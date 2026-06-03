using System;

namespace Domain.Entities;

/// <summary>
/// 檔案用途對照實體 (例如: 商品圖片、商家logo、商家首頁banner)
/// </summary>
public class FilPur
{
    /// <summary>
    /// 用途識別碼
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 用途名稱 (例如: 商品圖片, 商家logo, 商家首頁banner)
    /// </summary>
    public string Name { get; set; } = string.Empty;
}
