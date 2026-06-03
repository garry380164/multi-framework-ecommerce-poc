'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, UserSession } from '../types';

// 降級 Mock 資料 - 採用繁體中文內容，並融入日系極簡 UI 風格
const MOCK_PRODUCTS: Record<string, Product[]> = {
  'store-a': [
    {
      id: 1,
      merchantId: 'store-a',
      name: '耶加雪菲精品咖啡豆 (250g)',
      description: '帶有豐富的柑橘與花香調性，中淺烘焙，酸質明亮細緻。',
      price: 450,
      stock: 120,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 450',
      bIsFullImage: false,
      sCategory: '精選豆'
    },
    {
      id: 2,
      merchantId: 'store-a',
      name: '極簡磨砂陶瓷馬克杯 (售罄)',
      description: '質感磨砂黑，350ml 容量，保溫效果佳，辦公室必備。',
      price: 350,
      stock: 0,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
      createdAt: new Date().toISOString(),
      sBadgeText: 'SOLD OUT',
      sPriceFormatted: 'NT$ 350',
      bIsFullImage: false,
      sCategory: '器具'
    },
    {
      id: 3,
      merchantId: 'store-a',
      name: '冰滴咖啡專用玻璃壺',
      description: '耐熱高矽硼玻璃，極簡線條設計，滴漏流速穩定。',
      price: 1200,
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 1,200',
      bIsFullImage: false,
      sCategory: '器具'
    },
    {
      id: 4,
      merchantId: 'store-a',
      name: '巴拿馬藝妓精品咖啡豆 (250g)',
      description: '頂級莊園藝妓，帶有茉莉花香與檸檬紅茶風味，餘韻綿長。',
      price: 980,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 980',
      bIsFullImage: false,
      sCategory: '精選豆'
    },
    {
      id: 5,
      merchantId: 'store-a',
      name: '極簡咖啡館 16 期終身會員方案',
      description: '加入終身會員，可獲得精選咖啡豆與專屬限量馬克杯一份！',
      price: 6800,
      stock: 99,
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500',
      createdAt: new Date().toISOString(),
      sBadgeText: '新規入會',
      sPriceFormatted: 'NT$ 6,800',
      bIsFullImage: true,
      sCategory: '專案'
    }
  ],
  'store-b': [
    {
      id: 6,
      merchantId: 'store-b',
      name: '重磅落肩寬版連帽衫',
      description: '420g 重磅純棉，寬鬆落肩版型，親膚保暖，美式街頭風格。',
      price: 1280,
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 1,280',
      bIsFullImage: true,
      sCategory: '服飾'
    },
    {
      id: 7,
      merchantId: 'store-b',
      name: '日系原色帆布托特包',
      description: '厚實耐磨帆布，附內部拉鍊小袋，大容量可裝 15 吋筆電。',
      price: 590,
      stock: 110,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 590',
      bIsFullImage: false,
      sCategory: '包袋'
    },
    {
      id: 8,
      merchantId: 'store-b',
      name: '極簡機能防風外套 (售罄)',
      description: '防潑水機能面料，俐落版型，適合城市通勤與戶外穿搭。',
      price: 2480,
      stock: 0,
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500',
      createdAt: new Date().toISOString(),
      sBadgeText: 'SOLD OUT',
      sPriceFormatted: 'NT$ 2,480',
      bIsFullImage: false,
      sCategory: '服飾'
    },
    {
      id: 9,
      merchantId: 'store-b',
      name: '復古水洗老帽',
      description: '水洗斜紋棉布，可調式金屬扣，呈現獨特復古洗舊質感。',
      price: 450,
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 450',
      bIsFullImage: false,
      sCategory: '配件'
    }
  ]
};

// 商店名稱對照表
const STORE_NAMES: Record<string, string> = {
  'store-a': '極簡咖啡館 (Store A)',
  'store-b': '潮流服飾店 (Store B)'
};

interface CartItem {
  product: Product;
  count: number;
}

