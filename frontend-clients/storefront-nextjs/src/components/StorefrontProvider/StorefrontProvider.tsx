'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { createStore, useStore } from 'zustand';
import { Product, UserSession, CategoryCount } from '../types';
import { api } from './apiClient';
import protobuf from 'protobufjs/light';
import protoDescriptor from '../../proto/products.json';

// 初始化 Protobuf 解碼器
const root = protobuf.Root.fromJSON(protoDescriptor);
const ApiResponseProductsProto = root.lookupType("ecommerce.ApiResponseProductsProto");

import { MOCK_PRODUCTS, STORE_NAMES } from './mockData';

export interface StorefrontInitialProps {
  initialMerchantId?: string;
  initialCategory?: string;
  initialProducts?: Product[];
  initialCategories?: CategoryCount[];
  initialMerchantName?: string;
  initialMerchantLogo?: string;
  initialOnline?: boolean;
}


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
  aCategories: CategoryCount[];
  nPage: number;
  bHasMore: boolean;
  bIsLoadingMore: boolean;
  bIsProductsLoading: boolean;
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
  fnFetchProducts: (sMerchantId: string, oCurrentUser?: UserSession | null, bAppend?: boolean) => Promise<void>;
  fnLoadNextPage: () => Promise<void>;
  fnFetchCategories: (sMerchantId: string) => Promise<void>;
  fnAddToCart: (oProduct: Product) => Promise<void>;
  fnRemoveFromCart: (nProductId: number) => Promise<void>;
  fnHandleLogout: () => void;
  fnCheckout: () => void;
  fnShowCustomAlert: (sTitle: string, sMessage: string, sCode?: string) => void;
  fnOnLoginSuccess: (oSession: UserSession) => Promise<void>;
  fnOnRegisterSuccess: (oSession: UserSession) => Promise<void>;
  
  // 內部輔助 Action
  fnLoadCartFromServer: (sToken: string, sMerchantId: string) => Promise<void>;
  fnSyncAllCartsWithServer: (sToken: string) => Promise<void>;
  fnUpdateCartState: (aNewCart: CartItem[]) => void;
  fnFetchMerchantInfo: (sMerchantId: string) => Promise<void>;
}

// 建立 Zustand Store 的型別與實體產生器
export type StorefrontStore = ReturnType<typeof createStorefrontStore>;

