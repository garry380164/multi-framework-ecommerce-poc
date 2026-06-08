namespace Application.DTOs;

/// <summary>
/// 商品分類與其商品數量資料傳輸物件 (繁體中文註解)
/// </summary>
public class CategoryCountDto
{
    /// <summary>
    /// 分類名稱
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 該分類下的商品總數
    /// </summary>
    public int Count { get; set; }
}
