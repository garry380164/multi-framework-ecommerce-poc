import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LucidePackage, LucideChevronDown, LucidePlus } from '@lucide/angular';
import { ApiClientService } from '../../services/api-client.service';

// 導入環境設定與 Standalone 元件/介面
import { environment } from '../../../environments/environment';
import { LayoutComponent } from '../layout/layout.component';
import { TabsComponent } from '../tabs/tabs.component';
import { ProductTableComponent, Product } from '../product-table/product-table.component';
import { SingleSelectDropdownComponent, SelectOption } from '../single-select-dropdown/single-select-dropdown.component';
import { AuthService } from '../../services/auth.service';
import { ProductKanbanComponent } from '../product-kanban/product-kanban.component';
import { ProductCalendarComponent } from '../product-calendar/product-calendar.component';

// 本地 Mock 資料，當無法連線後端 API 時自動啟用
const MOCK_PRODUCTS: Record<string, Product[]> = {
  'store-a': [
    { id: 1, merchantId: 'store-a', name: '耶加雪菲精品咖啡豆 (250g)', description: '帶有豐富的柑橘與花香調性，中淺烘焙，酸質明亮細緻。', price: 450, stock: 120, imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', orderedQty: 30, shortageQty: 0, categoryId: 1, categoryName: '精品咖啡' },
    { id: 2, merchantId: 'store-a', name: '極簡磨砂陶瓷馬克杯', description: '質感磨砂黑，350ml 容量，保溫效果佳，辦公室必備。', price: 350, stock: 85, imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500', orderedQty: 15, shortageQty: 0, categoryId: 2, categoryName: '生活器具' },
    { id: 5, merchantId: 'store-a', name: '手沖精品玻璃分享壺', description: '高硼矽耐熱玻璃，500ml，帶有精準刻度，手沖咖啡良伴。', price: 480, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500', orderedQty: 80, shortageQty: 65, categoryId: 2, categoryName: '生活器具' }
  ],
  'store-b': [
    { id: 3, merchantId: 'store-b', name: '重磅落肩連帽衫', description: '420g 重磅純棉，寬鬆落肩版型，親膚保暖，美式街頭風格。', price: 1280, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500', orderedQty: 60, shortageQty: 15, categoryId: 3, categoryName: '流行服飾' },
    { id: 4, merchantId: 'store-b', name: '日系原色帆布托特包', description: '厚實耐磨帆布，附內部拉鍊小袋，大容量可裝 15 吋筆電。', price: 590, stock: 110, imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500', orderedQty: 25, shortageQty: 0, categoryId: 4, categoryName: '質感配件' },
    { id: 6, merchantId: 'store-b', name: '水洗復古牛仔棒球帽', description: '100% 純棉水洗牛仔布，金屬調節扣，復古刷色做舊感。', price: 450, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500', orderedQty: 50, shortageQty: 42, categoryId: 4, categoryName: '質感配件' }
  ]
};

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HttpClientModule,
    LucidePackage,
    LucideChevronDown,
    LucidePlus,
    LayoutComponent,
    TabsComponent,
    ProductTableComponent,
    SingleSelectDropdownComponent,
    ProductKanbanComponent,
    ProductCalendarComponent
  ],
  template: `
    <!-- 使用獨立的版面配置元件 (bLockMerchant 設為 true，鎖定登入商家) -->
    <app-layout
      [sCurrentMerchant]="sCurrentMerchant"
      [sSearchQuery]="sSearchQuery"
      [bIsOnline]="bIsOnline"
      [sApiUrl]="sApiUrl"
      [sUserName]="sUserName"
      [sUserRole]="sUserRole"
      [bLockMerchant]="true"
      (currentMerchantChange)="fnOnMerchantChange($event)"
      (searchQueryChange)="fnOnSearchQueryChange($event)"
      (addProductClick)="fnAddProductAlert()"
      (logoutClick)="fnOnLogout()"
    >
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- 標題與裝飾按鈕 -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center space-x-1">
            <div class="p-1 text-brand-primary rounded-lg">
              <svg lucidePackage class="w-6 h-6"></svg>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h1 class="font-title text-2xl font-bold tracking-tight text-slate-800">商品庫存管理</h1>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用獨立的 Tabs 元件 -->
        <app-tabs
          class="block mt-2"
          [aTabs]="aTabsList"
          [sActiveTab]="sCurrentTab"
          (activeTabChange)="fnOnTabChange($event)"
        ></app-tabs>

        <!-- 篩選列 (僅在列表 Tab 顯示) -->
        <div *ngIf="sCurrentTab === '列表'" class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div class="flex flex-wrap items-center gap-3">
            <!-- 1. 上架日期篩選 (符合圖中指示：截止日期改成上架日期) -->
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">上架日期</span>
              <app-single-select-dropdown
                [aOptions]="aDateFilterOptions"
                [sValue]="sDateFilterValue"
                (sValueChange)="fnOnDateFilterChange($event)"
                sPlaceholder="全部時間"
                class="w-32"
                sPanelClass="min-w-[130px]"
              ></app-single-select-dropdown>
            </div>

            <!-- 2. 商品分類篩選 (符合圖中指示：負責人改成商品分類) -->
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">商品分類</span>
              <app-single-select-dropdown
                [aOptions]="aCategoryFilterOptions"
                [sValue]="sCategoryFilterValue"
                (sValueChange)="fnOnCategoryFilterChange($event)"
                sPlaceholder="全部分類"
                class="w-32"
                sPanelClass="min-w-[130px]"
              ></app-single-select-dropdown>
            </div>

            <!-- 3. 全域排序 (符合圖中指示：優先級改成排序，且列表若有排序狀態需要同步) -->
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">排序</span>
              <app-single-select-dropdown
                [aOptions]="aSortOptions"
                [sValue]="sCurrentSortValue"
                (sValueChange)="fnOnGlobalSortChange($event)"
                sPlaceholder="預設排序"
                class="w-36"
                sPanelClass="min-w-[220px]"
              ></app-single-select-dropdown>
            </div>

            <div class="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-650 flex items-center space-x-1 hover:bg-slate-50 cursor-pointer transition shadow-sm h-[32px] select-none">
              <span>進階篩選</span>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <button 
              *ngIf="fnHasPermission('Product.Create')"
              (click)="fnAddProductAlert()"
              class="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition duration-150 flex items-center space-x-1.5 shadow-md shadow-brand-primary/10 cursor-pointer"
            >
              <svg lucidePlus class="w-3.5 h-3.5"></svg>
              <span>新增商品</span>
            </button>
          </div>
        </div>

        <!-- 商品內容區域 -->
        <div class="space-y-6">
          
          <!-- 列表分頁視圖 -->
          <div *ngIf="sCurrentTab === '列表'" class="space-y-6">
            <!-- Pending (待補貨) 區塊 (使用擴充後的 app-product-table) -->
            <app-product-table
              sTitle="待補貨"
              [aProducts]="lowStockProducts"
              [bIsLowStock]="true"
              [bCanCreate]="fnHasPermission('Product.Create')"
              [bCanEdit]="fnHasPermission('Product.Edit')"
              [bCanDelete]="fnHasPermission('Product.Delete')"
              [bServerSide]="true"
              [nTotalItems]="nTotalLowStock"
              [nPageSize]="nPageSize"
              [nPageIndex]="nPageIndexLowStock"
              [sExternalSortKey]="sSortKeyLowStock"
              [sExternalSortOrder]="sSortOrderLowStock"
              (addProductClick)="fnAddProductAlert()"
              (editProduct)="fnEditAlert($event)"
              (deleteProduct)="fnDeleteAlert($event)"
              (sortChange)="fnOnSortChange('lowStock', $event)"
              (pageChange)="fnOnPageChange('lowStock', $event)"
              (selectionChange)="fnOnSelectionChange('lowStock', $event)"
            ></app-product-table>

            <!-- In Progress (進行中) 區塊 (使用擴充後的 app-product-table) -->
            <app-product-table
              sTitle="進行中"
              [aProducts]="sufficientProducts"
              [bIsLowStock]="false"
              [bCanCreate]="fnHasPermission('Product.Create')"
              [bCanEdit]="fnHasPermission('Product.Edit')"
              [bCanDelete]="fnHasPermission('Product.Delete')"
              [bServerSide]="true"
              [nTotalItems]="nTotalSufficient"
              [nPageSize]="nPageSize"
              [nPageIndex]="nPageIndexSufficient"
              [sExternalSortKey]="sSortKeySufficient"
              [sExternalSortOrder]="sSortOrderSufficient"
              (addProductClick)="fnAddProductAlert()"
              (editProduct)="fnEditAlert($event)"
              (deleteProduct)="fnDeleteAlert($event)"
              (sortChange)="fnOnSortChange('sufficient', $event)"
              (pageChange)="fnOnPageChange('sufficient', $event)"
              (selectionChange)="fnOnSelectionChange('sufficient', $event)"
            ></app-product-table>
          </div>

          <!-- 看板分頁視圖 -->
          <app-product-kanban
            *ngIf="sCurrentTab === '看板'"
            [aLowStockProducts]="lowStockProducts"
            [aSufficientProducts]="sufficientProducts"
            [bCanCreate]="fnHasPermission('Product.Create')"
            [bCanEdit]="fnHasPermission('Product.Edit')"
            [bCanDelete]="fnHasPermission('Product.Delete')"
            (editProduct)="fnEditAlert($event)"
            (deleteProduct)="fnDeleteAlert($event)"
            (productCategoryChange)="fnOnProductCategoryChange($event)"
            (columnNameChange)="fnOnColumnNameChange($event)"
            (addProductToCategory)="fnOnAddProductToCategory($event)"
          ></app-product-kanban>

          <!-- 行事曆分頁視圖 -->
          <app-product-calendar
            *ngIf="sCurrentTab === '行事曆'"
          ></app-product-calendar>

          <!-- 總覽 / 檔案 預留 Fallback 視圖 (極簡高質感扁平化) -->
          <div 
            *ngIf="sCurrentTab !== '列表' && sCurrentTab !== '看板' && sCurrentTab !== '行事曆'" 
            class="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto space-y-4"
          >
            <div class="w-12 h-12 mx-auto bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-500">
              <svg *ngIf="sCurrentTab === '總覽'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
              <svg *ngIf="sCurrentTab === '檔案'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="space-y-1">
              <h3 class="font-title font-medium text-slate-800 tracking-tight text-sm">「{{ sCurrentTab }}」分頁正在規劃中</h3>
              <p class="text-xs text-slate-400 max-w-sm mx-auto">
                開發團隊正積極設計符合全域扁平高質感風格之視覺交互，此功能即將推出。
              </p>
            </div>
          </div>

        </div>
      </div>
    </app-layout>

  `,
  styles: []
})
export class ProductsComponent implements OnInit, OnDestroy {
  // 全域/容器狀態
  sCurrentMerchant: string = 'store-a';
  sSearchQuery: string = '';
  aProducts: Product[] = [];
  aFilteredProducts: Product[] = [];
  
  // 動態 API 網址設定
  sApiUrl: string = environment.apiUrl;
  
  // 登入的使用者資訊
  sUserName: string = '管理員';
  sUserRole: string = '超級店長';
  
  // 分組商品資料 (傳給子元件)
  lowStockProducts: Product[] = [];
  sufficientProducts: Product[] = [];
  
  // 連線狀態與查詢次數計數
  bIsOnline: boolean = false;
  nQueryCount: number = 0;

  // Tabs 分頁相關設定
  aTabsList: string[] = ['總覽', '列表', '看板', '行事曆', '檔案'];
  sCurrentTab: string = '列表';

  // 內部已勾選的商品暫存
  aSelectedLowStock: Product[] = [];
  aSelectedSufficient: Product[] = [];

  // 上架日期篩選變數 (符合匈牙利命名法與繁體中文註解)
  aDateFilterOptions: SelectOption[] = [
    { sValue: 'all', sLabel: '全部時間' },
    { sValue: 'today', sLabel: '今日上架' },
    { sValue: 'week', sLabel: '本週上架' },
    { sValue: 'month', sLabel: '本月上架' }
  ];
  sDateFilterValue: string = 'all';

  // 商品分類篩選變數
  aCategoryFilterOptions: SelectOption[] = [
    { sValue: 'all', sLabel: '全部分類' },
    { sValue: 'coffee', sLabel: '精品咖啡' },
    { sValue: 'utensils', sLabel: '生活器具' },
    { sValue: 'apparel', sLabel: '流行服飾' },
    { sValue: 'accessories', sLabel: '質感配件' }
  ];
  sCategoryFilterValue: string = 'all';

  // 全域排序變數 (與表格排序狀態雙向同步)
  aSortOptions: SelectOption[] = [
    { sValue: 'none', sLabel: '預設排序' },
    { sValue: 'id_asc', sLabel: '商品編號-由小到大' },
    { sValue: 'id_desc', sLabel: '商品編號-由大到小' },
    { sValue: 'price_asc', sLabel: '價格-由低到高' },
    { sValue: 'price_desc', sLabel: '價格-由高到低' },
    { sValue: 'stock_asc', sLabel: '庫存-由少到多' },
    { sValue: 'stock_desc', sLabel: '庫存-由多到少' }
  ];
  sCurrentSortValue: string = 'none';

  // 伺服器端分頁與外部排序狀態
  sSortKeyLowStock: string | null = null;
  sSortOrderLowStock: 'asc' | 'desc' | null = null;
  sSortKeySufficient: string | null = null;
  sSortOrderSufficient: 'asc' | 'desc' | null = null;
  nPageIndexLowStock: number = 1;
  nPageIndexSufficient: number = 1;
  nPageSize: number = 10;
  nTotalLowStock: number = 0;
  nTotalSufficient: number = 0;



  // RxJS Stream 用於搜尋防抖 (Debounce)
  private oSearchSubject = new Subject<string>();
  private oSubSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private apiClient: ApiClientService
  ) {}

  ngOnInit() {
    // 從記憶體狀態載入已登入的使用者資訊與其所屬商家 ID
    this.sUserName = this.authService.sUserName;
    const sRoleName = this.authService.sUserRole;
    // 將英文的角色轉換為符合中文要求的顯示標籤
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

    // 分別載入兩個區域商品資料
    this.fnLoadProducts('lowStock');
    this.fnLoadProducts('sufficient');

    // 實作 RxJS 防抖查詢，避免使用者每打一個字就發起一次查詢
    this.oSubSubscription = this.oSearchSubject.pipe(
      debounceTime(300),          // 防抖 300 毫秒
      distinctUntilChanged()      // 僅當內容改變時才觸發
    ).subscribe(sVal => {
      // 搜尋條件變更時重設頁碼
      this.nPageIndexLowStock = 1;
      this.nPageIndexSufficient = 1;
      this.fnLoadProducts('lowStock');
      this.fnLoadProducts('sufficient');
      this.nQueryCount++;
    });
  }

  ngOnDestroy() {
    this.oSubSubscription?.unsubscribe();
  }

  // 載入特定的商品資料 (伺服器端模式，支援分頁與排序)
  fnLoadProducts(sType: 'lowStock' | 'sufficient') {
    const sMerchantId = this.sCurrentMerchant;
    const nPage = sType === 'lowStock' ? this.nPageIndexLowStock : this.nPageIndexSufficient;
    const sSortKey = sType === 'lowStock' ? this.sSortKeyLowStock : this.sSortKeySufficient;
    const sSortOrder = sType === 'lowStock' ? this.sSortOrderLowStock : this.sSortOrderSufficient;
    
    let oParams: any = {
      stockStatus: sType,
      page: nPage.toString(),
      pageSize: this.nPageSize.toString()
    };
    
    if (sSortKey && sSortOrder) {
      oParams.sortBy = sSortKey;
      oParams.sortOrder = sSortOrder;
    }
    
    if (this.sSearchQuery.trim()) {
      oParams.search = this.sSearchQuery.trim();
    }

    const oHeaders = { 'X-Merchant-Id': sMerchantId };

    this.apiClient.get<any>('/api/products/admin', { headers: oHeaders, params: oParams })
      .subscribe({
        next: (oResponse) => {
          this.bIsOnline = true;

          // 格式化圖片路徑 (繁體中文註解：將以 / 開頭的相對圖片路徑拼接為完整的 API 伺服器絕對網址)
          const fnFormatImageUrl = (oProd: any) => {
            let sImg = oProd.imageUrl;
            if (sImg && sImg.startsWith('/')) {
              sImg = `${environment.apiUrl}${sImg}`;
            }
            return { ...oProd, imageUrl: sImg };
          };

          // 支援 ApiResponse 統一回傳格式與舊版格式
          const oPayload = (oResponse && oResponse.success === true && oResponse.data !== undefined) ? oResponse.data : oResponse;

          // 防禦性檢查：若後端 API 支援包含 items 與 total 的分頁 JSON 物件
          if (oPayload && oPayload.items !== undefined && oPayload.total !== undefined) {
            if (sType === 'lowStock') {
              this.lowStockProducts = oPayload.items.map((oItem: any) => ({ ...fnFormatImageUrl(oItem), selected: false }));
              this.nTotalLowStock = oPayload.total;
            } else {
              this.sufficientProducts = oPayload.items.map((oItem: any) => ({ ...fnFormatImageUrl(oItem), selected: false }));
              this.nTotalSufficient = oPayload.total;
            }
          } else if (Array.isArray(oPayload)) {
            // 後端尚未改造，回傳完整商品陣列，則由前端代理處理分頁排序
            const aFormatted = oPayload.map((oItem: any) => fnFormatImageUrl(oItem));
            this.fnProcessClientPagedData(sType, aFormatted);
          }
        },
        error: (oErr) => {
          console.warn(`後端 Products API (${sType}) 載入失敗，啟用本地 Mock 模擬分頁與排序`, oErr);
          this.bIsOnline = false;
          const mockData = MOCK_PRODUCTS[this.sCurrentMerchant] || [];
          this.fnProcessClientPagedData(sType, mockData);
        }
      });
  }

  // 前端代理處理分頁與排序 (Mock/Fallback 或是舊版 API 相容)
  fnProcessClientPagedData(sType: 'lowStock' | 'sufficient', aFullData: Product[]) {
    // 1. 篩選低庫存或充足庫存商品
    let aFiltered = sType === 'lowStock'
      ? aFullData.filter(p => p.stock <= 50)
      : aFullData.filter(p => p.stock > 50);

    // 2. 關鍵字搜尋過濾
    if (this.sSearchQuery.trim()) {
      const sQuery = this.sSearchQuery.toLowerCase().trim();
      aFiltered = aFiltered.filter(p => p.name.toLowerCase().includes(sQuery));
    }

    // 3. 商品分類過濾 (符合匈牙利命名法與繁體中文註解)
    if (this.sCategoryFilterValue !== 'all') {
      const sTargetCategoryName = this.fnGetCategoryLabelByValue(this.sCategoryFilterValue);
      aFiltered = aFiltered.filter(p => p.categoryName === sTargetCategoryName);
    }

    // 4. 上架日期過濾 (模擬過濾效果以供展示)
    if (this.sDateFilterValue !== 'all') {
      if (this.sDateFilterValue === 'today') {
        // 模擬今日上架 (ID 為 1, 3 的商品)
        aFiltered = aFiltered.filter(p => p.id === 1 || p.id === 3);
      } else if (this.sDateFilterValue === 'week') {
        // 模擬本週上架 (ID 小於等於 4 的商品)
        aFiltered = aFiltered.filter(p => p.id <= 4);
      }
      // 本月上架則顯示全部符合商家之商品
    }

    // 5. 排序
    const sSortKey = sType === 'lowStock' ? this.sSortKeyLowStock : this.sSortKeySufficient;
    const sSortOrder = sType === 'lowStock' ? this.sSortOrderLowStock : this.sSortOrderSufficient;

    if (sSortKey && sSortOrder) {
      aFiltered.sort((oA, oB) => {
        let valA = (oA as any)[sSortKey];
        let valB = (oB as any)[sSortKey];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        // 數字型別比較
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sSortOrder === 'asc' ? valA - valB : valB - valA;
        }

        // 字串型別比較
        const sValA = valA.toString().toLowerCase();
        const sValB = valB.toString().toLowerCase();

        if (sValA < sValB) return sSortOrder === 'asc' ? -1 : 1;
        if (sValA > sValB) return sSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 6. 前端切片分頁 (Page 1-indexed)
    const nPage = sType === 'lowStock' ? this.nPageIndexLowStock : this.nPageIndexSufficient;
    const nStart = (nPage - 1) * this.nPageSize;
    const nEnd = nStart + this.nPageSize;
    const aPaged = aFiltered.slice(nStart, nEnd);

    if (sType === 'lowStock') {
      this.lowStockProducts = aPaged.map(p => ({ ...p, selected: false }));
      this.nTotalLowStock = aFiltered.length;
    } else {
      this.sufficientProducts = aPaged.map(p => ({ ...p, selected: false }));
      this.nTotalSufficient = aFiltered.length;
    }
  }

  // 當 Layout 元件回報商家變更時
  fnOnMerchantChange(sMerchant: string) {
    this.sCurrentMerchant = sMerchant;
    this.sSearchQuery = '';
    this.nPageIndexLowStock = 1;
    this.nPageIndexSufficient = 1;
    this.fnLoadProducts('lowStock');
    this.fnLoadProducts('sufficient');
  }

  // 當 Layout 元件回報搜尋關鍵字改變時
  fnOnSearchQueryChange(sQuery: string) {
    this.sSearchQuery = sQuery;
    this.oSearchSubject.next(sQuery);
  }

  // 當分頁籤切換時
  fnOnTabChange(sTab: string) {
    this.sCurrentTab = sTab;
    console.log(`[分頁切換] 當前分頁已切換至: ${sTab}`);
  }

  // 處理列表回報排序狀態變更 (表格點擊排序時，反向同步全域排序下拉選單)
  fnOnSortChange(sType: 'lowStock' | 'sufficient', event: { sKey: string | null, sOrder: 'asc' | 'desc' | null }) {
    if (sType === 'lowStock') {
      this.sSortKeyLowStock = event.sKey;
      this.sSortOrderLowStock = event.sOrder;
      this.nPageIndexLowStock = 1; // 排序變更時重設回第一頁
    } else {
      this.sSortKeySufficient = event.sKey;
      this.sSortOrderSufficient = event.sOrder;
      this.nPageIndexSufficient = 1;
    }

    // 列表點擊排序時同步全域排序下拉選單選中文字 (符合雙向同步要求，繁體中文註解)
    if (event.sKey && event.sOrder) {
      this.sCurrentSortValue = `${event.sKey}_${event.sOrder}`;
    } else {
      this.sCurrentSortValue = 'none';
    }

    this.fnLoadProducts(sType);
  }

  // 處理全域排序下拉選單變更，並同步套用至兩個表格的排序設定 (符合雙向同步要求)
  fnOnGlobalSortChange(sSortVal: string) {
    this.sCurrentSortValue = sSortVal;
    if (sSortVal === 'none') {
      this.sSortKeyLowStock = null;
      this.sSortOrderLowStock = null;
      this.sSortKeySufficient = null;
      this.sSortOrderSufficient = null;
    } else {
      const aParts = sSortVal.split('_');
      const sKey = aParts[0];
      const sOrder = aParts[1] as 'asc' | 'desc';

      this.sSortKeyLowStock = sKey;
      this.sSortOrderLowStock = sOrder;
      this.sSortKeySufficient = sKey;
      this.sSortOrderSufficient = sOrder;
    }

    this.nPageIndexLowStock = 1;
    this.nPageIndexSufficient = 1;
    this.fnLoadProducts('lowStock');
    this.fnLoadProducts('sufficient');
  }

  // 處理分類篩選變更並重新載入列表
  fnOnCategoryFilterChange(sVal: string) {
    this.sCategoryFilterValue = sVal;
    this.nPageIndexLowStock = 1;
    this.nPageIndexSufficient = 1;
    this.fnLoadProducts('lowStock');
    this.fnLoadProducts('sufficient');
  }

  // 處理日期篩選變更並重新載入列表
  fnOnDateFilterChange(sVal: string) {
    this.sDateFilterValue = sVal;
    this.nPageIndexLowStock = 1;
    this.nPageIndexSufficient = 1;
    this.fnLoadProducts('lowStock');
    this.fnLoadProducts('sufficient');
  }

  // 分類 Value 對應 Label 反查輔助方法 (符合繁體中文註解與匈牙利命名法)
  fnGetCategoryLabelByValue(sVal: string): string {
    switch (sVal) {
      case 'coffee': return '精品咖啡';
      case 'utensils': return '生活器具';
      case 'apparel': return '流行服飾';
      case 'accessories': return '質感配件';
      default: return '';
    }
  }

  // 處理列表回報頁碼變更
  fnOnPageChange(sType: 'lowStock' | 'sufficient', nPage: number) {
    if (sType === 'lowStock') {
      this.nPageIndexLowStock = nPage;
    } else {
      this.nPageIndexSufficient = nPage;
    }
    this.fnLoadProducts(sType);
  }

  // 當表格回報商品選取狀態改變時
  fnOnSelectionChange(sType: 'lowStock' | 'sufficient', aSelectedProducts: Product[]) {
    if (sType === 'lowStock') {
      this.aSelectedLowStock = aSelectedProducts;
    } else {
      this.aSelectedSufficient = aSelectedProducts;
    }
  }

  // 登出系統
  fnOnLogout() {
    this.authService.fnLogout();
    this.router.navigate(['/login']);
  }

  // 功能性 alerts/PoC 示範
  fnAddProductAlert() {
    if (this.fnHasPermission('Product.Create')) {
      alert(`[新增商品動作]\n權限驗證成功！您目前已通過「Product.Create」權限檢驗。\n在正式環境下，系統會將此操作附帶您的 JWT 權杖安全地發送至後端進行跨租戶商家驗證。`);
    } else {
      alert(`[權限不足]\n您的帳號不具備「Product.Create」功能權限，無法執行新增商品動作。`);
    }
  }

  fnEditAlert(product: Product) {
    if (this.fnHasPermission('Product.Edit')) {
      alert(`[編輯商品動作]\n權限驗證成功！您目前已通過「Product.Edit」權限檢驗。\n即將編輯: ${product.name}\n後端接收到請求後，會透過 JWT Claim 進行商家安全校驗。`);
    } else {
      alert(`[權限不足]\n您的帳號不具備「Product.Edit」功能權限，無法編輯此商品。`);
    }
  }

  fnDeleteAlert(product: Product) {
    if (this.fnHasPermission('Product.Delete')) {
      alert(`[刪除商品動作]\n權限驗證成功！您目前已通過「Product.Delete」權限檢驗。\n即將刪除: ${product.name}\n將使用 HTTP DELETE api/products/${product.id}`);
    } else {
      alert(`[權限不足]\n您的帳號不具備「Product.Delete」功能權限，無法刪除此商品。`);
    }
  }

  // 判斷當前使用者是否具備特定功能權限代號
  fnHasPermission(sCode: string): boolean {
    return this.authService.fnHasPermission(sCode);
  }

  // 格式化商品 ID 為四位數，如 #PROD-0001
  fnPadProductId(nId: number): string {
    return nId.toString().padStart(4, '0');
  }

  // 處理商品分類變更 (由分類看板拖曳觸發，繁體中文註解)
  fnOnProductCategoryChange(event: { oProduct: Product; nNewCategoryId: number; sNewCategoryName: string }) {
    const { oProduct, nNewCategoryId, sNewCategoryName } = event;
    console.log(`[看板分類變更] 商品 ID: ${oProduct.id}, 新分類 ID: ${nNewCategoryId}, 新分類名稱: ${sNewCategoryName}`);

    if (this.bIsOnline) {
      // 若後端 API 在線，呼叫 API 持久化更新商品的 CategoryId 欄位
      const oDto = {
        name: oProduct.name,
        description: oProduct.description,
        price: oProduct.price,
        stock: oProduct.stock,
        imageUrl: oProduct.imageUrl,
        categoryId: nNewCategoryId
      };

      const oHeaders = { 'X-Merchant-Id': this.sCurrentMerchant };
      this.apiClient.put<any>(`/api/products/${oProduct.id}`, oDto, { headers: oHeaders })
        .subscribe({
          next: (oRes) => {
            console.log('後端商品分類更新成功', oRes);
            this.fnLoadProducts('lowStock');
            this.fnLoadProducts('sufficient');
          },
          error: (oErr) => {
            console.error('後端商品分類更新失敗，改用本地更新', oErr);
            this.fnUpdateLocalProductCategory(oProduct.id, nNewCategoryId, sNewCategoryName, oProduct.stock, oProduct.price);
          }
        });
    } else {
      // 若離線展示狀態，直接修改 Mock 資料
      this.fnUpdateLocalProductCategory(oProduct.id, nNewCategoryId, sNewCategoryName, oProduct.stock, oProduct.price);
    }
  }

  // 本地更新 Mock 資料與記憶體狀態
  fnUpdateLocalProductCategory(nProdId: number, nNewCategoryId: number, sNewCategoryName: string, nStock: number, nPrice: number) {
    const aMerchantList = MOCK_PRODUCTS[this.sCurrentMerchant] || [];
    const oLocalProd = aMerchantList.find(p => p.id === nProdId);
    if (oLocalProd) {
      oLocalProd.categoryId = nNewCategoryId;
      oLocalProd.categoryName = sNewCategoryName;
      oLocalProd.stock = nStock;
      oLocalProd.price = nPrice;
    }

    this.fnLoadProducts('lowStock');
    this.fnLoadProducts('sufficient');
  }

  // 處理分類名稱原地變更 (繁體中文註解)
  fnOnColumnNameChange(event: { nCategoryId: number; sNewName: string }) {
    const { nCategoryId, sNewName } = event;
    console.log(`[分類名稱變更] 分類 ID: ${nCategoryId}, 新名稱: ${sNewName}`);
    
    // 更新本地模擬快取的所有對應分類名稱
    const aMerchantList = MOCK_PRODUCTS[this.sCurrentMerchant] || [];
    aMerchantList.forEach(p => {
      if (p.categoryId === nCategoryId) {
        p.categoryName = sNewName;
      }
    });

    // 重新載入，同步列表和看板資料層
    this.fnLoadProducts('lowStock');
    this.fnLoadProducts('sufficient');
  }

  // 處理在特定直欄下方點選新增商品的入口 (繁體中文註解)
  fnOnAddProductToCategory(event: { nCategoryId: number; sCategoryName: string }) {
    const { nCategoryId, sCategoryName } = event;
    if (this.fnHasPermission('Product.Create')) {
      alert(`[新增商品動作]\n您正在分類【${sCategoryName}】 (ID: ${nCategoryId}) 下新增商品！\n在正式環境中，這將會打開一個帶有預填分類的表單視窗。`);
    } else {
      alert(`[權限不足]\n您的帳號不具備「Product.Create」功能權限，無法執行新增商品動作。`);
    }
  }
}
