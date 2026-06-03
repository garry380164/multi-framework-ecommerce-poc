using System.Threading.Tasks;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Application.Interfaces;

namespace WebApi.Controllers;

/// <summary>
/// 商家資訊管理控制器 (繁體中文註解)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MerchantsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMerchantProvider _merchantProvider;

    public MerchantsController(AppDbContext context, IMerchantProvider merchantProvider)
    {
        _context = context;
        _merchantProvider = merchantProvider;
    }

    /// <summary>
    /// 獲取當前商家的詳細資訊，包含 Logo 圖片相對網址
    /// </summary>
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentMerchant()
    {
        var merchantId = _merchantProvider.MerchantId;
        if (string.IsNullOrEmpty(merchantId))
        {
            return BadRequest(new { message = "請於請求標頭中提供 X-Merchant-Id。" });
        }

        // Merchants 屬於全域資料庫的基礎表，不套用多租戶 QueryFilter 故使用 IgnoreQueryFilters() 讀取
        var merchant = await _context.Merchants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(m => m.Id == merchantId);

        if (merchant == null)
        {
            return NotFound(new { message = "查無此商家商店。" });
        }

        // 依據 TargetId 與 檔案用途 (FilPurId == 2 代表 商家LOGO) 查詢對應檔案
        var logoFile = await _context.Files
            .FirstOrDefaultAsync(f => f.TargetId == merchantId && f.FilPurId == 2);

        // 拼接 Logo 圖片的網址 (例如: /uploads/logo-store-a.png)
        string? logoUrl = null;
        if (logoFile != null)
        {
            logoUrl = $"/uploads/{logoFile.SaveName}";
        }

        return Ok(new
        {
            id = merchant.Id,
            name = merchant.Name,
            domain = merchant.Domain,
            logoUrl = logoUrl
        });
    }

    /// <summary>
    /// 獲取所有啟用中的商家列表 (繁體中文註解)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllMerchants()
    {
        var merchants = await _context.Merchants
            .IgnoreQueryFilters()
            .Where(m => m.IsActive)
            .Select(m => new { id = m.Id, name = m.Name })
            .ToListAsync();

        return Ok(merchants);
    }
}
