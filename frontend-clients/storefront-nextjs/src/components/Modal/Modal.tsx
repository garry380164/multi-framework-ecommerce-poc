'use client';

import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  bIsOpen: boolean;
  fnOnClose: () => void;
  children: React.ReactNode;
  sWidth?: string;
}

export default function Modal({
  bIsOpen,
  fnOnClose,
  children,
  sWidth = '440px'
}: ModalProps) {
  // 控制 DOM 是否掛載 (匈牙利命名：b 代表 Boolean)
  const [bShouldRender, setBShouldRender] = useState<boolean>(false);
  // 控制是否為關閉中狀態以觸發退出動畫 (匈牙利命名：b 代表 Boolean)
  const [bIsClosing, setBIsClosing] = useState<boolean>(false);

  useEffect(() => {
    let nTimerId: NodeJS.Timeout; // 匈牙利命名：n 代表 Number
    if (bIsOpen) {
      // 開啟時直接渲染 DOM，利用 CSS @keyframes 自動播放進入動畫
      setBShouldRender(true);
      setBIsClosing(false);
    } else if (bShouldRender) {
      // 已渲染但接收到關閉信號，先播放退出動畫，於 300ms 後卸載 DOM
      setBIsClosing(true);
      nTimerId = setTimeout(() => {
        setBShouldRender(false);
        setBIsClosing(false);
      }, 300);
    }
    return () => {
      if (nTimerId) clearTimeout(nTimerId);
    };
  }, [bIsOpen, bShouldRender]);

  // 監聽 Esc 按鍵以關閉 Modal (匈牙利命名：fn 代表 Function)
  useEffect(() => {
    if (!bShouldRender) return;

    const fnHandleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        fnOnClose();
      }
    };

    window.addEventListener('keydown', fnHandleKeyDown);
    return () => window.removeEventListener('keydown', fnHandleKeyDown);
  }, [bShouldRender, fnOnClose]);

  if (!bShouldRender) return null;

  return (
    <div 
      className={`${styles.modalOverlay} ${bIsClosing ? styles.modalOverlayClosing : ''}`} 
      onClick={fnOnClose}
    >
      <div 
        className={`${styles.modalContent} ${bIsClosing ? styles.modalContentClosing : ''}`} 
        style={{ width: sWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
