namespace Application.DTOs;

/// <summary>
/// 建立或更新商品時的請求參數
/// </summary>
public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }

    /// <summary>
    /// 關聯分類 ID (繁體中文註解)
    /// </summary>
    public int? CategoryId { get; set; }
}
