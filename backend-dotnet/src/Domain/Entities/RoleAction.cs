using System;

namespace Domain.Entities;

/// <summary>
/// 角色與功能動作之對應關聯實體
/// </summary>
public class RoleAction : AuditableEntity
{
    /// <summary>
    /// 主鍵 ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 角色 ID
    /// </summary>
    public int RoleId { get; set; }

    /// <summary>
    /// 功能動作 ID
    /// </summary>
    public int SystemActionId { get; set; }

    /// <summary>
    /// 此關聯的操作狀態。"1" 代表正常運作；"0" 代表停用/禁用；"9" 代表已刪除
    /// </summary>
    public string Status { get; set; } = "1";

    // 導覽屬性 (Navigation Properties)
    public Role? Role { get; set; }
    public SystemAction? SystemAction { get; set; }
}
