using System.Threading.Tasks;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

/// <summary>
/// 多商家訂單管理控制器 (支援分頁、篩選與排序，自動套用商家隔離)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IMerchantProvider _merchantProvider;

    public OrdersController(IOrderService orderService, IMerchantProvider merchantProvider)
    {
        _orderService = orderService;
        _merchantProvider = merchantProvider;
    }

    /// <summary>
    /// 獲取當前商家租戶下的所有訂單列表 (支援分頁、篩選與排序)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? ordStatus = null,
        [FromQuery] string? payStatus = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null,
        [FromQuery] string? search = null)
    {
        if (string.IsNullOrEmpty(_merchantProvider.MerchantId))
        {
            return BadRequest(new { message = "請於請求標頭中提供 X-Merchant-Id。" });
        }

        var result = await _orderService.GetPagedOrdersAsync(
            ordStatus,
            payStatus,
            page,
            pageSize,
            sortBy,
            sortOrder,
            search);

        return Ok(result);
    }

    /// <summary>
    /// 獲取特定訂單詳情
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        if (string.IsNullOrEmpty(_merchantProvider.MerchantId))
        {
            return BadRequest(new { message = "請於請求標頭中提供 X-Merchant-Id。" });
        }

        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null)
        {
            return NotFound(new { message = "查無此訂單或該訂單不屬於當前商店。" });
        }

        return Ok(order);
    }
}
