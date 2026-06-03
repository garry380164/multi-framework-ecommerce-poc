using System;

namespace Domain.Entities;

/// <summary>
/// 商品規格實體 (一個商品可能有多個規格)
/// </summary>
public class ProductSpec : AuditableEntity
{
    public int Id { get; set; }

    /// <summary>
    /// 關聯的商品識別碼
    /// </summary>
    public int ProductId { get; set; }

    /// <summary>
    /// 規格名稱 (例如: "黑色 / L", "250g裝")
    /// </summary>
    public string SpecName { get; set; } = string.Empty;

    /// <summary>
    /// 規格售價
    /// </summary>
    public decimal Price { get; set; }

    /// <summary>
    /// 規格庫存數量
    /// </summary>
    public int Stock { get; set; }

    // 導覽屬性 (Navigation Properties)
    public Product? Product { get; set; }
}
