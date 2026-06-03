using System;
using System.Linq;
using System.Threading.Tasks;
using Application.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Controllers;

/// <summary>
/// 多商家報表數據控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMerchantProvider _merchantProvider;

    public ReportsController(AppDbContext context, IMerchantProvider merchantProvider)
    {
        _context = context;
        _merchantProvider = merchantProvider;
    }

    /// <summary>
    /// 獲取指定商家的月度銷售報表數據 (本月營收、訂單數、上月對比、熱銷 Top 3 商品)
    /// </summary>
    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthlyReport([FromQuery] string? targetDate = null)
    {
        var merchantId = _merchantProvider.MerchantId;
        if (string.IsNullOrEmpty(merchantId))
        {
            return BadRequest(new { message = "請於請求標頭中提供 X-Merchant-Id。" });
        }

        // 解析目標日期，若未指定則以當前時間為主 (例如：2026-05)
        DateTime parsedTargetDate = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(targetDate) && DateTime.TryParse(targetDate, out var dt))
        {
            parsedTargetDate = dt;
        }

        // 1. 計算本月與上月的起訖時間
        var curMonthStart = new DateTime(parsedTargetDate.Year, parsedTargetDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var curMonthEnd = curMonthStart.AddMonths(1).AddTicks(-1);

        var prevMonthStart = curMonthStart.AddMonths(-1);
        var prevMonthEnd = curMonthStart.AddTicks(-1);

        // 2. 彙總當月與上月訂單 (EF Core 會透過 Global Query Filter 自動依據當前 MerchantId 過濾)
        var allOrders = await _context.Orders
            .Where(o => o.OrderDate >= prevMonthStart && o.OrderDate <= curMonthEnd)
            .Where(o => o.OrdStatus == "Completed" || o.OrdStatus == "Shipped" || o.PayStatus == "Paid") // 僅統計已付款、已出貨或已完成的有效訂單
            .ToListAsync();

        var curMonthOrdersList = allOrders.Where(o => o.OrderDate >= curMonthStart && o.OrderDate <= curMonthEnd).ToList();
        var prevMonthOrdersList = allOrders.Where(o => o.OrderDate >= prevMonthStart && o.OrderDate <= prevMonthEnd).ToList();

        decimal revenue = curMonthOrdersList.Sum(o => o.TotalAmount);
        int orderCount = curMonthOrdersList.Count;

        decimal prevRevenue = prevMonthOrdersList.Sum(o => o.TotalAmount);
        int prevOrderCount = prevMonthOrdersList.Count;

        // 計算環比營收增長率
        decimal revenueGrowthRatePercent = 100;
        if (prevRevenue > 0)
        {
            revenueGrowthRatePercent = Math.Round(((revenue - prevRevenue) / prevRevenue) * 100, 2);
        }

        // 3. 計算本月的 Top 3 熱銷商品
        var topProducts = await _context.OrderItems
            .Include(oi => oi.Product)
            .Include(oi => oi.Order)
            .Where(oi => oi.Order != null && oi.Order.OrderDate >= curMonthStart && oi.Order.OrderDate <= curMonthEnd)
            .Where(oi => oi.Order != null && (oi.Order.OrdStatus == "Completed" || oi.Order.OrdStatus == "Shipped" || oi.Order.PayStatus == "Paid"))
            .GroupBy(oi => new { oi.ProductId, ProductName = oi.Product != null ? oi.Product.Name : "未知商品" })
            .Select(g => new
            {
                ProductName = g.Key.ProductName,
                TotalQty = g.Sum(oi => oi.Quantity)
            })
            .OrderByDescending(g => g.TotalQty)
            .Take(3)
            .ToListAsync();

        string topProduct1_Name = topProducts.Count > 0 ? topProducts[0].ProductName : "無商品資料";
        int topProduct1_Qty = topProducts.Count > 0 ? topProducts[0].TotalQty : 0;

        string topProduct2_Name = topProducts.Count > 1 ? topProducts[1].ProductName : "無商品資料";
        int topProduct2_Qty = topProducts.Count > 1 ? topProducts[1].TotalQty : 0;

        string topProduct3_Name = topProducts.Count > 2 ? topProducts[2].ProductName : "無商品資料";
        int topProduct3_Qty = topProducts.Count > 2 ? topProducts[2].TotalQty : 0;

        // 回傳符合前端 Dashboard 預期的 JSON 資料結構
        return Ok(new
        {
            merchantId = merchantId,
            reportingMonth = parsedTargetDate.ToString("yyyy-MM"),
            revenue = revenue,
            orderCount = orderCount,
            prevRevenue = prevRevenue,
            prevOrderCount = prevOrderCount,
            revenueGrowthRatePercent = revenueGrowthRatePercent,
            topProduct1_Name = topProduct1_Name,
            topProduct1_Qty = topProduct1_Qty,
            topProduct2_Name = topProduct2_Name,
            topProduct2_Qty = topProduct2_Qty,
            topProduct3_Name = topProduct3_Name,
            topProduct3_Qty = topProduct3_Qty
        });
    }
}
