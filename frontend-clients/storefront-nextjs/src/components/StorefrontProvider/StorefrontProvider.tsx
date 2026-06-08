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

export const createStorefrontStore = () => {
  return createStore<StorefrontContextType>((set, get) => ({
    sSelectedMerchant: 'store-a',
    sMerchantLogo: '/images/logo-store-a.png',
    sMerchantName: '極簡咖啡館 (Store A)',
    sSelectedCategory: 'ALL',
    aProducts: [],
    aCategories: [],
    nPage: 1,
    bHasMore: true,
    bIsLoadingMore: false,
    bIsProductsLoading: true,
    bIsOnline: false,
    bIsLoading: true,
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
      get().fnFetchProducts(sMerchantId, get().oUser, false);
      get().fnFetchCategories(sMerchantId);
      get().fnFetchMerchantInfo(sMerchantId);
    },

    setSSelectedCategory: (sCategory) => {
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

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<StorefrontStore>();
  if (!storeRef.current) {
    storeRef.current = createStorefrontStore();
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
        store.setState({ oUser: oInitialUser });
        api.setToken(oInitialUser?.token || '');
      } catch (e) {
        localStorage.removeItem('user_session');
      }
    }

    // 進行首次載入
    const { sSelectedMerchant } = store.getState();
    store.getState().fnFetchProducts(sSelectedMerchant, oInitialUser);
    store.getState().fnFetchCategories(sSelectedMerchant);
    store.getState().fnFetchMerchantInfo(sSelectedMerchant);

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

