import { Product, CategoryCount } from '@/features/storefront/types';
import { MOCK_PRODUCTS, STORE_NAMES } from '@/features/storefront/services/mockData';

interface StorefrontServerData {
  sMerchantId: string;
  sCategory: string;
  aProducts: Product[];
  aCategories: CategoryCount[];
  sMerchantName: string;
  sMerchantLogo: string;
  bIsOnline: boolean;
  bHasMore: boolean;
}

/**
 * 伺服器端資料獲取模組，支援 API 離線時自動降級為 Mock 資料
 */
export async function fnServerFetchStorefrontData(
  sMerchantId: string,
  sCategory: string
): Promise<StorefrontServerData> {
  const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5176';
  let bIsOnline = true;
  
  // 1. 宣告回傳變數 (採用匈牙利命名法)
  let aProducts: Product[] = [];
  let aCategories: CategoryCount[] = [];
  let sMerchantName = STORE_NAMES[sMerchantId] || '未知商店';
  let sMerchantLogo = `/images/logo-${sMerchantId}.png`;
  let bHasMore = false;

  try {
    // 使用 Promise.all 同步並行抓取，增進 SSR 效能
    const [oMerchantRes, oCategoriesRes, oProductsRes] = await Promise.all([
      fetch(`${sApiUrl}/api/merchants/current`, {
        headers: { 'X-Merchant-Id': sMerchantId },
        cache: 'no-store', // 即時取得最新動態資料
      }).then(r => r.ok ? r.json() : null).catch(() => null),

      fetch(`${sApiUrl}/api/products/categories`, {
        headers: { 'X-Merchant-Id': sMerchantId },
        cache: 'no-store',
      }).then(r => r.ok ? r.json() : null).catch(() => null),

      fetch(`${sApiUrl}/api/products?page=1&pageSize=9&categoryName=${encodeURIComponent(sCategory)}`, {
        headers: { 'X-Merchant-Id': sMerchantId },
        cache: 'no-store',
      }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    // 檢查 API 是否成功連線，若三大關鍵請求皆失敗，判定為離線模式
    if (!oMerchantRes && !oCategoriesRes && !oProductsRes) {
      throw new Error('無法連線至後端 API，將啟動伺服器端 Mock 降級機制。');
    }

    // 解析商家資訊
    if (oMerchantRes && oMerchantRes.success && oMerchantRes.data) {
      const oMerchantData = oMerchantRes.data;
      sMerchantName = oMerchantData.name || sMerchantName;
      if (oMerchantData.logoUrl) {
        sMerchantLogo = oMerchantData.logoUrl.startsWith('/') 
          ? `${sApiUrl}${oMerchantData.logoUrl}` 
          : oMerchantData.logoUrl;
      }
    }

    // 解析分類列表
    if (oCategoriesRes && oCategoriesRes.success && Array.isArray(oCategoriesRes.data)) {
      aCategories = oCategoriesRes.data;
    }

    // 解析商品列表
    if (oProductsRes && oProductsRes.success && oProductsRes.data) {
      const oPagedPayload = oProductsRes.data;
      let aRawProducts: any[] = [];
      if (oPagedPayload && Array.isArray(oPagedPayload.items)) {
        aRawProducts = oPagedPayload.items;
      } else if (Array.isArray(oPagedPayload)) {
        aRawProducts = oPagedPayload;
      }

      aProducts = aRawProducts.map((oProd: any) => {
        let sImageUrl = oProd.imageUrl;
        if (sImageUrl && sImageUrl.startsWith('/')) {
          sImageUrl = `${sApiUrl}${sImageUrl}`;
        }
        return {
          id: oProd.id,
          merchantId: oProd.merchantId,
          name: oProd.name,
          description: oProd.description || '',
          price: oProd.price,
          stock: oProd.stock,
          imageUrl: sImageUrl || '/images/default_product.png',
          createdAt: oProd.createdAt,
          sPriceFormatted: `NT$ ${oProd.price.toLocaleString()}`,
          bIsFullImage: false,
          sCategory: oProd.categoryName || '其他'
        };
      });

      // 伺服器端同樣以每頁 9 筆判斷是否還有下一頁
      bHasMore = aProducts.length === 9;
    }

  } catch (oErr: any) {
    console.warn(`[SSR 警告] 伺服器端資料獲取失敗: ${oErr.message}`);
    bIsOnline = false;

    // 離線降級 (Fallback to Mock Data)
    const aAllMock = MOCK_PRODUCTS[sMerchantId] || [];
    
    // 計算 Mock 分類數量
    const oCatMap = new Map<string, number>();
    aAllMock.forEach((oProd) => {
      if (oProd.sCategory) {
        oCatMap.set(oProd.sCategory, (oCatMap.get(oProd.sCategory) || 0) + 1);
      }
    });
    aCategories = Array.from(oCatMap.entries()).map(([sName, nVal]) => ({
      name: sName,
      count: nVal
    }));

    // 篩選與分頁 Mock 商品
    const aFilteredMock = sCategory === 'ALL'
      ? aAllMock
      : aAllMock.filter((oProd) => oProd.sCategory === sCategory);

    // 取得第一頁的 9 筆商品
    aProducts = aFilteredMock.slice(0, 9);
    bHasMore = aFilteredMock.length > 9;
  }

  return {
    sMerchantId,
    sCategory,
    aProducts,
    aCategories,
    sMerchantName,
    sMerchantLogo,
    bIsOnline,
    bHasMore
  };
}
