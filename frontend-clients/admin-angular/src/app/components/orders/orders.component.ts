import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideClipboardList, LucideBox, LucideClipboardCheck, LucideTruck, LucideShoppingBag, LucideCheckCircle2 } from '@lucide/angular';

// 導入佈局元件、通用表格、服務與介面
import { LayoutComponent } from '../layout/layout.component';
import { CommonTableComponent, TableColumn } from '../common-table/common-table.component';
import { OrderService, Order, OrderItem, OrderStatus, PaymentStatus } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

// 定義狀態分頁籤介面
interface StatusTab {
  key: 'all' | OrderStatus;
  label: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutComponent,
    CommonTableComponent,
    LucideClipboardList,
    LucideBox,
    LucideClipboardCheck,
    LucideTruck,
    LucideShoppingBag,
    LucideCheckCircle2
  ],
  template: `
    <!-- 使用主要版面配置元件 -->
    <app-layout
      [sCurrentMerchant]="sCurrentMerchant"
      [sSearchQuery]="sSearchQuery"
      [bIsOnline]="bIsOnline"
      [sApiUrl]="sApiUrl"
      [sUserName]="sUserName"
      [sUserRole]="sUserRole"
      (currentMerchantChange)="fnOnMerchantChange($event)"
      (searchQueryChange)="fnOnSearchQueryChange($event)"
      (logoutClick)="fnOnLogout()"
    >
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- 標題 -->
        <div class="flex items-center space-x-2">
          <div class="p-1 text-brand-primary rounded-lg">
            <svg lucideClipboardList class="w-6 h-6"></svg>
          </div>
          <h1 class="font-title text-2xl font-bold tracking-tight text-slate-800">訂單總覽</h1>
        </div>

        <!-- 狀態過濾選項與匯出 -->
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <!-- 快速狀態分頁籤 -->
          <div class="flex border-b border-slate-200 w-full sm:w-auto overflow-x-auto whitespace-nowrap">
            <button 
              *ngFor="let tab of aStatusTabs"
              (click)="fnOnStatusTabChange(tab.key)"
              class="px-4 py-2 text-sm font-medium border-b-2 transition duration-150 cursor-pointer"
              [ngClass]="sActiveStatusTab === tab.key ? 'border-brand-primary text-brand-primary font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 匯出與功能按鈕 -->
          <div class="flex items-center space-x-2 w-full sm:w-auto justify-end flex-shrink-0">
            <button 
              (click)="fnExportCsv()"
              class="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition duration-150 cursor-pointer shadow-sm"
            >
              匯出 CSV
            </button>
          </div>
        </div>

        <!-- 訂單列表 (撐滿寬度) -->
        <div class="space-y-4">
          <app-common-table
            sTitle="訂單列表"
            [aColumns]="aOrderColumns"
            [aData]="aFilteredOrders"
            [bShowSelection]="false"
            [bCanView]="true"
            [bServerSide]="true"
            [nTotalItems]="nTotalOrders"
            [nPageSize]="nPageSize"
            [nPageIndex]="nPageIndex"
            [sExternalSortKey]="sSortKey"
            [sExternalSortOrder]="sSortOrder"
            [oTemplates]="{
              id: idCol,
              member: memberCol,
              products: productsCol,
              orderDate: dateCol,
              payStatus: payStatusCol,
              ordStatus: statusCol,
              actions: actionsCol
            }"
            (sortChange)="fnOnSortChange($event)"
            (pageChange)="fnOnPageChange($event)"
          ></app-common-table>

        </div>
      </div>
    </app-layout>

    <!-- 右側滑出式明細面板 (Drawer) -->
    <div *ngIf="oSelectedOrder" class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <!-- 點擊背景遮罩關閉抽屜 -->
      <div 
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
        [ngClass]="bShowDrawer ? 'opacity-100' : 'opacity-0'"
        (click)="fnCloseDetail()"
      ></div>

      <div class="fixed inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
        <!-- 抽屜面板本身 -->
        <div 
          class="w-screen max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out"
          [ngClass]="bShowDrawer ? 'translate-x-0' : 'translate-x-full'"
        >
          <!-- 詳情標頭 -->
          <div class="px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-bold text-slate-800" id="slide-over-title">訂單明細資訊</h2>
              <p class="text-xs text-slate-400 font-mono mt-0.5">OD{{ fnPadOrderIdTo3(oSelectedOrder.id) }}</p>
            </div>
            
            <div class="flex items-center space-x-2">
              <!-- 付款狀態標籤 -->
              <span class="inline-flex items-center text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg whitespace-nowrap">
                <span [className]="'w-2 h-2 rounded-full mr-1.5 ' + fnGetPayStatusDotClass(oSelectedOrder.payStatus)"></span>
                {{ fnGetPayStatusText(oSelectedOrder.payStatus) }}
              </span>
              
              <!-- 訂單狀態標籤 -->
              <span [className]="'inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold border whitespace-nowrap ' + fnGetStatusClass(oSelectedOrder.ordStatus)">
                <svg *ngIf="oSelectedOrder.ordStatus === 'ToDispatch'" lucideBox class="w-3.5 h-3.5 flex-shrink-0"></svg>
                <svg *ngIf="oSelectedOrder.ordStatus === 'ToPick'" lucideClipboardCheck class="w-3.5 h-3.5 flex-shrink-0"></svg>
                <svg *ngIf="oSelectedOrder.ordStatus === 'ToShip'" lucideTruck class="w-3.5 h-3.5 flex-shrink-0"></svg>
                <svg *ngIf="oSelectedOrder.ordStatus === 'ToCollect'" lucideShoppingBag class="w-3.5 h-3.5 flex-shrink-0"></svg>
                <svg *ngIf="oSelectedOrder.ordStatus === 'Completed'" lucideCheckCircle2 class="w-3.5 h-3.5 flex-shrink-0"></svg>
                <span>{{ fnGetStatusText(oSelectedOrder.ordStatus) }}</span>
              </span>
              
              <!-- 關閉按鈕 -->
              <button 
                (click)="fnCloseDetail()" 
                class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition flex items-center justify-center cursor-pointer border border-slate-200 shadow-sm"
                title="關閉"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 詳情內容 (可滾動區) -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- 1. 會員聯絡資訊 -->
            <div class="space-y-2.5">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">購買會員資訊</h3>
              <div class="grid grid-cols-3 gap-4 bg-slate-50/60 rounded-lg p-3 border border-slate-100 text-xs text-slate-600">
                <!-- 會員姓名 -->
                <div class="flex flex-col space-y-0.5 min-w-0">
                  <span class="font-medium text-slate-400 text-xs uppercase tracking-wider">會員姓名</span>
                  <span class="font-semibold text-slate-800 truncate">{{ oSelectedOrder.userName }}</span>
                </div>
                 <!-- 手機號碼 -->
                 <div class="flex flex-col space-y-0.5 min-w-0">
                   <span class="font-medium text-slate-400 text-xs uppercase tracking-wider">手機號碼</span>
                   <span class="font-mono text-slate-800 truncate" [title]="oSelectedOrder.userPhone">{{ fnGetMaskedPhone(oSelectedOrder.userPhone) }}</span>
                 </div>
                <!-- 訂購時間 -->
                <div class="flex flex-col space-y-0.5 min-w-0">
                  <span class="font-medium text-slate-400 text-xs uppercase tracking-wider">訂購時間</span>
                  <span class="text-slate-800 font-mono text-xs whitespace-normal sm:whitespace-nowrap">{{ oSelectedOrder.orderDate | date:'yyyy-MM-dd HH:mm:ss' }}</span>
                </div>
              </div>
            </div>

            <!-- 訂購收貨資訊 -->
            <div class="space-y-2.5">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">訂購收貨資訊</h3>
              <div class="grid grid-cols-3 gap-4 bg-slate-50/60 rounded-lg p-3 border border-slate-100 text-xs text-slate-600">
                <!-- 收貨人姓名 -->
                <div class="flex flex-col space-y-0.5 min-w-0">
                  <span class="font-medium text-slate-400 text-xs uppercase tracking-wider">收貨人姓名</span>
                  <span class="font-semibold text-slate-800 truncate" [title]="oSelectedOrder.receiverName">{{ oSelectedOrder.receiverName }}</span>
                </div>
                <!-- 收貨地址 -->
                <div class="flex flex-col space-y-0.5 col-span-2 min-w-0">
                  <span class="font-medium text-slate-400 text-xs uppercase tracking-wider">收貨地址</span>
                  <span class="font-semibold text-slate-800 break-words" [title]="oSelectedOrder.shippingAddress">{{ oSelectedOrder.shippingAddress }}</span>
                </div>
              </div>
            </div>

            <!-- 2. 訂購商品明細 (副列表，套用通用列表元件且無標頭) -->
            <div class="space-y-2.5">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">訂購明細項目</h3>
              <!-- 嵌套 app-common-table 渲染訂單明細 -->
              <app-common-table
                [aColumns]="aOrderItemColumns"
                [aData]="oSelectedOrder.orderItems"
                [bShowSelection]="false"
                [bCanCreate]="false"
                [oTemplates]="{
                  product: productDetailCol,
                  totalAmount: subtotalCol
                }"
              ></app-common-table>
            </div>

            <!-- 3. 金額結算資訊 -->
            <div class="border-t border-slate-100 pt-4 space-y-2.5">
              <div class="flex justify-between text-xs text-slate-500">
                <span>原始金額總計:</span>
                <span class="font-mono font-bold text-slate-600">\${{ oSelectedOrder.totalAmount | number:'1.0-2' }}</span>
              </div>
              <div class="flex justify-between text-xs text-slate-500" *ngIf="oSelectedOrder.discountAmount > 0">
                <span>商品折讓折扣:</span>
                <span class="font-mono font-bold text-rose-500">-\${{ oSelectedOrder.discountAmount | number:'1.0-2' }}</span>
              </div>
              <div class="flex justify-between text-xs text-slate-500" *ngIf="oSelectedOrder.pointsAmount > 0">
                <span>會員購物金扣抵:</span>
                <span class="font-mono font-bold text-rose-500">-\${{ oSelectedOrder.pointsAmount | number:'1.0-2' }}</span>
              </div>
              <div class="flex justify-between text-xs text-slate-500" *ngIf="oSelectedOrder.promoAmount > 0">
                <span>優惠代碼折抵:</span>
                <span class="font-mono font-bold text-rose-500">-\${{ oSelectedOrder.promoAmount | number:'1.0-2' }}</span>
              </div>
              <!-- 實線風格強調應收金額 -->
              <div class="border-t border-slate-150 pt-2.5 flex justify-between text-sm items-center">
                <span class="font-bold text-slate-800">訂單應收金額:</span>
                <span class="font-mono font-bold text-brand-primary text-base">\${{ oSelectedOrder.receivableAmount | number:'1.0-2' }}</span>
              </div>
              <div class="flex justify-between text-xs text-slate-500">
                <span>已收款金額:</span>
                <span class="font-mono font-semibold" [ngClass]="oSelectedOrder.receivedAmount === oSelectedOrder.receivableAmount ? 'text-emerald-600' : 'text-slate-600'">
                  \${{ oSelectedOrder.receivedAmount | number:'1.0-2' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 訂單列表客製化欄位樣板 -->
    <ng-template #idCol let-order>
      <span class="font-mono font-bold text-xs text-slate-700">
        OD{{ fnPadOrderIdTo3(order.id) }}
      </span>
    </ng-template>

    <ng-template #memberCol let-order>
      <div class="flex items-center space-x-2.5 py-0.5">
        <img [src]="fnGetMemberAvatar(order.userName)" class="w-8 h-8 rounded-full object-cover border border-slate-100 flex-shrink-0" alt="Avatar" />
        <div class="flex flex-col min-w-0">
          <span class="font-bold text-slate-800 text-xs leading-normal">{{ order.userName }}</span>
          <span class="text-xs text-slate-400 font-mono mt-0.5 leading-normal">{{ fnGetMaskedPhone(order.userPhone) }}</span>
        </div>
      </div>
    </ng-template>

    <ng-template #productsCol let-order>
      <div class="flex flex-col space-y-1 py-1">
        <!-- 迴圈顯示最多前兩項商品 -->
        <div *ngFor="let item of $any(order).orderItems | slice:0:2" class="text-xs text-slate-700 flex items-center space-x-1.5 min-w-0">
          <span class="font-semibold truncate max-w-[140px]" [title]="$any(item).productName">{{ $any(item).productName }}</span>
          <span class="text-slate-400 font-mono text-xs flex-shrink-0">x{{ $any(item).quantity }}</span>
        </div>
        <!-- 超過兩項時，顯示 還有其他x項商品 -->
        <div *ngIf="$any(order).orderItems && $any(order).orderItems.length > 2" class="text-[11px] text-brand-primary font-bold mt-0.5 whitespace-nowrap">
          還有其他 {{ $any(order).orderItems.length - 2 }} 項商品
        </div>
      </div>
    </ng-template>

    <ng-template #dateCol let-order>
      <span class="text-xs text-slate-400 font-medium">
        {{ order.orderDate | date:'yyyy-MM-dd HH:mm' }}
      </span>
    </ng-template>

    <ng-template #payStatusCol let-order>
      <span class="inline-flex items-center text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg whitespace-nowrap">
        <span [className]="'w-2 h-2 rounded-full mr-1.5 ' + fnGetPayStatusDotClass(order.payStatus)"></span>
        {{ fnGetPayStatusText(order.payStatus) }}
      </span>
    </ng-template>

    <ng-template #statusCol let-order>
      <span [className]="'inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold border whitespace-nowrap ' + fnGetStatusClass(order.ordStatus)">
        <svg *ngIf="order.ordStatus === 'ToDispatch'" lucideBox class="w-3.5 h-3.5 flex-shrink-0"></svg>
        <svg *ngIf="order.ordStatus === 'ToPick'" lucideClipboardCheck class="w-3.5 h-3.5 flex-shrink-0"></svg>
        <svg *ngIf="order.ordStatus === 'ToShip'" lucideTruck class="w-3.5 h-3.5 flex-shrink-0"></svg>
        <svg *ngIf="order.ordStatus === 'ToCollect'" lucideShoppingBag class="w-3.5 h-3.5 flex-shrink-0"></svg>
        <svg *ngIf="order.ordStatus === 'Completed'" lucideCheckCircle2 class="w-3.5 h-3.5 flex-shrink-0"></svg>
        <span>{{ fnGetStatusText(order.ordStatus) }}</span>
      </span>
    </ng-template>

    <ng-template #actionsCol let-order>
      <button 
        (click)="fnSelectOrder(order)"
        class="p-1.5 hover:bg-slate-50 border border-slate-200 text-brand-primary hover:text-brand-primary-hover rounded-lg transition flex items-center justify-center ml-auto cursor-pointer shadow-sm"
        title="查看明細"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </button>
    </ng-template>

    <!-- 訂單明細列表客製化欄位樣板 -->
    <ng-template #productDetailCol let-item>
      <div class="flex items-center space-x-2.5 py-0.5">
        <img *ngIf="item.productImageUrl" [src]="item.productImageUrl" class="w-8 h-8 object-cover rounded border border-slate-150 flex-shrink-0" />
        <div class="flex flex-col min-w-0">
          <span class="font-bold text-slate-800 text-xs leading-normal whitespace-normal break-words">{{ item.productName }}</span>
          <span *ngIf="item.specName" class="text-xs text-slate-400 font-medium mt-0.5 leading-normal whitespace-normal break-words">
            {{ item.specName }}
          </span>
        </div>
      </div>
    </ng-template>

    <ng-template #subtotalCol let-item>
      <span class="font-mono font-bold text-slate-700 text-xs">
        \${{ item.totalAmount | number:'1.0-2' }}
      </span>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class OrdersComponent implements OnInit {
  // 全域/容器狀態
  sCurrentMerchant: string = 'store-a';
  sSearchQuery: string = '';
  bIsOnline: boolean = false;
  sApiUrl: string = environment.apiUrl;

  // 登入使用者資訊
  sUserName: string = '管理員';
  sUserRole: string = '超級店長';

  // 訂單資料狀態
  aOrders: Order[] = [];
  aFilteredOrders: Order[] = [];
  oSelectedOrder: Order | null = null;
  bShowDrawer: boolean = false; // 控制右側明細抽屜滑出/滑入狀態

  // 分頁與排序狀態
  nPageIndex: number = 1;
  nPageSize: number = 10;
  nTotalOrders: number = 0;
  sSortKey: string | null = null;
  sSortOrder: 'asc' | 'desc' | null = null;

  // 狀態篩選與分頁籤
  sActiveStatusTab: 'all' | OrderStatus = 'all';
  aStatusTabs: StatusTab[] = [
    { key: 'all', label: '全部訂單' },
    { key: 'ToDispatch', label: '待配貨' },
    { key: 'ToPick', label: '待揀貨' },
    { key: 'ToShip', label: '待出貨' },
    { key: 'ToCollect', label: '待取貨' },
    { key: 'Completed', label: '已結單' }
  ];

  // 訂單主表欄位配置
  aOrderColumns: TableColumn[] = [
    { sKey: 'id', sLabel: '訂單編號', sType: 'custom', sClass: 'w-24', bSortable: true },
    { sKey: 'member', sLabel: '會員資訊', sType: 'custom' },
    { sKey: 'products', sLabel: '訂購商品', sType: 'custom' },
    { sKey: 'orderDate', sLabel: '訂購日期', sType: 'custom', sClass: 'hidden sm:table-cell', sHeaderClass: 'hidden sm:table-cell', bSortable: true },
    { sKey: 'receivableAmount', sLabel: '應收金額', sType: 'currency', sClass: 'font-mono font-bold text-slate-700', bSortable: true },
    { sKey: 'payStatus', sLabel: '付款狀態', sType: 'custom', sClass: 'w-24', bSortable: true },
    { sKey: 'ordStatus', sLabel: '訂單狀態', sType: 'custom', sClass: 'w-24', bSortable: true },
    { sKey: 'actions', sLabel: '詳情', sType: 'custom', sClass: 'text-right w-16' }
  ];


  // 訂單明細子表欄位配置 (嵌套於右側，微縮樣式)
  aOrderItemColumns: TableColumn[] = [
    { sKey: 'product', sLabel: '商品 / 規格', sType: 'custom' },
    { sKey: 'quantity', sLabel: '數量', sType: 'text', sClass: 'text-center font-mono text-xs text-slate-500', sHeaderClass: 'text-center' },
    { sKey: 'originalUnitPrice', sLabel: '單價', sType: 'currency', sClass: 'font-mono text-xs text-slate-400' },
    { sKey: 'totalAmount', sLabel: '小計', sType: 'custom' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    // 復原登入者資訊
    this.sUserName = this.authService.sUserName;
    const sRoleName = this.authService.sUserRole;
    if (sRoleName === 'SystemAdmin') {
      this.sUserRole = '系統管理員';
    } else if (sRoleName === 'MerchantAdmin') {
      this.sUserRole = '店家管理員';
    } else if (sRoleName === 'MerchantStaff') {
      this.sUserRole = '店家店務人員';
    } else {
      this.sUserRole = sRoleName;
    }

    this.sCurrentMerchant = this.authService.sCurrentMerchant;
    this.fnLoadOrders();
  }

  // 載入訂單列表 (伺服器端模式，支援分頁與排序)
  fnLoadOrders() {
    const oParams = {
      ordStatus: this.sActiveStatusTab,
      payStatus: 'all',
      page: this.nPageIndex,
      pageSize: this.nPageSize,
      sortBy: this.sSortKey,
      sortOrder: this.sSortOrder,
      search: this.sSearchQuery
    };

    this.orderService.fnGetPagedOrders(this.sCurrentMerchant, oParams).subscribe({
      next: (oResponse) => {
        this.bIsOnline = true;

        // 格式化訂單商品圖片 (繁體中文註解：將以 / 開頭的相對圖片路徑拼接為完整的 API 伺服器絕對網址)
        const fnFormatOrderImages = (oOrd: Order) => {
          if (oOrd.orderItems) {
            oOrd.orderItems = oOrd.orderItems.map(oItem => {
              let sImg = oItem.productImageUrl;
              if (sImg && sImg.startsWith('/')) {
                sImg = `${environment.apiUrl}${sImg}`;
              }
              return { ...oItem, productImageUrl: sImg };
            });
          }
          return oOrd;
        };

        if (oResponse && (oResponse as any).items !== undefined && (oResponse as any).total !== undefined) {
          const res = oResponse as { items: Order[], total: number };
          this.aOrders = res.items.map(o => ({ ...fnFormatOrderImages(o), selected: false }));
          this.nTotalOrders = res.total;
          this.aFilteredOrders = [...this.aOrders];
        } else if (Array.isArray(oResponse)) {
          // 後端尚未支援分頁回傳物件，由前端代理分頁與排序
          const aFormatted = oResponse.map(o => fnFormatOrderImages(o));
          this.fnProcessClientPagedOrders(aFormatted);
        }
      },
      error: (oErr) => {
        console.error('載入訂單失敗:', oErr);
        this.bIsOnline = false;
        // API 失敗時，利用服務中定義的 Mock 進行本地分頁與排序
        this.orderService.fnGetOrders(this.sCurrentMerchant).subscribe(aMock => {
          this.fnProcessClientPagedOrders(aMock);
        });
      }
    });
  }

  // 前端代理處理分頁、搜尋與排序 (Mock/Fallback 或是舊版 API 相容)
  fnProcessClientPagedOrders(aFullData: Order[]) {
    let aResult = [...aFullData];

    // 1. 關鍵字搜尋篩選 (支援編號、姓名與信箱)
    if (this.sSearchQuery.trim()) {
      const sQuery = this.sSearchQuery.toLowerCase().trim();
      aResult = aResult.filter(o =>
        o.id.toString().includes(sQuery) ||
        (o.userName && o.userName.toLowerCase().includes(sQuery)) ||
        (o.userEmail && o.userEmail.toLowerCase().includes(sQuery))
      );
    }

    // 2. 狀態 Tab 篩選
    if (this.sActiveStatusTab !== 'all') {
      aResult = aResult.filter(o => o.ordStatus === this.sActiveStatusTab);
    }

    // 3. 排序邏輯
    if (this.sSortKey && this.sSortOrder) {
      const sKey = this.sSortKey;
      const sOrder = this.sSortOrder;

      aResult.sort((oA, oB) => {
        let valA = (oA as any)[sKey];
        let valB = (oB as any)[sKey];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        // 數字型別比較
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sOrder === 'asc' ? valA - valB : valB - valA;
        }

        // 日期型別比較 (若為 ISO 字串，轉為 epoch 時間比較)
        if (sKey === 'orderDate') {
          const timeA = new Date(valA).getTime();
          const timeB = new Date(valB).getTime();
          return sOrder === 'asc' ? timeA - timeB : timeB - timeA;
        }

        // 字串型別比較
        const sValA = valA.toString().toLowerCase();
        const sValB = valB.toString().toLowerCase();

        if (sValA < sValB) return sOrder === 'asc' ? -1 : 1;
        if (sValA > sValB) return sOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 4. 前端切片分頁 (Page 1-indexed)
    this.nTotalOrders = aResult.length;
    const nStart = (this.nPageIndex - 1) * this.nPageSize;
    const nEnd = nStart + this.nPageSize;
    this.aFilteredOrders = aResult.slice(nStart, nEnd).map(o => ({ ...o, selected: false }));
  }

  // 當商家選單切換時
  fnOnMerchantChange(sMerchant: string) {
    this.sCurrentMerchant = sMerchant;
    this.sSearchQuery = '';
    this.nPageIndex = 1;
    this.sSortKey = null;
    this.sSortOrder = null;
    this.bShowDrawer = false;
    this.oSelectedOrder = null;
    this.fnLoadOrders();
  }

  // 當搜尋列關鍵字變更時
  fnOnSearchQueryChange(sQuery: string) {
    this.sSearchQuery = sQuery;
    this.nPageIndex = 1; // 重設頁碼
    this.fnLoadOrders();
  }

  // 當切換狀態 Tab 時
  fnOnStatusTabChange(sStatus: 'all' | OrderStatus) {
    this.sActiveStatusTab = sStatus;
    this.nPageIndex = 1; // 重設頁碼
    this.fnLoadOrders();
  }

  // 處理列表回報排序狀態變更
  fnOnSortChange(event: { sKey: string | null, sOrder: 'asc' | 'desc' | null }) {
    this.sSortKey = event.sKey;
    this.sSortOrder = event.sOrder;
    this.nPageIndex = 1; // 排序變更時重設回第一頁
    this.fnLoadOrders();
  }

  // 處理列表回報頁碼變更
  fnOnPageChange(nPage: number) {
    this.nPageIndex = nPage;
    this.fnLoadOrders();
  }


  // 點選查看某筆訂單詳情
  fnSelectOrder(oOrder: Order) {
    this.oSelectedOrder = oOrder;
    setTimeout(() => {
      this.bShowDrawer = true;
    }, 50);
  }

  // 關閉訂單詳情面板 (Drawer)
  fnCloseDetail() {
    this.bShowDrawer = false;
    setTimeout(() => {
      this.oSelectedOrder = null;
    }, 300);
  }

  // 獲取狀態標籤對應的文字
  fnGetStatusText(sStatus: OrderStatus): string {
    switch (sStatus) {
      case 'ToDispatch': return '待配貨';
      case 'ToPick': return '待揀貨';
      case 'ToShip': return '待出貨';
      case 'ToCollect': return '待取貨';
      case 'Completed': return '結單';
      default: return sStatus;
    }
  }

  // 獲取狀態標籤對應的 UI class
  fnGetStatusClass(sStatus: OrderStatus): string {
    switch (sStatus) {
      case 'ToDispatch': return 'bg-[#FFF9F0] text-[#C2410C] border-[#FED7AA]'; // 橘黃色
      case 'ToPick': return 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'; // 綠色
      case 'ToShip': return 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'; // 藍色
      case 'ToCollect': return 'bg-[#FAF5FF] text-[#7C3AED] border-[#E9D5FF]'; // 紫色
      case 'Completed': return 'bg-slate-50 text-slate-500 border-slate-200'; // 冷灰色
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  }

  // 獲取付款狀態對應的文字
  fnGetPayStatusText(sStatus: PaymentStatus): string {
    switch (sStatus) {
      case 'Unpaid': return '未付款';
      case 'PartiallyPaid': return '部分付款';
      case 'Paid': return '已付款';
      default: return sStatus;
    }
  }

  // 獲取付款狀態對應的 UI class
  fnGetPayStatusClass(sStatus: PaymentStatus): string {
    switch (sStatus) {
      case 'Unpaid': return 'bg-rose-50 text-rose-600 border-rose-200'; // 紅色
      case 'PartiallyPaid': return 'bg-amber-50 text-amber-600 border-amber-200'; // 橘黃色
      case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-200'; // 綠色
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  }

  // 獲取付款狀態指示燈的 CSS 類別
  fnGetPayStatusDotClass(sStatus: PaymentStatus): string {
    switch (sStatus) {
      case 'Unpaid': return 'bg-rose-500 animate-pulse'; // 未付款：紅色閃爍/呼吸燈
      case 'PartiallyPaid': return 'bg-amber-500'; // 部分付款：橘黃色
      case 'Paid': return 'bg-emerald-500'; // 已付款：綠色
      default: return 'bg-slate-400';
    }
  }

  // 格式化訂單 ID 為四位數，如 #ORD-0001
  fnPadOrderId(nId: number): string {
    return nId.toString().padStart(4, '0');
  }

  // 格式化訂單 ID 為三位數，如 OD001
  fnPadOrderIdTo3(nId: number): string {
    return nId.toString().padStart(3, '0');
  }

  // 根據會員姓名獲取 Mock 大頭貼網址
  fnGetMemberAvatar(sName?: string): string {
    if (sName === '林志明') {
      return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop';
    }
    if (sName === '陳美玲') {
      return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop';
    }
    if (sName === '王大同') {
      return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop';
    }
    if (sName === '張小華') {
      return 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop';
  }

  // 獲取遮罩後的手機號碼，格式為 0912-***-678
  fnGetMaskedPhone(sPhone?: string): string {
    if (!sPhone) return '';
    if (sPhone.length === 10) {
      return `${sPhone.slice(0, 4)}-***-${sPhone.slice(7)}`;
    }
    return sPhone;
  }

  // 登出系統
  fnOnLogout() {
    this.authService.fnLogout();
    this.router.navigate(['/login']);
  }

  // 匯出 CSV 提示 (PoC)
  fnExportCsv() {
    alert(`[匯出 CSV動作]\n即將為當前商店「${this.sCurrentMerchant === 'store-a' ? '極簡咖啡館' : '潮流服飾店'}」匯出 ${this.aFilteredOrders.length} 筆訂單記錄。\n在正式環境下，這會產出帶有 BOM UTF-8 編碼的 CSV 檔案並下載至您的電腦。`);
  }
}
