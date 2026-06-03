using System.Collections.Generic;

namespace Application.DTOs;

/// <summary>
/// 通用分頁回傳結果物件
/// </summary>
/// <typeparam name="T">資料型別</typeparam>
public class PagedResultDto<T>
{
    /// <summary>
    /// 當前分頁的資料列表
    /// </summary>
    public IEnumerable<T> Items { get; set; } = new List<T>();

    /// <summary>
    /// 篩選條件下的總筆數
    /// </summary>
    public int Total { get; set; }
}
