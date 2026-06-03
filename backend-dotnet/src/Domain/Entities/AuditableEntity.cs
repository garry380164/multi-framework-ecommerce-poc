using System;

namespace Domain.Entities;

/// <summary>
/// 審計實體基底類別，紀錄建立與更新的相關審計資訊
/// </summary>
public abstract class AuditableEntity
{
    /// <summary>
    /// 建立時間
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 建立者
    /// </summary>
    public string? CreatedUser { get; set; }

    /// <summary>
    /// 最後更新時間
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// 最後更新者
    /// </summary>
    public string? UpdatedUser { get; set; }
}
