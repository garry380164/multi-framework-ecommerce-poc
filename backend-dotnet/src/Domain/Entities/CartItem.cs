using System;

namespace Domain.Entities;

/// <summary>
/// 會員購物車項目實體 (支援多商家隔離)
/// </summary>
public class CartItem : AuditableEntity, IMustHaveMerchant
{
    public int Id { get; set; }

    /// <summary>
    /// 所屬商家識別碼
    /// </summary>
    public string MerchantId { get; set; } = string.Empty;

    /// <summary>
    /// 關聯的會員識別碼
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// 關聯的商品識別碼
    /// </summary>
    public int ProductId { get; set; }

    /// <summary>
    /// 關聯的商品規格識別碼 (若無則為空)
    /// </summary>
    public int? ProductSpecId { get; set; }

    /// <summary>
    /// 購物車商品數量
    /// </summary>
    public int Quantity { get; set; }

    // 導覽屬性 (Navigation Properties)
    public User? User { get; set; }
    public Product? Product { get; set; }
    public ProductSpec? ProductSpec { get; set; }
}
