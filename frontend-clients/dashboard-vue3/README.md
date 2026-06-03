# 🚫 CMS Sales Dashboard (Vue 3 + Pinia + Vite) - 已停用

> [!WARNING]
> **此專案目前已停用，不再進行維護與採用。**
> 為了統一後台架構並簡化多框架開發，數據儀表板（Sales Metrics）功能已完全重構並整合至 Angular 管理後台 (`admin-angular`) 中。
> 請前往 Angular 後台專案檢視最新的儀表板功能與 Chart.js 圖表實作。

---

## 🎨 樣式與排版方案：Scoped CSS

本儀表板專案採用 Vue 特有的 **Scoped CSS** 進行開發，以確保樣式的模組化與高度可控性。
*   **視覺風格**：遵循 **Refined UI 設計指南**。以扁平、細線邊框為主（如進度條與卡片邊框），去除所有 Drop Shadow。
*   **字重與字型**：標題使用 Outfit 字型，數據面板的數值採用等寬 Outfit 數字，加強視覺質感。

---

## ⚡ 核心前端技術實作

### 1. Pinia 全域狀態管理 (Sales Store)
*   將當前租戶與銷售數據解耦。透過建立 `sales` store，統一控管租戶切換、API 連線狀態、加載狀態 (Loading) 以及銷售報表 (Revenue, Orders, Ranking) 的業務邏輯。
*   提供離線降級 (Fallback) 機制。當 API 請求失敗時，會自動切換為本地預載入的 Pinia 靜態銷售報表，保證 Showcase 運行穩定。

### 2. Dapper 複雜預存程序串接
*   本儀表板預計對接後端的 Dapper API。後端底層透過優化過的預存程序，計算出當月與上月的銷售額環比增長率，以及利用 SQL 視窗函數 `ROW_NUMBER()` 快速產生的暢銷商品排行 Top 3，再經由本儀表板直觀呈現。

---

## 📂 專案目錄結構

```text
dashboard-vue3/
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── package.json            # 依賴檔 (Vue 3, Pinia, Vite)
├── index.html              # HTML 進入點
└── src/
    ├── main.ts             # 應用程式啟動引導
    ├── App.vue             # 看板主元件 (包含 Scoped CSS 與圖表設計)
    └── stores/
        └── sales.ts        # Pinia 銷售狀態 Store (含 Fallback 機制)
```

---

## 🛠️ 開發與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

*   看板位址：`http://localhost:5173`
