'use client';

import React, { useState, useEffect } from 'react';
import styles from './LoginModal.module.css';
import { UserSession } from '../types';
import { useStorefront } from '../StorefrontProvider';
import Modal from '../Modal';

export default function LoginModal() {
  const {
    bIsAuthModalOpen,
    sAuthTab,
    setBIsAuthModalOpen,
    sSelectedMerchant,
    sRegCode,
    setSRegCode,
    fnOnLoginSuccess,
    fnOnRegisterSuccess,
    fnShowCustomAlert
  } = useStorefront();

  const [sTab, setSTab] = useState<'login' | 'register'>('login');
  
  // 登入欄位狀態
  const [sLogEmail, setSLogEmail] = useState<string>('');
  const [sLogPassword, setSLogPassword] = useState<string>('');

  // 註冊欄位狀態
  const [sRegEmail, setSRegEmail] = useState<string>('');
  const [sRegPassword, setSRegPassword] = useState<string>('');
  const [sRegConfirmPassword, setSRegConfirmPassword] = useState<string>('');

  // 當預設分頁或彈窗開關改變時同步 Tab
  useEffect(() => {
    setSTab(sAuthTab);
  }, [sAuthTab, bIsAuthModalOpen]);



  // 發送註冊驗證碼 (API)
  const fnSendVerificationCode = async () => {
    if (!sRegEmail.trim()) {
      fnShowCustomAlert("提示", "請輸入電子郵件以發送驗證碼。");
      return;
    }
    try {
      const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const oRes = await fetch(`${sApiUrl}/api/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Merchant-Id': sSelectedMerchant
        },
        body: JSON.stringify({ email: sRegEmail })
      });
      const oData = await oRes.json();
      if (oRes.ok && oData.success) {
        fnShowCustomAlert(
          "驗證碼發送成功 (技術展示)",
          "系統已自動為您生成註冊驗證碼。在正式環境下此代碼將會寄送至您的電子郵件。",
          oData.code
        );
      } else {
        fnShowCustomAlert("發送失敗", oData.message || "發送驗證碼失敗。");
      }
    } catch (e) {
      fnShowCustomAlert("錯誤", "無法連線至後端伺服器。");
    }
  };

  // 註冊會員並自動登入 (API)
  const fnHandleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sRegEmail.trim() || !sRegPassword || !sRegConfirmPassword || !sRegCode) {
      fnShowCustomAlert("提示", "請完整填寫註冊欄位。");
      return;
    }
    if (sRegPassword !== sRegConfirmPassword) {
      fnShowCustomAlert("提示", "密碼與確認密碼不一致。");
      return;
    }
    try {
      const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const oRes = await fetch(`${sApiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Merchant-Id': sSelectedMerchant
        },
        body: JSON.stringify({
          email: sRegEmail,
          password: sRegPassword,
          confirmPassword: sRegConfirmPassword,
          code: sRegCode
        })
      });
      const oData = await oRes.json();
      if (oRes.ok && oData.success) {
        const oSession: UserSession = {
          token: oData.token,
          username: oData.username,
          role: oData.role,
          merchantId: oData.merchantId
        };
        await fnOnRegisterSuccess(oSession);
        // 重設表單
        setSRegEmail('');
        setSRegPassword('');
        setSRegConfirmPassword('');
        setSRegCode('');
      } else {
        fnShowCustomAlert("註冊失敗", oData.message || "註冊失敗，請檢查資料與驗證碼。");
      }
    } catch (err) {
      fnShowCustomAlert("錯誤", "註冊過程發生連線錯誤。");
    }
  };

  // 登入會員 (API)
  const fnHandleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sLogEmail.trim() || !sLogPassword) {
      fnShowCustomAlert("提示", "請輸入電子郵件與密碼。");
      return;
    }
    try {
      const sApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const oRes = await fetch(`${sApiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: sLogEmail,
          password: sLogPassword
        })
      });
      const oData = await oRes.json();
      if (oRes.ok && oData.success) {
        const oSession: UserSession = {
          token: oData.token,
          username: oData.username,
          role: oData.role,
          merchantId: oData.merchantId
        };
        await fnOnLoginSuccess(oSession);
        // 重設表單
        setSLogEmail('');
        setSLogPassword('');
      } else {
        fnShowCustomAlert("登入失敗", oData.message || "電子郵件或密碼錯誤。");
      }
    } catch (err) {
      fnShowCustomAlert("錯誤", "登入過程發生連線錯誤。");
    }
  };

  return (
    <Modal bIsOpen={bIsAuthModalOpen} fnOnClose={() => setBIsAuthModalOpen(false)}>
      <div className={styles.authModalHeader}>
          <div className={styles.authTabs}>
            <button
              className={`${styles.authTab} ${sTab === 'login' ? styles.authTabActive : ''}`}
              onClick={() => setSTab('login')}
            >
              會員登入
            </button>
            <button
              className={`${styles.authTab} ${sTab === 'register' ? styles.authTabActive : ''}`}
              onClick={() => setSTab('register')}
            >
              會員註冊
            </button>
          </div>
          <button 
            className={styles.authModalClose} 
            onClick={() => setBIsAuthModalOpen(false)}
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        <div className={styles.authModalBody}>
          {sTab === 'login' ? (
            <form onSubmit={fnHandleLogin} className={styles.authForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>電子郵件</label>
                <input
                  type="email"
                  className={styles.formInput}
                  placeholder="example@test.com"
                  value={sLogEmail}
                  onChange={(e) => setSLogEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>密碼</label>
                <input
                  type="password"
                  className={styles.formInput}
                  placeholder="請輸入密碼"
                  value={sLogPassword}
                  onChange={(e) => setSLogPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.authSubmitBtn}>
                登入
              </button>
            </form>
          ) : (
            <form onSubmit={fnHandleRegister} className={styles.authForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>電子郵件</label>
                <input
                  type="email"
                  className={styles.formInput}
                  placeholder="example@test.com"
                  value={sRegEmail}
                  onChange={(e) => setSRegEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>密碼</label>
                <input
                  type="password"
                  className={styles.formInput}
                  placeholder="請輸入密碼"
                  value={sRegPassword}
                  onChange={(e) => setSRegPassword(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>確認密碼</label>
                <input
                  type="password"
                  className={styles.formInput}
                  placeholder="請再次輸入密碼"
                  value={sRegConfirmPassword}
                  onChange={(e) => setSRegConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>驗證碼</label>
                <div className={styles.codeGroup}>
                  <input
                    type="text"
                    className={styles.formInputCode}
                    placeholder="請輸入6位驗證碼"
                    value={sRegCode}
                    onChange={(e) => setSRegCode(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className={styles.sendCodeBtn}
                    onClick={fnSendVerificationCode}
                  >
                    獲取驗證碼
                  </button>
                </div>
              </div>
              <button type="submit" className={styles.authSubmitBtn}>
                註冊並登入
              </button>
            </form>
          )}
        </div>
    </Modal>
  );
}
