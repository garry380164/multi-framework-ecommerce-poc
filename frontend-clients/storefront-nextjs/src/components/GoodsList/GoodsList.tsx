'use client';

import React from 'react';
import styles from './GoodsList.module.css';
import { Product } from '../types';
import { useStorefront } from '../StorefrontProvider';

// 定義 GoodsCard 的 Props 介面
interface GoodsCardProps {
  oProduct: Product;
  fnAddToCart: (oProduct: Product) => Promise<void>;
}

// 將單一商品卡片擷取為獨立元件並使用 React.memo 快取以優化效能
const GoodsCard = React.memo(function GoodsCard({ oProduct, fnAddToCart }: GoodsCardProps) {
  const bIsSoldOut = oProduct.stock <= 0 || oProduct.sBadgeText === 'SOLD OUT';

  return (
    <article className={styles.card}>
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
});

// 為 React.memo 包裹的元件設定 displayName 便於除錯
GoodsCard.displayName = 'GoodsCard';

const GoodsCardSkeleton = React.memo(function GoodsCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeleton}`}>
      <div className={`${styles.imageWrapper} ${styles.skeletonImage}`}></div>
      <div className={styles.cardBody}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.cardFooter}>
          <div className={styles.skeletonPrice}></div>
          <div className={styles.skeletonStock}></div>
        </div>
      </div>
    </div>
  );
});

GoodsCardSkeleton.displayName = 'GoodsCardSkeleton';

export default function GoodsList() {
  const aProducts = useStorefront((s) => s.aProducts);
  const bIsProductsLoading = useStorefront((s) => s.bIsProductsLoading);
  const bIsLoadingMore = useStorefront((s) => s.bIsLoadingMore);
  const bHasMore = useStorefront((s) => s.bHasMore);
  const fnLoadNextPage = useStorefront((s) => s.fnLoadNextPage);
  const fnAddToCart = useStorefront((s) => s.fnAddToCart);

  const sentinelRef = React.useRef<HTMLDivElement>(null);

  // 監聽滾動觸發加載下一頁商品 (繁體中文註解以符合全域開發規範)
  React.useEffect(() => {
    if (!bHasMore || bIsProductsLoading || bIsLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fnLoadNextPage();
        }
      },
      {
        rootMargin: '120px', // 提前 120 像素載入，提升前台使用者滾動滑順感
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [bHasMore, bIsProductsLoading, bIsLoadingMore, fnLoadNextPage]);

  // 初始載入大骨架屏 (顯示 6 個商品卡片)
  if (bIsProductsLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <GoodsCardSkeleton key={`init-sk-${idx}`} />
        ))}
      </div>
    );
  }

  if (aProducts.length === 0) {
    return (
      <div className={styles.noProductsContainer}>
        此分類目前沒有商品。
      </div>
    );
  }

  return (
    <>
      <div className={styles.grid}>
        {aProducts.map((oProduct) => (
          <GoodsCard
            key={oProduct.id}
            oProduct={oProduct}
            fnAddToCart={fnAddToCart}
          />
        ))}

        {/* 滾動加載中的額外 3 個微光骨架屏卡片 */}
        {bIsLoadingMore && (
          <>
            <GoodsCardSkeleton key="load-sk-1" />
            <GoodsCardSkeleton key="load-sk-2" />
            <GoodsCardSkeleton key="load-sk-3" />
          </>
        )}
      </div>

      {/* 滾動偵測哨兵 */}
      {bHasMore && <div ref={sentinelRef} className={styles.sentinel} />}

      {/* 已顯示所有商品結束提示線 */}
      {!bHasMore && aProducts.length > 0 && (
        <div className={styles.noMoreProducts}>
          <span className={styles.noMoreDivider}></span>
          <span className={styles.noMoreText}>已載入所有商品</span>
          <span className={styles.noMoreDivider}></span>
        </div>
      )}
    </>
  );
}

