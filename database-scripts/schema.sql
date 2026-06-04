-- ============================================================================
-- 專案主題：E-Commerce Multi-Merchant CMS (多商家電商與內容管理系統)
-- 檔案描述：資料庫主結構 Schema 設計 (相容 MSSQL Server)
-- 註解語言：繁體中文
-- ============================================================================

-- 0.1 建立檔案類型表 (FilTyp)
CREATE TABLE [dbo].[FilTyp] (
    [Id] INT NOT NULL,
    [Name] NVARCHAR(50) NOT NULL,
    CONSTRAINT [PK_FilTyp] PRIMARY KEY CLUSTERED ([Id] ASC)
);

-- 0.2 建立檔案用途表 (FilPur)
CREATE TABLE [dbo].[FilPur] (
    [Id] INT NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    CONSTRAINT [PK_FilPur] PRIMARY KEY CLUSTERED ([Id] ASC)
);

-- 0.3 建立檔案表 (File)
CREATE TABLE [dbo].[File] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [OriName] NVARCHAR(250) NOT NULL,
    [SaveName] NVARCHAR(250) NOT NULL,
    [TargetId] NVARCHAR(100) NOT NULL,            -- 被關聯對象的唯一識別碼 (例如: 商家Id, 商品Id)
    [FileSize] BIGINT NOT NULL,
    [Extension] NVARCHAR(10) NOT NULL,
    [FilPurId] INT NOT NULL,
    [FilTypId] INT NOT NULL,
    [Status] NVARCHAR(10) CONSTRAINT [DF_File_Status] DEFAULT (N'1') NOT NULL,
    [CreatedAt] DATETIME2(7) CONSTRAINT [DF_File_CreatedAt] DEFAULT (SYSUTCDATETIME()) NOT NULL,
    [Creator] NVARCHAR(100) CONSTRAINT [DF_File_Creator] DEFAULT (N'System') NOT NULL,
    CONSTRAINT [PK_File] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_File_FilPur] FOREIGN KEY ([FilPurId]) REFERENCES [dbo].[FilPur] ([Id]),
    CONSTRAINT [FK_File_FilTyp] FOREIGN KEY ([FilTypId]) REFERENCES [dbo].[FilTyp] ([Id])
);

-- 1. 建立角色表 (Roles)
CREATE TABLE [dbo].[Roles] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(50) NOT NULL,
    [Description] NVARCHAR(250) NULL,
    -- 審計欄位
    [CreatedAt] DATETIME2(7) CONSTRAINT [DF_Roles_CreatedAt] DEFAULT (SYSUTCDATETIME()) NOT NULL,
    [CreatedUser] NVARCHAR(100) NULL,
    [UpdatedAt] DATETIME2(7) NULL,
    [UpdatedUser] NVARCHAR(100) NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([Id] ASC)
);

-- 2. 建立商家表 (Merchants)
CREATE TABLE [dbo].[Merchants] (
    [Id] NVARCHAR(50) NOT NULL,              -- 商家唯一識別碼 (例如: "store-a", "store-b")
    [Name] NVARCHAR(100) NOT NULL,            -- 商家商店名稱
    [Domain] NVARCHAR(100) NULL,              -- 獨立域名 (若有)
    [IsActive] BIT CONSTRAINT [DF_Merchants_IsActive] DEFAULT ((1)) NOT NULL,
    -- 審計欄位
    [CreatedAt] DATETIME2(7) CONSTRAINT [DF_Merchants_CreatedAt] DEFAULT (SYSUTCDATETIME()) NOT NULL,
    [CreatedUser] NVARCHAR(100) NULL,
    [UpdatedAt] DATETIME2(7) NULL,
    [UpdatedUser] NVARCHAR(100) NULL,
    CONSTRAINT [PK_Merchants] PRIMARY KEY CLUSTERED ([Id] ASC)
);

