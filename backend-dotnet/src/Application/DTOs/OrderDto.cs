using System;
using System.Collections.Generic;

namespace Application.DTOs;

/// <summary>
/// 訂單資料傳輸物件 (對應前端 Order 介面)
/// </summary>
public class OrderDto
{
    public int Id { get; set; }
    public string MerchantId { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserPhone { get; set; }
    public string? ReceiverName { get; set; }
    public string? ShippingAddress { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal ReceivableAmount { get; set; }
    public decimal ReceivedAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal PointsAmount { get; set; }
    public decimal PromoAmount { get; set; }
    public string OrdStatus { get; set; } = "ToDispatch";
    public string PayStatus { get; set; } = "Unpaid";
    public ICollection<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();
}
