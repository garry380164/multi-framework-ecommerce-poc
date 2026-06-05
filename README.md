# E-Commerce Multi-Merchant CMS (多商家電商與內容管理系統)

這是一個展示多框架整合能力（React/Next.js、Angular）與 ASP.NET Core 後端的企業級全端架構 PoC (Proof of Concept) 展示專案。旨在呈現如何利用統一的後端 API 與資料隔離機制，為不同前端應用提供高效、安全的資料服務。

---

## <img src="https://api.iconify.design/material-symbols:explore-outline-rounded.svg?color=%23888888" width="24" height="24" /> 快速導覽 (Navigation)

<a href="#-線上展示入口-live-demo"><img src="https://api.iconify.design/material-symbols:open-in-new-rounded.svg?color=%23888888" width="18" height="18" align="absbottom" /> 線上展示入口 (Live Demo)</a><br>
<a href="#-專案核心亮點與過去解決方案重現"><img src="https://api.iconify.design/material-symbols:rocket-launch-rounded.svg?color=%23888888" width="18" height="18" align="absbottom" /> 專案核心亮點與過去解決方案重現</a><br>
<a href="#-進階系統機制與技術特徵-advanced-system-mechanisms"><img src="https://api.iconify.design/material-symbols:lock-outline-rounded.svg?color=%23888888" width="18" height="18" align="absbottom" /> 🔧 進階系統機制與技術特徵 (Advanced System Mechanisms)</a><br>
<a href="#-技術棧清單-tech-stack"><img src="https://api.iconify.design/material-symbols:construction-rounded.svg?color=%23888888" width="18" height="18" align="absbottom" /> 技術棧清單 (Tech Stack)</a><br>
<a href="#-系統架構圖-system-architecture"><img src="https://api.iconify.design/material-symbols:schema-outline-rounded.svg?color=%23888888" width="18" height="18" align="absbottom" /> 系統架構圖 (System Architecture)</a><br>
<a href="#-專案目錄結構"><img src="https://api.iconify.design/material-symbols:folder-open-outline-rounded.svg?color=%23888888" width="18" height="18" align="absbottom" /> 專案目錄結構</a><br>
<a href="#-本地啟動與開發指南"><img src="https://api.iconify.design/material-symbols:construction-rounded.svg?color=%23888888" width="18" height="18" align="absbottom" /> 本地啟動與開發指南</a><br>
&nbsp;&nbsp;&nbsp;&nbsp;<a href="#-推薦方式使用一鍵啟動控制台-windows-環境"><img src="https://api.iconify.design/material-symbols:rocket-launch-rounded.svg?color=%23888888" width="14" height="14" align="absbottom" /> 推薦方式：使用一鍵啟動控制台 (Windows 環境)</a><br>
&nbsp;&nbsp;&nbsp;&nbsp;<a href="#-進階方式手動逐步啟動"><img src="https://api.iconify.design/material-symbols:settings-suggest-outline-rounded.svg?color=%23888888" width="14" height="14" align="absbottom" /> 進階方式：手動逐步啟動</a><br>
<a href="#-後台預置測試帳號與商店資訊"><img src="https://api.iconify.design/material-symbols:key-outline-rounded.svg?color=%23888888" width="18" height="18" align="absbottom" /> 後台預置測試帳號與商店資訊</a>

---

## <img src="https://api.iconify.design/material-symbols:open-in-new-rounded.svg?color=%23888888" width="24" height="24" /> 線上展示入口 (Live Demo)

為了方便您快速體驗本系統的實際運行效果，我們已將應用部署至線上環境：

