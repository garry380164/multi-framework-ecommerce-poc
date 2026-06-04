import { Component, Input, Output, EventEmitter, TemplateRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAlertTriangle, 
  LucideCheckCircle, 
  LucidePlus, 
  LucidePencil, 
  LucideTrash2, 
  LucideMoreHorizontal,
  LucideEye
} from '@lucide/angular';

// 定義列表欄位規格介面
export interface TableColumn {
  sKey: string;             // 對應資料物件的屬性名稱，例如 'price' 或 'status'
  sLabel: string;           // 顯示的表頭文字
  sType?: 'text' | 'image' | 'currency' | 'badge' | 'custom' | 'actions'; // 欄位資料類型
  sClass?: string;          // 單元格樣式
  sHeaderClass?: string;    // 表頭單元格樣式
  bSortable?: boolean;      // 新增：是否支援點擊表頭排序
}

@Component({
  selector: 'app-common-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAlertTriangle,
    LucideCheckCircle,
    LucidePlus,
    LucidePencil,
    LucideTrash2,
    LucideMoreHorizontal,
    LucideEye
  ],
  template: `
    <!-- 通用表格區塊容器 -->
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <!-- 區塊標頭 (可選) -->
      <div *ngIf="sTitle || bShowHeaderBadge" class="px-6 py-3.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
          <span class="text-sm font-bold text-slate-800" *ngIf="sTitle">{{ sTitle }}</span>
          
          <!-- 狀態標籤 (如：待補貨/庫存充足) -->
          <span 
            *ngIf="bShowHeaderBadge"
            [class]="'text-xs font-bold px-2 py-0.5 rounded flex items-center space-x-1.5 ' + sHeaderBadgeClass"
          >
            <svg *ngIf="sHeaderBadgeIcon === 'alert'" lucideAlertTriangle class="w-3.5 h-3.5"></svg>
            <svg *ngIf="sHeaderBadgeIcon === 'check'" lucideCheckCircle class="w-3.5 h-3.5"></svg>
            <span>{{ sHeaderBadgeText }}</span>
          </span>

          <span class="text-xs text-slate-400 font-semibold" *ngIf="aData && aData.length > 0">
            {{ aData.length }} 筆資料
          </span>
        </div>
      </div>

      <!-- 表格內容區 -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/20 whitespace-nowrap">
              <!-- 多選核取方塊欄位 -->
              <th *ngIf="bShowSelection" class="pl-6 pr-4 py-3 w-10">
                <input 
                  type="checkbox" 
                  [(ngModel)]="bAllSelected" 
                  (change)="fnToggleAll()" 
                  class="custom-checkbox"
                />
              </th>
              
              <!-- 動態表頭欄位 -->
              <th 
                *ngFor="let col of aColumns" 
                [className]="'px-4 py-3 ' + (col.sHeaderClass || '') + (col.bSortable ? ' cursor-pointer select-none hover:bg-slate-100/60 transition' : '')"
                (click)="fnOnSort(col)"
              >
                <div class="flex items-center space-x-1.5" [class.justify-end]="col.sHeaderClass?.includes('text-right') || col.sClass?.includes('text-right')">
                  <span>{{ col.sLabel }}</span>
                  <ng-container *ngIf="col.bSortable">
                    <!-- 升冪 -->
                    <svg *ngIf="sSortKey === col.sKey && sSortOrder === 'asc'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 text-brand-primary">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                    </svg>
                    <!-- 降冪 -->
                    <svg *ngIf="sSortKey === col.sKey && sSortOrder === 'desc'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 text-brand-primary">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                    </svg>
                    <!-- 未排序 (灰上下雙向箭頭) -->
                    <svg *ngIf="sSortKey !== col.sKey" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 text-slate-300">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                    </svg>
                  </ng-container>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-600">
            <!-- 資料列渲染 -->
            <tr *ngFor="let item of aDisplayData; let idx = index" class="hover:bg-slate-50/40 transition">
              <!-- 多選核取方塊單元格 -->
              <td *ngIf="bShowSelection" class="pl-6 pr-4 py-4 w-10">
                <input 
                  type="checkbox" 
                  [(ngModel)]="item.selected" 
                  (change)="fnOnItemChange()" 
                  class="custom-checkbox"
                />
              </td>

              <!-- 動態單元格渲染 -->
              <td 
                *ngFor="let col of aColumns" 
                [className]="'px-4 py-4 ' + (col.sClass || '')"
              >
                <!-- 1. 客製化樣板優先 -->
                <ng-container *ngIf="col.sType === 'custom'; else buildInTypes">
                  <ng-container 
                    *ngTemplateOutlet="oTemplates[col.sKey]; context: { $implicit: item, index: idx }"
                  ></ng-container>
                </ng-container>

                <!-- 2. 預設內建欄位類型 -->
                <ng-template #buildInTypes>
                  <!-- 2.1 動作下拉單元格 -->
                  <div *ngIf="col.sType === 'actions'" class="relative inline-block text-left">
                    <button 
                      (click)="fnToggleMenu(item, idx, $event)" 
                      class="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600 flex items-center justify-center"
                    >
                      <svg lucideMoreHorizontal class="w-4 h-4"></svg>
                    </button>
                    <!-- 彈出操作選單 (採用 fixed 絕對定位避免表格遮擋) -->
                    <div 
                      *ngIf="nActiveMenuRowId === fnGetRowId(item, idx)" 
                      [ngStyle]="{'top.px': nMenuTop, 'left.px': nMenuLeft}" 
                      class="fixed w-24 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[9999] text-left"
                    >
                      <button 
                        *ngIf="bCanView"
                        (click)="fnOnView(item, $event)" 
                        class="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-semibold flex items-center space-x-1.5"
                      >
                        <svg lucideEye class="w-3.5 h-3.5 text-slate-500"></svg>
                        <span>詳情</span>
                      </button>
                      <button 
                        *ngIf="bCanEdit"
                        (click)="fnOnEdit(item, $event)" 
                        class="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-semibold flex items-center space-x-1.5"
                      >
                        <svg lucidePencil class="w-3.5 h-3.5 text-indigo-500"></svg>
                        <span>編輯</span>
                      </button>
                      <button 
                        *ngIf="bCanDelete"
                        (click)="fnOnDelete(item, $event)" 
                        class="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center space-x-1.5"
                      >
                        <svg lucideTrash2 class="w-3.5 h-3.5 text-rose-500"></svg>
                        <span>刪除</span>
                      </button>
                    </div>
                  </div>

                  <!-- 2.2 圖片單元格 -->
                  <img 
                    *ngIf="col.sType === 'image'" 
                    [src]="item[col.sKey]" 
                    class="w-10 h-10 object-cover rounded-lg border border-slate-150" 
                    [alt]="item[col.sKey]"
                  />

                  <!-- 2.3 貨幣單元格 -->
                  <span *ngIf="col.sType === 'currency'" class="font-mono font-bold text-slate-600">
                    \${{ item[col.sKey] | number:'1.0-2' }}
                  </span>

                  <!-- 2.4 純文字單元格 (預設) -->
                  <span *ngIf="!col.sType || col.sType === 'text'">
                    {{ item[col.sKey] }}
                  </span>
                </ng-template>
              </td>
            </tr>

            <!-- 空白資料顯示 -->
            <tr *ngIf="!aData || aData.length === 0">
              <td [attr.colspan]="aColumns.length + (bShowSelection ? 1 : 0)" class="px-6 py-8 text-center text-xs font-semibold text-slate-400">
                目前沒有資料。
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 表格底部新增按鈕 -->
      <div 
        *ngIf="bCanCreate"
        (click)="fnOnCreate()"
        class="px-6 py-3 border-t border-slate-100 bg-white hover:bg-slate-50/50 cursor-pointer transition flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
      >
        <svg lucidePlus class="w-3.5 h-3.5"></svg>
        <span>{{ sCreateText }}</span>
      </div>

      <!-- 伺服器端分頁控制區 -->
      <div 
        *ngIf="bServerSide && nTotalItems > 0" 
        class="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500"
      >
        <div class="flex items-center space-x-1">
          <span>顯示第 {{ (nPageIndex - 1) * nPageSize + 1 }} 至 {{ fnMin(nPageIndex * nPageSize, nTotalItems) }} 筆，共 {{ nTotalItems }} 筆</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <!-- 上一頁 -->
          <button 
            [disabled]="nPageIndex === 1" 
            (click)="fnOnPageChange(nPageIndex - 1)" 
            class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition font-semibold shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            上一頁
          </button>
          <!-- 頁碼指示 -->
          <span class="px-2 font-bold text-slate-700">頁次 {{ nPageIndex }} / {{ fnGetTotalPages() }}</span>
          <!-- 下一頁 -->
          <button 
            [disabled]="nPageIndex >= fnGetTotalPages()" 
            (click)="fnOnPageChange(nPageIndex + 1)" 
            class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition font-semibold shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            下一頁
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CommonTableComponent {
  // 元件配置屬性
  @Input() sTitle: string = '';
  @Input() aColumns: TableColumn[] = [];
  @Input() aData: any[] = [];
  @Input() bShowSelection: boolean = false;
  
  // 標頭狀態標籤設定
  @Input() bShowHeaderBadge: boolean = false;
  @Input() sHeaderBadgeText: string = '';
  @Input() sHeaderBadgeClass: string = 'bg-[#F5F6FF] text-[#4F46E5] border border-[#E0E7FF]';
  @Input() sHeaderBadgeIcon?: 'alert' | 'check';

  // 權限與操作項目
  @Input() bCanCreate: boolean = false;
  @Input() sCreateText: string = '新增項目';
  @Input() bCanEdit: boolean = false;
  @Input() bCanDelete: boolean = false;
  @Input() bCanView: boolean = false;

  // 客製化樣板對照
  @Input() oTemplates: Record<string, TemplateRef<any>> = {};

  // 伺服器端分頁與外部排序參數
  @Input() bServerSide: boolean = false; // 是否啟用伺服器端排序與分頁
  @Input() nTotalItems: number = 0;      // 伺服器端總資料筆數
  @Input() nPageSize: number = 10;       // 每頁資料筆數
  @Input() nPageIndex: number = 1;       // 當前頁碼 (1-indexed)
  @Input() sExternalSortKey: string | null = null;
  @Input() sExternalSortOrder: 'asc' | 'desc' | null = null;

  // 事件輸出
  @Output() sortChange = new EventEmitter<{ sKey: string | null, sOrder: 'asc' | 'desc' | null }>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() createClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<any>();
  @Output() deleteClick = new EventEmitter<any>();
  @Output() viewClick = new EventEmitter<any>();

  // 內部選取狀態與排序狀態
  bAllSelected: boolean = false;
  nActiveMenuRowId: any = null;
  nMenuTop: number = 0;
  nMenuLeft: number = 0;
  
  // 排序狀態與展示陣列
  sSortKey: string | null = null;
  sSortOrder: 'asc' | 'desc' | null = null;
  aDisplayData: any[] = [];

  // 監聽點擊整個 document 以便在點選其他地方時關閉操作選單
  @HostListener('document:click', ['$event'])
  fnOnDocumentClick(event: MouseEvent) {
    this.nActiveMenuRowId = null;
  }

  // 監聽滾動或調整視窗大小時關閉選單，避免定位跑掉
  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  fnOnScrollOrResize() {
    this.nActiveMenuRowId = null;
  }

  // 獲取該列的唯一識別代號 (若無 id 欄位則回傳 index)
  fnGetRowId(oItem: any, nIndex: number): any {
    if (oItem.id !== undefined) return oItem.id;
    if (oItem.Id !== undefined) return oItem.Id;
    return nIndex;
  }

  // 點選全選/全取消
  fnToggleAll() {
    if (this.aDisplayData) {
      this.aDisplayData.forEach(item => item.selected = this.bAllSelected);
    }
    this.fnEmitSelectionChange();
  }

  // 點選單一項目
  fnOnItemChange() {
    this.bAllSelected = this.aDisplayData && this.aDisplayData.length > 0 && this.aDisplayData.every(item => item.selected);
    this.fnEmitSelectionChange();
  }

  // 發送選取變動事件
  fnEmitSelectionChange() {
    const aSelected = this.aDisplayData ? this.aDisplayData.filter(item => item.selected) : [];
    this.selectionChange.emit(aSelected);
  }

  // 切換操作選單開啟/關閉狀態
  fnToggleMenu(oItem: any, nIndex: number, event: MouseEvent) {
    event.stopPropagation();
    const rowId = this.fnGetRowId(oItem, nIndex);
    if (this.nActiveMenuRowId === rowId) {
      this.nActiveMenuRowId = null;
    } else {
      this.nActiveMenuRowId = rowId;
      const elButton = event.currentTarget as HTMLElement;
      if (elButton) {
        const rect = elButton.getBoundingClientRect();
        this.nMenuTop = rect.bottom;
        this.nMenuLeft = rect.right - 96; // 彈出選單裝度約為 w-24 (96px)
      }
    }
  }

  // 點擊新增按鈕
  fnOnCreate() {
    this.createClick.emit();
  }

  // 點擊編輯
  fnOnEdit(oItem: any, event: MouseEvent) {
    event.stopPropagation();
    this.nActiveMenuRowId = null;
    this.editClick.emit(oItem);
  }

  // 點擊刪除
  fnOnDelete(oItem: any, event: MouseEvent) {
    event.stopPropagation();
    this.nActiveMenuRowId = null;
    this.deleteClick.emit(oItem);
  }

  // 點擊查看詳情
  fnOnView(oItem: any, event: MouseEvent) {
    event.stopPropagation();
    this.nActiveMenuRowId = null;
    this.viewClick.emit(oItem);
  }

  // 處理表頭點擊排序
  fnOnSort(col: TableColumn) {
    if (!col.bSortable) return;

    if (this.sSortKey === col.sKey) {
      // 循環切換排序方向: asc -> desc -> null
      if (this.sSortOrder === 'asc') {
        this.sSortOrder = 'desc';
      } else if (this.sSortOrder === 'desc') {
        this.sSortOrder = null;
        this.sSortKey = null;
      } else {
        this.sSortOrder = 'asc';
      }
    } else {
      this.sSortKey = col.sKey;
      this.sSortOrder = 'asc';
    }

    if (this.bServerSide) {
      // 伺服器端排序模式：僅發送事件，不於內部對 aData 進行 sort 異動
      this.sortChange.emit({ sKey: this.sSortKey, sOrder: this.sSortOrder });
    } else {
      // 客戶端排序模式：在本地對 aData 進行排序
      this.fnApplySortAndFilter();
    }
  }

  // 執行資料排序與淺拷貝
  fnApplySortAndFilter() {
    if (!this.aData) {
      this.aDisplayData = [];
      return;
    }

    // 伺服器端分頁：資料已經由後端完成排序與分頁，直接拷貝即可
    if (this.bServerSide) {
      this.aDisplayData = [...this.aData];
      return;
    }

    let aResult = [...this.aData];

    if (this.sSortKey && this.sSortOrder) {
      const sKey = this.sSortKey;
      const sOrder = this.sSortOrder;

      aResult.sort((oA, oB) => {
        let valA = oA[sKey];
        let valB = oB[sKey];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        // 數字型別比較
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sOrder === 'asc' ? valA - valB : valB - valA;
        }

        // 字串型別比較
        const sValA = valA.toString().toLowerCase();
        const sValB = valB.toString().toLowerCase();

        if (sValA < sValB) return sOrder === 'asc' ? -1 : 1;
        if (sValA > sValB) return sOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.aDisplayData = aResult;
  }

  // 點選換頁
  fnOnPageChange(nPage: number) {
    if (nPage < 1 || nPage > this.fnGetTotalPages()) return;
    this.pageChange.emit(nPage);
  }

  // 獲取總頁數
  fnGetTotalPages(): number {
    if (this.nTotalItems <= 0) return 1;
    return Math.ceil(this.nTotalItems / this.nPageSize);
  }

  // 取最小值輔助函式
  fnMin(nA: number, nB: number): number {
    return Math.min(nA, nB);
  }

  // 當外部資料變更時，重新套用排序並檢查同步全選狀態
  ngOnChanges() {
    if (this.bServerSide) {
      this.sSortKey = this.sExternalSortKey;
      this.sSortOrder = this.sExternalSortOrder;
    }
    this.fnApplySortAndFilter();
    this.bAllSelected = this.aDisplayData && this.aDisplayData.length > 0 && this.aDisplayData.every(item => item.selected);
  }
}
