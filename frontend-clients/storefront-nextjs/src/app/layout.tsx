import React from 'react';
import '@/styles/globals.css';

export const metadata = {
  title: '多商戶電商官方平台',
  description: '採用 Next.js SSR 與 CSS Modules 打造的多租戶電商前台展示網頁。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant-TW">
      <body>
        {children}
      </body>
    </html>
  );
}


