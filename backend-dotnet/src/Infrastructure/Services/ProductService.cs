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
/// 商品管理服務 (實作 CRUD 邏輯，自動繼承多商家安全過濾)
/// </summary>
public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductDto>> GetProductsAsync()
    {
        // 由於 EF Core 全域過濾器，此處不需手動寫 WHERE MerchantId = @MerchantId
        return await _context.Products
            .Include(p => p.Category)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                MerchantId = p.MerchantId,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                ImageUrl = p.ImageUrl,
                CreatedAt = p.CreatedAt,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : "其他"
            })
            .ToListAsync();
    }

    public async Task<PagedResultDto<ProductDto>> GetPagedProductsAsync(
        string? stockStatus,
        int page,
        int pageSize,
        string? sortBy,
        string? sortOrder,
        string? search,
        string? categoryName = null)
    {
        var query = _context.Products.AsQueryable();

        // 商品分類篩選 (繁體中文註解以符合全域規範)
        if (!string.IsNullOrEmpty(categoryName) && !categoryName.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(p => p.Category != null && p.Category.Name == categoryName);
        }

        // 搜尋關鍵字篩選
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(searchLower)
                                  || (p.Description != null && p.Description.ToLower().Contains(searchLower)));
        }

        // 庫存狀態篩選
        if (!string.IsNullOrEmpty(stockStatus))
        {
            if (stockStatus.Equals("lowStock", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(p => p.Stock <= 50);
            }
            else if (stockStatus.Equals("sufficient", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(p => p.Stock > 50);
            }
        }

        // 計算 OrderedQty 與 ShortageQty 並投影為 ProductDto
        var dtoQuery = query.Select(p => new ProductDto
        {
            Id = p.Id,
            MerchantId = p.MerchantId,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            ImageUrl = p.ImageUrl,
            CreatedAt = p.CreatedAt,
            CategoryId = p.CategoryId,
            CategoryName = p.Category != null ? p.Category.Name : "其他",
            OrderedQty = _context.OrderItems
                .Where(oi => oi.ProductId == p.Id && oi.Order != null)
                .Sum(oi => (int?)oi.Quantity) ?? 0
        }).Select(dto => new ProductDto
        {
            Id = dto.Id,
            MerchantId = dto.MerchantId,
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            ImageUrl = dto.ImageUrl,
            CreatedAt = dto.CreatedAt,
            CategoryId = dto.CategoryId,
            CategoryName = dto.CategoryName,
            OrderedQty = dto.OrderedQty,
            ShortageQty = dto.OrderedQty > dto.Stock ? dto.OrderedQty - dto.Stock : 0
        });

        // 排序邏輯
        if (!string.IsNullOrEmpty(sortBy))
        {
            var isDesc = !string.IsNullOrEmpty(sortOrder) && sortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase);

            switch (sortBy.ToLower())
            {
                case "id":
                    dtoQuery = isDesc ? dtoQuery.OrderByDescending(p => p.Id) : dtoQuery.OrderBy(p => p.Id);
                    break;
                case "price":
                    dtoQuery = isDesc ? dtoQuery.OrderByDescending(p => (double)p.Price) : dtoQuery.OrderBy(p => (double)p.Price);
                    break;

                case "stock":
                    dtoQuery = isDesc ? dtoQuery.OrderByDescending(p => p.Stock) : dtoQuery.OrderBy(p => p.Stock);
                    break;
                case "orderedqty":
                    dtoQuery = isDesc ? dtoQuery.OrderByDescending(p => p.OrderedQty) : dtoQuery.OrderBy(p => p.OrderedQty);
                    break;
                case "shortageqty":
                    dtoQuery = isDesc ? dtoQuery.OrderByDescending(p => p.ShortageQty) : dtoQuery.OrderBy(p => p.ShortageQty);
                    break;
                case "name":
                    dtoQuery = isDesc ? dtoQuery.OrderByDescending(p => p.Name) : dtoQuery.OrderBy(p => p.Name);
                    break;
                default:
                    dtoQuery = dtoQuery.OrderBy(p => p.Id);
                    break;
            }
        }
        else
        {
            dtoQuery = dtoQuery.OrderBy(p => p.Id);
        }

        // 計算總筆數
        var total = await dtoQuery.CountAsync();

        // 分頁切片
        var items = await dtoQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<ProductDto>
        {
            Items = items,
            Total = total
        };
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        // FindAsync 會在過濾後的資料集進行查找
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product == null)
        {
            return null;
        }

        return new ProductDto
        {
            Id = product.Id,
            MerchantId = product.MerchantId,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            CreatedAt = product.CreatedAt,
            CategoryId = product.CategoryId,
            CategoryName = product.Category != null ? product.Category.Name : "其他"
        };
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            ImageUrl = dto.ImageUrl,
            CategoryId = dto.CategoryId
        };

        _context.Products.Add(product);
        // SaveChangesAsync 會自動利用 AppDbContext 的防漏填機制為其塞入 MerchantId
        await _context.SaveChangesAsync();

        if (product.CategoryId.HasValue)
        {
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();
        }

        return new ProductDto
        {
            Id = product.Id,
            MerchantId = product.MerchantId,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            CreatedAt = product.CreatedAt,
            CategoryId = product.CategoryId,
            CategoryName = product.Category != null ? product.Category.Name : "其他"
        };
    }

    public async Task<ProductDto?> UpdateProductAsync(int id, CreateProductDto dto)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product == null)
        {
            return null;
        }

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Stock = dto.Stock;
        product.ImageUrl = dto.ImageUrl;
        product.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();

        if (product.CategoryId.HasValue)
        {
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();
        }

        return new ProductDto
        {
            Id = product.Id,
            MerchantId = product.MerchantId,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            CreatedAt = product.CreatedAt,
            CategoryId = product.CategoryId,
            CategoryName = product.Category != null ? product.Category.Name : "其他"
        };
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product == null)
        {
            return false;
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<CategoryCountDto>> GetCategoriesWithCountAsync()
    {
        // 由於 EF Core 全域過濾器，此處僅會查到當前租戶下的 Category 及其商品數量 (繁體中文註解以符合全域規範)
        return await _context.Categories
            .Select(c => new CategoryCountDto
            {
                Name = c.Name,
                Count = c.Products.Count()
            })
            .ToListAsync();
    }
}