-- 3. 建立使用者表 (Users) - 支援多商家隔離
CREATE TABLE [dbo].[Users] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [MerchantId] NVARCHAR(50) NOT NULL,         -- 關聯商家
    [Username] NVARCHAR(50) NOT NULL,
    [Email] NVARCHAR(100) NOT NULL,
    [PasswordHash] NVARCHAR(250) NOT NULL,
    [RoleId] INT NOT NULL,                    -- 角色 (例如: Admin, Staff, Customer)
    -- 審計欄位
    [CreatedAt] DATETIME2(7) CONSTRAINT [DF_Users_CreatedAt] DEFAULT (SYSUTCDATETIME()) NOT NULL,
    [CreatedUser] NVARCHAR(100) NULL,
    [UpdatedAt] DATETIME2(7) NULL,
    [UpdatedUser] NVARCHAR(100) NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Users_Merchants] FOREIGN KEY ([MerchantId]) REFERENCES [dbo].[Merchants] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Users_Roles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles] ([Id])
);

-- 3.5 建立商品分類表 (Categories) - 支援多商家隔離
CREATE TABLE [dbo].[Categories] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [MerchantId] NVARCHAR(50) NOT NULL,         -- 關聯商家
    [Name] NVARCHAR(100) NOT NULL,            -- 分類名稱
    -- 審計欄位
    [CreatedAt] DATETIME2(7) CONSTRAINT [DF_Categories_CreatedAt] DEFAULT (SYSUTCDATETIME()) NOT NULL,
    [CreatedUser] NVARCHAR(100) NULL,
    [UpdatedAt] DATETIME2(7) NULL,
    [UpdatedUser] NVARCHAR(100) NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Categories_Merchants] FOREIGN KEY ([MerchantId]) REFERENCES [dbo].[Merchants] ([Id]) ON DELETE CASCADE
);

-- 4. 建立商品表 (Products) - 支援多商家隔離
CREATE TABLE [dbo].[Products] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [MerchantId] NVARCHAR(50) NOT NULL,         -- 關聯商家
    [Name] NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    [Price] DECIMAL(18, 2) NOT NULL,          -- 商品基礎價格
    [Stock] INT CONSTRAINT [DF_Products_Stock] DEFAULT ((0)) NOT NULL, -- 商品基礎庫存
    [ImageUrl] NVARCHAR(500) NULL,
    [CategoryId] INT NULL,                    -- 關聯分類
    -- 審計欄位
    [CreatedAt] DATETIME2(7) CONSTRAINT [DF_Products_CreatedAt] DEFAULT (SYSUTCDATETIME()) NOT NULL,
    [CreatedUser] NVARCHAR(100) NULL,
    [UpdatedAt] DATETIME2(7) NULL,
    [UpdatedUser] NVARCHAR(100) NULL,
    CONSTRAINT [PK_Products] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Products_Merchants] FOREIGN KEY ([MerchantId]) REFERENCES [dbo].[Merchants] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Products_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories] ([Id]) ON DELETE SET NULL
);

-- 5. 建立商品規格表 (ProductSpecs) - 支援一個商品有多個規格
CREATE TABLE [dbo].[ProductSpecs] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [ProductId] INT NOT NULL,                  -- 關聯商品
    [SpecName] NVARCHAR(100) NOT NULL,            -- 規格名稱 (例如: "黑色 / L", "250g裝")
    [Price] DECIMAL(18, 2) NOT NULL,              -- 規格售價
    [Stock] INT CONSTRAINT [DF_ProductSpecs_Stock] DEFAULT ((0)) NOT NULL, -- 規格庫存
    -- 審計欄位
    [CreatedAt] DATETIME2(7) CONSTRAINT [DF_ProductSpecs_CreatedAt] DEFAULT (SYSUTCDATETIME()) NOT NULL,
    [CreatedUser] NVARCHAR(100) NULL,
    [UpdatedAt] DATETIME2(7) NULL,
    [UpdatedUser] NVARCHAR(100) NULL,
    CONSTRAINT [PK_ProductSpecs] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProductSpecs_Products] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products] ([Id]) ON DELETE CASCADE
);

