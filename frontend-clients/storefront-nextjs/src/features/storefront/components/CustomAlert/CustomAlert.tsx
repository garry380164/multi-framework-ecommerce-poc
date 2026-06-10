'use client';

import React from 'react';
import styles from './CustomAlert.module.css';
import { useStorefront } from '../StorefrontProvider';

export default function CustomAlert() {
  const oCustomAlert = useStorefront((s) => s.oCustomAlert);
  const setOCustomAlert = useStorefront((s) => s.setOCustomAlert);
  const setSRegCode = useStorefront((s) => s.setSRegCode);

  if (!oCustomAlert || !oCustomAlert.show) return null;

  const { title, message, code } = oCustomAlert;

  const fnHandleClose = () => {
    setOCustomAlert(null);
  };

  const fnHandleAutoFill = () => {
    if (code) {
      setSRegCode(code);
    }
    setOCustomAlert(null);
  };

  return (
    <div className={styles.toastOverlay} onClick={fnHandleClose}>
      <div className={styles.toastCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.toastHeader}>
          <span className={styles.toastTitle}>{title}</span>
          <button 
            className={styles.toastCloseBtn} 
            onClick={fnHandleClose}
          >
            ✕
          </button>
        </div>
        <div className={styles.toastBody}>
          <p>{message}</p>
          {code && (
            <div className={styles.toastCodeBlock}>
              <span className={styles.toastCodeLabel}>驗證碼：</span>
              <span className={styles.toastCodeValue}>{code}</span>
              <button
                className={styles.toastAutoFillBtn}
                onClick={fnHandleAutoFill}
              >
                自動填入
              </button>
            </div>
          )}
        </div>
        <div className={styles.toastFooter}>
          <button 
            className={styles.toastConfirmBtn} 
            onClick={fnHandleClose}
          >
            確定
          </button>
        </div>
      </div>
    </div>
  );
}
