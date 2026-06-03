using System.Collections.Generic;

namespace Application.DTOs;

/// <summary>
/// 登入回應結果
/// </summary>
public class LoginResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string MerchantId { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
}
