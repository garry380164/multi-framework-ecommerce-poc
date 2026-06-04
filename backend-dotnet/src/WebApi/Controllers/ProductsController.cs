using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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


