'use client';

import React from 'react';
import styles from './Banner.module.css';
import { useStorefront } from '@/features/storefront/components/StorefrontProvider';

export default function Banner() {
  const sSelectedMerchant = useStorefront((s) => s.sSelectedMerchant);
  const sMerchantName = useStorefront((s) => s.sMerchantName);

  return (
    <section
      className={styles.mainTitleSection}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), url(${
          sSelectedMerchant === 'store-a' ? '/store_a_banner.png' : '/store_b_banner.png'
        })`
      }}
    >
      {/* 毛玻璃質感文字卡片 */}
      <div className={styles.bannerContent}>
        <h1 className={styles.mainTitle}>精選商品</h1>
        <div className={styles.mainSubtitle}>
          {sMerchantName}
        </div>
      </div>
    </section>
  );
}
