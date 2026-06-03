'use client';

import React from 'react';
import styles from './GoodsList.module.css';
import { Product } from '../types';
import { useStorefront } from '../StorefrontProvider';

export default function GoodsList() {
  const { aProducts, bIsLoading, fnAddToCart, sSelectedCategory } = useStorefront();

  // 根據選擇的分類篩選商品 (繁體中文註解)
  const aFilteredProducts = React.useMemo(() => {
    if (sSelectedCategory === 'ALL') return aProducts;
    return aProducts.filter((oProd) => oProd.sCategory === sSelectedCategory);
  }, [aProducts, sSelectedCategory]);

  if (bIsLoading) {
    return (
      <div className={styles.loadingContainer}>
        正在載入商品列表...
      </div>
    );
  }

  if (aFilteredProducts.length === 0) {
    return (
      <div className={styles.noProductsContainer}>
        此分類目前沒有商品。
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {aFilteredProducts.map((oProduct) => {
        const bIsSoldOut = oProduct.stock <= 0 || oProduct.sBadgeText === 'SOLD OUT';
        return (
          <article className={styles.card} key={oProduct.id}>
            {/* 商品圖片區 */}
            <div className={styles.imageWrapper}>
              {/* SOLD OUT 濾鏡與標籤 */}
              {oProduct.sBadgeText === 'SOLD OUT' && (
                <span className={styles.badgeSoldOut}>SOLD OUT</span>
              )}
              
              {/* 新規入會 標籤 */}
              {oProduct.sBadgeText === '新規入會' && (
                <span className={styles.badgeNewMember}>新規入會</span>
              )}
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={`${styles.image} ${
                  oProduct.bIsFullImage ? styles.imageFull : ''
                } ${bIsSoldOut ? styles.imageSoldOut : ''}`}
                src={oProduct.imageUrl}
                alt={oProduct.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default_product.png';
                }}
              />
              
              {/* Hover Overlay 快速加入 */}
              {!bIsSoldOut && (
                <div className={styles.quickAddOverlay}>
                  <button
                    className={styles.quickAddBtn}
                    onClick={() => fnAddToCart(oProduct)}
                  >
                    + QUICK ADD
                  </button>
                </div>
              )}
            </div>
            
            {/* 商品文字資訊 */}
            <div className={styles.cardBody}>
              <h2 className={styles.productName}>{oProduct.name}</h2>
              <div className={styles.cardFooter}>
                <span className={styles.price}>
                  {oProduct.sPriceFormatted || `NT$ ${oProduct.price.toLocaleString()}`}
                </span>
                <span className={styles.stockStatus}>
                  {oProduct.stock > 0 ? `有現貨` : '已售罄'}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
