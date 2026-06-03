using System;

namespace Domain.Entities;

/// <summary>
/// 多商家實體
/// </summary>
public class Merchant : AuditableEntity
{
    /// <summary>
    /// 商家唯一識別碼 (例如: "store-a", "store-b")
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// 商家名稱
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 獨立網域名稱
    /// </summary>
    public string? Domain { get; set; }

    /// <summary>
    /// 商家是否啟用
    /// </summary>
    public bool IsActive { get; set; } = true;
}
