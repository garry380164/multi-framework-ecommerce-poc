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
    /// 根據使用者 ID 取得使用者設定資料與權限列表
    /// </summary>
    Task<UserProfileResponse?> GetProfileAsync(int userId);
}
