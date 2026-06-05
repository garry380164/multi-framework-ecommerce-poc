using System;

namespace Domain.Entities;

/// <summary>
/// 重新整理權杖實體 (支援多商家隔離與安全防範)
/// </summary>
public class RefreshToken : AuditableEntity, IMustHaveMerchant
{
    public int Id { get; set; }

    /// <summary>
    /// 所屬商家識別碼
    /// </summary>
    public string MerchantId { get; set; } = string.Empty;

    /// <summary>
    /// 使用者識別碼
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// 重新整理權杖的 SHA-256 雜湊值 (不存明文以策安全)
    /// </summary>
    public string TokenHash { get; set; } = string.Empty;

    /// <summary>
    /// 過期時間
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// 是否已過期
    /// </summary>
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

    /// <summary>
    /// 撤銷時間 (若不為 null 代表此 Token 已失效)
    /// </summary>
    public DateTime? RevokedAt { get; set; }

    /// <summary>
    /// 撤銷時的來源 IP
    /// </summary>
    public string? RevokedByIp { get; set; }

    /// <summary>
    /// 取代此權杖的新權杖雜湊值 (用於 Token 輪轉鏈安全追蹤)
    /// </summary>
    public string? ReplacedByTokenHash { get; set; }

    /// <summary>
    /// 該權杖是否仍為活躍有效狀態
    /// </summary>
    public bool IsActive => RevokedAt == null && !IsExpired;

    // 導覽屬性 (Navigation Properties)
    public User? User { get; set; }
}
