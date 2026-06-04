export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
}

/// <summary>
/// 統一處理前台 API 請求的 Client 類別 (繁體中文註解)
/// </summary>
class ApiClient {
  private sMerchantId: string = '';
  private sToken: string = '';
  private fnLoadingCallback?: (bLoading: boolean) => void;
  private nActiveRequestsCount: number = 0;

  /// <summary>
  /// 設定當前商家的識別碼
  /// </summary>
  public setMerchantId(sMerchantId: string) {
    this.sMerchantId = sMerchantId;
  }

  /// <summary>
  /// 設定當前登入會員的 JWT Token
  /// </summary>
  public setToken(sToken: string) {
    this.sToken = sToken;
  }

  /// <summary>
  /// 註冊用於變更 UI Loading 狀態的回呼方法
  /// </summary>
  public registerLoadingCallback(fnCallback: (bLoading: boolean) => void) {
    this.fnLoadingCallback = fnCallback;
  }

  /// <summary>
  /// 內部方法：累加/扣減當前活躍的請求數量，並觸發 Loading 狀態回呼
  /// </summary>
  private fnUpdateLoading(bLoading: boolean) {
    if (bLoading) {
      this.nActiveRequestsCount++;
      if (this.nActiveRequestsCount === 1 && this.fnLoadingCallback) {
        this.fnLoadingCallback(true);
      }
    } else {
      this.nActiveRequestsCount = Math.max(0, this.nActiveRequestsCount - 1);
      if (this.nActiveRequestsCount === 0 && this.fnLoadingCallback) {
        this.fnLoadingCallback(false);
      }
    }
  }

  /// <summary>
  /// 發送 HTTP 請求的核心封裝方法
  /// </summary>
  public async request<T = any>(
    sUrl: string,
    oOptions: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    this.fnUpdateLoading(true);
    try {
      const sApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const oHeaders = new Headers(oOptions.headers);

      // 1. 自動注入商家 ID
      if (this.sMerchantId) {
        oHeaders.set('X-Merchant-Id', this.sMerchantId);
      }

      // 2. 自動注入 JWT Token
      if (this.sToken) {
        oHeaders.set('Authorization', `Bearer ${this.sToken}`);
      }

      // 3. 設定預設 JSON 內容格式
      if (oOptions.body && !oHeaders.has('Content-Type') && !(oOptions.body instanceof FormData)) {
        oHeaders.set('Content-Type', 'application/json');
      }

      const oResponse = await fetch(`${sApiBaseUrl}${sUrl}`, {
        ...oOptions,
        headers: oHeaders
      });

      // 處理 HTTP 錯誤狀態
      if (!oResponse.ok) {
        try {
          const oErrData = await oResponse.json();
          return {
            success: false,
            code: oErrData.code || oResponse.status,
            message: oErrData.message || '請求失敗',
            data: null
          };
        } catch {
          return {
            success: false,
            code: oResponse.status,
            message: `HTTP 錯誤: ${oResponse.statusText}`,
            data: null
          };
        }
      }

      // 處理 NoContent 回應
      if (oResponse.status === 204) {
        return {
          success: true,
          code: 1,
          message: 'Success',
          data: null
        };
      }

      const oJson = await oResponse.json();

      // 4. 若後端已採用 ApiResponse 統一結構包裝，直接回傳
      if (oJson && typeof oJson.success === 'boolean') {
        return oJson as ApiResponse<T>;
      }

      // 5. 若為舊款未包裝的 API，由前端代理封裝以保持結構一致
      return {
        success: true,
        code: 1,
        message: 'Success',
        data: oJson
      };

    } catch (oErr: any) {
      return {
        success: false,
        code: -999,
        message: oErr.message || '連線失敗，請檢查網路。',
        data: null
      };
    } finally {
      this.fnUpdateLoading(false);
    }
  }

  public get<T = any>(sUrl: string, oHeaders?: any): Promise<ApiResponse<T>> {
    return this.request<T>(sUrl, { method: 'GET', headers: oHeaders });
  }

  public post<T = any>(sUrl: string, body?: any, oHeaders?: any): Promise<ApiResponse<T>> {
    return this.request<T>(sUrl, {
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      headers: oHeaders
    });
  }

  public put<T = any>(sUrl: string, body?: any, oHeaders?: any): Promise<ApiResponse<T>> {
    return this.request<T>(sUrl, {
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      headers: oHeaders
    });
  }

  public delete<T = any>(sUrl: string, oHeaders?: any): Promise<ApiResponse<T>> {
    return this.request<T>(sUrl, { method: 'DELETE', headers: oHeaders });
  }
}

// 導出 API 單例，便於在整個前台專案中共享相同的設定與狀態
export const api = new ApiClient();