interface CustomAlertState {
  show: boolean;
  title: string;
  message: string;
  code?: string;
}

interface StorefrontContextType {
  sSelectedMerchant: string;
  setSSelectedMerchant: (sMerchantId: string) => void;
  sMerchantName: string;
  sMerchantLogo: string;
  sSelectedCategory: string;
  setSSelectedCategory: (sCategory: string) => void;
  aProducts: Product[];
  bIsOnline: boolean;
  bIsLoading: boolean;
  aCart: CartItem[];
  bIsCartOpen: boolean;
  setBIsCartOpen: (bIsOpen: boolean) => void;
  oUser: UserSession | null;
  bIsAuthModalOpen: boolean;
  setBIsAuthModalOpen: (bIsOpen: boolean) => void;
  sAuthTab: 'login' | 'register';
  setSAuthTab: (sTab: 'login' | 'register') => void;
  sRegCode: string;
  setSRegCode: (sCode: string) => void;
  oCustomAlert: CustomAlertState | null;
  setOCustomAlert: (oAlert: CustomAlertState | null) => void;
  nTotalCartCount: number;
  nTotalCartAmount: number;
  fnFetchProducts: (sMerchantId: string, oCurrentUser?: UserSession | null) => Promise<void>;
  fnAddToCart: (oProduct: Product) => Promise<void>;
  fnRemoveFromCart: (nProductId: number) => Promise<void>;
  fnHandleLogout: () => void;
  fnCheckout: () => void;
  fnShowCustomAlert: (sTitle: string, sMessage: string, sCode?: string) => void;
  fnOnLoginSuccess: (oSession: UserSession) => Promise<void>;
  fnOnRegisterSuccess: (oSession: UserSession) => Promise<void>;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  const [sSelectedMerchant, setSSelectedMerchant] = useState<string>('store-a');
  const [sMerchantLogo, setSMerchantLogo] = useState<string>('/images/logo-store-a.png');
  const [sSelectedCategory, setSSelectedCategory] = useState<string>('ALL');
  const [aProducts, setAProducts] = useState<Product[]>([]);
  const [bIsOnline, setBIsOnline] = useState<boolean>(false);
  const [bIsLoading, setBIsLoading] = useState<boolean>(true);
  const [aCart, setACart] = useState<CartItem[]>([]);
  const [bIsCartOpen, setBIsCartOpen] = useState<boolean>(false);

  // 會員登入狀態
  const [oUser, setOUser] = useState<UserSession | null>(null);
  const [bIsAuthModalOpen, setBIsAuthModalOpen] = useState<boolean>(false);
  const [sAuthTab, setSAuthTab] = useState<'login' | 'register'>('login');
  const [sRegCode, setSRegCode] = useState<string>('');

  // 客製化 Alert / Toast 狀態
  const [oCustomAlert, setOCustomAlert] = useState<CustomAlertState | null>(null);

  // 初始化 localStorage 的 Session
  useEffect(() => {
    const sSession = localStorage.getItem('user_session');
    if (sSession) {
      try {
        const oParsed = JSON.parse(sSession);
        setOUser(oParsed);
      } catch (e) {
        localStorage.removeItem('user_session');
      }
    }
  }, []);

  // 當購物車改變且為訪客狀態時同步至 localStorage 的對應商家項目中
  useEffect(() => {
    if (!oUser) {
      const sLocalCarts = localStorage.getItem('guest_carts');
      let oCarts: Record<string, CartItem[]> = {};
      if (sLocalCarts) {
        try {
          oCarts = JSON.parse(sLocalCarts);
        } catch (e) {}
      }
      oCarts[sSelectedMerchant] = aCart;
      localStorage.setItem('guest_carts', JSON.stringify(oCarts));
    }
  }, [aCart, oUser, sSelectedMerchant]);

