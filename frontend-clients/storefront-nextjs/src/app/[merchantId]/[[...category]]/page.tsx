import React from 'react';
import { Metadata } from 'next';
import { STORE_NAMES } from '../../../components/StorefrontProvider/mockData';
import { fnServerFetchStorefrontData } from '../../../components/StorefrontProvider/serverFetch';
import { StorefrontStoreSync } from './sync';
import StorefrontPageClient from './page.client';

interface Props {
  params: { merchantId: string; category?: string[] };
}

// 1. 動態產生伺服器端 Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sMerchantId = params.merchantId || 'store-a';
  const sCategory = params.category?.[0] ? decodeURIComponent(params.category[0]) : 'ALL';
  
  const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5176';
  let sMerchantName = STORE_NAMES[sMerchantId] || '未知商店';

  try {
    const oRes = await fetch(`${sApiUrl}/api/merchants/current`, {
      headers: { 'X-Merchant-Id': sMerchantId },
      cache: 'no-store',
    }).then(r => r.ok ? r.json() : null).catch(() => null);

    if (oRes && oRes.success && oRes.data?.name) {
      sMerchantName = oRes.data.name;
    }
  } catch {}

  const sTitle = sCategory === 'ALL' 
    ? `${sMerchantName} - 官方線上商店` 
    : `${sCategory} | ${sMerchantName} 精選商品`;

  const sBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    title: sTitle,
    description: `歡迎光臨 ${sMerchantName}！採用 Next.js 14 SSR 技術打造，為您提供最優質的 ${sCategory === 'ALL' ? '系列商品' : sCategory}。線上即刻下單！`,
    alternates: {
      canonical: `${sBaseUrl}/${sMerchantId}${sCategory === 'ALL' ? '' : `/${encodeURIComponent(sCategory)}`}`,
    },
    openGraph: {
      title: sTitle,
      description: `歡迎光臨 ${sMerchantName}！精選優質商品，線上即刻下標。`,
      type: 'website',
    }
  };
}

// 2. 頁面 Server Component
export default async function MerchantPage({ params }: Props) {
  const sMerchantId = params.merchantId || 'store-a';
  const sCategory = params.category?.[0] ? decodeURIComponent(params.category[0]) : 'ALL';

  // 伺服器端抓取 SSR 初始資料
  const oServerData = await fnServerFetchStorefrontData(sMerchantId, sCategory);

  const sBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 3. 配置 JSON-LD 結構化資料 (提升 Google 富媒體搜尋結果點擊率)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${sBaseUrl}/${sMerchantId}`,
    name: oServerData.sMerchantName,
    url: `${sBaseUrl}/${sMerchantId}`,
    image: oServerData.sMerchantLogo.startsWith('/') 
      ? `${sBaseUrl}${oServerData.sMerchantLogo}` 
      : oServerData.sMerchantLogo,
    description: `${oServerData.sMerchantName} - 官方電商平台，為您提供豐富的精品商品選購。`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${sBaseUrl}/${sMerchantId}?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      {/* 注入 JSON-LD 結構化資料 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 將 SSR 資料同步至 Zustand */}
      <StorefrontStoreSync
        sMerchantId={oServerData.sMerchantId}
        sCategory={oServerData.sCategory}
        aProducts={oServerData.aProducts}
        aCategories={oServerData.aCategories}
        sMerchantName={oServerData.sMerchantName}
        sMerchantLogo={oServerData.sMerchantLogo}
        bIsOnline={oServerData.bIsOnline}
        bHasMore={oServerData.bHasMore}
      />

      {/* 載入客戶端主要 UI 配置 */}
      <StorefrontPageClient />
    </>
  );
}
