import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  constructor(private http: HttpClient) {}

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
   * 登出系統，清除記憶體與 localStorage 的 token
   */
  fnLogout() {
    localStorage.removeItem('token');
    this.userName$.next('管理員');
    this.userRole$.next('MerchantAdmin');
    this.currentMerchant$.next('store-a');
    this.permissions$.next([]);
    this.isLoaded$.next(false);
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

    return this.http.get<any>(`${environment.apiUrl}/api/Auth/me`).pipe(
      tap((oRes) => {
        if (oRes && oRes.success) {
          this.userName$.next(oRes.username);
          this.userRole$.next(oRes.role);
          this.currentMerchant$.next(oRes.merchantId);
          this.permissions$.next(oRes.permissions || []);
          this.isLoaded$.next(true);
        }
      }),
      map(oRes => !!(oRes && oRes.success)),
      catchError((oErr) => {
        console.warn('無法從 API 獲取使用者身分，嘗試以 Token 解碼進行離線 Mock 狀態復原...', oErr);
        
        // 離線 Mock / 後端未啟動時的 Fallback 機制
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
          return of(true);
        }

        this.fnLogout();
        return of(false);
      })
    );
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
