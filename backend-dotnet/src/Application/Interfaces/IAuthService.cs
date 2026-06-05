using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces;

/// <summary>
/// 認證與授權服務介面
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// 執行登入並返回 JWT Token
    /// </summary>
    Task<LoginResponse> LoginAsync(LoginRequest request, string merchantId);

    /// <summary>
    /// 執行登入並返回 JWT Token 與新生成的 Refresh Token (用於寫入 Cookie)
    /// </summary>
    Task<(LoginResponse Response, string RefreshToken)> LoginWithRefreshAsync(LoginRequest request, string merchantId, string ipAddress);

    /// <summary>
    /// 使用 Refresh Token 刷新並取得新的一組 Access Token 與新 Refresh Token (輪轉機制)
    /// </summary>
    Task<(LoginResponse Response, string RefreshToken)?> RefreshTokenAsync(string rawRefreshToken, string ipAddress);

    /// <summary>
    /// 註銷/撤銷指定的 Refresh Token
    /// </summary>
    Task<bool> RevokeTokenAsync(string rawRefreshToken, string ipAddress);

    /// <summary>
    /// 根據使用者 ID 取得使用者設定資料與權限列表
    /// </summary>
    Task<UserProfileResponse?> GetProfileAsync(int userId);
}
