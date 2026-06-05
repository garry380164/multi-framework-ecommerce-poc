using System.Threading.Tasks;
using System.Linq;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Google.Protobuf;
using WebApi.Protos;

namespace WebApi.Controllers;

/// <summary>
/// 多商家商品管理控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IMerchantProvider _merchantProvider;

    public ProductsController(IProductService productService, IMerchantProvider merchantProvider)
    {
        _productService = productService;
        _merchantProvider = merchantProvider;
    }

    /// <summary>
    /// 獲取當前商家商店的所有商品 (支援分頁、篩選與排序)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? stockStatus = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null,
        [FromQuery] string? search = null)
    {
        if (string.IsNullOrEmpty(_merchantProvider.MerchantId))
        {
            return BadRequest(ApiResponse.Fail("無效的請求或缺少必要的參數。", ResultCodes.InvalidParameters));
        }

        var result = await _productService.GetPagedProductsAsync(
            stockStatus,
            page,
            pageSize,
            sortBy,
            sortOrder,
            search);

        return Ok(ApiResponse<PagedResultDto<ProductDto>>.Ok(result));
    }

    /// <summary>
    /// 獲取當前商家商店的所有商品 (Protobuf 二進位格式，專供 Next.js 前台使用)
    /// </summary>
    [HttpGet("proto")]
    public async Task<IActionResult> GetProductsProto(
        [FromQuery] string? stockStatus = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null,
        [FromQuery] string? search = null)
    {
        if (string.IsNullOrEmpty(_merchantProvider.MerchantId))
        {
            var failProto = new ApiResponseProductsProto
            {
                Success = false,
                Code = ResultCodes.InvalidParameters,
                Message = "無效的請求或缺少必要的參數。",
                Data = new PagedProductsProto { Total = 0 }
            };
            return BadRequest(failProto.ToByteArray());
        }

        var result = await _productService.GetPagedProductsAsync(
            stockStatus,
            page,
            pageSize,
            sortBy,
            sortOrder,
            search);

        var pagedProto = new PagedProductsProto
        {
            Total = result.Total
        };

        if (result.Items != null)
        {
            pagedProto.Items.AddRange(result.Items.Select(dto => new ProductProto
            {
                Id = dto.Id,
                MerchantId = dto.MerchantId ?? string.Empty,
                Name = dto.Name ?? string.Empty,
                Description = dto.Description ?? string.Empty,
                Price = (double)dto.Price,
                Stock = dto.Stock,
                ImageUrl = dto.ImageUrl ?? string.Empty,
                CreatedAt = dto.CreatedAt.ToString("o"),
                OrderedQty = dto.OrderedQty,
                ShortageQty = dto.ShortageQty,
                CategoryId = dto.CategoryId ?? 0,
                CategoryName = dto.CategoryName ?? string.Empty,
                BIsFullImage = false,
                SPriceFormatted = $"NT$ {dto.Price:N0}"
            }));
        }

        var okProto = new ApiResponseProductsProto
        {
            Success = true,
            Code = ResultCodes.Success,
            Message = "Success",
            Data = pagedProto
        };

        // 回傳二進位流 (application/x-protobuf)，以繁體中文註解以配合全域開發規範
        return File(okProto.ToByteArray(), "application/x-protobuf");
    }

    /// <summary>
    /// 獲取當前商家商店的所有商品 (後台管理專用，需登入驗證且支援分頁、篩選與排序)
    /// </summary>
    [HttpGet("admin")]
    [Authorize(Roles = "SystemAdmin,MerchantAdmin,MerchantStaff")]
    public async Task<IActionResult> GetAllForAdmin(
        [FromQuery] string? stockStatus = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null,
        [FromQuery] string? search = null)
    {
        if (string.IsNullOrEmpty(_merchantProvider.MerchantId))
        {
            return BadRequest(ApiResponse.Fail("無效的請求或缺少必要的參數。", ResultCodes.InvalidParameters));
        }

        var result = await _productService.GetPagedProductsAsync(
            stockStatus,
            page,
            pageSize,
            sortBy,
            sortOrder,
            search);

        return Ok(ApiResponse<PagedResultDto<ProductDto>>.Ok(result));
    }


    /// <summary>
    /// 獲取特定商品詳情 (官網公開瀏覽，免登入)
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        if (string.IsNullOrEmpty(_merchantProvider.MerchantId))
        {
            return BadRequest(ApiResponse.Fail("無效的請求或缺少必要的參數。", ResultCodes.InvalidParameters));
        }

        var product = await _productService.GetProductByIdAsync(id);
        if (product == null)
        {
            return NotFound(ApiResponse.Fail("查無此商品或該商品不屬於當前商店。", ResultCodes.NotFound));
        }

        return Ok(ApiResponse<ProductDto>.Ok(product));
    }

    /// <summary>
    /// 建立新商品 (限管理員與店務權限)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "SystemAdmin,MerchantAdmin,MerchantStaff")]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
    {
        var product = await _productService.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, ApiResponse<ProductDto>.Ok(product));
    }

    /// <summary>
    /// 更新商品資訊 (限管理員與店務權限)
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "SystemAdmin,MerchantAdmin,MerchantStaff")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateProductDto dto)
    {
        var product = await _productService.UpdateProductAsync(id, dto);
        if (product == null)
        {
            return NotFound(ApiResponse.Fail("無法更新，查無此商品或無操作權限。", ResultCodes.NotFound));
        }

        return Ok(ApiResponse<ProductDto>.Ok(product));
    }

    /// <summary>
    /// 刪除商品 (限管理員與店務權限)
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "SystemAdmin,MerchantAdmin,MerchantStaff")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _productService.DeleteProductAsync(id);
        if (!success)
        {
            return NotFound(ApiResponse.Fail("無法刪除，查無此商品或無操作權限。", ResultCodes.NotFound));
        }

        return Ok(ApiResponse.Ok("商品已成功刪除。"));
    }
}


