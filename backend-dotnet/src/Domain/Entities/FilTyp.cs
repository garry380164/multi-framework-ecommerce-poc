using System;

namespace Domain.Entities;

/// <summary>
/// 檔案類型對照實體 (例如: 圖片、影片、文件)
/// </summary>
public class FilTyp
{
    /// <summary>
    /// 類型識別碼
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 類型名稱 (例如: 圖片, 影片, 文件)
    /// </summary>
    public string Name { get; set; } = string.Empty;
}
