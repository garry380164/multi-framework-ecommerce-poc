'use client';

import React from 'react';
import styles from './Topbar.module.css';
import { useStorefront } from '../StorefrontProvider';

export default function Topbar() {
  const oUser = useStorefront((s) => s.oUser);
  const nTotalCartCount = useStorefront((s) => s.nTotalCartCount);
  const sSelectedMerchant = useStorefront((s) => s.sSelectedMerchant);
  const setSSelectedMerchant = useStorefront((s) => s.setSSelectedMerchant);
  const bIsLoading = useStorefront((s) => s.bIsLoading);
  const bIsOnline = useStorefront((s) => s.bIsOnline);
  const setBIsCartOpen = useStorefront((s) => s.setBIsCartOpen);
  const setBIsAuthModalOpen = useStorefront((s) => s.setBIsAuthModalOpen);
  const setSAuthTab = useStorefront((s) => s.setSAuthTab);
  const fnHandleLogout = useStorefront((s) => s.fnHandleLogout);
  const fnFetchProducts = useStorefront((s) => s.fnFetchProducts);
  const sMerchantLogo = useStorefront((s) => s.sMerchantLogo);

  return (
    <header className={styles.headerContainer}>
      {/* 最頂部控制條 (多租戶技術展示) */}
      <div className={styles.controlBar}>
        <div className={styles.statusIndicator}>
          <span
            className={`${styles.dot} ${
              bIsOnline ? styles.dotOnline : styles.dotOffline
            }`}
          ></span>
          <span>
            {bIsOnline
              ? '連線模式：後端 API 正常運行 (EF Core Global Query Filter)'
              : '展示模式：後端 API 未連線，已啟用 Mock 展示資料'}
          </span>
        </div>
        <div className={styles.controls}>
          <span className={styles.merchantSelectorLabel}>切換模擬商家商店：</span>
          <select
            className={styles.select}
            value={sSelectedMerchant}
            onChange={(e) => setSSelectedMerchant(e.target.value)}
            disabled={bIsLoading}
          >
            <option value="store-a">極簡咖啡館 (Store A)</option>
            <option value="store-b">潮流服飾店 (Store B)</option>
          </select>
        </div>
      </div>

      {/* 主導覽列 */}
      <div className={styles.header}>
        <div className={styles.brand} onClick={() => fnFetchProducts(sSelectedMerchant, oUser)}>
          {sMerchantLogo ? (
            <img src={sMerchantLogo} alt="Logo" className={styles.merchantLogo} />
          ) : (
            <>
              <span className={styles.logoG}>g</span><span>enron</span>
            </>
          )}
        </div>
        
        {/* 繁體中文導覽選單 */}
        <ul className={styles.navMenu}>
          <li><a href="#" className={styles.navLink}>關於我們</a></li>
          <li>
            <a href="#" className={styles.navLink}>
              商品分類 <span className={styles.navArrow}>∨</span>
            </a>
          </li>
          <li><a href="#" className={styles.navLink}>最新消息</a></li>
          <li><a href="#" className={styles.navLink}>常見問題 <span className={styles.navArrow}>↗</span></a></li>
          <li><a href="#" className={styles.navLink}>聯絡我們 <span className={styles.navArrow}>↗</span></a></li>
        </ul>

        {/* 右側功能圖示 */}
        <div className={styles.navIcons}>
          <button className={styles.iconBtn} aria-label="搜尋" onClick={() => alert('搜尋功能示範')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          
          {oUser ? (
            <div className={styles.userSection}>
              <span className={styles.userNameDisplay}>{oUser.username}</span>
              <button 
                className={styles.logoutBtn} 
                onClick={fnHandleLogout} 
                title="會員登出"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            <button 
              className={styles.iconBtn} 
              aria-label="帳戶" 
              onClick={() => { setSAuthTab('login'); setBIsAuthModalOpen(true); }}
              title="會員登入"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          )}
          
          <button className={styles.iconBtn} aria-label="購物車" onClick={() => setBIsCartOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {nTotalCartCount > 0 && (
              <span className={styles.cartBadge}>{nTotalCartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
