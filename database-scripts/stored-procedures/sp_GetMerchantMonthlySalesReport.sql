-- ============================================================================
-- 專案主題：E-Commerce Multi-Merchant CMS (多商家電商與內容管理系統)
-- 檔案描述：複雜報表查詢效能優化預存程序 (MSSQL 語法)
-- 業務功能：計算單一商家指定月份的銷售總額、訂單數、上月環比增長率，以及熱銷 Top 3 商品。
-- 最佳化技術：使用 CTE (通用資料表運算式)、Window Functions (視窗函數) 取代 Cursor 迴圈，優化執行計畫。
-- 註解語言：繁體中文
-- ============================================================================

CREATE PROCEDURE [dbo].[sp_GetMerchantMonthlySalesReport]
    @MerchantId NVARCHAR(50),
    @TargetDate DATETIME2
AS
BEGIN
    -- 關閉受影響行數的訊息，減少網絡傳輸開銷並提升執行效能
    SET NOCOUNT ON;

    -- 宣告時間範圍變數
    DECLARE @CurMonthStart DATETIME2;
    DECLARE @CurMonthEnd DATETIME2;
    DECLARE @PrevMonthStart DATETIME2;
    DECLARE @PrevMonthEnd DATETIME2;

    -- 1. 計算本月與上月的起訖時間
    SET @CurMonthStart = DATEFROMPARTS(YEAR(@TargetDate), MONTH(@TargetDate), 1);
    SET @CurMonthEnd = DATEADD(MILLISECOND, -3, CAST(DATEADD(MONTH, 1, @CurMonthStart) AS DATETIME2));
    
    SET @PrevMonthStart = DATEADD(MONTH, -1, @CurMonthStart);
    SET @PrevMonthEnd = DATEADD(MILLISECOND, -3, CAST(DATEADD(MONTH, 1, @PrevMonthStart) AS DATETIME2));

    -- 2. 使用 CTE (Common Table Expression) 進行結構化查詢，確保只掃描一次 Orders 資料表
    ;WITH MonthlySales AS (
        -- 彙總當月與上月的銷售數據
        SELECT
            SUM(CASE WHEN [OrderDate] BETWEEN @CurMonthStart AND @CurMonthEnd THEN [TotalAmount] ELSE 0 END) AS [CurMonthRevenue],
            COUNT(CASE WHEN [OrderDate] BETWEEN @CurMonthStart AND @CurMonthEnd THEN 1 END) AS [CurMonthOrders],
            SUM(CASE WHEN [OrderDate] BETWEEN @PrevMonthStart AND @PrevMonthEnd THEN [TotalAmount] ELSE 0 END) AS [PrevMonthRevenue],
            COUNT(CASE WHEN [OrderDate] BETWEEN @PrevMonthStart AND @PrevMonthEnd THEN 1 END) AS [PrevMonthOrders]
        FROM [dbo].[Orders]
        WHERE [MerchantId] = @MerchantId
          -- 僅計算已付款、已出貨或已完成的有效訂單，且系統狀態必須為可用 (Status = '1')
          AND ([OrdStatus] IN (N'Completed', N'Shipped') OR [PayStatus] = N'Paid')
          AND [Status] = N'1'
          AND [OrderDate] BETWEEN @PrevMonthStart AND @CurMonthEnd
    ),
    ProductRanking AS (
        -- 使用 ROW_NUMBER() 視窗函數計算當月暢銷商品規格排名 (細化到 ProductSpec)
        SELECT
            oi.[ProductId],
            oi.[ProductSpecId],
            -- 若有規格名稱，則顯示為 "商品名稱 (規格名稱)"，否則僅顯示商品名稱
            CASE 
                WHEN oi.[SpecName] IS NOT NULL AND oi.[SpecName] <> '' 
                THEN CONCAT(p.[Name], ' (', oi.[SpecName], ')')
                ELSE p.[Name]
            END AS [ProductName],
            SUM(oi.[Quantity]) AS [TotalQtySold],
            -- 使用明細總額 TotalAmount 統計營收
            SUM(oi.[TotalAmount]) AS [ProductRevenue],
            ROW_NUMBER() OVER (
                ORDER BY SUM(oi.[Quantity]) DESC, SUM(oi.[TotalAmount]) DESC
            ) AS [SalesRank]
        FROM [dbo].[OrderItems] oi
        INNER JOIN [dbo].[Orders] o ON oi.[OrderId] = o.[Id]
        INNER JOIN [dbo].[Products] p ON oi.[ProductId] = p.[Id]
        WHERE o.[MerchantId] = @MerchantId
          -- 僅計算有效且系統狀態為可用 (Status = '1') 的訂單明細
          AND (o.[OrdStatus] IN (N'Completed', N'Shipped') OR o.[PayStatus] = N'Paid')
          AND o.[Status] = N'1'
          AND o.[OrderDate] BETWEEN @CurMonthStart AND @CurMonthEnd
        GROUP BY oi.[ProductId], oi.[ProductSpecId], p.[Name], oi.[SpecName]
    )
    -- 3. 輸出報表結果集
    SELECT
        -- 商家與時間資訊
        @MerchantId AS [MerchantId],
        FORMAT(@TargetDate, 'yyyy-MM') AS [ReportingMonth],

        -- 本月營收與訂單數
        ISNULL(s.[CurMonthRevenue], 0) AS [Revenue],
        ISNULL(s.[CurMonthOrders], 0) AS [OrderCount],

        -- 上月營收與訂單數
        ISNULL(s.[PrevMonthRevenue], 0) AS [PrevRevenue],
        ISNULL(s.[PrevMonthOrders], 0) AS [PrevOrderCount],

        -- 環比成長率計算 (MoM %)，處理除以零的邊界狀況
        CASE 
            WHEN ISNULL(s.[PrevMonthRevenue], 0) = 0 THEN 100.00
            ELSE CAST(((s.[CurMonthRevenue] - s.[PrevMonthRevenue]) / s.[PrevMonthRevenue]) * 100 AS DECIMAL(10, 2))
        END AS [RevenueGrowthRatePercent],

        -- 最暢銷商品第一名 (Top 1)
        (SELECT TOP 1 [ProductName] FROM ProductRanking WHERE [SalesRank] = 1) AS [TopProduct1_Name],
        (SELECT TOP 1 [TotalQtySold] FROM ProductRanking WHERE [SalesRank] = 1) AS [TopProduct1_Qty],

        -- 最暢銷商品第二名 (Top 2)
        (SELECT TOP 1 [ProductName] FROM ProductRanking WHERE [SalesRank] = 2) AS [TopProduct2_Name],
        (SELECT TOP 1 [TotalQtySold] FROM ProductRanking WHERE [SalesRank] = 2) AS [TopProduct2_Qty],

        -- 最暢銷商品第三名 (Top 3)
        (SELECT TOP 1 [ProductName] FROM ProductRanking WHERE [SalesRank] = 3) AS [TopProduct3_Name],
        (SELECT TOP 1 [TotalQtySold] FROM ProductRanking WHERE [SalesRank] = 3) AS [TopProduct3_Qty]

    FROM MonthlySales s;
END
GO
