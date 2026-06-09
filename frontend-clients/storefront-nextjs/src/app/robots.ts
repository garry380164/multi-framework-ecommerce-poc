import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const sBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',      // 禁止爬蟲抓取內部 API 路由
        '/checkout/', // 禁止抓取結帳流程
        '/cart/',     // 禁止抓取購物車頁面
      ],
    },
    sitemap: `${sBaseUrl}/sitemap.xml`,
  };
}
