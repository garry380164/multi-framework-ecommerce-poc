using Application.Interfaces;

namespace WebApi.Merchant;

/// <summary>
/// 請求範圍 (Scoped) 內的商家資訊提供者
/// </summary>
public class MerchantProvider : IMerchantProvider
{
    /// <summary>
    /// 當前請求的商家 ID，若未設定則為空字串
    /// </summary>
    public string MerchantId { get; private set; } = string.Empty;

    /// <summary>
    /// 設定當前請求的商家 ID (由 MerchantMiddleware 呼叫)
    /// </summary>
    public void SetMerchant(string merchantId)
    {
        MerchantId = merchantId;
    }
}
