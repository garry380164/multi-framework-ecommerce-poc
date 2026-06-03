using System.Collections.Generic;

namespace Domain.Entities;

/// <summary>
/// 商品實體 (支援多商家隔離)
/// </summary>
public class Product : AuditableEntity, IMustHaveMerchant
{
    public int Id { get; set; }

    /// <summary>
    /// 所屬商家識別碼
    /// </summary>
    public string MerchantId { get; set; } = string.Empty;

    /// <summary>
    /// 商品名稱
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 商品描述
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// 價格
    /// </summary>
    public decimal Price { get; set; }

    /// <summary>
    /// 庫存數量
    /// </summary>
    public int Stock { get; set; }

    /// <summary>
    /// 圖片網址
    /// </summary>
    public string? ImageUrl { get; set; }

    /// <summary>
    /// 關聯分類 ID (繁體中文註解)
    /// </summary>
    public int? CategoryId { get; set; }

    // 導覽屬性 (Navigation Properties)
    public Merchant? Merchant { get; set; }
    public Category? Category { get; set; }
    public ICollection<ProductSpec> ProductSpecs { get; set; } = new List<ProductSpec>();
}
