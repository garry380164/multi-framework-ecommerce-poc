'use client';

import { useEffect, useContext } from 'react';
import { StorefrontContext } from '@/features/storefront/components/StorefrontProvider';

export function StorefrontStoreSync({
  sMerchantId,
  sCategory,
  aProducts,
  aCategories,
  sMerchantName,
  sMerchantLogo,
  bIsOnline,
  bHasMore
}: any) {
  const store = useContext(StorefrontContext);
  if (!store) {
    throw new Error('StorefrontStoreSync must be used within a StorefrontProvider');
  }


  useEffect(() => {
    // 當伺服器端因為路由參數變更回傳新資料時，即時更新 Zustand 狀態庫
    store.setState({
      sSelectedMerchant: sMerchantId,
      sSelectedCategory: sCategory,
      aProducts,
      aCategories,
      sMerchantName,
      sMerchantLogo,
      bIsOnline,
      bHasMore,
      nPage: 1, // 重設分頁
      bIsLoadingMore: false,
      bIsProductsLoading: false
    });
  }, [
    sMerchantId,
    sCategory,
    aProducts,
    aCategories,
    sMerchantName,
    sMerchantLogo,
    bIsOnline,
    bHasMore,
    store
  ]);

  return null;
}