| 平台入口 | 部署平台 | 體驗連結 |
| :--- | :--- | :--- |
| **🛍️ 前台官網 (Storefront)** | Vercel | [點此前往體驗 ➔](https://estore-demo-red.vercel.app/) |
| **⚙️ 管理後台 (Admin Dashboard)** | Vercel | [點此前往體驗 ➔](https://nexashop-phi.vercel.app/) |

> [!TIP]
> 登入管理後台時，您可以使用本專案預置的測試帳號（詳見下方[後台預置測試帳號與商店資訊](#-後台預置測試帳號與商店資訊)）。

---

## <img src="https://api.iconify.design/material-symbols:rocket-launch-rounded.svg?color=%23888888" width="24" height="24" /> 專案核心亮點與過去解決方案重現

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

## <img src="https://api.iconify.design/material-symbols:lock-outline-rounded.svg?color=%23888888" width="24" height="24" /> 🔧 進階系統機制與技術特徵 (Advanced System Mechanisms)

為了滿足企業級應用的高安全性、抗爬蟲能力、高併發效能以及優秀的維護性，本專案在前後端協作上實作了以下核心技術特徵：

### 1. 雙 Token 無感輪轉刷新機制 (Silent Access & Refresh Token Rotation)

為了兼顧「防禦 Token 竊取」與「良好的使用者體驗 (UX)」，系統設計了嚴謹的雙 Token 機制：

*   **安全防禦策略**：
    *   **Access Token (JWT)**：儲存於前端記憶體中，效期極短 (e.g. 15分鐘)，每次 API 呼叫皆攜帶於 `Authorization` 標頭中，降低被竊取後的長期濫用風險。
    *   **Refresh Token**：效期較長 (e.g. 7天)，由後端在登入時寫入 `HttpOnly`, `SameSite=Lax`, `Path="/"`, `Secure` (依 HTTPS 自動適配) 的 Cookie 中。此 Cookie 無法被 JavaScript 讀取，徹底防範 XSS 攻擊。
*   **併發請求排隊鎖 (Request Queuing)**：
    當 Access Token 過期時，若前端有多個 API 請求同時發送，將觸發 401 未授權錯誤。為避免重複調用 `/refresh` 導致 Token 失效，前端實作了排隊機制：
    *   **Next.js 官網前台 ([apiClient.ts](file:///d:/project/Others/frontend-clients/storefront-nextjs/src/components/StorefrontProvider/apiClient.ts))**：透過單一 `Promise` 鎖定機制 (`promiseRefreshToken`) 攔截併發，首個 401 請求啟動刷新後，後續的 401 請求會直接排隊等待該 Promise 完成，拿到新 Token 後再重試。
    *   **Angular 管理後台 ([auth.interceptor.ts](file:///d:/project/Others/frontend-clients/admin-angular/src/app/interceptors/auth.interceptor.ts))**：使用 RxJS 的 `BehaviorSubject` 搭配 `switchMap` / `filter`，在 Token 刷新期間鎖定佇列，刷新完成後自動解鎖並攜帶新 Token 重新發送所有暫存的 API 請求。

```mermaid
sequenceDiagram
    participant FE as 前端 (Next.js / Angular)
    participant BE as 後端 API (ASP.NET Core)
    
    FE->>BE: 1. 發送 API 請求 (夾帶 Expired Access Token)
    Note over BE: 驗證 JWT 失敗 (401 Unauthorized)
    BE-->>FE: 2. 回傳 401 狀態碼
    Note over FE: 觸發 401 攔截器，啟動排隊鎖
    FE->>BE: 3. 發送 /refresh 請求 (自動攜帶 HttpOnly Cookie 中的 Refresh Token)
    Note over BE: 驗證 Refresh Token 成功，生成新雙 Token
    BE-->>FE: 4. 回傳新 Access Token (Cookie 內自動更新 Refresh Token)
    Note over FE: 更新 Token，釋放排隊佇列，以新 Token 重試原請求
    FE->>BE: 5. 重新發送 API 請求 (夾帶新 Access Token)
    BE-->>FE: 6. 回傳資料成功
```

---

### 2. API 二進位資料遮蔽與防爬蟲 (Protobuf over HTTP)

對於電商前台的商品與定價數據，為了防止競業爬蟲惡意抓取，本系統在通訊協議上進行了二進位混淆遮蔽：

*   **後端 Protobuf 序列化**：
    *   在後端商品控制器中實作了專供 Next.js 前台呼叫的 `/api/Products/proto` 端點，使用 `Google.Protobuf` 序列化商品資料，並回傳 `application/x-protobuf` 格式的二進位流。
*   **前端二進位解碼 ([apiClient.ts](file:///d:/project/Others/frontend-clients/storefront-nextjs/src/components/StorefrontProvider/apiClient.ts))**：
    *   `apiClient` 提供 `requestBinary()` 方法，在發送請求時手動附加 `Accept: application/x-protobuf` 標頭，取得 API 回應的 `ArrayBuffer` 後，在用戶端（瀏覽器）進行反序列化還原。
*   **防護成效**：
    *   外部人員在瀏覽器開發者工具 (DevTools) 的 **Network 面板中無法直接閱讀明文 JSON**，只能看到無法解析的二進位亂碼，大幅提高了敏感資料的安全性與爬蟲門檻。

```mermaid
sequenceDiagram
    participant FE as 前端 (apiClient.ts)
    participant BE as 後端 (ProductsController)
    
    FE->>BE: 1. 呼叫 /api/Products/proto (Accept: application/x-protobuf)
    BE->>BE: 2. 檢索商品並序列化為 Protobuf Byte Array
    BE-->>FE: 3. 回傳二進位流 (application/x-protobuf)
    Note over FE: DevTools Network 面板顯示亂碼/二進位內容
    FE->>FE: 4. 解碼 ArrayBuffer 為 JS 物件並渲染 UI
```

---

### 3. 多商家安全模糊化防護 (Merchant Header Obfuscation)

在 SaaS 多商家架構下，為了防止惡意攻擊者透過 API 探測內部實作細節：

*   **訊息模糊化機制**：
    *   後端的 `MerchantMiddleware` 在攔截並校驗必要請求標頭 `X-Merchant-Id` 時，若發現標頭缺失或格式錯誤，不再回傳過於具體、透露資料庫或程式邏輯的詳細錯誤訊息，而是統一拋出模糊化的「**無效的請求標頭**」或「**請求格式錯誤**」通用訊息。
    *   這既能確保合法的用戶端（前後台）正常調用，也能阻斷惡意掃描器對內部多商家隔離機制的逆向工程。

---

### 4. 複雜銷售報表預存程序優化 (CTE & Window Functions)

為解決大數據量下商家銷售報表運算緩慢的問題，專案優化了預存程序：

*   **精細化規格運算 ([sp_GetMerchantMonthlySalesReport.sql](file:///d:/project/Others/database-scripts/stored-procedures/sp_GetMerchantMonthlySalesReport.sql))**：
    *   預存程序將統計粒度細化至商品規格 (`ProductSpec`)，結合 `OrderItems` 計算單一商家指定月份的銷售總額、有效訂單數、上月環比增長率以及熱銷商品 Top 3。
*   **資料庫效能優化**：
    *   利用 SQL **CTE (Common Table Expression)** 結構化查詢，確保在運算本月與上月數據時只需掃描一次訂單表。
    *   使用 **視窗函數 (Window Functions)** `ROW_NUMBER() OVER()` 在資料庫核心直接進行銷量排名，徹底避免在 C# 等應用程式記憶體中進行多次 Join 迴圈與過濾，優化執行計畫以降低 I/O 負載。

---

### 5. Angular 管理後台架構重構與 UI 體驗優化

隨著管理後台的功能擴展，對專案的結構維護性與 UI 互動流暢度進行了全面升級：

*   **目錄結構物理隔離 ([app.routes.ts](file:///d:/project/Others/frontend-clients/admin-angular/src/app/app.routes.ts))**：
    *   將管理後台結構進行重構，嚴格將 `pages` (路由頁面，如商品管理、訂單管理、儀表板、登入頁) 與 `components` (通用 UI 組件) 進行物理性區隔。所有的路由與參照路徑均進行了全面修正，提升專案的模組化程度與可維護性。
*   **平滑動畫 Modal 元件封裝**：
    *   抽離出一個可重用的基礎 Modal 組件，實作了流暢的 Fade-in / Fade-out 平滑滑入與滑出動畫，並重構了後台登入彈窗，帶來更優質的視覺回饋。
*   **管理介面細節美化**：
    *   **庫存管理**：美化了表格的核取方塊 (Checkbox)，將價格與表頭靠右對齊，並移除標題旁多餘的編輯圖示以簡化介面。
    *   **儀表板行事曆**：對 Calendar UI 中的日程條進行了美化與對齊微調，使活動行程的顯示更加直觀美觀。

---

## <img src="https://api.iconify.design/material-symbols:construction-rounded.svg?color=%23888888" width="24" height="24" /> 技術棧清單 (Tech Stack)

| 目錄 / 元件 | 技術領域 | 使用技術 / 框架 | 版本 | 說明 |
| :--- | :--- | :--- | :--- | :--- |
| **`backend-dotnet`** | 後端 API | ASP.NET Core C# / EF Core / Dapper | .NET 8.0 | 採用 Clean Architecture，支援 JWT、多商家隔離 |
| **`storefront-nextjs`**| 前台官網 | React / Next.js (App Router) / CSS Modules | Next.js 14.x | 主打 SEO 與 FCP，展示 SSR/ISR 渲染技術 |
| **`admin-angular`** | 管理後台 | Angular / RxJS / TailwindCSS | Angular 17.x | 處理複雜資料表格、動態表單、銷售圖表與 RBAC 權限控管 |
| **`database-scripts`** | 資料庫 | SQLite (開發) / MSSQL (展示) | - | 包含完整 Schema 與高效預存程序腳本 |

---

## <img src="https://api.iconify.design/material-symbols:schema-outline-rounded.svg?color=%23888888" width="24" height="24" /> 系統架構圖 (System Architecture)

```mermaid
graph TD
    %% 前端宇宙
    subgraph FrontendClients ["前端應用宇宙"]
        NextJS["storefront-nextjs (前台官網)<br>React / Next.js (CSS Modules)"]
        Angular["admin-angular (管理後台)<br>Angular 17 (TailwindCSS)"]
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

    MerchantMW -->|2. 解析並綁定 Merchant Context| Controllers
    Controllers -->|3. 讀寫常規資料| EFCore
    Controllers -->|3. 執行複雜報表 SP| Dapper

    EFCore -->|4. 資料隔離過濾| SQLiteDB
    Dapper -->|4. 高效執行| SQLiteDB
    
    %% 展示映射
    SQLiteDB -.->|Schema 映射展示| MSSQLDB
```

---

## <img src="https://api.iconify.design/material-symbols:folder-open-outline-rounded.svg?color=%23888888" width="24" height="24" /> 專案目錄結構

```text
fullstack-architecture-showcase/
├── README.md               # 整個宇宙的導覽手冊（本檔案）
├── .gitignore              # 綜合忽略規則
├── run-all.ps1             # Windows PowerShell 整合啟動與環境建置控制台
├── run-all.bat             # 雙擊直接執行 run-all.ps1 的 Windows 批次檔
│
├── 📂 database-scripts/    # 資料庫專區 (展示 MSSQL / Database 實力)
│   ├── schema.sql          # 資料表結構定義 (商家、商品、訂單、使用者、角色)
│   └── stored-procedures/  # 效能優化預存程序 (計算銷售額與環比)
│
├── 📂 backend-dotnet/      # 後端核心：ASP.NET Core Web API (Clean Architecture)
│   ├── src/
│   │   ├── Domain/         # 領域層 (Entities)
│   │   ├── Application/    # 商業邏輯 (Services, DTOs, Interfaces)
│   │   ├── Infrastructure/ # 資料庫存取 (DbContext, Seed Data, SQLite)
│   │   └── WebApi/         # 進入點 (Controllers, Middlewares, Program.cs)
│   └── README.md           # C# 架構設計、API 文件、DB 最佳化說明
│
└── 📂 frontend-clients/    # 前端宇宙：多框架與不同樣式方案展示
    ├── 📁 storefront-nextjs/  # Next.js App Router 前台 (CSS Modules)
    └── 📁 admin-angular/      # Angular 後台管理 (RxJS, TailwindCSS, Guard)
```

---

## <img src="https://api.iconify.design/material-symbols:construction-rounded.svg?color=%23888888" width="24" height="24" /> 本地啟動與開發指南

本專案提供了根目錄一鍵啟動的控制台腳本，能夠自動檢測環境、還原套件並同步啟動前後端所有服務。

### <img src="https://api.iconify.design/material-symbols:rocket-launch-rounded.svg?color=%23888888" width="20" height="20" /> 推薦方式：使用一鍵啟動控制台 (Windows 環境)

在專案根目錄下，您可以直接執行以下腳本：

1.  **雙擊執行**：雙擊根目錄的 `run-all.bat`。
2.  **PowerShell 執行**：
    ```powershell
    ./run-all.ps1
    ```

啟動後會出現功能選單，輸入 `1` 即可同時啟動後端 API、Next.js 前台與 Angular 後台，並自動於獨立的視窗中運行，免去手動開多個 Terminal 的繁瑣步驟。

---

### <img src="https://api.iconify.design/material-symbols:settings-suggest-outline-rounded.svg?color=%23888888" width="20" height="20" /> 進階方式：手動逐步啟動

如果您想要個別手動啟動服務，請參考以下步驟：

#### 1. 環境與依賴還原
在根目錄下，您可以透過控制台腳本輸入 `5` 自動安裝所有專案相依性，或者手動進入各目錄執行還原：
```bash
# 後端還原
dotnet restore backend-dotnet/src/WebApi

# 前台 Next.js 還原
cd frontend-clients/storefront-nextjs && npm install

# 後台 Angular 還原
cd frontend-clients/admin-angular && npm install
```

#### 2. 後端啟動 (ASP.NET Core Web API)
後端採用 SQLite，啟動時會**自動建立 `app.db` 並寫入測試 Seed Data**，不需手動安裝資料庫。
```bash
# 進入後端目錄
cd backend-dotnet/src/WebApi

# 啟動 API 伺服器
dotnet run
```
*   API 預設運行於：`http://localhost:5000` (或控制台輸出的 https 連接)
*   Swagger 文件：`http://localhost:5000/swagger`

#### 3. 前端啟動

##### 3.1 Next.js 前台 (`storefront-nextjs`)
```bash
cd frontend-clients/storefront-nextjs
npm run dev
```
*   運行於：`http://localhost:3000`

##### 3.2 Angular 後台 (`admin-angular`)
```bash
cd frontend-clients/admin-angular
npm start
```
*   運行於：`http://localhost:4200`

---

## <img src="https://api.iconify.design/material-symbols:key-outline-rounded.svg?color=%23888888" width="24" height="24" /> 後台預置測試帳號與商店資訊

系統在啟動時會自動初始化 `app.db` (SQLite)，並寫入以下測試資料與帳號（預設密碼皆為 `password123`）：

| 帳號 Email | 所屬商店 (MerchantId / X-Merchant-Id) | 角色 (Role) | 功能說明 |
| :--- | :--- | :--- | :--- |
| **`store-a-admin@test.com`** | 極簡咖啡館 (`store-a`) | Admin | 咖啡館管理員，可管理咖啡館商品與查看月度銷量報表 |
| **`store-b-admin@test.com`** | 潮流服飾店 (`store-b`) | Admin | 服飾店管理員，可管理服飾店商品與查看月度銷量報表 |
| **`customer-a@test.com`** | 極簡咖啡館 (`store-a`) | Customer | 一般顧客，可於前台瀏覽商品與模擬下單 |

*   **前台官網測試**：可使用 `customer-a@test.com` 於 Next.js 前台進行商品瀏覽及下單。
*   **管理後台測試**：可使用 `store-a-admin@test.com` 或 `store-b-admin@test.com` 登入 Angular 後台，驗證多商家資料安全隔離、商品管理與月度銷售報表功能。
