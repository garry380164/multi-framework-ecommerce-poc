namespace Application.DTOs;

/// <summary>
/// 統一的 API 回傳結構 (泛型，繁體中文註解)
/// </summary>
/// <typeparam name="T">資料載荷型別</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// 是否成功
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// 業務狀態碼 (對應 ResultCodes)
    /// </summary>
    public int Code { get; set; }

    /// <summary>
    /// 訊息描述
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// 回傳的資料內容
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// 快速建立成功回應 (帶資料)
    /// </summary>
    public static ApiResponse<T> Ok(T data, string message = "Success", int code = ResultCodes.Success)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Code = code,
            Message = message,
            Data = data
        };
    }
}

/// <summary>
/// 統一的 API 回傳結構 (非泛型，主要用於無資料載荷的回應)
/// </summary>
public class ApiResponse : ApiResponse<object>
{
    /// <summary>
    /// 快速建立成功回應 (不帶資料)
    /// </summary>
    public static ApiResponse Ok(string message = "Success", int code = ResultCodes.Success)
    {
        return new ApiResponse
        {
            Success = true,
            Code = code,
            Message = message,
            Data = null
        };
    }

    /// <summary>
    /// 快速建立失敗回應
    /// </summary>
    public static ApiResponse Fail(string message = "Failure", int code = ResultCodes.Error)
    {
        return new ApiResponse
        {
            Success = false,
            Code = code,
            Message = message,
            Data = null
        };
    }
}
