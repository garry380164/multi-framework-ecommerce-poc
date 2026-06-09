'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import styles from './CategorySidebar.module.css';
import { useStorefront } from '../StorefrontProvider';

export default function CategorySidebar() {
  const aCategories = useStorefront((s) => s.aCategories);
  const sSelectedCategory = useStorefront((s) => s.sSelectedCategory);
  const sSelectedMerchant = useStorefront((s) => s.sSelectedMerchant);

  // 計算所有分類商品數總和當作全部商品數量 (繁體中文註解以符合全域規範)
  const nTotalProductsCount = useMemo(() => {
    return aCategories.reduce((nSum, oCat) => nSum + oCat.count, 0);
  }, [aCategories]);

  return (
    <aside className={styles.sidebarContainer}>
      <h3 className={styles.sidebarTitle}>商品分類</h3>
      <nav className={styles.navigation}>
        {/* 全部商品按鈕 */}
        <Link
          href={`/${sSelectedMerchant}`}
          className={`${styles.navItem} ${sSelectedCategory === 'ALL' ? styles.active : ''}`}
        >
          全部商品 <span className={styles.countText}>({nTotalProductsCount})</span>
        </Link>

        {/* 動態分類按鈕 */}
        {aCategories.map((oCat) => {
          return (
            <Link
              key={oCat.name}
              href={`/${sSelectedMerchant}/${encodeURIComponent(oCat.name)}`}
              className={`${styles.navItem} ${sSelectedCategory === oCat.name ? styles.active : ''}`}
            >
              {oCat.name} <span className={styles.countText}>({oCat.count})</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

