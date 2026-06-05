import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

/**
 * 解析 JWT 內容，取得過期時間 (exp)
 * @param sToken JWT Token 字串
 */
export function fnParseJwt(sToken: string): any {
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

/**
 * 檢查 Token 是否已過期
 * @param sToken JWT Token 字串
 */
export function fnIsTokenExpired(sToken: string | null): boolean {
  if (!sToken) {
    return true;
  }
  const oPayload = fnParseJwt(sToken);
  if (!oPayload || !oPayload.exp) {
    return true;
  }
  
  const nExpiry = oPayload.exp; // 秒級時間戳記
  const nNow = Math.floor(Date.now() / 1000); // 當前秒級時間戳記
  return nExpiry < nNow;
}

/**
 * 路由守衛：檢查是否已登入且 Token 未過期，並動態載入使用者資料
 */
export const authGuard: CanActivateFn = (route, state) => {
  const oRouter = inject(Router);
  const oAuthService = inject(AuthService);
  const sToken = localStorage.getItem('token');
  
  if (sToken) {
    // 1. 如果 Token 未過期，且使用者資料已載入，直接放行
    if (!fnIsTokenExpired(sToken) && oAuthService.bIsLoaded) {
      return true;
    }
    
    // 2. 如果已過期，或者使用者資料尚未載入，則嘗試透過 fnLoadUserProfile 載入
    // 此時若是因為過期而載入，API 會回傳 401，進而觸發 Interceptor 的自動無感刷新
    return oAuthService.fnLoadUserProfile().pipe(
      map((bSuccess) => {
        if (bSuccess) {
          return true;
        } else {
          oAuthService.fnLogout();
          oRouter.navigate(['/login']);
          return false;
        }
      })
    );
  }
  
  // 若根本沒有 Token，清除本地狀態並導向登入頁面
  oAuthService.fnLogout();
  oRouter.navigate(['/login']);
  return false;
};
