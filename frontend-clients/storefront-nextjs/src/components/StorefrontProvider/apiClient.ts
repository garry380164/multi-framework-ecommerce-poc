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
  private promiseRefreshToken: Promise<string | null> | null = null;
  private fnSessionRefreshedCallback?: (oSession: any) => void;

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
  /// 註冊用於同步 React Session 狀態的回呼方法 (繁體中文註解)
  /// </summary>
  public registerSessionRefreshedCallback(fnCallback: (oSession: any) => void) {
    this.fnSessionRefreshedCallback = fnCallback;
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
        headers: oHeaders,
        credentials: 'include' // 啟用傳遞 Cookie (跨網域)
      });

      // 處理 HTTP 401 未授權錯誤 (JWT 過期，且排除登入、註冊、刷新本身的請求) (忽略路徑大小寫差異)
      const sUrlLower = sUrl.toLowerCase();
      if (oResponse.status === 401 && !sUrlLower.includes('/auth/login') && !sUrlLower.includes('/auth/register') && !sUrlLower.includes('/auth/refresh')) {
        const sNewToken = await this.fnRefreshTokenChain();
        if (sNewToken) {
          // 重新夾帶新的 Access Token
          oHeaders.set('Authorization', `Bearer ${sNewToken}`);
          const oRetryResponse = await fetch(`${sApiBaseUrl}${sUrl}`, {
            ...oOptions,
            headers: oHeaders,
            credentials: 'include'
          });
          if (oRetryResponse.ok) {
            const oJson = await oRetryResponse.json();
            return (oJson && typeof oJson.success === 'boolean') ? oJson : { success: true, code: 1, message: 'Success', data: oJson };
          }
        }
      }

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

  /// <summary>
  /// 發送 HTTP 請求並接收二進位資料的方法 (繁體中文註解)
  /// </summary>
  public async requestBinary(
    sUrl: string,
    oOptions: RequestInit = {}
  ): Promise<ApiResponse<ArrayBuffer>> {
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

      // 3. 設定接受的二進位格式
      oHeaders.set('Accept', 'application/x-protobuf');

      const oResponse = await fetch(`${sApiBaseUrl}${sUrl}`, {
        ...oOptions,
        headers: oHeaders,
        credentials: 'include'
      });

      // 處理 HTTP 401 未授權錯誤 (JWT 過期，且排除登入、註冊、刷新本身的請求) (忽略路徑大小寫差異)
      const sUrlLower = sUrl.toLowerCase();
      if (oResponse.status === 401 && !sUrlLower.includes('/auth/login') && !sUrlLower.includes('/auth/register') && !sUrlLower.includes('/auth/refresh')) {
        const sNewToken = await this.fnRefreshTokenChain();
        if (sNewToken) {
          oHeaders.set('Authorization', `Bearer ${sNewToken}`);
          const oRetryResponse = await fetch(`${sApiBaseUrl}${sUrl}`, {
            ...oOptions,
            headers: oHeaders,
            credentials: 'include'
          });
          if (oRetryResponse.ok) {
            const oBuf = await oRetryResponse.arrayBuffer();
            return { success: true, code: 1, message: 'Success', data: oBuf };
          }
        }
      }

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

      const oBuf = await oResponse.arrayBuffer();

      return {
        success: true,
        code: 1,
        message: 'Success',
        data: oBuf
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

  /// <summary>
  /// 執行 Refresh Token 鏈式刷新與排隊機制 (繁體中文註解)
  /// </summary>
  private async fnRefreshTokenChain(): Promise<string | null> {
    if (this.promiseRefreshToken) {
      return this.promiseRefreshToken;
    }

    this.promiseRefreshToken = (async () => {
      try {
        const sApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const oHeaders = new Headers();
        if (this.sMerchantId) {
          oHeaders.set('X-Merchant-Id', this.sMerchantId);
        }

        const oResponse = await fetch(`${sApiBaseUrl}/api/Auth/refresh`, {
          method: 'POST',
          headers: oHeaders,
          credentials: 'include'
        });

        if (oResponse.ok) {
          const oJson = await oResponse.json();
          const oRes = oJson.success ? oJson : { success: true, data: oJson };
          const oData = oRes.data || oJson;

          if (oData && oData.token) {
            this.setToken(oData.token);

            let oSession: any = null;
            if (typeof window !== 'undefined') {
              const sSession = localStorage.getItem('user_session');
              if (sSession) {
                try {
                  oSession = JSON.parse(sSession);
                  oSession.token = oData.token;
                  oSession.username = oData.username;
                  oSession.role = oData.role;
                  localStorage.setItem('user_session', JSON.stringify(oSession));
                } catch (e) {}
              }
            }

            if (this.fnSessionRefreshedCallback && oSession) {
              this.fnSessionRefreshedCallback(oSession);
            }
            return oData.token as string;
          }
        }

        // 刷新失敗，清除憑證與登入狀態
        this.setToken('');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user_session');
        }
        if (this.fnSessionRefreshedCallback) {
          this.fnSessionRefreshedCallback(null);
        }
        if (typeof window !== 'undefined') {
          // 重新導向至首頁或強制重整以觸發重新登入彈窗
          window.location.reload();
        }
        return null;
      } catch (oErr) {
        console.error('無感刷新失敗：', oErr);
        this.setToken('');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user_session');
        }
        if (this.fnSessionRefreshedCallback) {
          this.fnSessionRefreshedCallback(null);
        }
        return null;
      } finally {
        this.promiseRefreshToken = null;
      }
    })();

    return this.promiseRefreshToken;
  }
}

// 導出 API 單例，便於在整個前台專案中共享相同的設定與狀態
export const api = new ApiClient();
