'use client';

import React from 'react';
import styles from './CartList.module.css';
import { useStorefront } from '@/features/storefront/components/StorefrontProvider';

export default function CartList() {
  const bIsCartOpen = useStorefront((s) => s.bIsCartOpen);
  const setBIsCartOpen = useStorefront((s) => s.setBIsCartOpen);
  const aCart = useStorefront((s) => s.aCart);
  const nTotalCartAmount = useStorefront((s) => s.nTotalCartAmount);
  const fnRemoveFromCart = useStorefront((s) => s.fnRemoveFromCart);
  const fnCheckout = useStorefront((s) => s.fnCheckout);

  return (
    <>
      {/* 購物車 Drawer 背景遮罩 */}
      <div 
        className={`${styles.cartDrawerOverlay} ${bIsCartOpen ? styles.cartDrawerOverlayActive : ''}`}
        onClick={() => setBIsCartOpen(false)}
      />
      
      {/* 購物車 Drawer 側邊欄 */}
      <div className={`${styles.cartDrawer} ${bIsCartOpen ? styles.cartDrawerActive : ''}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>購物車明細</span>
          <button className={styles.closeBtn} onClick={() => setBIsCartOpen(false)} aria-label="關閉購物車">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className={styles.drawerBody}>
          {aCart.length === 0 ? (
            <div className={styles.drawerEmpty}>
              您的購物車是空的
            </div>
          ) : (
            <ul className={styles.drawerList}>
              {aCart.map((oItem) => (
                <li className={styles.drawerItem} key={oItem.product.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                     className={styles.drawerItemImage}
                     src={oItem.product.imageUrl} 
                     alt={oItem.product.name}
                  />
                  <div className={styles.drawerItemInfo}>
                    <span className={styles.drawerItemName}>{oItem.product.name}</span>
                    <div className={styles.drawerItemDetail}>
                      <span className={styles.drawerItemPrice}>
                        {oItem.product.sPriceFormatted ? oItem.product.sPriceFormatted.split(' ')[0] + ' ' + oItem.product.sPriceFormatted.split(' ')[1] : `NT$ ${oItem.product.price.toLocaleString()}`} x {oItem.count}
                      </span>
                      <button 
                        className={styles.drawerItemRemove}
                        onClick={() => fnRemoveFromCart(oItem.product.id)}
                      >
                        移除
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {aCart.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.drawerTotal}>
              <span>應付總額</span>
              <span className={styles.drawerTotalAmount}>
                NT$ {nTotalCartAmount.toLocaleString()}
              </span>
            </div>
            <button 
              className={styles.drawerCheckoutBtn}
              onClick={fnCheckout}
            >
              確認結帳
            </button>
          </div>
        )}
      </div>
    </>
  );
}
