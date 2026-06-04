namespace Application.DTOs;

/// <summary>
/// 統一業務代碼常數定義 (繁體中文註解)
/// </summary>
public static class ResultCodes
{
    // ==========================================
    // 1. 一般與系統層級 (General & System)
    // ==========================================
    
    /// <summary>
    /// 操作成功
    /// </summary>
    public const int Success = 1;

    /// <summary>
    /// 一般性商務邏輯錯誤
    /// </summary>
    public const int Error = -1;

    /// <summary>
    /// 系統未處理異常或伺服器崩潰
    /// </summary>
    public const int SystemError = -999;

    /// <summary>
    /// 系統維護中
    /// </summary>
    public const int Maintenance = -998;

    // ==========================================
    // 2. 身份驗證與安全控管 (Auth & Security)
    // ==========================================

    /// <summary>
    /// 未登入或認證權杖已過期
    /// </summary>
    public const int Unauthorized = -401;

    /// <summary>
    /// 已登入但無權限執行此操作
    /// </summary>
    public const int Forbidden = -403;

    /// <summary>
    /// 帳號或密碼錯誤
    /// </summary>
    public const int InvalidCredentials = -10;

    /// <summary>
    /// 帳號已被停用或鎖定
    /// </summary>
    public const int UserBlocked = -11;

    /// <summary>
    /// 驗證碼已過期
    /// </summary>
    public const int VerificationCodeExpired = -12;

    /// <summary>
    /// 驗證碼錯誤或失效
    /// </summary>
    public const int VerificationCodeInvalid = -13;

    /// <summary>
    /// 使用者帳號/電子信箱已被註冊
    /// </summary>
    public const int UserAlreadyExists = -14;

    // ==========================================
    // 3. 資源與資料庫 (Resources & DB)
    // ==========================================

    /// <summary>
    /// 找不到該筆資料 (商品、訂單、分類等不存在)
    /// </summary>
    public const int NotFound = -100;

    /// <summary>
    /// 資料已被刪除或封存
    /// </summary>
    public const int AlreadyDeleted = -101;

    /// <summary>
    /// 前端請求參數驗證失敗
    /// </summary>
    public const int InvalidParameters = -102;

    /// <summary>
    /// 資料衝突或重複建立
    /// </summary>
    public const int DuplicateRecord = -103;

    /// <summary>
    /// 資料處理鎖定衝突
    /// </summary>
    public const int DataLockConflict = -104;

    // ==========================================
    // 4. 商品與庫存管理 (Products & Inventory)
    // ==========================================

    /// <summary>
    /// 庫存不足，無法購買或出貨
    /// </summary>
    public const int OutOfStock = -200;

    /// <summary>
    /// 商品已下架或未啟用
    /// </summary>
    public const int ProductOffShelves = -201;

    /// <summary>
    /// 商品價格已變動 (與下單價格不符)
    /// </summary>
    public const int PriceChanged = -202;

    /// <summary>
    /// 商品規格不存在或不合法
    /// </summary>
    public const int InvalidSpec = -203;

    // ==========================================
    // 5. 訂單與交易支付 (Orders & Payment)
    // ==========================================

    /// <summary>
    /// 訂單狀態不符 (例如已出貨不可取消)
    /// </summary>
    public const int InvalidOrderStatus = -300;

    /// <summary>
    /// 訂單已逾期
    /// </summary>
    public const int OrderExpired = -301;

    /// <summary>
    /// 付款失敗
    /// </summary>
    public const int PaymentFailed = -302;

    /// <summary>
    /// 退款處理失敗
    /// </summary>
    public const int RefundFailed = -303;

    /// <summary>
    /// 物流方式不支援當前商品或運送地區
    /// </summary>
    public const int ShippingMethodNotAllowed = -304;
}
