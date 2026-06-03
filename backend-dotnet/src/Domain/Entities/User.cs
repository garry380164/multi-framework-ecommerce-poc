using System;

namespace Domain.Entities;

/// <summary>
/// 使用者實體 (支援多商家隔離)
/// </summary>
public class User : AuditableEntity, IMustHaveMerchant
{
    public int Id { get; set; }

    /// <summary>
    /// 所屬商家識別碼
    /// </summary>
    public string MerchantId { get; set; } = string.Empty;

    /// <summary>
    /// 使用者名稱
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// 電子郵件
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// 加密後的密碼
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// 角色識別碼
    /// </summary>
    public int RoleId { get; set; }

    // 導覽屬性 (Navigation Properties)
    public Merchant? Merchant { get; set; }
    public Role? Role { get; set; }
}
