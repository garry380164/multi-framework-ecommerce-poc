import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * 前端認證與狀態管理服務
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 雙 Token 刷新排隊佇列狀態
  public isRefreshing = false;
  public refreshTokenSubject = new BehaviorSubject<string | null>(null);

  // 記憶體中的使用者狀態
  private userName$ = new BehaviorSubject<string>('管理員');
  private userRole$ = new BehaviorSubject<string>('MerchantAdmin');
  private currentMerchant$ = new BehaviorSubject<string>('store-a');
  private permissions$ = new BehaviorSubject<string[]>([]);
  private isLoaded$ = new BehaviorSubject<boolean>(false);

  // 提供 Observable 供元件訂閱以達到動態更新 UI
  userNameObservable$ = this.userName$.asObservable();
  userRoleObservable$ = this.userRole$.asObservable();
  currentMerchantObservable$ = this.currentMerchant$.asObservable();
  permissionsObservable$ = this.permissions$.asObservable();
  isLoadedObservable$ = this.isLoaded$.asObservable();

  constructor(private apiClient: ApiClientService) {}

  /**
   * 同步獲取當前記憶體狀態
   */
  get sUserName(): string {
    return this.userName$.value;
  }

  get sUserRole(): string {
    return this.userRole$.value;
  }

  get sCurrentMerchant(): string {
    return this.currentMerchant$.value;
  }

  get bIsLoaded(): boolean {
    return this.isLoaded$.value;
  }

  /**
   * 手動變更當前商家 ID (前端選單切換時使用)
   */
  fnSetMerchant(sMerchantId: string) {
    this.currentMerchant$.next(sMerchantId);
  }

  /**
   * 寫入登入成功狀態，僅長存 token 於 localStorage
   */
  fnLogin(sToken: string, sUsername: string, sRole: string, sMerchantId: string, aPermissions: string[]) {
    localStorage.setItem('token', sToken);
    this.userName$.next(sUsername);
    this.userRole$.next(sRole);
    this.currentMerchant$.next(sMerchantId);
    this.permissions$.next(aPermissions);
    this.isLoaded$.next(true);
  }

  /**
   * 登出系統，清除記憶體與 localStorage 的 token，並向後端註銷
   */
  fnLogout() {
    this.apiClient.post('/api/Auth/logout').subscribe({
      next: () => {},
      error: (oErr) => console.warn('後端登出呼叫失敗，已直接清除前端認證狀態：', oErr)
    });

    localStorage.removeItem('token');
    this.userName$.next('管理員');
    this.userRole$.next('MerchantAdmin');
    this.currentMerchant$.next('store-a');
    this.permissions$.next([]);
    this.isLoaded$.next(false);
  }

  /**
   * 向後端呼叫 Refresh Token 以取得新 Access Token，落實無感刷新
   */
  fnRefreshToken(): Observable<any> {
    return this.apiClient.post<any>('/api/Auth/refresh').pipe(
      map((oRes: any) => {
        const oResAny = oRes as any;
        const oData = oRes.data || oResAny;
        
        if (oRes && oRes.success && oData.token) {
          localStorage.setItem('token', oData.token);
          this.userName$.next(oData.username);
          this.userRole$.next(oData.role);
          this.currentMerchant$.next(oData.merchantId);
          this.permissions$.next(oData.permissions || []);
          this.isLoaded$.next(true);
          return oData;
        }
        throw new Error(oRes.message || '刷新憑證失敗');
      })
    );
  }

  /**
   * 權限查核函數
   */
  fnHasPermission(sCode: string): boolean {
    return this.permissions$.value.includes(sCode);
  }

  /**
   * 向後端獲取當前登入者資訊以還原記憶體狀態，支援離線 Mock 模式
   */
  fnLoadUserProfile(): Observable<boolean> {
    const sToken = localStorage.getItem('token');
    if (!sToken) {
      this.fnLogout();
      return of(false);
    }

    // 若已經載入過，直接傳回成功
    if (this.bIsLoaded) {
      return of(true);
    }

    return this.apiClient.get<any>('/api/Auth/me').pipe(
      map((oRes: any) => {
        // 相容 data 包裝與原始無包裝之 API 回傳結構 (繁體中文註解)
        const oResAny = oRes as any;
        const oProfile = oRes.data || oResAny;

        if (oRes && oRes.success && oProfile.username) {
          this.userName$.next(oProfile.username);
          this.userRole$.next(oProfile.role);
          this.currentMerchant$.next(oProfile.merchantId);
          localStorage.setItem('merchantId', oProfile.merchantId);
          this.permissions$.next(oProfile.permissions || []);
          this.isLoaded$.next(true);
          return true;
        } else {
          // 若 API 呼叫不成功 (例如後端未啟動或回傳錯誤)，嘗試進行離線 Mock 狀態復原
          return this.fnFallbackMockProfile(sToken);
        }
      }),
      catchError((oErr: any) => {
        console.warn('API 請求拋出異常，嘗試進行離線 Mock 狀態復原...', oErr);
        return of(this.fnFallbackMockProfile(sToken));
      })
    );
  }

  /**
   * 離線 Mock / 後端未啟動時的 Fallback 狀態復原機制 (繁體中文註解)
   */
  private fnFallbackMockProfile(sToken: string): boolean {
    console.warn('正在透過 Token 解碼進行離線 Mock 狀態復原...');
    const oPayload = this.fnParseJwt(sToken);
    if (oPayload) {
      const sRole = oPayload.role || 'MerchantAdmin';
      const sUser = oPayload.name || '管理員';
      const sMerchant = oPayload.merchantId || 'store-a';
      
      let aMockPermissions: string[] = [];
      if (sRole === 'SystemAdmin') {
        aMockPermissions = ['Product.Create', 'Product.Edit', 'Product.Delete', 'Employee.Manage'];
      } else if (sRole === 'MerchantAdmin') {
        aMockPermissions = ['Product.Create', 'Product.Edit', 'Product.Delete'];
      } else if (sRole === 'MerchantStaff') {
        aMockPermissions = ['Product.Edit'];
      }

      this.userName$.next(sUser);
      this.userRole$.next(sRole);
      this.currentMerchant$.next(sMerchant);
      this.permissions$.next(aMockPermissions);
      this.isLoaded$.next(true);
      return true;
    }

    this.fnLogout();
    return false;
  }

  /**
   * 解密 JWT Token 的 Payload
   */
  private fnParseJwt(sToken: string): any {
    try {
      const sBase64Url = sToken.split('.')[1];
      const sBase64 = sBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      const sJsonPayload = decodeURIComponent(
        window.atob(sBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(sJsonPayload);
    } catch (oError) {
      return null;
    }
  }
}
