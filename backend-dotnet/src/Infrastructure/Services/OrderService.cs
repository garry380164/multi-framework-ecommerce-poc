using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

/// <summary>
/// 訂單管理服務 (實作多商家隔離下的訂單查詢、分頁與排序)
/// </summary>
public class OrderService : IOrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResultDto<OrderDto>> GetPagedOrdersAsync(
        string? ordStatus,
        string? payStatus,
        int page,
        int pageSize,
        string? sortBy,
        string? sortOrder,
        string? search)
    {
        var query = _context.Orders.AsQueryable();

        // 搜尋篩選：訂單編號、會員名稱或手機號碼
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(o => o.Id.ToString().Contains(searchLower)
                                  || (o.User != null && o.User.Username.ToLower().Contains(searchLower))
                                  || (o.UserPhone != null && o.UserPhone.Contains(searchLower)));
        }

        // 狀態篩選 (all 或 空 代表不篩選)
        if (!string.IsNullOrEmpty(ordStatus) && !ordStatus.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(o => o.OrdStatus == ordStatus);
        }

        // 付款狀態篩選 (all 或 空 代表不篩選)
        if (!string.IsNullOrEmpty(payStatus) && !payStatus.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(o => o.PayStatus == payStatus);
        }

        // 投影 DTO 並載入關聯明細
        var dtoQuery = query.Select(o => new OrderDto
        {
            Id = o.Id,
            MerchantId = o.MerchantId,
            UserId = o.UserId,
            UserName = o.User != null ? o.User.Username : string.Empty,
            UserEmail = o.User != null ? o.User.Email : string.Empty,
            UserPhone = o.UserPhone,
            ReceiverName = o.ReceiverName,
            ShippingAddress = o.ShippingAddress,
            OrderDate = o.OrderDate,
            TotalAmount = o.TotalAmount,
            ReceivableAmount = o.ReceivableAmount,
            ReceivedAmount = o.ReceivedAmount,
            DiscountAmount = o.DiscountAmount,
            PointsAmount = o.PointsAmount,
            PromoAmount = o.PromoAmount,
            OrdStatus = o.OrdStatus,
            PayStatus = o.PayStatus,
            OrderItems = o.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                OrderId = oi.OrderId,
                ProductId = oi.ProductId,
                ProductName = oi.Product != null ? oi.Product.Name : string.Empty,
                ProductImageUrl = oi.Product != null ? oi.Product.ImageUrl : string.Empty,
                ProductSpecId = oi.ProductSpecId,
                SpecName = oi.SpecName,
                Quantity = oi.Quantity,
                OriginalUnitPrice = oi.OriginalUnitPrice,
                DiscountUnitPrice = oi.DiscountUnitPrice,
                TotalAmount = oi.TotalAmount
            }).ToList()
        });

        // 排序邏輯
        if (!string.IsNullOrEmpty(sortBy))
        {
            var isDesc = !string.IsNullOrEmpty(sortOrder) && sortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase);

            switch (sortBy.ToLower())
            {
                case "id":
                    dtoQuery = isDesc ? dtoQuery.OrderByDescending(o => o.Id) : dtoQuery.OrderBy(o => o.Id);
                    break;
                case "orderdate":
                    dtoQuery = isDesc ? dtoQuery.OrderByDescending(o => o.OrderDate) : dtoQuery.OrderBy(o => o.OrderDate);
                    break;
                case "receivableamount":
                    // 轉型為 double 以適配 SQLite 對 decimal 於 ORDER BY 中的限制
                    dtoQuery = isDesc ? dtoQuery.OrderByDescending(o => (double)o.ReceivableAmount) : dtoQuery.OrderBy(o => (double)o.ReceivableAmount);
                    break;
                case "ordstatus":
                    dtoQuery = isDesc ? dtoQuery.OrderByDescending(o => o.OrdStatus) : dtoQuery.OrderBy(o => o.OrdStatus);
                    break;
                case "paystatus":
                    dtoQuery = isDesc ? dtoQuery.OrderByDescending(o => o.PayStatus) : dtoQuery.OrderBy(o => o.PayStatus);
                    break;
                default:
                    dtoQuery = dtoQuery.OrderByDescending(o => o.OrderDate);
                    break;
            }
        }
        else
        {
            // 預設按日期降冪 (新訂單在前)
            dtoQuery = dtoQuery.OrderByDescending(o => o.OrderDate);
        }

        // 計算總筆數
        var total = await dtoQuery.CountAsync();

        // 分頁切片
        var items = await dtoQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<OrderDto>
        {
            Items = items,
            Total = total
        };
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id)
    {
        var order = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return null;

        return new OrderDto
        {
            Id = order.Id,
            MerchantId = order.MerchantId,
            UserId = order.UserId,
            UserName = order.User != null ? order.User.Username : string.Empty,
            UserEmail = order.User != null ? order.User.Email : string.Empty,
            UserPhone = order.UserPhone,
            ReceiverName = order.ReceiverName,
            ShippingAddress = order.ShippingAddress,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            ReceivableAmount = order.ReceivableAmount,
            ReceivedAmount = order.ReceivedAmount,
            DiscountAmount = order.DiscountAmount,
            PointsAmount = order.PointsAmount,
            PromoAmount = order.PromoAmount,
            OrdStatus = order.OrdStatus,
            PayStatus = order.PayStatus,
            OrderItems = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                OrderId = oi.OrderId,
                ProductId = oi.ProductId,
                ProductName = oi.Product != null ? oi.Product.Name : string.Empty,
                ProductImageUrl = oi.Product != null ? oi.Product.ImageUrl : string.Empty,
                ProductSpecId = oi.ProductSpecId,
                SpecName = oi.SpecName,
                Quantity = oi.Quantity,
                OriginalUnitPrice = oi.OriginalUnitPrice,
                DiscountUnitPrice = oi.DiscountUnitPrice,
                TotalAmount = oi.TotalAmount
            }).ToList()
        };
    }
}
