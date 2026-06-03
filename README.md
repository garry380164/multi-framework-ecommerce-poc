# E-Commerce Multi-Merchant CMS (多商家電商與內容管理系統)

這是一個展示多框架整合能力（React/Next.js、Angular、Vue 3）與 ASP.NET Core 後端的企業級全端架構 PoC (Proof of Concept) 展示專案。旨在呈現如何利用統一的後端 API 與資料隔離機制，為不同前端應用提供高效、安全的資料服務。

---

## 🚀 專案核心亮點與過去解決方案重現

本專案將實際開發中常見的痛點與解決方案進行封裝與呈現，主要亮點包括：

*   **多商家資料隔離與安全 (Multi-Merchant Isolation)**
    *   **重現場景**：在多商家 (SaaS) 電商系統中，最忌諱商家間的資料發生交叉污染或外洩。
    *   **解決方案**：在 `backend-dotnet` 中實作 `MerchantMiddleware` 攔截請求標頭 `X-Merchant-Id`。配合 EF Core 的 **Global Query Filter (全域查詢過濾器)**，在底層自動注入商家過濾條件（例如 `WHERE MerchantId = @MerchantId`），使開發人員在編寫一般 CRUD 時，不需手動串接商家 ID，徹底杜絕資料外洩風險。
*   **複雜報表效能優化 (Stored Procedures & Dapper)**
    *   **重現場景**：當商店規模擴大、訂單量達到百萬級時，多表 Join 查詢會導致首頁儀表板或銷售報表載入極度緩慢。
    *   **解決方案**：在 `database-scripts/stored-procedures/` 中，將複雜的月度銷售報表邏輯（包含當月銷量、上月銷量、環比成長率與熱銷 Top 3 商品）編寫為優化過的預存程序。利用 SQL 的 **CTE (Common Table Expression)** 與 **視窗函數 (Window Functions)** 進行一次性高效計算，避免在記憶體中進行多次循環過濾，大幅降低 I/O 負載。
*   **極致 SEO 與首屏優化 (Next.js & CSS Modules)**
    *   **重現場景**：電商官網前台對 SEO 與載入速度 (FCP) 要求極高，一般的 SPA 應用在沒有伺服器端渲染的情況下不利於搜尋引擎爬蟲。
    *   **解決方案**：在 `storefront-nextjs` 中，利用 Next.js 的 **SSR (Server-Side Rendering)** 與 **SSG (Static Site Generation)** 機制，在伺服器端預先抓取後端 API 資料並生成 HTML。樣式方案使用 **CSS Modules (Vanilla CSS)**，確保 CSS 只載入當前頁面所需的最小部分，並避免 Tailwind 在超大型網站中產生的龐大樣式表積累，提供極佳的 Lighthouse 評分。
*   **企業級後台嚴謹架構 (Angular & TailwindCSS)**
    *   **重現場景**：企業管理後台通常面臨高度複雜的表單校驗、大量數據表格 (Data Table)、分頁與動態排序，以及嚴格的權限控管 (RBAC)。
    *   **解決方案**：在 `admin-angular` 中，採用強型別的 TypeScript 與 Reactive Form，並深度使用 **RxJS 流式處理**，實作「防抖 (Debounce) 聯想搜尋與過濾」。配合 **Route Guards** 與動態選單，根據使用者角色權限 (RBAC) 自動進行路由攔截與按鈕級權限控制。排版採用 **TailwindCSS**，加速後台的快速開發。

---

## 🛠️ 技術棧清單 (Tech Stack)

| 目錄 / 元件 | 技術領域 | 使用技術 / 框架 | 版本 | 說明 |
| :--- | :--- | :--- | :--- | :--- |
| **`backend-dotnet`** | 後端 API | ASP.NET Core C# / EF Core / Dapper | .NET 8.0 | 採用 Clean Architecture，支援 JWT、多商家隔離 |
| **`storefront-nextjs`**| 前台官網 | React / Next.js (App Router) / CSS Modules | Next.js 14.x | 主打 SEO 與 FCP，展示 SSR/ISR 渲染技術 |
| **`admin-angular`** | 管理後台 | Angular / RxJS / TailwindCSS | Angular 17.x | 處理複雜資料表格、動態表單與 RBAC 權限控管 |
| **`dashboard-vue3`** (已停用) | 數據看板 | Vue 3 / Pinia / TypeScript / Scoped CSS | Vue 3.x (Vite)| 🚫 專案已停用，數據看板功能已整合至 admin-angular |
| **`database-scripts`** | 資料庫 | SQLite (開發) / MSSQL (展示) | - | 包含完整 Schema 與高效預存程序腳本 |

