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
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["JwtSettings:Issuer"] ?? "CMS_WebAPI",
            Audience = _configuration["JwtSettings:Audience"] ?? "CMS_Clients"
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
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
