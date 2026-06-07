'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, UserSession } from '../types';
import { api } from './apiClient';
import protobuf from 'protobufjs/light';
import protoDescriptor from '../../proto/products.json';

// 初始化 Protobuf 解碼器
const root = protobuf.Root.fromJSON(protoDescriptor);
const ApiResponseProductsProto = root.lookupType("ecommerce.ApiResponseProductsProto");

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

  // 註冊 ApiClient 的 Loading 與 Session 同步狀態回呼，並同步 React 狀態與 ApiClient 的參數
  useEffect(() => {
    api.registerLoadingCallback(setBIsLoading);
    api.registerSessionRefreshedCallback((oSession) => {
      setOUser(oSession);
    });
  }, []);

  useEffect(() => {
    api.setMerchantId(sSelectedMerchant);
  }, [sSelectedMerchant]);

  useEffect(() => {
    api.setToken(oUser?.token || '');
  }, [oUser]);

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
  const fnLoadCartFromServer = useCallback(async (sToken: string, sMerchantId: string) => {
    try {
      api.setToken(sToken);
      api.setMerchantId(sMerchantId);

      const oRes = await api.get<any[]>('/api/cart');
      if (oRes.success && oRes.data) {
        const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const aCartList = oRes.data.map((oItem: any) => {
          let sImageUrl = oItem.product.imageUrl;
          if (sImageUrl && sImageUrl.startsWith('/')) {
            sImageUrl = `${sApiUrl}${sImageUrl}`;
          }
          return {
            product: {
              id: oItem.product.id,
              merchantId: oItem.product.merchantId,
              name: oItem.product.name,
              description: oItem.product.description || '',
              price: oItem.product.price,
              stock: oItem.product.stock,
              imageUrl: sImageUrl,
              createdAt: oItem.product.createdAt || '',
              sBadgeText: oItem.product.sBadgeText || undefined
            },
            count: oItem.quantity
          };
        });
        setACart(aCartList as CartItem[]);
      }
    } catch (oErr) {
      console.warn("無法自後端載入會員購物車，維持本地資料。", oErr);
    }
  }, []);

  // 同步所有商家的訪客購物車至後端
  const fnSyncAllCartsWithServer = useCallback(async (sToken: string) => {
    const sLocalCarts = localStorage.getItem('guest_carts');
    if (!sLocalCarts) return;
    try {
      api.setToken(sToken);
      const oCarts: Record<string, CartItem[]> = JSON.parse(sLocalCarts);
      for (const sMerchantId of Object.keys(oCarts)) {
        const aLocalCart = oCarts[sMerchantId];
        if (aLocalCart && aLocalCart.length > 0) {
          api.setMerchantId(sMerchantId);
          const aBody = aLocalCart.map(oItem => ({
            productId: oItem.product.id,
            productSpecId: null,
            quantity: oItem.count
          }));
          await api.post('/api/cart/sync', aBody);
        }
      }
      localStorage.removeItem('guest_carts');
    } catch (oErr) {
      console.error("同步所有商家購物車失敗：", oErr);
    }
  }, []);

  // 取得商品資料
  const fnFetchProducts = useCallback(async (sMerchantId: string, oCurrentUser: UserSession | null = null) => {
    try {
      const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      api.setMerchantId(sMerchantId);
      if (oCurrentUser) {
        api.setToken(oCurrentUser.token);
      }
      
      // 改為呼叫二進位 Protobuf API 端點
      const oRes = await api.requestBinary('/api/products/proto?pageSize=100');

      if (oRes.success && oRes.data) {
        // 使用 protobufjs 反序列化二進位資料
        const uint8Array = new Uint8Array(oRes.data);
        const decodedMessage = ApiResponseProductsProto.decode(uint8Array);
        const oResData = decodedMessage.toJSON() as any;

        if (oResData.success && oResData.data) {
          let aProductsList: any[] = [];
          const oPayload = oResData.data;

          if (oPayload && oPayload.items !== undefined && Array.isArray(oPayload.items)) {
            aProductsList = oPayload.items;
          } else if (Array.isArray(oPayload)) {
            aProductsList = oPayload;
          }

          const aFormattedData = aProductsList.map((oProd: any) => {
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
              imageUrl: sImageUrl,
              createdAt: oProd.createdAt,
              sPriceFormatted: oProd.sPriceFormatted || `NT$ ${oProd.price.toLocaleString()}`,
              bIsFullImage: oProd.bIsFullImage ?? false,
              sCategory: oProd.categoryName || oProd.sCategory || '其他'
            };
          });
          setAProducts(aFormattedData);
          setBIsOnline(true);
        } else {
          throw new Error('Protobuf 業務狀態解碼錯誤');
        }

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
    }
  }, [fnLoadCartFromServer]);

  // 獲取當前商家詳細資訊與 Logo 檔案
  const fnFetchMerchantInfo = useCallback(async (sMerchantId: string) => {
    try {
      const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      api.setMerchantId(sMerchantId);
      const oRes = await api.get<any>('/api/merchants/current');
      if (oRes.success && oRes.data) {
        const oData = oRes.data;
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
  }, []);

  // 當選擇的商家改變時
  useEffect(() => {
    setSSelectedCategory('ALL');
    fnFetchProducts(sSelectedMerchant, oUser);
    fnFetchMerchantInfo(sSelectedMerchant);
  }, [sSelectedMerchant, fnFetchProducts, fnFetchMerchantInfo]);

  // 當登入使用者 Session 改變時
  useEffect(() => {
    if (oUser && bIsOnline) {
      fnLoadCartFromServer(oUser.token, sSelectedMerchant);
    }
  }, [oUser, bIsOnline, sSelectedMerchant, fnLoadCartFromServer]);

  // 加入購物車
  const fnAddToCart = useCallback(async (oProduct: Product) => {
    if (oProduct.stock <= 0) return;

    if (oUser && bIsOnline) {
      try {
        api.setMerchantId(sSelectedMerchant);
        api.setToken(oUser.token);
        const oRes = await api.post('/api/cart/add', {
          productId: oProduct.id,
          productSpecId: null,
          quantity: 1
        });
        if (oRes.success) {
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
  }, [oUser, bIsOnline, sSelectedMerchant, fnLoadCartFromServer]);

  // 移出購物車
  const fnRemoveFromCart = useCallback(async (nProductId: number) => {
    if (oUser && bIsOnline) {
      try {
        api.setMerchantId(sSelectedMerchant);
        api.setToken(oUser.token);
        const oRes = await api.delete(`/api/cart?productId=${nProductId}`);
        if (oRes.success) {
          await fnLoadCartFromServer(oUser.token, sSelectedMerchant);
        }
      } catch (e) {
        console.error("移除購物車商品遠端同步失敗：", e);
      }
    } else {
      setACart(aPrev => aPrev.filter(oItem => oItem.product.id !== nProductId));
    }
  }, [oUser, bIsOnline, sSelectedMerchant, fnLoadCartFromServer]);

  // 顯示客製化提示
  const fnShowCustomAlert = useCallback((sTitle: string, sMessage: string, sCode?: string) => {
    setOCustomAlert({
      show: true,
      title: sTitle,
      message: sMessage,
      code: sCode
    });
  }, []);

  // 登出
  const fnHandleLogout = useCallback(() => {
    // 呼叫後端 API 登出以清除伺服器端 cookie 並撤銷 refresh token
    api.post('/api/Auth/logout').catch((oErr) => {
      console.warn("呼叫後端登出 API 失敗：", oErr);
    });

    setOUser(null);
    localStorage.removeItem('user_session');
    setACart([]);
    fnShowCustomAlert("登出", "您已成功登出系統。");
  }, [fnShowCustomAlert]);

  const nTotalCartCount = aCart.reduce((nSum, oItem) => nSum + oItem.count, 0);
  const nTotalCartAmount = aCart.reduce((nSum, oItem) => nSum + oItem.product.price * oItem.count, 0);
  const sMerchantName = STORE_NAMES[sSelectedMerchant] || '未知商店';

  // 結帳
  const fnCheckout = useCallback(() => {
    if (!oUser) {
      setSAuthTab('login');
      setBIsAuthModalOpen(true);
      return;
    }

    alert(`感謝您在 ${STORE_NAMES[sSelectedMerchant]} 下單！結帳金額：NT$ ${nTotalCartAmount.toLocaleString()}`);
    setACart([]);
    setBIsCartOpen(false);
  }, [oUser, sSelectedMerchant, nTotalCartAmount]);

  // 登入成功
  const fnOnLoginSuccess = useCallback(async (oSession: UserSession) => {
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
  }, [sSelectedMerchant, fnSyncAllCartsWithServer, fnLoadCartFromServer, fnShowCustomAlert]);

  // 註冊成功
  const fnOnRegisterSuccess = useCallback(async (oSession: UserSession) => {
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
  }, [sSelectedMerchant, fnSyncAllCartsWithServer, fnLoadCartFromServer, fnShowCustomAlert]);

  // 使用 useMemo 包裝 Context Value 避免每次 re-render 產生新參照
  const contextValue = useMemo(() => ({
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
  }), [
    sSelectedMerchant,
    sMerchantName,
    sMerchantLogo,
    sSelectedCategory,
    aProducts,
    bIsOnline,
    bIsLoading,
    aCart,
    bIsCartOpen,
    oUser,
    bIsAuthModalOpen,
    sAuthTab,
    sRegCode,
    oCustomAlert,
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
  ]);

  return (
    <StorefrontContext.Provider value={contextValue}>
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
