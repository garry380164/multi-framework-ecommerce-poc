using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace WebApi.Merchant;

/// <summary>
/// 攔截請求並解析商家 ID 的中介軟體
/// </summary>
public class MerchantMiddleware
{
    private readonly RequestDelegate _next;

    public MerchantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, MerchantProvider merchantProvider)
    {
        // 1. 從請求標頭 (Header) 嘗試取得商家識別碼 (適用於未登入的官網前台瀏覽)
        if (context.Request.Headers.TryGetValue("X-Merchant-Id", out var headerMerchantId))
        {
            merchantProvider.SetMerchant(headerMerchantId.ToString());
        }

        // 2. 核心安全性驗證：若使用者已通過 JWT 認證，則「強制」以 JWT Claim 中的 merchantId 為準
        // 避免惡意使用者登入商家 B，卻在 Header 傳入商家 A 的 ID 來竊取資料
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var jwtMerchantId = context.User.FindFirst("merchantId")?.Value;
            if (!string.IsNullOrEmpty(jwtMerchantId))
            {
                merchantProvider.SetMerchant(jwtMerchantId);
            }
        }

        await _next(context);
    }
}
