namespace Domain.Entities;

/// <summary>
/// 訂單明細實體
/// </summary>
public class OrderItem : AuditableEntity
{
    public int Id { get; set; }
    
    /// <summary>
    /// 關聯訂單識別碼
    /// </summary>
    public int OrderId { get; set; }

    /// <summary>
    /// 關聯商品識別碼
    /// </summary>
    public int ProductId { get; set; }

    /// <summary>
    /// 關聯商品規格識別碼 (允許為空，相容無規格商品)
    /// </summary>
    public int? ProductSpecId { get; set; }

    /// <summary>
    /// 快照商品規格名稱 (例如: "黑色 / L")
    /// </summary>
    public string? SpecName { get; set; }

    /// <summary>
    /// 購買數量
    /// </summary>
    public int Quantity { get; set; }

    /// <summary>
    /// 商品原始單價
    /// </summary>
    public decimal OriginalUnitPrice { get; set; }

    /// <summary>
    /// 商品優惠後單價 (若有優惠)
    /// </summary>
    public decimal? DiscountUnitPrice { get; set; }

    /// <summary>
    /// 明細總計金額
    /// </summary>
    public decimal TotalAmount { get; set; }

    // 導覽屬性 (Navigation Properties)
    public Order? Order { get; set; }
    public Product? Product { get; set; }
    public ProductSpec? ProductSpec { get; set; }
}
