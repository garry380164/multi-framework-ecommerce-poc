namespace Application.Interfaces;

/// <summary>
/// 提供當前請求的商家識別資訊 (用於底層自動過濾與隔離)
/// </summary>
public interface IMerchantProvider
{
    /// <summary>
    /// 當前請求的商家 ID (例如: "store-a", "store-b")
    /// </summary>
    string MerchantId { get; }
}
