using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace WebApi.Services;

/// <summary>
/// 基於 HttpContext 的當前使用者資訊提供者
/// </summary>
public class CurrentUserProvider : ICurrentUserProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// 從 JWT Claims 中取得使用者識別碼
    /// </summary>
    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    /// <summary>
    /// 從 JWT Claims 中取得使用者名稱
    /// </summary>
    public string? Username => _httpContextAccessor.HttpContext?.User?.Identity?.Name;
}
