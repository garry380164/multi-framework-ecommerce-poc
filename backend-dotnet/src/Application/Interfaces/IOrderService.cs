using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces;

/// <summary>
/// 訂單管理服務介面 (基於多商家隔離)
/// </summary>
public interface IOrderService
{
    /// <summary>
    /// 獲取當前租戶下的訂單列表（支援分頁、篩選與排序）
    /// </summary>
    /// <param name="ordStatus">訂單狀態過濾 (ToDispatch/ToPick/ToShip/ToCollect/Completed)</param>
    /// <param name="payStatus">付款狀態過濾 (Unpaid/PartiallyPaid/Paid)</param>
    /// <param name="page">頁碼</param>
    /// <param name="pageSize">每頁筆數</param>
    /// <param name="sortBy">排序欄位</param>
    /// <param name="sortOrder">排序方向</param>
    /// <param name="search">搜尋關鍵字</param>
    Task<PagedResultDto<OrderDto>> GetPagedOrdersAsync(
        string? ordStatus,
        string? payStatus,
        int page,
        int pageSize,
        string? sortBy,
        string? sortOrder,
        string? search);

    /// <summary>
    /// 根據訂單 ID 獲取訂單詳情
    /// </summary>
    Task<OrderDto?> GetOrderByIdAsync(int id);
}
