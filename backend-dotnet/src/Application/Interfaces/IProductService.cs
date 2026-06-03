using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces;

/// <summary>
/// 商品管理服務介面 (基於多租戶隔離)
/// </summary>
public interface IProductService
{
    /// <summary>
    /// 獲取當前租戶下的所有商品
    /// </summary>
    Task<IEnumerable<ProductDto>> GetProductsAsync();

    /// <summary>
    /// 獲取當前租戶下的商品（支援分頁、篩選與排序）
    /// </summary>
    /// <param name="stockStatus">庫存狀態過濾 (lowStock/sufficient)</param>
    /// <param name="page">頁碼</param>
    /// <param name="pageSize">每頁筆數</param>
    /// <param name="sortBy">排序欄位</param>
    /// <param name="sortOrder">排序方向</param>
    /// <param name="search">搜尋關鍵字</param>
    Task<PagedResultDto<ProductDto>> GetPagedProductsAsync(
        string? stockStatus,
        int page,
        int pageSize,
        string? sortBy,
        string? sortOrder,
        string? search);


    /// <summary>
    /// 根據商品 ID 獲取商品詳情
    /// </summary>
    Task<ProductDto?> GetProductByIdAsync(int id);

    /// <summary>
    /// 為當前租戶建立新商品
    /// </summary>
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);

    /// <summary>
    /// 更新商品資料
    /// </summary>
    Task<ProductDto?> UpdateProductAsync(int id, CreateProductDto dto);

    /// <summary>
    /// 刪除商品
    /// </summary>
    Task<bool> DeleteProductAsync(int id);
}
