namespace Domain.Entities;

/// <summary>
/// 多商家強制約束介面
/// </summary>
public interface IMustHaveMerchant
{
    /// <summary>
    /// 商家識別碼
    /// </summary>
    string MerchantId { get; set; }
}
