import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP 攔截器：處理請求中的 JWT Token 注入與 401 未授權處理
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const oRouter = inject(Router);
  const oAuthService = inject(AuthService);
  const sToken = localStorage.getItem('token');
  const sMerchantId = oAuthService.sCurrentMerchant;

  // 配置請求標頭，如果本地存有 token 和商家 ID 則夾帶
  const oHeadersConfig: { [name: string]: string } = {};
  
  if (sToken) {
    oHeadersConfig['Authorization'] = `Bearer ${sToken}`;
  }
  
  if (sMerchantId) {
    oHeadersConfig['X-Merchant-Id'] = sMerchantId;
  }

  const oClonedReq = req.clone({
    setHeaders: oHeadersConfig
  });

  return next(oClonedReq).pipe(
    catchError((oError: HttpErrorResponse) => {
      // 攔截 401 錯誤 (JWT 簽章失效或已過期)
      if (oError.status === 401) {
        oAuthService.fnLogout();
        oRouter.navigate(['/login']);
      }
      return throwError(() => oError);
    })
  );
};
