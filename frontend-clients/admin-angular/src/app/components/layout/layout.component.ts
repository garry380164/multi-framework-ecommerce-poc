import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { 
  LucideSearch, 
  LucideFileText, 
  LucideBell, 
  LucidePackage, 
  LucideClipboardList, 
  LucideUsers, 
  LucideFolder, 
  LucideChevronDown, 
  LucideChevronRight, 
  LucidePlus,
  LucideLayoutDashboard
} from '@lucide/angular';
import { LogoComponent } from '../logo/logo.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    LucideSearch,
    LucideFileText,
    LucideBell,
    LucidePackage,
    LucideClipboardList,
    LucideUsers,
    LucideFolder,
    LucideChevronDown,
    LucideChevronRight,
    LucidePlus,
    LucideLayoutDashboard,
    LogoComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col font-sans bg-brand-bg-main">
      <!-- 頂部導航 -->
      <header class="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-10">
        <!-- 左側 Logo 與標題 -->
        <div class="flex items-center space-x-3">
          <app-logo sClass="w-8 h-8"></app-logo>
          <span class="font-title text-lg font-bold tracking-tight text-slate-800">智慧電商管理系統</span>
        </div>

        <!-- 中間：寬扁搜尋列 (與父元件雙向或單向事件連動) -->
        <div class="flex-1 max-w-xl mx-8 relative hidden md:block">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg lucideSearch class="h-4 w-4 text-slate-400"></svg>
          </div>
          <input
            type="text"
            [(ngModel)]="sSearchQuery"
            (ngModelChange)="fnOnSearchQueryChange()"
            placeholder="搜尋商品、訂單或會員資訊..."
            class="w-full bg-brand-bg-search hover:bg-brand-bg-search-hover focus:bg-white text-sm border-0 rounded-full pl-9 pr-4 py-2 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition duration-150"
          />
        </div>

        <!-- 右側：功能鍵與管理員頭像 -->
        <div class="flex items-center space-x-4">
          <button class="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition">
            <svg lucideFileText class="w-5 h-5"></svg>
          </button>
          <button class="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition relative">
            <svg lucideBell class="w-5 h-5"></svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full"></span>
          </button>

          <!-- 頭像與管理員資訊 (權限名稱以標籤呈現，並與使用者名稱並排，包含登出按鈕) -->
          <div class="flex items-center space-x-3 border-l border-slate-200 pl-4">
            <div class="hidden lg:flex items-center space-x-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-brand-primary-light border border-brand-primary/10 text-brand-primary">
                {{ sUserRole }}
              </span>
              <span class="text-xs font-medium text-slate-700">{{ sUserName }}</span>
            </div>
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" class="w-8 h-8 rounded-full border border-slate-200 object-cover" alt="User avatar" />
            <!-- 登出按鈕 -->
            <button 
              *ngIf="sUserName" 
              (click)="fnOnLogoutClick()" 
              class="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition flex items-center justify-center cursor-pointer"
              title="登出系統"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div class="flex-1 flex overflow-hidden">
        <!-- 側邊欄選單 -->
        <aside class="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between hidden md:flex">
          <div class="space-y-6">
            <!-- 商家切換 (垂直擺放高質感風格，無外框樣式) -->
            <div 
              class="relative p-2 gap-4 flex flex-col items-center justify-center text-center transition duration-150"
            >
              <!-- 商家 LOGO -->
              <img 
                  [src]="sMerchantLogoUrl" 
                  class="px-6 max-w-[200px] w-full h-full object-cover" 
                  alt="Merchant Logo" 
                />

              <!-- 商家名稱與狀態 -->
              <div class="space-y-1">
                <div class="text-xs font-bold text-slate-800 flex items-center justify-center space-x-1">
                  <span>{{ sMerchantName }}</span>
                  <svg *ngIf="!bLockMerchant" lucideChevronDown class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></svg>
                </div>
              </div>

              <select 
                [(ngModel)]="sCurrentMerchant" 
                (change)="fnOnMerchantChange()"
                [disabled]="bLockMerchant"
                class="absolute inset-0 w-full h-full opacity-0"
                [ngClass]="bLockMerchant ? 'cursor-not-allowed' : 'cursor-pointer'"
              >
                <option *ngFor="let oMerchant of aMerchants" [value]="oMerchant.id">
                  {{ oMerchant.name }}
                </option>
              </select>
            </div>

            <!-- 新增商品大按鈕 -->
            <button 
              *ngIf="fnHasPermission('Product.Create')"
              (click)="fnOnAddProductClick()"
              class="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-md shadow-brand-primary/10"
            >
              <svg lucidePlus class="w-4 h-4"></svg>
              <span>新增商品</span>
            </button>

            <!-- 主要選單 -->
            <div class="space-y-2">
              <div class="text-xs font-bold text-slate-400 uppercase tracking-widest px-3">主要選單</div>
              <nav class="space-y-1">
                <!-- 數據儀表板 -->
                <a routerLink="/dashboard" routerLinkActive="bg-brand-primary-light text-brand-primary font-semibold" [routerLinkActiveOptions]="{exact: true}" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition">
                  <svg lucideLayoutDashboard class="w-5 h-5"></svg>
                  <span>數據儀表板</span>
                </a>
                <!-- 商品管理 -->
                <a routerLink="/products" routerLinkActive="bg-brand-primary-light text-brand-primary font-semibold" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition">
                  <svg lucidePackage class="w-5 h-5"></svg>
                  <span>商品管理</span>
                </a>
                <a routerLink="/orders" routerLinkActive="bg-brand-primary-light text-brand-primary font-semibold" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition">
                  <svg lucideClipboardList class="w-5 h-5"></svg>
                  <span>訂單總覽</span>
                  <span 
                    *ngIf="nUnshippedCount > 0"
                    class="ml-auto bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    {{ nUnshippedCount }}
                  </span>
                </a>
                <a *ngIf="fnHasPermission('Employee.Manage')" href="#" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition">
                  <svg lucideUsers class="w-5 h-5"></svg>
                  <span>員工管理</span>
                </a>
              </nav>
            </div>

            <!-- 分組項目 (Main Project 風格) -->
            <div class="space-y-2 pt-2 border-t border-slate-100">
              <div class="flex items-center justify-between px-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>主要目錄</span>
                <button class="hover:text-slate-600 font-bold">+</button>
              </div>
              <div class="space-y-1">
                <div>
                  <div class="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div class="flex items-center space-x-2">
                      <svg lucideFolder class="w-3.5 h-3.5"></svg>
                      <span>主要商品區</span>
                    </div>
                    <svg lucideChevronDown class="w-3 h-3 text-slate-400"></svg>
                  </div>
                  <div class="pl-6 space-y-1 mt-1">
                    <a routerLink="/products" routerLinkActive="bg-brand-primary-light text-brand-primary font-semibold" #rlaProducts="routerLinkActive" class="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50/50 transition">
                      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="rlaProducts.isActive ? 'bg-brand-primary' : 'bg-transparent'"></span>
                      <span>商品管理</span>
                    </a>
                    <a href="#" class="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50/50 transition">
                      <span class="w-1.5 h-1.5 rounded-full bg-transparent"></span>
                      <span>推廣促銷組</span>
                    </a>
                  </div>
                </div>

                <div class="flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                  <div class="flex items-center space-x-2">
                    <svg lucideFolder class="w-3.5 h-3.5"></svg>
                    <span>行銷廣告區</span>
                  </div>
                  <svg lucideChevronRight class="w-3 h-3 text-slate-400"></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- 側邊欄底部 -->
          <div class="space-y-4 pt-4 border-t border-slate-100">
            <div class="flex space-x-2">
              <button class="flex-1 text-center bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-2 px-3 rounded-lg transition">
                邀請團隊
              </button>
              <button class="flex-1 text-center bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-2 px-3 rounded-lg transition">
                說明
              </button>
            </div>

            <!-- 後端狀態指示 -->
            <div class="text-xs text-slate-400 flex items-center justify-between px-1">
              <span class="truncate">{{ sApiUrl }}</span>
              <div class="flex items-center space-x-1 flex-shrink-0">
                <span class="w-2 h-2 rounded-full" [ngClass]="bIsOnline ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                <span class="font-medium" [ngClass]="bIsOnline ? 'text-emerald-600' : 'text-rose-500'">
                  {{ bIsOnline ? '已連線' : '離線模式' }}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <!-- 主要內容區 -->
        <main class="flex-1 overflow-y-auto p-8">
          <!-- 這裡使用內容投影 -->
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class LayoutComponent implements OnInit, OnChanges {
  // 傳入的狀態
  @Input() sCurrentMerchant: string = 'store-a';
  @Input() sSearchQuery: string = '';
  @Input() bIsOnline: boolean = false;
  @Input() sApiUrl: string = '';

  // 使用者資訊與權限標籤
  @Input() sUserRole: string = '超級店長';
  @Input() sUserName: string = '管理員';
  @Input() bLockMerchant: boolean = false;

  // 傳出的事件
  @Output() currentMerchantChange = new EventEmitter<string>();
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() addProductClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  // 觸發登出事件
  fnOnLogoutClick() {
    this.logoutClick.emit();
  }

  // 當商家切換時觸發
  fnOnMerchantChange() {
    this.currentMerchantChange.emit(this.sCurrentMerchant);
  }

  // 當搜尋條件輸入改變時觸發
  fnOnSearchQueryChange() {
    this.searchQueryChange.emit(this.sSearchQuery);
  }

  // 當點擊新增商品時觸發
  fnOnAddProductClick() {
    this.addProductClick.emit();
  }

  nUnshippedCount: number = 0;
  sMerchantLogoUrl: string = '';
  sMerchantName: string = '';
  aMerchants: any[] = [];

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fnUpdateUnshippedCount();
    this.fnFetchMerchantLogo();
    this.fnFetchAllMerchants();
  }

  ngOnChanges(oChanges: SimpleChanges) {
    if (oChanges['sCurrentMerchant'] || oChanges['sApiUrl']) {
      this.fnUpdateUnshippedCount();
      this.fnFetchMerchantLogo();
    }
    if (oChanges['sApiUrl']) {
      this.fnFetchAllMerchants();
    }
  }

  // 更新非已結單的訂單數量
  fnUpdateUnshippedCount() {
    this.orderService.fnGetOrders(this.sCurrentMerchant).subscribe({
      next: (aOrders) => {
        this.nUnshippedCount = aOrders.filter(o => o.ordStatus !== 'Completed').length;
      },
      error: () => {
        this.nUnshippedCount = 0;
      }
    });
  }

  // 判斷當前使用者是否具備特定功能權限代號
  fnHasPermission(sCode: string): boolean {
    return this.authService.fnHasPermission(sCode);
  }

  // 獲取資料庫商家 LOGO 與名稱，失敗或離線時使用預設值與 Unsplash 降級
  fnFetchMerchantLogo() {
    if (!this.sApiUrl || !this.sCurrentMerchant) {
      this.fnSetDefaultLogo();
      this.sMerchantName = this.fnGetDefaultMerchantName();
      return;
    }

    const oHeaders = new HttpHeaders().set('X-Merchant-Id', this.sCurrentMerchant);
    this.http.get<any>(`${this.sApiUrl}/api/Merchants/current`, { headers: oHeaders }).subscribe({
      next: (oRes) => {
        if (oRes) {
          if (oRes.logoUrl) {
            // 拼接後端網址取得上傳的 Logo 圖片資源
            this.sMerchantLogoUrl = `${this.sApiUrl}${oRes.logoUrl}`;
          } else {
            this.fnSetDefaultLogo();
          }
          this.sMerchantName = oRes.name || this.fnGetDefaultMerchantName();
        } else {
          this.fnSetDefaultLogo();
          this.sMerchantName = this.fnGetDefaultMerchantName();
        }
      },
      error: (oErr) => {
        console.warn('無法獲取商家 Logo 與名稱，改用預設圖片與 Mock 名稱...', oErr);
        this.fnSetDefaultLogo();
        this.sMerchantName = this.fnGetDefaultMerchantName();
      }
    });
  }

  // 設定預設高品質的商家模擬 LOGO
  fnSetDefaultLogo() {
    this.sMerchantLogoUrl = this.sCurrentMerchant === 'store-a' 
      ? 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=120&h=120&fit=crop' 
      : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=120&h=120&fit=crop';
  }

  // 獲取所有啟用的商家列表
  fnFetchAllMerchants() {
    if (!this.sApiUrl) {
      this.fnSetDefaultMerchants();
      return;
    }

    this.http.get<any[]>(`${this.sApiUrl}/api/Merchants`).subscribe({
      next: (aRes) => {
        if (aRes && aRes.length > 0) {
          this.aMerchants = aRes;
        } else {
          this.fnSetDefaultMerchants();
        }
      },
      error: (oErr) => {
        console.warn('無法獲取商家列表，使用預設 Mock 商家...', oErr);
        this.fnSetDefaultMerchants();
      }
    });
  }

  // 設定預設 Mock 商家清單
  fnSetDefaultMerchants() {
    this.aMerchants = [
      { id: 'store-a', name: '極簡咖啡館 (Store A)' },
      { id: 'store-b', name: '潮流服飾店 (Store B)' }
    ];
  }

  // 取得預設商家名稱
  fnGetDefaultMerchantName(): string {
    return this.sCurrentMerchant === 'store-a' ? '極簡咖啡館 (Store A)' : '潮流服飾店 (Store B)';
  }
}
