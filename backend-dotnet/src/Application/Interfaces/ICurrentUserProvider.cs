namespace Application.Interfaces;

/// <summary>
/// 提供當前請求的使用者資訊 (用於自動審計欄位填入)
/// </summary>
public interface ICurrentUserProvider
{
    /// <summary>
    /// 當前使用者的識別碼
    /// </summary>
    string? UserId { get; }

    /// <summary>
    /// 當前使用者的帳號名稱
    /// </summary>
    string? Username { get; }
}
