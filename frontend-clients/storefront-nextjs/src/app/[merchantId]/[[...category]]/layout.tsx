import React from 'react';
import { StorefrontProvider } from '@/features/storefront/components/StorefrontProvider';
import { fnServerFetchStorefrontData } from '@/features/storefront/services/serverFetch';
import Topbar from '@/features/storefront/components/Topbar';
import CartList from '@/features/storefront/components/CartList';
import LoginModal from '@/features/storefront/components/LoginModal';
import CustomAlert from '@/features/storefront/components/CustomAlert';

interface Props {
  children: React.ReactNode;
  params: { merchantId: string; category?: string[] };
}

export default async function MerchantLayout({ children, params }: Props) {
  const sMerchantId = params.merchantId || 'store-a';
  
  // 當路徑含有分類時 (例如 /store-a/Coffee)，category 參數會是 ['Coffee']
  const sCategory = params.category?.[0] ? decodeURIComponent(params.category[0]) : 'ALL';

  // 伺服器端進行 API 資料抓取 (或 Mock 降級)
  const oServerData = await fnServerFetchStorefrontData(sMerchantId, sCategory);

  return (
    <StorefrontProvider
      initialMerchantId={oServerData.sMerchantId}
      initialCategory={oServerData.sCategory}
      initialProducts={oServerData.aProducts}
      initialCategories={oServerData.aCategories}
      initialMerchantName={oServerData.sMerchantName}
      initialMerchantLogo={oServerData.sMerchantLogo}
      initialOnline={oServerData.bIsOnline}
    >
      <Topbar />
      {children}
      <CartList />
      <LoginModal />
      <CustomAlert />
    </StorefrontProvider>
  );
}