-- 6. 建立訂單表 (Orders) - 支援多商家隔離
CREATE TABLE [dbo].[Orders] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [MerchantId] NVARCHAR(50) NOT NULL,         -- 關聯商家
    [UserId] INT NOT NULL,                    -- 下單會員
    [OrderDate] DATETIME2(7) CONSTRAINT [DF_Orders_OrderDate] DEFAULT (SYSUTCDATETIME()) NOT NULL, -- 下單時間
    [TotalAmount] DECIMAL(18, 2) NOT NULL,      -- 訂單總金額
    [ReceivableAmount] DECIMAL(18, 2) NOT NULL, -- 訂單應收金額
    [ReceivedAmount] DECIMAL(18, 2) NOT NULL,   -- 訂單已收金額
    [DiscountAmount] DECIMAL(18, 2) NOT NULL,   -- 訂單折讓金額
    [PointsAmount] DECIMAL(18, 2) NOT NULL,     -- 訂單購物金扣抵金額
    [PromoAmount] DECIMAL(18, 2) NOT NULL,      -- 訂單優惠扣抵金額
    [OrdStatus] NVARCHAR(50) CONSTRAINT [DF_Orders_OrdStatus] DEFAULT (N'Pending') NOT NULL, -- 訂單狀態 (Pending, Paid, Shipped, Cancelled)
    [Status] NVARCHAR(10) CONSTRAINT [DF_Orders_Status] DEFAULT (N'1') NOT NULL, -- 系統狀態 (1: 正常/可用, 0: 停用/刪除)
    -- 審計欄位
    [CreatedAt] DATETIME2(7) CONSTRAINT [DF_Orders_CreatedAt] DEFAULT (SYSUTCDATETIME()) NOT NULL,
    [CreatedUser] NVARCHAR(100) NULL,
    [UpdatedAt] DATETIME2(7) NULL,
    [UpdatedUser] NVARCHAR(100) NULL,
    CONSTRAINT [PK_Orders] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Orders_Merchants] FOREIGN KEY ([MerchantId]) REFERENCES [dbo].[Merchants] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Orders_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
);

-- 7. 建立訂單明細表 (OrderItems)
CREATE TABLE [dbo].[OrderItems] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [OrderId] INT NOT NULL,                    -- 關聯訂單
    [ProductId] INT NOT NULL,                  -- 關聯商品
    [ProductSpecId] INT NULL,                  -- 關聯商品規格 (允許為空以相容無規格商品)
    [SpecName] NVARCHAR(100) NULL,                 -- 快照訂購時的商品規格名稱
    [Quantity] INT NOT NULL,                   -- 訂購數量
    [OriginalUnitPrice] DECIMAL(18, 2) NOT NULL, -- 商品原始單價
    [DiscountUnitPrice] DECIMAL(18, 2) NULL,     -- 商品優惠後單價 (若有優惠)
    [TotalAmount] DECIMAL(18, 2) NOT NULL,       -- 明細總計金額 (通常為 Quantity * (DiscountUnitPrice ?? OriginalUnitPrice))
    -- 審計欄位
    [CreatedAt] DATETIME2(7) CONSTRAINT [DF_OrderItems_CreatedAt] DEFAULT (SYSUTCDATETIME()) NOT NULL,
    [CreatedUser] NVARCHAR(100) NULL,
    [UpdatedAt] DATETIME2(7) NULL,
    [UpdatedUser] NVARCHAR(100) NULL,
    CONSTRAINT [PK_OrderItems] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_OrderItems_Orders] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_OrderItems_Products] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_OrderItems_ProductSpecs] FOREIGN KEY ([ProductSpecId]) REFERENCES [dbo].[ProductSpecs] ([Id]) ON DELETE SET NULL
);