  // 讀取伺服器端的購物車資料
  const fnLoadCartFromServer = async (sToken: string, sMerchantId: string) => {
    try {
      const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const oRes = await fetch(`${sApiUrl}/api/cart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sToken}`,
          'X-Merchant-Id': sMerchantId
        }
      });
      if (oRes.ok) {
        const aItems = await oRes.json();
        const aCartList = aItems.map((oItem: any) => ({
          product: {
            id: oItem.product.id,
            merchantId: oItem.product.merchantId,
            name: oItem.product.name,
            price: oItem.product.price,
            stock: oItem.product.stock,
            imageUrl: oItem.product.imageUrl,
            sBadgeText: oItem.product.sBadgeText || undefined
          },
          count: oItem.quantity
        }));
        setACart(aCartList);
      }
    } catch (oErr) {
      console.warn("無法自後端載入會員購物車，維持本地資料。", oErr);
    }
  };

  // 同步所有商家的訪客購物車至後端
  const fnSyncAllCartsWithServer = async (sToken: string) => {
    const sLocalCarts = localStorage.getItem('guest_carts');
    if (!sLocalCarts) return;
    try {
      const oCarts: Record<string, CartItem[]> = JSON.parse(sLocalCarts);
      for (const sMerchantId of Object.keys(oCarts)) {
        const aLocalCart = oCarts[sMerchantId];
        if (aLocalCart && aLocalCart.length > 0) {
          const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const aBody = aLocalCart.map(oItem => ({
            productId: oItem.product.id,
            productSpecId: null,
            quantity: oItem.count
          }));
          await fetch(`${sApiUrl}/api/cart/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sToken}`,
              'X-Merchant-Id': sMerchantId
            },
            body: JSON.stringify(aBody)
          });
        }
      }
      localStorage.removeItem('guest_carts');
    } catch (oErr) {
      console.error("同步所有商家購物車失敗：", oErr);
    }
  };

  // 取得商品資料
  const fnFetchProducts = async (sMerchantId: string, oCurrentUser: UserSession | null = null) => {
    setBIsLoading(true);
    try {
      const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const oRes = await fetch(`${sApiUrl}/api/products?pageSize=100`, {
        method: 'GET',
        headers: {
          'X-Merchant-Id': sMerchantId
        }
      });

      if (oRes.ok) {
        const oData = await oRes.json();
        let aProductsList: Product[] = [];
        if (oData && oData.items !== undefined && Array.isArray(oData.items)) {
          aProductsList = oData.items;
        } else if (Array.isArray(oData)) {
          aProductsList = oData;
        }

        const aFormattedData = aProductsList.map((oProd: Product) => {
          let sImageUrl = oProd.imageUrl;
          if (sImageUrl && sImageUrl.startsWith('/')) {
            sImageUrl = `${sApiUrl}${sImageUrl}`;
          }
          return {
            ...oProd,
            imageUrl: sImageUrl,
            sPriceFormatted: oProd.sPriceFormatted || `NT$ ${oProd.price.toLocaleString()}`,
            bIsFullImage: oProd.bIsFullImage ?? false,
            sCategory: (oProd as any).categoryName || oProd.sCategory || '其他'
          };
        });
        setAProducts(aFormattedData);
        setBIsOnline(true);

        if (oCurrentUser) {
          await fnLoadCartFromServer(oCurrentUser.token, sMerchantId);
        } else {
          const sLocalCarts = localStorage.getItem('guest_carts');
          if (sLocalCarts) {
            try {
              const oCarts = JSON.parse(sLocalCarts);
              setACart(oCarts[sMerchantId] || []);
            } catch (e) {
              setACart([]);
            }
          } else {
            setACart([]);
          }
        }
      } else {
        throw new Error('API 回傳錯誤');
      }
    } catch (oErr) {
      console.warn('無法連線至 .NET 後端 API，改為載入前端 Mock 展示資料。');
      setAProducts(MOCK_PRODUCTS[sMerchantId] || []);
      setBIsOnline(false);

      const sLocalCarts = localStorage.getItem('guest_carts');
      if (sLocalCarts) {
        try {
          const oCarts = JSON.parse(sLocalCarts);
          setACart(oCarts[sMerchantId] || []);
        } catch (e) {
          setACart([]);
        }
      } else {
        setACart([]);
      }
    } finally {
      setBIsLoading(false);
    }
  };

  // 獲取當前商家詳細資訊與 Logo 檔案 (繁體中文註解)
  const fnFetchMerchantInfo = async (sMerchantId: string) => {
    try {
      const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const oRes = await fetch(`${sApiUrl}/api/merchants/current`, {
        method: 'GET',
        headers: {
          'X-Merchant-Id': sMerchantId
        }
      });
      if (oRes.ok) {
        const oData = await oRes.json();
        if (oData.logoUrl) {
          // 拼接後端網址取得上傳的 Logo 圖片資源
          setSMerchantLogo(`${sApiUrl}${oData.logoUrl}`);
        } else {
          setSMerchantLogo(`/images/logo-${sMerchantId}.png`);
        }
      } else {
        throw new Error();
      }
    } catch (e) {
      // 無後端 API 連線或錯誤時降級為前端本地 Mock 圖片
      setSMerchantLogo(`/images/logo-${sMerchantId}.png`);
    }
  };

  // 當選擇的商家改變時
  useEffect(() => {
    setSSelectedCategory('ALL');
    fnFetchProducts(sSelectedMerchant, oUser);
    fnFetchMerchantInfo(sSelectedMerchant);
  }, [sSelectedMerchant]);

  // 當登入使用者 Session 改變時
  useEffect(() => {
    if (oUser && bIsOnline) {
      fnLoadCartFromServer(oUser.token, sSelectedMerchant);
    }
  }, [oUser, bIsOnline]);

  // 加入購物車
  const fnAddToCart = async (oProduct: Product) => {
    if (oProduct.stock <= 0) return;

    if (oUser && bIsOnline) {
      try {
        const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const oRes = await fetch(`${sApiUrl}/api/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oUser.token}`,
            'X-Merchant-Id': sSelectedMerchant
          },
          body: JSON.stringify({
            productId: oProduct.id,
            productSpecId: null,
            quantity: 1
          })
        });
        if (oRes.ok) {
          await fnLoadCartFromServer(oUser.token, sSelectedMerchant);
        }
      } catch (e) {
        console.error("加入購物車遠端同步失敗：", e);
      }
    } else {
      setACart(aPrev => {
        const nExistIdx = aPrev.findIndex(oItem => oItem.product.id === oProduct.id);
        if (nExistIdx > -1) {
          const aNewCart = [...aPrev];
          aNewCart[nExistIdx] = {
            ...aNewCart[nExistIdx],
            count: aNewCart[nExistIdx].count + 1
          };
          return aNewCart;
        }
        return [...aPrev, { product: oProduct, count: 1 }];
      });
    }
    setBIsCartOpen(true);
  };

  // 移出購物車
  const fnRemoveFromCart = async (nProductId: number) => {
    if (oUser && bIsOnline) {
      try {
        const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const oRes = await fetch(`${sApiUrl}/api/cart?productId=${nProductId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${oUser.token}`,
            'X-Merchant-Id': sSelectedMerchant
          }
        });
        if (oRes.ok) {
          await fnLoadCartFromServer(oUser.token, sSelectedMerchant);
        }
      } catch (e) {
        console.error("移除購物車商品遠端同步失敗：", e);
      }
    } else {
      setACart(aPrev => aPrev.filter(oItem => oItem.product.id !== nProductId));
    }
  };

  // 登出
  const fnHandleLogout = () => {
    setOUser(null);
    localStorage.removeItem('user_session');
    setACart([]);
    fnShowCustomAlert("登出", "您已成功登出系統。");
  };

  // 結帳
  const fnCheckout = () => {
    if (!oUser) {
      setSAuthTab('login');
      setBIsAuthModalOpen(true);
      return;
    }

    alert(`感謝您在 ${STORE_NAMES[sSelectedMerchant]} 下單！結帳金額：NT$ ${nTotalCartAmount.toLocaleString()}`);
    setACart([]);
    setBIsCartOpen(false);
  };

  // 顯示客製化提示
  const fnShowCustomAlert = (sTitle: string, sMessage: string, sCode?: string) => {
    setOCustomAlert({
      show: true,
      title: sTitle,
      message: sMessage,
      code: sCode
    });
  };

  // 登入成功
  const fnOnLoginSuccess = async (oSession: UserSession) => {
    setOUser(oSession);
    localStorage.setItem('user_session', JSON.stringify(oSession));
    setBIsAuthModalOpen(false);

    // 檢查是否有訪客購物車商品需要合併
    const sLocalCarts = localStorage.getItem('guest_carts');
    let bHasItemsToSync = false;
    if (sLocalCarts) {
      try {
        const oCarts = JSON.parse(sLocalCarts);
        bHasItemsToSync = Object.values(oCarts).some((aItems: any) => Array.isArray(aItems) && aItems.length > 0);
      } catch (e) {}
    }

    if (bHasItemsToSync) {
      await fnSyncAllCartsWithServer(oSession.token);
      await fnLoadCartFromServer(oSession.token, sSelectedMerchant);
      fnShowCustomAlert("成功", "登入成功！已完成各商家訪客購物車合併。");
    } else {
      await fnLoadCartFromServer(oSession.token, sSelectedMerchant);
      fnShowCustomAlert("成功", `登入成功！歡迎回來，${oSession.username || '會員'}。`);
    }
  };

  // 註冊成功
  const fnOnRegisterSuccess = async (oSession: UserSession) => {
    setOUser(oSession);
    localStorage.setItem('user_session', JSON.stringify(oSession));
    setBIsAuthModalOpen(false);

    // 檢查是否有訪客購物車商品需要合併
    const sLocalCarts = localStorage.getItem('guest_carts');
    let bHasItemsToSync = false;
    if (sLocalCarts) {
      try {
        const oCarts = JSON.parse(sLocalCarts);
        bHasItemsToSync = Object.values(oCarts).some((aItems: any) => Array.isArray(aItems) && aItems.length > 0);
      } catch (e) {}
    }

    if (bHasItemsToSync) {
      await fnSyncAllCartsWithServer(oSession.token);
      await fnLoadCartFromServer(oSession.token, sSelectedMerchant);
      fnShowCustomAlert("成功", "註冊成功，已為您自動登入！原各商家訪客購物車商品已成功合併同步。");
    } else {
      await fnLoadCartFromServer(oSession.token, sSelectedMerchant);
      fnShowCustomAlert("成功", "註冊成功，已為您自動登入！");
    }
  };

  const nTotalCartCount = aCart.reduce((nSum, oItem) => nSum + oItem.count, 0);
  const nTotalCartAmount = aCart.reduce((nSum, oItem) => nSum + oItem.product.price * oItem.count, 0);
  const sMerchantName = STORE_NAMES[sSelectedMerchant] || '未知商店';

  return (
    <StorefrontContext.Provider value={{
      sSelectedMerchant,
      setSSelectedMerchant,
      sMerchantName,
      sMerchantLogo,
      sSelectedCategory,
      setSSelectedCategory,
      aProducts,
      bIsOnline,
      bIsLoading,
      aCart,
      bIsCartOpen,
      setBIsCartOpen,
      oUser,
      bIsAuthModalOpen,
      setBIsAuthModalOpen,
      sAuthTab,
      setSAuthTab,
      sRegCode,
      setSRegCode,
      oCustomAlert,
      setOCustomAlert,
      nTotalCartCount,
      nTotalCartAmount,
      fnFetchProducts,
      fnAddToCart,
      fnRemoveFromCart,
      fnHandleLogout,
      fnCheckout,
      fnShowCustomAlert,
      fnOnLoginSuccess,
      fnOnRegisterSuccess
    }}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const oCtx = useContext(StorefrontContext);
  if (!oCtx) {
    throw new Error('useStorefront must be used within a StorefrontProvider');
  }
  return oCtx;
}
