using System.Collections.Generic;

namespace Domain.Entities;

/// <summary>
/// 商品分類實體 (支援多商家隔離，繁體中文註解)
/// </summary>
public class Category : AuditableEntity, IMustHaveMerchant
{
    public int Id { get; set; }

    /// <summary>
    /// 所屬商家識別碼
    /// </summary>
    public string MerchantId { get; set; } = string.Empty;

    /// <summary>
    /// 分類名稱
    /// </summary>
    public string Name { get; set; } = string.Empty;

    // 導覽屬性 (Navigation Properties)
    public Merchant? Merchant { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