-- 8. 建立系統功能動作表 (SystemActions)
CREATE TABLE [dbo].[SystemActions] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Code] NVARCHAR(100) NOT NULL,            -- 功能動作代號 (如: Product.Create)
    [Name] NVARCHAR(100) NOT NULL,            -- 功能動作名稱 (如: 新增商品)
    [Description] NVARCHAR(250) NULL,
    [Status] NVARCHAR(10) CONSTRAINT [DF_SystemActions_Status] DEFAULT (N'1') NOT NULL, -- 運作狀態
    -- 審計欄位
    [CreatedAt] DATETIME2(7) CONSTRAINT [DF_SystemActions_CreatedAt] DEFAULT (SYSUTCDATETIME()) NOT NULL,
    [CreatedUser] NVARCHAR(100) NULL,
    [UpdatedAt] DATETIME2(7) NULL,
    [UpdatedUser] NVARCHAR(100) NULL,
    CONSTRAINT [PK_SystemActions] PRIMARY KEY CLUSTERED ([Id] ASC)
);

-- 9. 建立角色功能關聯表 (RoleActions)
CREATE TABLE [dbo].[RoleActions] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [RoleId] INT NOT NULL,                     -- 關聯角色
    [SystemActionId] INT NOT NULL,             -- 關聯系統功能動作
    [Status] NVARCHAR(10) CONSTRAINT [DF_RoleActions_Status] DEFAULT (N'1') NOT NULL, -- 狀態
    -- 審計欄位
    [CreatedAt] DATETIME2(7) CONSTRAINT [DF_RoleActions_CreatedAt] DEFAULT (SYSUTCDATETIME()) NOT NULL,
    [CreatedUser] NVARCHAR(100) NULL,
    [UpdatedAt] DATETIME2(7) NULL,
    [UpdatedUser] NVARCHAR(100) NULL,
    CONSTRAINT [PK_RoleActions] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_RoleActions_Roles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_RoleActions_SystemActions] FOREIGN KEY ([SystemActionId]) REFERENCES [dbo].[SystemActions] ([Id]) ON DELETE CASCADE
);

-- ============================================================================
-- 效能優化：索引設計 (Index Design)
-- ============================================================================

-- 在使用者表上建立多商家與電子郵件的複合唯一索引，用於登入驗證加速
CREATE UNIQUE NONCLUSTERED INDEX [UX_Users_Merchant_Email]
    ON [dbo].[Users]([MerchantId] ASC, [Email] ASC);

-- 在商品表上建立商家索引，加速單一商家的商品列表查詢
CREATE NONCLUSTERED INDEX [IX_Products_MerchantId]
    ON [dbo].[Products]([MerchantId] ASC)
    INCLUDE ([Name], [Price], [Stock]);

-- 在商品表上建立分類索引，加速分類查詢
CREATE NONCLUSTERED INDEX [IX_Products_CategoryId]
    ON [dbo].[Products]([CategoryId] ASC);

-- 在商品規格表上建立商品 ID 索引
CREATE NONCLUSTERED INDEX [IX_ProductSpecs_ProductId]
    ON [dbo].[ProductSpecs]([ProductId] ASC);

-- 在訂單表上建立商家與訂單日期的複合索引，以利銷售報表與時間區間篩選的效能優化
CREATE NONCLUSTERED INDEX [IX_Orders_Merchant_Date]
    ON [dbo].[Orders]([MerchantId] ASC, [OrderDate] DESC)
    INCLUDE ([TotalAmount], [OrdStatus]);

-- 在訂單明細表上建立訂單編號索引，加速訂單詳情載入
CREATE NONCLUSTERED INDEX [IX_OrderItems_OrderId]
    ON [dbo].[OrderItems]([OrderId] ASC)
    INCLUDE ([ProductId], [ProductSpecId], [Quantity], [OriginalUnitPrice], [DiscountUnitPrice], [TotalAmount]);

-- 建立 SystemActions Code 的唯一索引
CREATE UNIQUE NONCLUSTERED INDEX [UX_SystemActions_Code]
    ON [dbo].[SystemActions]([Code] ASC);

-- 在檔案表上建立 TargetId 與用途 ID 的複合索引，加速檔案通用查詢
CREATE NONCLUSTERED INDEX [IX_File_Target_Purpose]
    ON [dbo].[File]([TargetId] ASC, [FilPurId] ASC);
