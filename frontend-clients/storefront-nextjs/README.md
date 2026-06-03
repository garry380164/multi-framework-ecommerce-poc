# E-Commerce Storefront (Next.js 14 + React)

這是為多商家 CMS 平台打造的官網前台展示網站，基於 **React** 與 **Next.js 14 (App Router)** 實作。

---

## 🎨 樣式與排版方案：CSS Modules

為展現對 CSS 底層的掌控力、提供最極致的加載效能，本前台專案**不使用** Tailwind 等 CSS 框架，而是完全採用 **CSS Modules (Vanilla CSS)**。

### CSS Modules 的優勢 (面試官關注點)：
1.  **零樣式表污染**：透過 Local Scope 類別命名，徹底避免不同頁面間的樣式互相覆蓋與污染。
2.  **更小的打包體積 (Zero CSS Bloat)**：每個頁面只會加載自己所需的 CSS 檔案，保證首屏渲染速度。
3.  **靈活的高級特效**：可完全自主定義 CSS 變數，實現精緻的 UI 微互動，並杜絕了「AI 套版感」。

---

## 🚀 效能與 SEO 優化策略 (Rendering Strategies)

作為面向消費者的電商前台，本應用採用了 Next.js 特有的渲染機制：

1.  **伺服器端渲染 (SSR - Server-Side Rendering)**：
    *   在請求商品列表時，將多商家上下文封裝在 HTTP Header (`X-Merchant-Id`) 中，向 ASP.NET Core 後端 API 發起請求。
    *   後端在伺服器端完成資料隔離查詢後，直接將 HTML 與完整商品資料渲染返回前端，優化 SEO 與爬蟲易讀性。
2.  **降級展示設計 (Graceful Degradation)**：
    *   **場景**：當面試官單獨開啟前端，卻沒有在本地運行 .NET API 時，網頁通常會直接當掉或顯示空白。
    *   **解決方案**：本專案程式碼設計了自動降級檢測。當 Fetch 後端 API 失敗時，前端會自動切換為 **「展示模式」**，改由內建的 Mock 資料（同樣區分 Store A 與 Store B 商品）來渲染，並提供狀態警示條，保證履歷展示永遠正常！

---

## 📂 專案目錄結構

```text
storefront-nextjs/
├── tsconfig.json           # TypeScript 配置
├── next.config.js          # Next.js 配置
├── package.json            # 依賴檔 (Next 14, React 18)
└── 📂 src/
    └── 📂 app/
        ├── globals.css     # 全域重設與 CSS 變數 (依據 Refined UI 規範)
        ├── layout.tsx      # 全域 Layout
        ├── page.tsx        # 首頁 (主打 React Client Component, 串接多商家 API)
        └── page.module.css # 首頁專屬樣式表 (CSS Modules)
```

---

## 🛠️ 開發與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

*   首頁位址：`http://localhost:3000`
