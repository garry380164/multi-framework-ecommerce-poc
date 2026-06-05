import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP 攔截器：處理請求中的 JWT Token 注入與 401 未授權的自動刷新 (Rotation)
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const oRouter = inject(Router);
  const oAuthService = inject(AuthService);
  const sToken = localStorage.getItem('token');
  const sMerchantId = oAuthService.sCurrentMerchant;

  // 如果是 login, register, 或 refresh 請求，不進行 401 攔截刷新，避免無限循環
  const bIsAuthApi = req.url.includes('/Auth/login') || req.url.includes('/Auth/register') || req.url.includes('/Auth/refresh');

  // 配置請求標頭，如果本地存有 token 和商家 ID 則夾帶
  const fnAddToken = (request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> => {
    const oHeadersConfig: { [name: string]: string } = {};
    if (token) {
      oHeadersConfig['Authorization'] = `Bearer ${token}`;
    }
    if (sMerchantId) {
      oHeadersConfig['X-Merchant-Id'] = sMerchantId;
    }
    return request.clone({ setHeaders: oHeadersConfig });
  };

  const oClonedReq = fnAddToken(req, sToken);

  return next(oClonedReq).pipe(
    catchError((oError: HttpErrorResponse): Observable<HttpEvent<unknown>> => {
      // 攔截 401 錯誤，並且排除公開認證 API，且排除 mock 模式
      if (oError.status === 401 && !bIsAuthApi && sToken && !sToken.endsWith('.mocksignature')) {
        return handle401Error(req, next, oAuthService, oRouter, fnAddToken);
      }
      
      // 如果是在 auth api 發生 401，或者 refresh 失敗，直接登出
      if (oError.status === 401) {
        oAuthService.fnLogout();
        oRouter.navigate(['/login']);
      }
      
      return throwError(() => oError) as Observable<never>;
    })
  );
};

// 處理 401 錯誤的佇列排隊與刷新邏輯
const handle401Error = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  oAuthService: AuthService,
  oRouter: Router,
  fnAddToken: (r: HttpRequest<unknown>, t: string | null) => HttpRequest<unknown>
): Observable<HttpEvent<unknown>> => {
  if (!oAuthService.isRefreshing) {
    oAuthService.isRefreshing = true;
    oAuthService.refreshTokenSubject.next(null);

    return oAuthService.fnRefreshToken().pipe(
      switchMap((oRes: any) => {
        oAuthService.isRefreshing = false;
        oAuthService.refreshTokenSubject.next(oRes.token); // 解鎖排隊的請求
        return next(fnAddToken(req, oRes.token));
      }),
      catchError((oErr) => {
        oAuthService.isRefreshing = false;
        oAuthService.fnLogout();
        oRouter.navigate(['/login']);
        return throwError(() => oErr) as Observable<never>;
      })
    );
  } else {
    // 當前已在刷新中，讓其他請求等待
    return oAuthService.refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap(jwt => {
        return next(fnAddToken(req, jwt));
      })
    );
  }
};
