namespace Application.DTOs;

/// <summary>
/// 訂單明細資料傳輸物件
/// </summary>
public class OrderItemDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? ProductImageUrl { get; set; }
    public int? ProductSpecId { get; set; }
    public string? SpecName { get; set; }
    public int Quantity { get; set; }
    public decimal OriginalUnitPrice { get; set; }
    public decimal? DiscountUnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
}