export const createStorefrontStore = (initialProps?: StorefrontInitialProps) => {
  return createStore<StorefrontContextType>((set, get) => ({
    sSelectedMerchant: initialProps?.initialMerchantId || 'store-a',
    sMerchantLogo: initialProps?.initialMerchantLogo || '/images/logo-store-a.png',
    sMerchantName: initialProps?.initialMerchantName || '極簡咖啡館 (Store A)',
    sSelectedCategory: initialProps?.initialCategory || 'ALL',
    aProducts: initialProps?.initialProducts || [],
    aCategories: initialProps?.initialCategories || [],
    nPage: 1,
    bHasMore: initialProps?.initialProducts ? (initialProps.initialProducts.length === 9) : true,
    bIsLoadingMore: false,
    bIsProductsLoading: initialProps?.initialProducts ? false : true,
    bIsOnline: initialProps?.initialOnline ?? false,
    bIsLoading: initialProps?.initialProducts ? false : true,
    aCart: [],
    bIsCartOpen: false,
    oUser: null,
    bIsAuthModalOpen: false,
    sAuthTab: 'login',
    sRegCode: '',
    oCustomAlert: null,
    nTotalCartCount: 0,
    nTotalCartAmount: 0,

    setSSelectedMerchant: (sMerchantId) => {
      if (typeof window !== 'undefined') {
        document.cookie = `selected_merchant=${sMerchantId}; path=/; max-age=31536000`;
        document.cookie = `selected_category=ALL; path=/; max-age=31536000`;
      }
      
      // 若切換的商家與當前登入使用者的商家不同，自動清空 Session (強制登出以防後端強制覆蓋 X-Merchant-Id)
      let oCurrentUser = get().oUser;
      if (oCurrentUser && oCurrentUser.merchantId !== sMerchantId) {
        oCurrentUser = null;
        set({
          oUser: null,
          aCart: [],
          nTotalCartCount: 0,
          nTotalCartAmount: 0
        });
        localStorage.removeItem('user_session');
        api.setToken('');
      }

      api.setMerchantId(sMerchantId);
      set({
        sSelectedMerchant: sMerchantId,
        sSelectedCategory: 'ALL',
        nPage: 1,
        bHasMore: true,
        bIsLoadingMore: false,
        bIsProductsLoading: true,
        sMerchantName: STORE_NAMES[sMerchantId] || '未知商店'
      });
      get().fnFetchProducts(sMerchantId, oCurrentUser, false);
      get().fnFetchCategories(sMerchantId);
      get().fnFetchMerchantInfo(sMerchantId);
    },

    setSSelectedCategory: (sCategory) => {
      if (typeof window !== 'undefined') {
        document.cookie = `selected_category=${sCategory}; path=/; max-age=31536000`;
      }
      set({
        sSelectedCategory: sCategory,
        nPage: 1,
        bHasMore: true,
        bIsLoadingMore: false,
        bIsProductsLoading: true
      });
      const { sSelectedMerchant, oUser } = get();
      get().fnFetchProducts(sSelectedMerchant, oUser, false);
    },
    setBIsCartOpen: (bIsOpen) => set({ bIsCartOpen: bIsOpen }),
    setBIsAuthModalOpen: (bIsOpen) => set({ bIsAuthModalOpen: bIsOpen }),
    setSAuthTab: (sTab) => set({ sAuthTab: sTab }),
    setSRegCode: (sCode) => set({ sRegCode: sCode }),
    setOCustomAlert: (oAlert) => set({ oCustomAlert: oAlert }),

    fnFetchProducts: async (sMerchantId, oCurrentUser = null, bAppend = false) => {
      try {
        const { sSelectedCategory, nPage } = get();
        if (!bAppend) {
          set({ bIsLoading: true, bIsProductsLoading: true });
        } else {
          set({ bIsLoadingMore: true });
        }

        const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        api.setMerchantId(sMerchantId);
        if (oCurrentUser) {
          api.setToken(oCurrentUser.token);
        }
        
        // 帶入分頁、分類篩選與限制一頁 9 筆 (繁體中文註解以符合全域規範)
        const sCategoryParam = encodeURIComponent(sSelectedCategory);
        const oRes = await api.requestBinary(
          `/api/products/proto?page=${nPage}&pageSize=9&categoryName=${sCategoryParam}`
        );

        if (oRes.success && oRes.data) {
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

            // 只要回傳的資料小於 9 筆，就代表沒有下一頁了
            const bHasMoreResult = aFormattedData.length === 9;

            set((s) => ({
              aProducts: bAppend ? [...s.aProducts, ...aFormattedData] : aFormattedData,
              bIsOnline: true,
              bHasMore: bHasMoreResult,
              bIsLoading: false,
              bIsLoadingMore: false,
              bIsProductsLoading: false
            }));
          } else {
            throw new Error('Protobuf 業務狀態解碼錯誤');
          }

          if (oCurrentUser) {
            await get().fnLoadCartFromServer(oCurrentUser.token, sMerchantId);
          } else {
            const sLocalCarts = localStorage.getItem('guest_carts');
            if (sLocalCarts) {
              try {
                const oCarts = JSON.parse(sLocalCarts);
                get().fnUpdateCartState(oCarts[sMerchantId] || []);
              } catch (e) {
                get().fnUpdateCartState([]);
              }
            } else {
              get().fnUpdateCartState([]);
            }
          }
        } else {
          throw new Error('API 回傳錯誤');
        }
      } catch (oErr) {
        console.warn('無法連線至 .NET 後端 API，改為載入前端 Mock 展示資料。');
        
        const { sSelectedCategory, nPage } = get();
        const aAllMock = MOCK_PRODUCTS[sMerchantId] || [];
        const aFilteredMock = sSelectedCategory === 'ALL'
          ? aAllMock
          : aAllMock.filter((oProd) => oProd.sCategory === sSelectedCategory);

        // 模擬離線分頁切片 (一頁 9 筆)
        const nPageSize = 9;
        const nStart = (nPage - 1) * nPageSize;
        const aPagedMock = aFilteredMock.slice(nStart, nStart + nPageSize);
        const bHasMoreMock = nStart + nPageSize < aFilteredMock.length;

        set((s) => ({
          aProducts: bAppend ? [...s.aProducts, ...aPagedMock] : aPagedMock,
          bIsOnline: false,
          bHasMore: bHasMoreMock,
          bIsLoading: false,
          bIsLoadingMore: false,
          bIsProductsLoading: false
        }));

        const sLocalCarts = localStorage.getItem('guest_carts');
        if (sLocalCarts) {
          try {
            const oCarts = JSON.parse(sLocalCarts);
            get().fnUpdateCartState(oCarts[sMerchantId] || []);
          } catch (e) {
            get().fnUpdateCartState([]);
          }
        } else {
          get().fnUpdateCartState([]);
        }
      }
    },

    fnLoadNextPage: async () => {
      const { bIsLoading, bIsLoadingMore, bHasMore, sSelectedMerchant, oUser, nPage } = get();
      if (bIsLoading || bIsLoadingMore || !bHasMore) return;

      set({ nPage: nPage + 1 });
      await get().fnFetchProducts(sSelectedMerchant, oUser, true);
    },

    fnFetchCategories: async (sMerchantId) => {
      try {
        api.setMerchantId(sMerchantId);
        const oRes = await api.get<CategoryCount[]>('/api/products/categories');
        if (oRes.success && Array.isArray(oRes.data)) {
          set({ aCategories: oRes.data });
        } else {
          throw new Error('無法取得商品分類列表');
        }
      } catch (oErr) {
        console.warn('無法從 API 獲取商品分類，改為從前端 Mock 商品中提取 (降級模式)。');
        // 離線降級 (Mock)
        const aAllMock = MOCK_PRODUCTS[sMerchantId] || [];
        const oCatMap = new Map<string, number>();
        aAllMock.forEach((oProd) => {
          if (oProd.sCategory) {
            oCatMap.set(oProd.sCategory, (oCatMap.get(oProd.sCategory) || 0) + 1);
          }
        });
        const aMockCategories = Array.from(oCatMap.entries()).map(([sName, nVal]) => ({
          name: sName,
          count: nVal
        }));
        set({ aCategories: aMockCategories });
      }
    },

    fnFetchMerchantInfo: async (sMerchantId) => {
      try {
        const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        api.setMerchantId(sMerchantId);
        const oRes = await api.get<any>('/api/merchants/current');
        if (oRes.success && oRes.data) {
          const oData = oRes.data;
          if (oData.logoUrl) {
            set({ sMerchantLogo: `${sApiUrl}${oData.logoUrl}` });
          } else {
            set({ sMerchantLogo: `/images/logo-${sMerchantId}.png` });
          }
        } else {
          throw new Error();
        }
      } catch (e) {
        set({ sMerchantLogo: `/images/logo-${sMerchantId}.png` });
      }
    },

    fnLoadCartFromServer: async (sToken, sMerchantId) => {
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
          get().fnUpdateCartState(aCartList as CartItem[]);
        }
      } catch (oErr) {
        console.warn("無法自後端載入會員購物車，維持本地資料。", oErr);
      }
    },

    fnSyncAllCartsWithServer: async (sToken) => {
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
    },

    fnUpdateCartState: (aNewCart) => {
      const nTotalCartCount = aNewCart.reduce((nSum, oItem) => nSum + oItem.count, 0);
      const nTotalCartAmount = aNewCart.reduce((nSum, oItem) => nSum + oItem.product.price * oItem.count, 0);
      
      set({
        aCart: aNewCart,
        nTotalCartCount,
        nTotalCartAmount
      });

      const { oUser, sSelectedMerchant } = get();
      if (!oUser) {
        const sLocalCarts = localStorage.getItem('guest_carts');
        let oCarts: Record<string, CartItem[]> = {};
        if (sLocalCarts) {
          try {
            oCarts = JSON.parse(sLocalCarts);
          } catch (e) {}
        }
        oCarts[sSelectedMerchant] = aNewCart;
        localStorage.setItem('guest_carts', JSON.stringify(oCarts));
      }
    },

    fnAddToCart: async (oProduct) => {
      if (oProduct.stock <= 0) return;
      const { oUser, bIsOnline, sSelectedMerchant } = get();

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
            await get().fnLoadCartFromServer(oUser.token, sSelectedMerchant);
          }
        } catch (e) {
          console.error("加入購物車遠端同步失敗：", e);
        }
      } else {
        const aPrev = get().aCart;
        const nExistIdx = aPrev.findIndex(oItem => oItem.product.id === oProduct.id);
        let aNewCart: CartItem[] = [];
        if (nExistIdx > -1) {
          aNewCart = [...aPrev];
          aNewCart[nExistIdx] = {
            ...aNewCart[nExistIdx],
            count: aNewCart[nExistIdx].count + 1
          };
        } else {
          aNewCart = [...aPrev, { product: oProduct, count: 1 }];
        }
        get().fnUpdateCartState(aNewCart);
      }
      set({ bIsCartOpen: true });
    },

    fnRemoveFromCart: async (nProductId) => {
      const { oUser, bIsOnline, sSelectedMerchant } = get();
      if (oUser && bIsOnline) {
        try {
          api.setMerchantId(sSelectedMerchant);
          api.setToken(oUser.token);
          const oRes = await api.delete(`/api/cart?productId=${nProductId}`);
          if (oRes.success) {
            await get().fnLoadCartFromServer(oUser.token, sSelectedMerchant);
          }
        } catch (e) {
          console.error("移除購物車商品遠端同步失敗：", e);
        }
      } else {
        const aNewCart = get().aCart.filter(oItem => oItem.product.id !== nProductId);
        get().fnUpdateCartState(aNewCart);
      }
    },

    fnShowCustomAlert: (sTitle, sMessage, sCode) => {
      set({
        oCustomAlert: {
          show: true,
          title: sTitle,
          message: sMessage,
          code: sCode
        }
      });
    },

    fnHandleLogout: () => {
      api.post('/api/Auth/logout').catch((oErr) => {
        console.warn("呼叫後端登出 API 失敗：", oErr);
      });

      set({
        oUser: null,
        aCart: [],
        nTotalCartCount: 0,
        nTotalCartAmount: 0
      });
      localStorage.removeItem('user_session');
      get().fnShowCustomAlert("登出", "您已成功登出系統。");
    },

    fnCheckout: () => {
      const { oUser, sSelectedMerchant, nTotalCartAmount } = get();
      if (!oUser) {
        set({ sAuthTab: 'login', bIsAuthModalOpen: true });
        return;
      }

      alert(`感謝您在 ${STORE_NAMES[sSelectedMerchant]} 下單！結帳金額：NT$ ${nTotalCartAmount.toLocaleString()}`);
      get().fnUpdateCartState([]);
      set({ bIsCartOpen: false });
    },

    fnOnLoginSuccess: async (oSession) => {
      set({ oUser: oSession, bIsAuthModalOpen: false });
      localStorage.setItem('user_session', JSON.stringify(oSession));
      api.setToken(oSession.token);

      const sLocalCarts = localStorage.getItem('guest_carts');
      let bHasItemsToSync = false;
      if (sLocalCarts) {
        try {
          const oCarts = JSON.parse(sLocalCarts);
          bHasItemsToSync = Object.values(oCarts).some((aItems: any) => Array.isArray(aItems) && aItems.length > 0);
        } catch (e) {}
      }

      const { sSelectedMerchant } = get();
      if (bHasItemsToSync) {
        await get().fnSyncAllCartsWithServer(oSession.token);
        await get().fnLoadCartFromServer(oSession.token, sSelectedMerchant);
        get().fnShowCustomAlert("成功", "登入成功！已完成各商家訪客購物車合併。");
      } else {
        await get().fnLoadCartFromServer(oSession.token, sSelectedMerchant);
        get().fnShowCustomAlert("成功", `登入成功！歡迎回來，${oSession.username || '會員'}。`);
      }
    },

    fnOnRegisterSuccess: async (oSession) => {
      set({ oUser: oSession, bIsAuthModalOpen: false });
      localStorage.setItem('user_session', JSON.stringify(oSession));
      api.setToken(oSession.token);

      const sLocalCarts = localStorage.getItem('guest_carts');
      let bHasItemsToSync = false;
      if (sLocalCarts) {
        try {
          const oCarts = JSON.parse(sLocalCarts);
          bHasItemsToSync = Object.values(oCarts).some((aItems: any) => Array.isArray(aItems) && aItems.length > 0);
        } catch (e) {}
      }

      const { sSelectedMerchant } = get();
      if (bHasItemsToSync) {
        await get().fnSyncAllCartsWithServer(oSession.token);
        await get().fnLoadCartFromServer(oSession.token, sSelectedMerchant);
        get().fnShowCustomAlert("成功", "註冊成功，已為您自動登入！原各商家訪客購物車商品已成功合併同步。");
      } else {
        await get().fnLoadCartFromServer(oSession.token, sSelectedMerchant);
        get().fnShowCustomAlert("成功", "註冊成功，已為您自動登入！");
      }
    }
  }));
};

