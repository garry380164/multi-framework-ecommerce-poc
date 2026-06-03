import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { OrdersComponent } from './components/orders/orders.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // 登入頁面
  { path: 'login', component: LoginComponent },
  // 數據儀表板 (受 AuthGuard 守衛保護)
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  // 商品庫存管理 (受 AuthGuard 守衛保護)
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  // 訂單總覽 (受 AuthGuard 守衛保護)
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  // 預設導向數據儀表板
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  // 其他無效路徑亦導向數據儀表板
  { path: '**', redirectTo: 'dashboard' }
];
