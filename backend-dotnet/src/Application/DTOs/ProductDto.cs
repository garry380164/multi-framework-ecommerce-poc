using System;

namespace Application.DTOs;

/// <summary>
/// 商品資料傳輸物件 (用於 API 輸出)
/// </summary>
public class ProductDto
{
    public int Id { get; set; }
    public string MerchantId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// 總訂購數量 (繁體中文註解)
    /// </summary>
    public int OrderedQty { get; set; }

    /// <summary>
    /// 缺貨數量 (繁體中文註解)
    /// </summary>
    public int ShortageQty { get; set; }

    /// <summary>
    /// 關聯分類 ID (繁體中文註解)
    /// </summary>
    public int? CategoryId { get; set; }

    /// <summary>
    /// 分類名稱 (繁體中文註解)
    /// </summary>
    public string? CategoryName { get; set; }
}