export const StorefrontContext = createContext<StorefrontStore | undefined>(undefined);

export interface StorefrontProviderProps extends StorefrontInitialProps {
  children: React.ReactNode;
}

export function StorefrontProvider({
  children,
  initialMerchantId,
  initialCategory,
  initialProducts,
  initialCategories,
  initialMerchantName,
  initialMerchantLogo,
  initialOnline
}: StorefrontProviderProps) {
  const storeRef = useRef<StorefrontStore>();
  if (!storeRef.current) {
    storeRef.current = createStorefrontStore({
      initialMerchantId,
      initialCategory,
      initialProducts,
      initialCategories,
      initialMerchantName,
      initialMerchantLogo,
      initialOnline
    });
  }

  const store = storeRef.current;

  useEffect(() => {
    // 註冊 ApiClient 的 Loading 與 Session 同步狀態回呼，並同步 React 狀態與 ApiClient 的參數
    api.registerLoadingCallback((bLoading) => {
      store.setState({ bIsLoading: bLoading });
    });

    api.registerSessionRefreshedCallback((oSession) => {
      store.setState({ oUser: oSession });
      if (oSession) {
        localStorage.setItem('user_session', JSON.stringify(oSession));
        api.setToken(oSession.token);
      } else {
        localStorage.removeItem('user_session');
        api.setToken('');
      }
    });

    // 初始化 localStorage 的 Session
    const sSession = localStorage.getItem('user_session');
    let oInitialUser: UserSession | null = null;
    if (sSession) {
      try {
        oInitialUser = JSON.parse(sSession);
        // 額外安全檢查：若本地暫存的 Session 商家與當前已選的商家不符，則清除以防 API 發生多租戶覆蓋
        const { sSelectedMerchant } = store.getState();
        if (oInitialUser && oInitialUser.merchantId !== sSelectedMerchant) {
          oInitialUser = null;
          localStorage.removeItem('user_session');
        } else {
          store.setState({ oUser: oInitialUser });
          api.setToken(oInitialUser?.token || '');
        }
      } catch (e) {
        localStorage.removeItem('user_session');
      }
    }

    // 進行首次載入 (若伺服器端無預載資料，則進行首次載入)
    const { sSelectedMerchant, aProducts } = store.getState();
    if (aProducts.length === 0) {
      store.getState().fnFetchProducts(sSelectedMerchant, oInitialUser);
      store.getState().fnFetchCategories(sSelectedMerchant);
      store.getState().fnFetchMerchantInfo(sSelectedMerchant);
    } else {
      // 若已有伺服器端預載商品，仍需載入會員購物車
      if (oInitialUser) {
        store.getState().fnLoadCartFromServer(oInitialUser.token, sSelectedMerchant);
      }
    }

  }, [store]);

  return (
    <StorefrontContext.Provider value={store}>
      {children}
    </StorefrontContext.Provider>
  );
}

// 實作支援 Selector 與向下相容的 useStorefront Hook
export function useStorefront<T = StorefrontContextType>(
  fnSelector?: (state: StorefrontContextType) => T
): T {
  const store = useContext(StorefrontContext);
  if (!store) {
    throw new Error('useStorefront must be used within a StorefrontProvider');
  }

  if (fnSelector) {
    return useStore(store, fnSelector);
  }
  
  return useStore(store, (s) => s as any);
}

