'use client';

import React, { useMemo, useContext } from 'react';
import Link from 'next/link';
import styles from './CategorySidebar.module.css';
import { useStorefront, StorefrontContext } from '../StorefrontProvider';

export default function CategorySidebar() {
  const aCategories = useStorefront((s) => s.aCategories);
  const sSelectedCategory = useStorefront((s) => s.sSelectedCategory);
  const sSelectedMerchant = useStorefront((s) => s.sSelectedMerchant);
  
  const store = useContext(StorefrontContext);

  // 計算所有分類商品數總和當作全部商品數量 (繁體中文註解以符合全域規範)
  const nTotalProductsCount = useMemo(() => {
    return aCategories.reduce((nSum, oCat) => nSum + oCat.count, 0);
  }, [aCategories]);

  // 混合導航處理程式：攔截點擊行為，手動更新狀態並更新網址列，避免任何滾動跳轉
  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, sCatName: string) => {
    e.preventDefault();
    if (!store) return;
    
    // 透過 Zustand 直接觸發客戶端篩選與資料獲取
    store.getState().setSSelectedCategory(sCatName);
    
    // 使用 HTML5 History API 更新網址列，但不觸發 Next.js 頁面重載與滾動回復
    const sHref = sCatName === 'ALL' 
      ? `/${sSelectedMerchant}` 
      : `/${sSelectedMerchant}/${encodeURIComponent(sCatName)}`;
    window.history.pushState(null, '', sHref);
  };

  return (
    <aside className={styles.sidebarContainer}>
      <h3 className={styles.sidebarTitle}>商品分類</h3>
      <nav className={styles.navigation}>
        {/* 全部商品按鈕 */}
        <Link
          href={`/${sSelectedMerchant}`}
          className={`${styles.navItem} ${sSelectedCategory === 'ALL' ? styles.active : ''}`}
          scroll={false}
          onClick={(e) => handleCategoryClick(e, 'ALL')}
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
              scroll={false}
              onClick={(e) => handleCategoryClick(e, oCat.name)}
            >
              {oCat.name} <span className={styles.countText}>({oCat.count})</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


