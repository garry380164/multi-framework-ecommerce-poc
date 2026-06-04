using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Controllers;

/// <summary>
/// 商家成員登入與註冊控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IMerchantProvider _merchantProvider;
    private readonly AppDbContext _context;

    public AuthController(
        IAuthService authService, 
        IMerchantProvider merchantProvider,
        AppDbContext context)
    {
        _authService = authService;
        _merchantProvider = merchantProvider;
        _context = context;
    }

    /// <summary>
    /// 全域登入 API (免選商家，直接依據帳號進行登入與商家辨識)
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // 全域登入比對 (不再強制要求 X-Merchant-Id 請求標頭)
        var result = await _authService.LoginAsync(request, null!);
        
        if (!result.Success)
        {
            return Unauthorized(new { message = result.Message });
        }

        return Ok(result);
    }

    /// <summary>
    /// 發送註冊驗證碼 (技術展示用，會直接回傳驗證碼供前端填入)
    /// </summary>
    [HttpPost("send-code")]
    public async Task<IActionResult> SendCode([FromBody] SendCodeRequest request)
    {
        if (string.IsNullOrEmpty(_merchantProvider.MerchantId))
        {
            return BadRequest(new { message = "無效的請求或缺少必要的參數。" });
        }

        if (string.IsNullOrEmpty(request.Email))
        {
            return BadRequest(new { message = "請提供電子郵件。" });
        }

        // 產生 6 位數隨機數字驗證碼
        var random = new Random();
        var code = random.Next(100000, 999999).ToString();

        // 建立驗證碼實體，並設定 5 分鐘後過期 (EF Core 自動填充 IMustHaveMerchant)
        var verificationCode = new VerificationCode
        {
            Email = request.Email,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            IsUsed = false
        };

        _context.VerificationCodes.Add(verificationCode);
        await _context.SaveChangesAsync();

        // 技術展示：直接將 verification code 在 response 中回傳
        return Ok(new
        {
            success = true,
            message = "驗證碼已發送至信箱(技術展示自動帶入)",
            code = code
        });
    }

    /// <summary>
    /// 會員註冊 API (驗證成功後自動登入)
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrEmpty(_merchantProvider.MerchantId))
        {
            return BadRequest(new { message = "無效的請求或缺少必要的參數。" });
        }

        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { message = "請填寫電子郵件與密碼。" });
        }

        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "密碼與確認密碼不一致。" });
        }

        // 檢查該 Email 在當前商家下是否已註冊
        var userExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
        if (userExists)
        {
            return BadRequest(new { message = "該電子郵件已在當前商店註冊。" });
        }

        // 校驗驗證碼是否正確且未過期、未使用
        var latestCode = await _context.VerificationCodes
            .OrderByDescending(v => v.CreatedAt)
            .FirstOrDefaultAsync(v => v.Email == request.Email && !v.IsUsed);

        if (latestCode == null || latestCode.Code != request.Code)
        {
            return BadRequest(new { message = "驗證碼不正確或已失效。" });
        }

        if (latestCode.ExpiresAt < DateTime.UtcNow)
        {
            return BadRequest(new { message = "驗證碼已過期，請重新發送。" });
        }

        // 驗證碼通過，標記為已使用
        latestCode.IsUsed = true;
        _context.VerificationCodes.Update(latestCode);

        // 建立新會員 User (RoleId = 4 為 Member)
        var user = new User
        {
            Email = request.Email,
            Username = request.Username ?? request.Email.Split('@')[0],
            PasswordHash = HashPassword(request.Password),
            RoleId = 4 // 一般消費者
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // 註冊成功後，自動執行登入並返回 JWT Token
        var loginRequest = new LoginRequest
        {
            Email = request.Email,
            Password = request.Password
        };
        var loginResult = await _authService.LoginAsync(loginRequest, _merchantProvider.MerchantId);

        return Ok(loginResult);
    }

    /// <summary>
    /// 獲取當前登入使用者的設定資料與權限列表
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new { message = "無效的安全憑證。" });
        }

        var profile = await _authService.GetProfileAsync(userId);
        if (profile == null)
        {
            return NotFound(new { message = "找不到該使用者資料。" });
        }

        return Ok(profile);
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

public class SendCodeRequest
{
    public string Email { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Username { get; set; }
}