---

## 📐 系統架構圖 (System Architecture)

```mermaid
graph TD
    %% 前端宇宙
    subgraph FrontendClients ["前端應用宇宙"]
        NextJS["storefront-nextjs (前台官網)<br>React / Next.js (CSS Modules)"]
        Angular["admin-angular (管理後台)<br>Angular 17 (TailwindCSS)"]
        Vue3["dashboard-vue3 (數據看板 - 已停用)<br>Vue 3 (Vite + TS)"]
    end

    %% 後端核心
    subgraph BackendCore ["後端 API 核心 (ASP.NET Core .NET 8)"]
        MerchantMW["Merchant Middleware<br>(攔截 X-Merchant-Id Header)"]
        Controllers["Controllers / Endpoints<br>(Products, Orders, Auth)"]
        EFCore["EF Core (Clean DB Access)<br>Global Query Filter"]
        Dapper["Dapper (高效報表查詢)<br>Stored Procedures"]
    end

    %% 資料庫
    subgraph DataStorage ["資料庫儲存"]
        SQLiteDB[("SQLite DB (Local 開發用)<br>app.db (自動 Seed)")]
        MSSQLDB[("MSSQL Server (生產/架構展示)<br>database-scripts/")]
    end

    %% 請求流向
    NextJS -->|1. 攜帶 X-Merchant-Id / JWT| MerchantMW
    Angular -->|1. 攜帶 X-Merchant-Id / JWT| MerchantMW
    Vue3 -->|1. 攜帶 X-Merchant-Id / JWT| MerchantMW

    MerchantMW -->|2. 解析並綁定 Merchant Context| Controllers
    Controllers -->|3. 讀寫常規資料| EFCore
    Controllers -->|3. 執行複雜報表 SP| Dapper

    EFCore -->|4. 資料隔離過濾| SQLiteDB
    Dapper -->|4. 高效執行| SQLiteDB
    
    %% 展示映射
    SQLiteDB -.->|Schema 映射展示| MSSQLDB
```

---

## 📂 專案目錄結構

```text
fullstack-architecture-showcase/
├── README.md               # 整個宇宙的導覽手冊（本檔案）
├── .gitignore              # 綜合忽略規則
│
├── 📂 database-scripts/    # 資料庫專區 (展示 MSSQL / Database 實力)
│   ├── schema.sql          # 資料表結構定義 (商家、商品、訂單、使用者、角色)
│   └── stored-procedures/  # 效能優化預存程序 (計算銷售額與環比)
│
├── 📂 backend-dotnet/      # 後端核心：ASP.NET Core Web API (Clean Architecture)
│   ├── src/
│   │   ├── Domain/         # 領域模型 (Entities)
│   │   ├── Application/    # 商業邏輯 (Services, DTOs, Interfaces)
│   │   ├── Infrastructure/ # 資料庫存取 (DbContext, Seed Data, SQLite)
│   │   └── WebApi/         # 進入點 (Controllers, Middlewares, Program.cs)
│   └── README.md           # C# 架構設計、API 文件、DB 最佳化說明
│
└── 📂 frontend-clients/    # 前端宇宙：多框架與不同樣式方案展示
    ├── 📁 storefront-nextjs/  # Next.js App Router 前台 (CSS Modules)
    ├── 📁 admin-angular/      # Angular 後台管理 (RxJS, TailwindCSS, Guard)
    └── 📁 dashboard-vue3/     # 🚫 已停用 (功能已整合至 admin-angular)
```

---

## 🛠️ 本地啟動與開發指南

### 1. 後端啟動 (ASP.NET Core Web API)
後端採用 SQLite，啟動時會**自動建立 `app.db` 並寫入測試 Seed Data**，不需手動安裝資料庫。
```bash
# 進入後端目錄
cd backend-dotnet/src/WebApi

# 啟動 API 伺服器
dotnet run
```
*   API 預設運行於：`http://localhost:5000` (或控制台輸出的 https 連接)
*   Swagger 文件：`http://localhost:5000/swagger`

### 2. 前端啟動

#### 2.1 Next.js 前台 (`storefront-nextjs`)
```bash
cd frontend-clients/storefront-nextjs
npm install
npm run dev
```
*   運行於：`http://localhost:3000`

#### 2.2 Angular 後台 (`admin-angular`)
```bash
cd frontend-clients/admin-angular
npm install
npm start
```
*   運行於：`http://localhost:4200`

#### 2.3 Vue 3 看板 (`dashboard-vue3`)
```bash
cd frontend-clients/dashboard-vue3
npm install
npm run dev
```
*   運行於：`http://localhost:5173`
