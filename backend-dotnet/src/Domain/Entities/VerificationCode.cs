using System;

namespace Domain.Entities;

/// <summary>
/// 會員註冊驗證碼實體 (支援多商家隔離)
/// </summary>
public class VerificationCode : AuditableEntity, IMustHaveMerchant
{
    public int Id { get; set; }

    /// <summary>
    /// 所屬商家識別碼
    /// </summary>
    public string MerchantId { get; set; } = string.Empty;

    /// <summary>
    /// 電子郵件
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// 驗證碼 (6位數隨機碼)
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// 驗證碼過期時間
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// 驗證碼是否已被使用
    /// </summary>
    public bool IsUsed { get; set; }
}
