using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Domain.Entities;

namespace Infrastructure.Services;

/// <summary>
/// 認證服務實作 (支援多商家隔離與 JWT 簽發)
/// </summary>
public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, string merchantId)
    {
        // 1. 全域尋找使用者 (忽略多商家過濾器以支援直接登入)
        var user = await _context.Users
            .IgnoreQueryFilters()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return new LoginResponse { Success = false, Message = "電子郵件或密碼錯誤。" };
        }

        // 2. 驗證密碼雜湊值
        string requestPasswordHash = HashPassword(request.Password);
        if (user.PasswordHash != requestPasswordHash)
        {
            return new LoginResponse { Success = false, Message = "電子郵件或密碼錯誤。" };
        }

        // 3. 產生 JWT Token
        string token = GenerateJwtToken(user);

        // 4. 取得該角色所對應的所有啟用狀態權限 (Status = "1")
        var permissions = await _context.RoleActions
            .IgnoreQueryFilters()
            .Where(ra => ra.RoleId == user.RoleId && ra.Status == "1" && ra.SystemAction!.Status == "1")
            .Select(ra => ra.SystemAction!.Code)
            .ToListAsync();

        return new LoginResponse
        {
            Success = true,
            Message = "登入成功。",
            Token = token,
            Username = user.Username,
            Role = user.Role?.Name ?? "Customer",
            MerchantId = user.MerchantId,
            Permissions = permissions
        };
    }

    public async Task<UserProfileResponse?> GetProfileAsync(int userId)
    {
        var user = await _context.Users
            .IgnoreQueryFilters()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return null;
        }

        var permissions = await _context.RoleActions
            .IgnoreQueryFilters()
            .Where(ra => ra.RoleId == user.RoleId && ra.Status == "1" && ra.SystemAction!.Status == "1")
            .Select(ra => ra.SystemAction!.Code)
            .ToListAsync();

        return new UserProfileResponse
        {
            Success = true,
            Username = user.Username,
            Role = user.Role?.Name ?? "Customer",
            MerchantId = user.MerchantId,
            Permissions = permissions
        };
    }

    /// <summary>
    /// 產生 JWT Token，將 UserId, Role 與 MerchantId 寫入 Claim 中
    /// </summary>
    private string GenerateJwtToken(Domain.Entities.User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        
        // 從配置檔讀取金鑰，若無則使用 PoC 預設安全金鑰
        string secretKey = _configuration["JwtSettings:Secret"] ?? "super_secret_key_showcase_portfolio_123456789";
        var key = Encoding.ASCII.GetBytes(secretKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "Customer"),
                new Claim("merchantId", user.MerchantId) // 寫入商家 ID，以便後續請求的安全校驗
            }),
            Expires = DateTime.UtcNow.AddMinutes(15), // Access Token 過期時間縮短至 15 分鐘
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["JwtSettings:Issuer"] ?? "CMS_WebAPI",
            Audience = _configuration["JwtSettings:Audience"] ?? "CMS_Clients"
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// 執行登入並返回 JWT Token 與新生成的 Refresh Token (用於寫入 Cookie)
    /// </summary>
    public async Task<(LoginResponse Response, string RefreshToken)> LoginWithRefreshAsync(LoginRequest request, string merchantId, string ipAddress)
    {
        // 1. 全域尋找使用者 (忽略多商家過濾器以支援直接登入)
        var user = await _context.Users
            .IgnoreQueryFilters()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return (new LoginResponse { Success = false, Message = "電子郵件或密碼錯誤。" }, string.Empty);
        }

        // 2. 驗證密碼雜湊值
        string requestPasswordHash = HashPassword(request.Password);
        if (user.PasswordHash != requestPasswordHash)
        {
            return (new LoginResponse { Success = false, Message = "電子郵件或密碼錯誤。" }, string.Empty);
        }

        // 3. 產生 JWT Token (Access Token)
        string token = GenerateJwtToken(user);

        // 4. 取得該角色所對應的所有啟用狀態權限 (Status = "1")
        var permissions = await _context.RoleActions
            .IgnoreQueryFilters()
            .Where(ra => ra.RoleId == user.RoleId && ra.Status == "1" && ra.SystemAction!.Status == "1")
            .Select(ra => ra.SystemAction!.Code)
            .ToListAsync();

        // 5. 產生並儲存全新的 Refresh Token
        string rawRefreshToken = GenerateRandomTokenString();
        string tokenHash = HashToken(rawRefreshToken);

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(7), // 設定 7 天過期
            MerchantId = user.MerchantId,
            CreatedUser = user.Username
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync();

        var response = new LoginResponse
        {
            Success = true,
            Message = "登入成功。",
            Token = token,
            Username = user.Username,
            Role = user.Role?.Name ?? "Customer",
            MerchantId = user.MerchantId,
            Permissions = permissions
        };

        return (response, rawRefreshToken);
    }

    /// <summary>
    /// 使用 Refresh Token 刷新並取得新的一組 Access Token 與新 Refresh Token (輪轉機制)
    /// </summary>
    public async Task<(LoginResponse Response, string RefreshToken)?> RefreshTokenAsync(string rawRefreshToken, string ipAddress)
    {
        string tokenHash = HashToken(rawRefreshToken);

        // 忽略商家過濾器以尋找該 token
        var dbToken = await _context.RefreshTokens
            .IgnoreQueryFilters()
            .Include(r => r.User)
            .ThenInclude(u => u!.Role)
            .FirstOrDefaultAsync(r => r.TokenHash == tokenHash);

        if (dbToken == null)
        {
            return null; // Token 不存在
        }

        // ⚠️ 安全防護：偵測重播攻擊 (Reused Token Detection)
        // 如果此 Token 已經被撤銷，代表它之前被換過了，現在又拿來換，可能是 Token 遭到竊取重播！
        if (dbToken.RevokedAt != null)
        {
            // 撤銷該使用者「所有」活躍的 Refresh Tokens，防止駭客繼續存取
            var activeTokens = await _context.RefreshTokens
                .IgnoreQueryFilters()
                .Where(r => r.UserId == dbToken.UserId && r.RevokedAt == null)
                .ToListAsync();

            foreach (var t in activeTokens)
            {
                t.RevokedAt = DateTime.UtcNow;
                t.RevokedByIp = ipAddress;
                t.UpdatedUser = "SecurityDetection";
            }
            await _context.SaveChangesAsync();
            return null; // 拒絕存取
        }

        // 檢查是否已過期
        if (dbToken.IsExpired)
        {
            return null;
        }

        // --- 驗證通過，執行 Token 輪轉 (Rotation) ---

        // 1. 產生新的雙 Token
        string newAccessToken = GenerateJwtToken(dbToken.User!);
        string newRawRefreshToken = GenerateRandomTokenString();
        string newRefreshTokenHash = HashToken(newRawRefreshToken);

        // 2. 標記舊 Token 為已撤銷，並關聯新 Token
        dbToken.RevokedAt = DateTime.UtcNow;
        dbToken.RevokedByIp = ipAddress;
        dbToken.ReplacedByTokenHash = newRefreshTokenHash;
        dbToken.UpdatedUser = dbToken.User!.Username;

        // 3. 儲存新 Token 記錄
        var newDbToken = new RefreshToken
        {
            UserId = dbToken.UserId,
            TokenHash = newRefreshTokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            MerchantId = dbToken.MerchantId,
            CreatedUser = dbToken.User!.Username
        };

        _context.RefreshTokens.Add(newDbToken);
        await _context.SaveChangesAsync();

        // 4. 取得使用者權限
        var permissions = await _context.RoleActions
            .IgnoreQueryFilters()
            .Where(ra => ra.RoleId == dbToken.User.RoleId && ra.Status == "1" && ra.SystemAction!.Status == "1")
            .Select(ra => ra.SystemAction!.Code)
            .ToListAsync();

        var response = new LoginResponse
        {
            Success = true,
            Message = "刷新成功。",
            Token = newAccessToken,
            Username = dbToken.User.Username,
            Role = dbToken.User.Role?.Name ?? "Customer",
            MerchantId = dbToken.MerchantId,
            Permissions = permissions
        };

        return (response, newRawRefreshToken);
    }

    /// <summary>
    /// 註銷/撤銷指定的 Refresh Token
    /// </summary>
    public async Task<bool> RevokeTokenAsync(string rawRefreshToken, string ipAddress)
    {
        string tokenHash = HashToken(rawRefreshToken);

        var dbToken = await _context.RefreshTokens
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.TokenHash == tokenHash);

        if (dbToken == null || !dbToken.IsActive)
        {
            return false;
        }

        dbToken.RevokedAt = DateTime.UtcNow;
        dbToken.RevokedByIp = ipAddress;
        dbToken.UpdatedUser = "System";

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// 產生明文隨機 Refresh Token
    /// </summary>
    private string GenerateRandomTokenString()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    /// <summary>
    /// 將明文 Token 轉為 SHA256 雜湊值 (用於比對與資料庫安全儲存)
    /// </summary>
    private string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    /// <summary>
    /// SHA256 密碼雜湊
    /// </summary>
    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}
