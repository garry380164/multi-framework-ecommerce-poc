using System;
using System.Collections.Generic;

namespace Domain.Entities;

/// <summary>
/// 訂單主表實體 (支援多商家隔離)
/// </summary>
public class Order : AuditableEntity, IMustHaveMerchant
{
    public int Id { get; set; }

    /// <summary>
    /// 所屬商家識別碼
    /// </summary>
    public string MerchantId { get; set; } = string.Empty;

    /// <summary>
    /// 下單會員識別碼
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// 下單時間
    /// </summary>
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 訂單總金額
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// 訂單應收金額
    /// </summary>
    public decimal ReceivableAmount { get; set; }

    /// <summary>
    /// 訂單已收金額
    /// </summary>
    public decimal ReceivedAmount { get; set; }

    /// <summary>
    /// 訂單折讓金額
    /// </summary>
    public decimal DiscountAmount { get; set; }

    /// <summary>
    /// 訂單購物金扣抵金額
    /// </summary>
    public decimal PointsAmount { get; set; }

    /// <summary>
    /// 訂單優惠扣抵金額
    /// </summary>
    public decimal PromoAmount { get; set; }

    /// <summary>
    /// 訂單狀態 (ToDispatch, ToPick, ToShip, ToCollect, Completed)
    /// </summary>
    public string OrdStatus { get; set; } = "ToDispatch";

    /// <summary>
    /// 付款狀態 (Unpaid, PartiallyPaid, Paid)
    /// </summary>
    public string PayStatus { get; set; } = "Unpaid";

    /// <summary>
    /// 收貨人姓名
    /// </summary>
    public string? ReceiverName { get; set; }

    /// <summary>
    /// 收貨地址
    /// </summary>
    public string? ShippingAddress { get; set; }

    /// <summary>
    /// 下單會員電話 (手機號碼)
    /// </summary>
    public string? UserPhone { get; set; }

    // 導覽屬性 (Navigation Properties)

    public Merchant? Merchant { get; set; }
    public User? User { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
