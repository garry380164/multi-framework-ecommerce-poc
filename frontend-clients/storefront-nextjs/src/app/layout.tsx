import React from 'react';
import './globals.css';
import { StorefrontProvider } from '../components/StorefrontProvider';
import Topbar from '../components/Topbar';
import CartList from '../components/CartList';
import LoginModal from '../components/LoginModal';
import CustomAlert from '../components/CustomAlert';

export const metadata = {
  title: '多租戶電商前台官網 - Next.js Showcase',
  description: '採用 Next.js SSR 與 CSS Modules 打造，串接 ASP.NET Core 後端的多租戶電商展示網頁。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant-TW">
      <body>
        <StorefrontProvider>
          <Topbar />
          {children}
          <CartList />
          <LoginModal />
          <CustomAlert />
        </StorefrontProvider>
      </body>
    </html>
  );
}

