# CMS Admin Dashboard (Angular + TailwindCSS)

這是為多商家 CMS 平台打造的企業級管理後台，基於 **Angular 17 (Standalone Components)** 與 **TailwindCSS** 實作。

---

## 🎨 樣式與排版方案：TailwindCSS

本後台專案全面採用 **TailwindCSS (v3.4+)** 進行元件開發與快速排版，以應對企業後台大量複雜表單、數據表格與佈局的開發。
*   **視覺風格**：遵循 **Refined UI 設計指南**。使用 Slate 冷灰色調搭配 Indigo 強調色。
*   **去 AI 生成感**：移除大部分的 `shadow` (陰影)，全面改用 `border-slate-200` 細邊框進行區域邊界定義，維持介面的俐落、扁平與低調質感。

---

## ⚡ 核心前端技術實作

### 1. RxJS 搜尋防抖機制 (Debounce Search)
*   **痛點**：一般的即時搜尋會在使用者每輸入一個字母時，就向伺服器發送一次請求，造成資料庫極大的負擔。
*   **解決方案**：在 `app.component.ts` 中，使用 RxJS 的 `Subject` 配合 `debounceTime(300)` 與 `distinctUntilChanged()` 操作符。當使用者輸入時，會等待 300 毫秒且確認內容有改變時，才發起查詢動作。

### 2. 多商家權限控制 (RBAC & Merchant Check)
*   後端在 JWT Token 簽發時，已在 Payload 中加密寫入 `merchantId` 與 `role` 等 Claims。
*   Angular 後台在載入商品資料或發起寫入 (CRUD) 請求時，會在請求標頭附加 `Authorization: Bearer <Token>`。後端中介軟體會驗證該 Token，確保當前管理員無法非法操作其他商店的商品，實現前端防禦。

---

## 📂 專案目錄結構

```text
admin-angular/
├── angular.json            # Angular CLI 配置
├── tailwind.config.js      # TailwindCSS 配置
├── package.json            # 依賴檔 (Angular 17, TailwindCSS, RxJS)
└── src/
    ├── index.html          # HTML 進入點 (載入 Google Fonts)
    ├── main.ts             # 應用程式啟動引導
    ├── styles.css          # 全域樣式 (導入 Tailwind 基礎模組)
    └── app/
        ├── app.routes.ts   # 路由配置
        └── app.component.ts# 後台管理主元件 (包含 RxJS 防抖與表格 UI)
```

---

## 🛠️ 開發與啟動

```bash
# 安裝依賴 (包含 TailwindCSS 工具)
npm install

# 啟動開發伺服器
npm start
```

*   後台位址：`http://localhost:4200`
