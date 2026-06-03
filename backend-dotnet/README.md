# E-Commerce CMS Backend (.NET 8 Web API)

這是基於 **ASP.NET Core C# (.NET 8)** 建立的企業級多商家 Web API，採用 **Clean Architecture (乾淨架構 / 領域驅動設計簡化版)** 來組織專案。

---

## 📂 架構設計與目錄結構

本專案將業務邏輯與基礎設施技術解耦，分為四個層級：

```text
backend-dotnet/src/
├── 📂 Domain/         # 領域層 (不依賴任何外部套件/框架)
│   └── Entities/     # 存放 Merchant, Product, Order, User, Role 等實體與 IMustHaveMerchant 介面
│
├── 📂 Application/    # 應用服務介面與 DTO 層 (僅依賴 Domain)
│   ├── DTOs/         # 登入與商品的請求/回應 DTO (例如 LoginRequest, ProductDto)
│   └── Interfaces/   # 服務與 Provider 介面 (例如 IProductService, IMerchantProvider)
│
├── 📂 Infrastructure/ # 基礎設施層 (資料庫與外部服務實作)
│   ├── Data/         # AppDbContext (EF Core) 與 DbInitializer (SQLite 測試資料植入)
│   └── Services/     # ProductService 與 AuthService (JWT 與密碼驗證)
│
└── 📂 WebApi/         # 簡報層 / API 進入點
    ├── Controllers/  # ProductsController (CRUD) 與 AuthController (登入)
    ├── Merchant/     # MerchantMiddleware (商家過濾攔截器) 與 MerchantProvider (商家上下文)
    └── Program.cs    # 服務註冊、JWT 設定、中介軟體管線配置
```

---

## 🔒 多商家安全隔離機制 (Multi-Merchant Security)

本專案採用 **共享資料庫、邏輯隔離** 的多商家設計。這是目前 SaaS 平台最常見且經濟高效的設計模式。我們透過以下兩層防護保障資料安全：

### 1. 全域查詢過濾器 (EF Core Global Query Filter)
在 `AppDbContext.cs` 中，我們設定了：
```csharp
modelBuilder.Entity<Product>().HasQueryFilter(p => p.MerchantId == _merchantProvider.MerchantId);
modelBuilder.Entity<Order>().HasQueryFilter(o => o.MerchantId == _merchantProvider.MerchantId);
modelBuilder.Entity<User>().HasQueryFilter(u => u.MerchantId == _merchantProvider.MerchantId);
```
這代表每次開發人員在 Service 撰寫一般 EF Core 查詢時，系統會**自動在 SQL 層面追加商家 ID 的過濾**，徹底解決因遺漏 `WHERE` 條件造成的資料污染或跨商家洩漏。

### 2. JWT 安全強制綁定 (JWT Claim Force Binding)
為了解決前端惡意偽造 `X-Merchant-Id` Header 的問題，在 `MerchantMiddleware.cs` 中：
*   **未認證的請求** (如官網前台瀏覽商品)：直接採用前端傳入的 `X-Merchant-Id` Header 來顯示對應商店的商品。
*   **已認證的請求** (如管理員操作後台)：**強制** 讀取 JWT Token 中被加密簽章的 `merchantId` Claim。即便前端故意修改 Header，後端也會強制以 JWT 為準，保證權限與資料的一致性。

---

## 🔑 預置測試帳號 (適用於 SQLite 開箱即用)

後端啟動時會自動建立並初始化 `app.db`，包含以下測試帳號 (密碼皆為 `password123`)：

| 帳號 Email | 所屬商店 (MerchantId) | 角色 (Role) | 說明 |
| :--- | :--- | :--- | :--- |
| **`store-a-admin@test.com`** | 極簡咖啡館 (`store-a`) | Admin | 可管理咖啡館商品 |
| **`store-b-admin@test.com`** | 潮流服飾店 (`store-b`) | Admin | 可管理服飾店商品 |
| **`customer-a@test.com`** | 極簡咖啡館 (`store-a`) | Customer | 一般顧客，可瀏覽商品與下單 |

---

## 📡 API 端點清單 (API Endpoints)

| HTTP 方法 | 路由端點 | 權限要求 | 標頭要求 | 說明 |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | 任何人 | `X-Merchant-Id` | 商家成員登入，返回 JWT |
| **GET** | `/api/products` | 任何人 | `X-Merchant-Id` | 獲取指定商店的所有商品 |
| **GET** | `/api/products/{id}` | 任何人 | `X-Merchant-Id` | 獲取特定商品詳情 |
| **POST** | `/api/products` | 僅限 Admin | `Authorization: Bearer <Token>` | 建立新商品 |
| **PUT** | `/api/products/{id}` | 僅限 Admin | `Authorization: Bearer <Token>` | 修改商品資訊 |
| **DELETE** | `/api/products/{id}`| 僅限 Admin | `Authorization: Bearer <Token>` | 刪除指定商品 |
