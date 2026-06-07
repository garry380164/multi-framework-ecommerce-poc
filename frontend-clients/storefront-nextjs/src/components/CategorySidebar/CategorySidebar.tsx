'use client';

import React, { useMemo } from 'react';
import styles from './CategorySidebar.module.css';
import { useStorefront } from '../StorefrontProvider';

export default function CategorySidebar() {
  const { aProducts, sSelectedCategory, setSSelectedCategory } = useStorefront();

  // 動態自目前的商品列表中提取所有不重複的分類
  const aCategories = useMemo(() => {
    const oCategoriesSet = new Set<string>();
    aProducts.forEach((oProd) => {
      if (oProd.sCategory) {
        oCategoriesSet.add(oProd.sCategory);
      }
    });
    return Array.from(oCategoriesSet);
  }, [aProducts]);

  return (
    <aside className={styles.sidebarContainer}>
      <h3 className={styles.sidebarTitle}>商品分類</h3>
      <nav className={styles.navigation}>
        {/* 全部商品按鈕 */}
        <button
          className={`${styles.navItem} ${sSelectedCategory === 'ALL' ? styles.active : ''}`}
          onClick={() => setSSelectedCategory('ALL')}
        >
          全部商品 <span className={styles.countText}>({aProducts.length})</span>
        </button>

        {/* 動態分類按鈕 */}
        {aCategories.map((sCat) => {
          const nCatProductCount = aProducts.filter((oProd) => oProd.sCategory === sCat).length;
          return (
            <button
              key={sCat}
              className={`${styles.navItem} ${sSelectedCategory === sCat ? styles.active : ''}`}
              onClick={() => setSSelectedCategory(sCat)}
            >
              {sCat} <span className={styles.countText}>({nCatProductCount})</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
