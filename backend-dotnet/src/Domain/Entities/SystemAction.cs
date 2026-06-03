using System;

namespace Domain.Entities;

/// <summary>
/// 系統功能動作/操作權限實體
/// </summary>
public class SystemAction : AuditableEntity
{
    /// <summary>
    /// 主鍵 ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 功能動作唯一代號 (例如: Product.Create, Employee.Manage)
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// 中文功能動作名稱 (例如: 新增商品, 員工管理)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 功能描述
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// 運作狀態。"1" 代表正常運作；"0" 代表停用/禁用；"9" 代表已刪除
    /// </summary>
    public string Status { get; set; } = "1";
}
