'use client';

import React from 'react';
import styles from '@/app/page.module.css';
import Banner from '@/features/storefront/components/Banner';
import GoodsList from '@/features/storefront/components/GoodsList';
import CategorySidebar from '@/features/storefront/components/CategorySidebar';

export default function StorefrontPageClient() {
  return (
    <main>
      {/* 主畫面容器 */}
      <div className={styles.container}>
        {/* Banner 廣告看板區塊 */}
        <Banner />

        {/* 分類選單與商品列表佈局容器 */}
        <div className={styles.mainLayout}>
          <CategorySidebar />
          <GoodsList />
        </div>
      </div>
    </main>
  );
}
