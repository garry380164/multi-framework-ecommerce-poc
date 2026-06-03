using System;

namespace Domain.Entities;

/// <summary>
/// 檔案上傳路徑與描述實體
/// </summary>
public class File
{
    /// <summary>
    /// 檔案唯一識別碼
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 原始檔名 (上傳前)
    /// </summary>
    public string OriName { get; set; } = string.Empty;

    /// <summary>
    /// 儲存檔名 (伺服器上的檔案名稱)
    /// </summary>
    public string SaveName { get; set; } = string.Empty;

    /// <summary>
    /// 被關聯對象的唯一識別碼 (例如: 商家Id)
    /// </summary>
    public string TargetId { get; set; } = string.Empty;

    /// <summary>
    /// 檔案大小 (Byte)
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// 副檔名
    /// </summary>
    public string Extension { get; set; } = string.Empty;

    /// <summary>
    /// 檔案用途識別碼
    /// </summary>
    public int FilPurId { get; set; }

    /// <summary>
    /// 檔案類型識別碼
    /// </summary>
    public int FilTypId { get; set; }

    /// <summary>
    /// 檔案狀態 (例如: "1" 代表正常)
    /// </summary>
    public string Status { get; set; } = "1";

    /// <summary>
    /// 建立時間
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 建立者
    /// </summary>
    public string Creator { get; set; } = "System";

    // 導覽屬性
    public FilPur? FilPur { get; set; }
    public FilTyp? FilTyp { get; set; }
}
