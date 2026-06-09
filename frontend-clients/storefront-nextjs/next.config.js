/** @type {import('next').NextConfig} */

// 預設的影像白名單網域
const remotePatterns = [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '5176',
    pathname: '/**',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '5000',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
    pathname: '/**',
  },
  // 保障直接寫入當前的 Fly.io 後端網域
  {
    protocol: 'https',
    hostname: 'saas-demo.fly.dev',
    pathname: '/**',
  }
];

// 動態從 NEXT_PUBLIC_API_URL 環境變數中解析並加入影像白名單
if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    const oUrl = new URL(process.env.NEXT_PUBLIC_API_URL);
    remotePatterns.push({
      protocol: oUrl.protocol.replace(':', ''), // 'http' 或 'https'
      hostname: oUrl.hostname,
      port: oUrl.port || '', // 若無指定 port 則留空
      pathname: '/**',
    });
  } catch (e) {
    console.error('[next.config.js] 無法解析 NEXT_PUBLIC_API_URL 加入圖片白名單:', e);
  }
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
};

module.exports = nextConfig;
