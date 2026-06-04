import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
}

/**
 * 統一處理後台 API 請求的服務 (繁體中文註解)
 */
@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private loading$ = new BehaviorSubject<boolean>(false);
  
  // 提供 Observable 供其他組件訂閱以響應 Loading 狀態
  public loadingObservable$ = this.loading$.asObservable();
  
  private nActiveRequestsCount = 0;

  constructor(private http: HttpClient) {}

  /**
   * 累加/扣減當前活躍的請求數量，並觸發 Loading 狀態
   */
  private fnUpdateLoading(bLoading: boolean) {
    if (bLoading) {
      this.nActiveRequestsCount++;
      if (this.nActiveRequestsCount === 1) {
        this.loading$.next(true);
      }
    } else {
      this.nActiveRequestsCount = Math.max(0, this.nActiveRequestsCount - 1);
      if (this.nActiveRequestsCount === 0) {
        this.loading$.next(false);
      }
    }
  }

  /**
   * 取得配置後的 HttpHeaders (自動從 localStorage 讀取 token 與 merchantId)
   */
  private getRequestHeaders(oCustomHeaders?: any): HttpHeaders {
    let oHeaders = new HttpHeaders(oCustomHeaders);

    // 1. 自動注入 JWT Token
    const sToken = localStorage.getItem('token');
    if (sToken) {
      oHeaders = oHeaders.set('Authorization', `Bearer ${sToken}`);
    }

    // 2. 自動從 localStorage 注入當前商家 ID
    if (!oHeaders.has('X-Merchant-Id')) {
      const sMerchantId = localStorage.getItem('merchantId');
      if (sMerchantId) {
        oHeaders = oHeaders.set('X-Merchant-Id', sMerchantId);
      }
    }

    return oHeaders;
  }

  /**
   * 發送 HTTP 請求的核心封裝方法
   */
  public request<T = any>(
    sMethod: string,
    sUrl: string,
    body?: any,
    options: { headers?: any; params?: any } = {}
  ): Observable<ApiResponse<T>> {
    const sToken = localStorage.getItem('token');
    const bIsPublicApi = sUrl.includes('/Auth/login') || sUrl.includes('/Auth/register');

    // 若本地存有模擬的 Mock Token，且非登入註冊等公開 API，則直接攔截請求，防範後端 401 強制登出 (繁體中文註解)
    if (sToken && sToken.endsWith('.mocksignature') && !bIsPublicApi) {
      return of({
        success: false,
        code: -1,
        message: 'Mock 模式下攔截真實 API 請求',
        data: null
      } as ApiResponse<T>);
    }

    this.fnUpdateLoading(true);

    const sApiUrl = `${environment.apiUrl}${sUrl}`;
    const headers = this.getRequestHeaders(options.headers);
    const params = options.params;

    const requestObservable: Observable<any> = this.http.request(sMethod, sApiUrl, {
      body,
      headers,
      params
    });

    return requestObservable.pipe(
      map(oJson => {
        // 若後端已採用 ApiResponse 統一包裝
        if (oJson && typeof oJson.success === 'boolean') {
          return oJson as ApiResponse<T>;
        }
        // 否則由前端代理包裝成 ApiResponse 結構
        return {
          success: true,
          code: 1,
          message: 'Success',
          data: oJson
        } as ApiResponse<T>;
      }),
      catchError(oErr => {
        let sMsg = '請求失敗';
        let nCode = -1;
        if (oErr && oErr.error) {
          sMsg = oErr.error.message || oErr.message || sMsg;
          nCode = oErr.error.code || oErr.status || nCode;
        } else if (oErr) {
          sMsg = oErr.message || sMsg;
          nCode = oErr.status || nCode;
        }
        return of({
          success: false,
          code: nCode,
          message: sMsg,
          data: null
        } as ApiResponse<T>);
      }),
      finalize(() => {
        this.fnUpdateLoading(false);
      })
    );
  }

  public get<T = any>(sUrl: string, options: { headers?: any; params?: any } = {}): Observable<ApiResponse<T>> {
    return this.request<T>('GET', sUrl, undefined, options);
  }

  public post<T = any>(sUrl: string, body?: any, options: { headers?: any; params?: any } = {}): Observable<ApiResponse<T>> {
    return this.request<T>('POST', sUrl, body, options);
  }

  public put<T = any>(sUrl: string, body?: any, options: { headers?: any; params?: any } = {}): Observable<ApiResponse<T>> {
    return this.request<T>('PUT', sUrl, body, options);
  }

  public delete<T = any>(sUrl: string, options: { headers?: any; params?: any } = {}): Observable<ApiResponse<T>> {
    return this.request<T>('DELETE', sUrl, undefined, options);
  }
}
