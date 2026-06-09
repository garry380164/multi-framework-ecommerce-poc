import { MetadataRoute } from 'next';
import { MOCK_PRODUCTS, STORE_NAMES } from '../components/StorefrontProvider/mockData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5176';
  
  // 1. 預設靜態首頁與商家列表
  const aSitemaps: MetadataRoute.Sitemap = [
    {
      url: sBaseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 取得所有的動態商家 ID
  const aMerchantIds = Object.keys(STORE_NAMES);

  for (const sMerchantId of aMerchantIds) {
    // 2. 商家主頁面
    aSitemaps.push({
      url: `${sBaseUrl}/${sMerchantId}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });

    // 3. 取得該商家的所有商品與分類
    let aMerchantCategories: string[] = ['ALL'];
    let aMerchantProducts: any[] = [];

    try {
      // 嘗試向 API 抓取分類列表
      const oCategoriesRes = await fetch(`${sApiUrl}/api/products/categories`, {
        headers: { 'X-Merchant-Id': sMerchantId },
        next: { revalidate: 3600 },
      }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

      if (oCategoriesRes && oCategoriesRes.success && Array.isArray(oCategoriesRes.data)) {
        oCategoriesRes.data.forEach((oCat: any) => {
          if (oCat.name) aMerchantCategories.push(oCat.name);
        });
      }

      // 嘗試向 API 抓取第一頁商品（可依據實際後端架構調整）
      const oProductsRes = await fetch(`${sApiUrl}/api/products?page=1&pageSize=100`, {
        headers: { 'X-Merchant-Id': sMerchantId },
        next: { revalidate: 3600 },
      }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

      if (oProductsRes && oProductsRes.success && oProductsRes.data) {
        const oPagedPayload = oProductsRes.data;
        if (Array.isArray(oPagedPayload.items)) {
          aMerchantProducts = oPagedPayload.items;
        } else if (Array.isArray(oPagedPayload)) {
          aMerchantProducts = oPagedPayload;
        }
      }
    } catch {
      // 發生錯誤或後端 API 離線時，進入 Fallback 降級模式，由 Mock 資料產生
      console.warn(`[Sitemap 警告] 無法連線至後端 API 以取得 ${sMerchantId} 的動態資料，將改用 Mock 資料生成。`);
    }

    // 離線降級時提取 Mock 資訊
    if (aMerchantProducts.length === 0) {
      aMerchantProducts = MOCK_PRODUCTS[sMerchantId] || [];
      const oCatMap = new Set<string>();
      aMerchantProducts.forEach((p) => {
        if (p.sCategory) oCatMap.add(p.sCategory);
      });
      aMerchantCategories = ['ALL', ...Array.from(oCatMap)];
    }

    // 4. 動態生成分類 URL (例如 /store-a/Coffee)
    aMerchantCategories.forEach((sCategory) => {
      // "ALL" 可直接對應商家主頁，這裡排除以免重複
      if (sCategory !== 'ALL') {
        aSitemaps.push({
          url: `${sBaseUrl}/${sMerchantId}/${encodeURIComponent(sCategory)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    });
  }

  return aSitemaps;
}
