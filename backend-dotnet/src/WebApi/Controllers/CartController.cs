using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Controllers;

/// <summary>
/// 會員購物車管理控制器 (限登入會員)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 獲取當前登入會員的購物車項目列表
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { message = "無效的使用者憑證。" });

        var cartItems = await _context.CartItems
            .Include(c => c.Product)
            .Include(c => c.ProductSpec)
            .Where(c => c.UserId == userId.Value)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                id = c.Id,
                productId = c.ProductId,
                productSpecId = c.ProductSpecId,
                quantity = c.Quantity,
                createdAt = c.CreatedAt,
                product = new
                {
                    id = c.Product!.Id,
                    merchantId = c.Product.MerchantId,
                    name = c.Product.Name,
                    price = c.ProductSpec != null ? c.ProductSpec.Price : c.Product.Price, // 若有規格，以規格售價為主
                    stock = c.ProductSpec != null ? c.ProductSpec.Stock : c.Product.Stock,
                    imageUrl = c.Product.ImageUrl,
                    sBadgeText = c.ProductSpec != null ? c.ProductSpec.SpecName : null // 把規格名稱當成 badge 顯示，以相容前台
                }
            })
            .ToListAsync();

        return Ok(cartItems);
    }

    /// <summary>
    /// 同步訪客購物車 (合併至該會員底下)
    /// </summary>
    [HttpPost("sync")]
    public async Task<IActionResult> SyncCart([FromBody] List<CartSyncItemDto> items)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { message = "無效的使用者憑證。" });

        if (items == null || !items.Any())
        {
            return Ok(new { success = true, message = "無可同步的項目。" });
        }

        foreach (var item in items)
        {
            // 尋找是否已存在該會員相同的商品/商品規格
            var existing = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId.Value 
                                         && c.ProductId == item.ProductId 
                                         && c.ProductSpecId == item.ProductSpecId);

            if (existing != null)
            {
                // 合併數量
                existing.Quantity += item.Quantity;
                _context.CartItems.Update(existing);
            }
            else
            {
                // 新增項目
                var cartItem = new CartItem
                {
                    UserId = userId.Value,
                    ProductId = item.ProductId,
                    ProductSpecId = item.ProductSpecId,
                    Quantity = item.Quantity
                };
                _context.CartItems.Add(cartItem);
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "購物車同步完成。" });
    }

    /// <summary>
    /// 新增商品至購物車
    /// </summary>
    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] CartSyncItemDto item)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { message = "無效的使用者憑證。" });

        var existing = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId.Value 
                                     && c.ProductId == item.ProductId 
                                     && c.ProductSpecId == item.ProductSpecId);

        if (existing != null)
        {
            existing.Quantity += item.Quantity;
            _context.CartItems.Update(existing);
        }
        else
        {
            var cartItem = new CartItem
            {
                UserId = userId.Value,
                ProductId = item.ProductId,
                ProductSpecId = item.ProductSpecId,
                Quantity = item.Quantity
            };
            _context.CartItems.Add(cartItem);
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "成功加入購物車。" });
    }

    /// <summary>
    /// 更新購物車商品數量
    /// </summary>
    [HttpPut("update")]
    public async Task<IActionResult> UpdateQuantity([FromBody] CartUpdateDto item)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { message = "無效的使用者憑證。" });

        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId.Value 
                                     && c.ProductId == item.ProductId 
                                     && c.ProductSpecId == item.ProductSpecId);

        if (cartItem == null)
        {
            return NotFound(new { message = "找不到該購物車項目。" });
        }

        if (item.Quantity <= 0)
        {
            _context.CartItems.Remove(cartItem);
        }
        else
        {
            cartItem.Quantity = item.Quantity;
            _context.CartItems.Update(cartItem);
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "購物車更新成功。" });
    }

    /// <summary>
    /// 從購物車移除某商品
    /// </summary>
    [HttpDelete]
    public async Task<IActionResult> RemoveFromCart([FromQuery] int productId, [FromQuery] int? productSpecId = null)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { message = "無效的使用者憑證。" });

        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId.Value 
                                     && c.ProductId == productId 
                                     && c.ProductSpecId == productSpecId);

        if (cartItem != null)
        {
            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true, message = "商品已自購物車移除。" });
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int userId))
        {
            return null;
        }
        return userId;
    }
}

public class CartSyncItemDto
{
    public int ProductId { get; set; }
    public int? ProductSpecId { get; set; }
    public int Quantity { get; set; }
}

public class CartUpdateDto
{
    public int ProductId { get; set; }
    public int? ProductSpecId { get; set; }
    public int Quantity { get; set; }
}
