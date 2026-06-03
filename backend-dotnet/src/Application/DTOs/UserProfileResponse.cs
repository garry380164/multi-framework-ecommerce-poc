using System.Collections.Generic;

namespace Application.DTOs;

/// <summary>
/// 使用者設定與權限回應 DTO
/// </summary>
public class UserProfileResponse
{
    public bool Success { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string MerchantId { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
}
