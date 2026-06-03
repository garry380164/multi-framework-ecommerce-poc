namespace Domain.Entities;

/// <summary>
/// 使用者角色實體
/// </summary>
public class Role : AuditableEntity
{
    public int Id { get; set; }
    
    /// <summary>
    /// 角色名稱 (例如: Admin, Staff, Customer)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 角色描述
    /// </summary>
    public string? Description { get; set; }
}
