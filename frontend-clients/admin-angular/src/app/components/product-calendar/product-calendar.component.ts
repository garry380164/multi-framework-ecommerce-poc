import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideChevronLeft, 
  LucideChevronRight, 
  LucidePlus, 
  LucideUser, 
  LucideFileText, 
  LucideTag, 
  LucideBell, 
  LucideTrash2,
  LucideMoreHorizontal,
  LucideChevronDown
} from '@lucide/angular';
import { MultiSelectDropdownComponent, DropdownOption } from '../multi-select-dropdown/multi-select-dropdown.component';
import { SingleSelectDropdownComponent, SelectOption } from '../single-select-dropdown/single-select-dropdown.component';

// 行程資料結構介面
export interface CalendarEvent {
  id: number;
  sTitle: string;
  dateStart: Date;
  dateEnd: Date;
  bIsAllDay: boolean;
  sColor: string; // 'gray' | 'blue' | 'red' | 'green' | 'amber' 
  sDescription?: string;
  sNotification?: string;
  bSaveAsMemo?: boolean;
  bIsStockIn?: boolean;
  bIsStockOrder?: boolean;
  aAssociatedProductIds?: number[];
}

// 日曆單格資料結構介面
export interface DayGridCell {
  nDay: number;
  date: Date;
  bIsCurrentMonth: boolean;
  bIsToday: boolean;
  bIsSunday: boolean;
  bIsSaturday: boolean;
  aEvents: CalendarEvent[];
}

@Component({
  selector: 'app-product-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideChevronLeft,
    LucideChevronRight,
    LucidePlus,
    LucideUser,
    LucideFileText,
    LucideTag,
    LucideBell,
    LucideTrash2,
    LucideMoreHorizontal,
    LucideChevronDown,
    MultiSelectDropdownComponent,
    SingleSelectDropdownComponent
  ],
  template: `
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden flex h-[800px]">
      
      <!-- 左側：行事曆主網格 (當右側隱藏時，自動滿版 100% 寬度) -->
      <div class="flex-1 flex flex-col min-w-0">
        
        <!-- 頂部導覽控制列 (符合後台扁平簡潔風格，移除 TimeTree Logo) -->
        <header class="h-14 border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 bg-white">
          <div class="flex items-center space-x-4">
            <!-- 簡潔無 Logo 標題 -->
            <div class="flex items-center space-x-2 select-none">
              <span class="text-slate-800 font-bold tracking-tight text-base font-title">
                商品行程排程
              </span>
            </div>
            <!-- 今天按鈕 -->
            <button 
              (click)="fnGoToday()"
              class="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition"
            >
              今天
            </button>
            <!-- 左右切換月份 -->
            <div class="flex items-center border border-slate-300 rounded overflow-hidden">
              <button (click)="fnPrevMonth()" class="p-1.5 hover:bg-slate-50 text-slate-600 transition border-r border-slate-300">
                <svg lucideChevronLeft class="w-3.5 h-3.5"></svg>
              </button>
              <button (click)="fnNextMonth()" class="p-1.5 hover:bg-slate-50 text-slate-600 transition">
                <svg lucideChevronRight class="w-3.5 h-3.5"></svg>
              </button>
            </div>
            <!-- 年月份標題 (繁體中文格式) -->
            <span class="font-title font-medium text-slate-800 text-base tracking-tight ml-2">
              {{ sCurrentMonthYearLabel }}
            </span>
          </div>

          <!-- 右側新增行程按鈕 -->
          <div class="flex items-center space-x-3">
            <button 
              (click)="fnStartNewEvent()" 
              class="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
            >
              <svg lucidePlus class="w-3.5 h-3.5"></svg>
              <span>新增行程</span>
            </button>
          </div>
        </header>

        <!-- 繁體中文星期名稱標頭 -->
        <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50 text-center h-8 items-center text-xs font-bold tracking-wider text-slate-500 flex-shrink-0">
          <span class="text-rose-500">日</span>
          <span>一</span>
          <span>二</span>
          <span>三</span>
          <span>四</span>
          <span>五</span>
          <span class="text-indigo-500">六</span>
        </div>

        <!-- 42 格日曆網格 -->
        <div class="grid grid-cols-7 grid-rows-6 flex-1 bg-slate-200 gap-[1px]">
          <div 
            *ngFor="let cell of aMonthDays"
            (click)="fnOnDateClick(cell.date)"
            class="bg-white py-1 flex flex-col min-h-0 min-w-0 transition-colors duration-150 cursor-pointer hover:bg-slate-50/50 relative"
            [ngClass]="{ 'bg-slate-50/30': !cell.bIsCurrentMonth }"
          >
            <!-- 日期數字列 (高度調為 h-8 以便大圓圈舒適置中) -->
            <div class="flex justify-center py-1 items-center flex-shrink-0">
              <!-- 今日主題色圓圈高亮標記 (更醒目且符合後台主題色) -->
              <span 
                *ngIf="cell.bIsToday"
                class="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-extrabold select-none font-mono shadow-sm"
              >
                {{ cell.nDay }}
              </span>
              <!-- 普通日期顏色 -->
              <span 
                *ngIf="!cell.bIsToday"
                class="text-xs font-semibold select-none font-mono"
                [ngClass]="{
                  'text-slate-300': !cell.bIsCurrentMonth,
                  'text-rose-500': cell.bIsCurrentMonth && cell.bIsSunday,
                  'text-indigo-500': cell.bIsCurrentMonth && cell.bIsSaturday,
                  'text-slate-700': cell.bIsCurrentMonth && !cell.bIsSunday && !cell.bIsSaturday
                }"
              >
                {{ cell.nDay }}
              </span>
            </div>

            <!-- 行程條容器 (直向排列，移除 overflow-y-auto 以防水平剪裁，使跨日行程條能跨越網格線完美覆蓋) -->
            <div class="flex-1 space-y-1 mt-1">
              <div 
                *ngFor="let event of cell.aEvents.slice(0, 2)"
                (click)="fnOnEventClick(event, $event)"
                (mouseenter)="fnOnEventMouseEnter(event)"
                (mouseleave)="fnOnEventMouseLeave()"
                class="px-2 py-0.5 rounded text-xs font-semibold truncate select-none shadow-xs border transition-all duration-100 cursor-pointer"
                [class.scale-[1.02]]="event.id === nHoveredEventId"
                [class.brightness-95]="event.id === nHoveredEventId"
                [ngClass]="fnGetEventStyleClasses(event, cell)"
                [title]="event.sTitle"
              >
                {{ fnShouldShowEventTitle(event, cell) ? event.sTitle : '\u00A0' }}
              </div>

              <!-- 超過兩個行程時，顯示省略 icon 指標 (點擊則顯示第三個行程詳細內容) -->
              <div 
                *ngIf="cell.aEvents.length > 2" 
                class="mx-1 py-0.5 border border-slate-200 bg-slate-50 text-slate-400 rounded text-center select-none flex items-center justify-center mt-1 cursor-pointer hover:bg-slate-100 transition duration-150"
                (click)="fnOnEllipsisClick(cell, $event)"
                [title]="'還有 ' + (cell.aEvents.length - 2) + ' 項行程，點擊查看更多'"
              >
                <svg lucideMoreHorizontal class="w-4 h-4"></svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- 右側：行程編輯與新增面板 (30% 寬度，動態顯示) -->
      <div 
        *ngIf="bShowEditPanel"
        class="w-80 bg-white border-l border-slate-200 p-6 flex flex-col justify-between flex-shrink-0 h-full overflow-y-auto"
      >
        <div class="space-y-6">
          <!-- 當日行程切換下拉選單 (使用專案自訂的單選下拉選單 UI 元件，繁體中文註解) -->
          <div *ngIf="oSelectedEvent !== null && aSelectedDayEvents.length > 1" class="space-y-1.5 border-b border-slate-200 pb-4">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">切換當日行程</span>
            <app-single-select-dropdown
              [aOptions]="aSelectedDayEventOptions"
              [sValue]="oSelectedEvent.id.toString()"
              (sValueChange)="fnSelectEventById($event)"
              sPlaceholder="選擇行程"
              class="w-full block"
              sPanelClass="min-w-[200px]"
            ></app-single-select-dropdown>
          </div>

          <!-- 標題編輯區 -->
          <div class="border-b border-slate-200 pb-2">
            <span *ngIf="oSelectedEvent !== null && aSelectedDayEvents.length > 1" class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">行程主題名稱</span>
            <input 
              type="text" 
              [(ngModel)]="sEditTitle"
              placeholder="請輸入行程主題" 
              class="w-full text-base font-semibold text-slate-800 focus:outline-none placeholder-slate-350"
            />
          </div>

          <!-- 日期設定區 -->
          <div class="space-y-4 text-xs font-semibold text-slate-600">
            <!-- 開始時間 -->
            <div class="flex items-center justify-between">
              <span class="text-slate-400 w-16">開始日期</span>
              <input 
                type="date" 
                [(ngModel)]="sEditDateStart"
                class="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700 font-semibold focus:outline-none focus:border-brand-primary font-mono"
              />
            </div>
            <!-- 結束時間 -->
            <div class="flex items-center justify-between">
              <span class="text-slate-400 w-16">結束日期</span>
              <input 
                type="date" 
                [(ngModel)]="sEditDateEnd"
                class="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700 font-semibold focus:outline-none focus:border-brand-primary font-mono"
              />
            </div>

            <!-- 全天 & 存為備忘 自訂現代複選框 -->
            <div class="flex items-center space-x-4 pt-2">
              <div 
                (click)="bEditIsAllDay = !bEditIsAllDay"
                class="flex items-center space-x-1.5 cursor-pointer text-slate-700 select-none group"
              >
                <div 
                  class="w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 shadow-xs"
                  [ngClass]="bEditIsAllDay ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-slate-350 text-transparent group-hover:border-brand-primary'"
                >
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-xs font-semibold">整天</span>
              </div>

              <div 
                (click)="bEditSaveAsMemo = !bEditSaveAsMemo"
                class="flex items-center space-x-1.5 cursor-pointer text-slate-700 select-none group"
              >
                <div 
                  class="w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 shadow-xs"
                  [ngClass]="bEditSaveAsMemo ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-slate-350 text-transparent group-hover:border-brand-primary'"
                >
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-xs font-semibold">存為備忘錄</span>
              </div>
            </div>

            <!-- 入庫行程 & 叫貨行程 自訂現代複選框 -->
            <div class="flex items-center space-x-4 pt-1.5">
              <div 
                (click)="bEditIsStockIn = !bEditIsStockIn"
                class="flex items-center space-x-1.5 cursor-pointer text-slate-700 select-none group"
              >
                <div 
                  class="w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 shadow-xs"
                  [ngClass]="bEditIsStockIn ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-slate-350 text-transparent group-hover:border-brand-primary'"
                >
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-xs font-semibold">入庫行程</span>
              </div>

              <div 
                (click)="bEditIsStockOrder = !bEditIsStockOrder"
                class="flex items-center space-x-1.5 cursor-pointer text-slate-700 select-none group"
              >
                <div 
                  class="w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 shadow-xs"
                  [ngClass]="bEditIsStockOrder ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-slate-350 text-transparent group-hover:border-brand-primary'"
                >
                  <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-xs font-semibold">叫貨行程</span>
              </div>
            </div>
          </div>

          <!-- 其他欄位項目 (符合後台扁平排版) -->
          <div class="space-y-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
            <!-- 負責人 -->
            <div class="flex items-center space-x-3">
              <svg lucideUser class="w-4 h-4 text-slate-400 flex-shrink-0"></svg>
              <div class="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-0.5 text-slate-500 font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>系統管理員 (負責人)</span>
              </div>
            </div>

            <!-- 顏色選取 (天空藍, 玫瑰紅等標籤色) -->
            <div class="flex items-center space-x-3">
              <svg lucideTag class="w-4 h-4 text-slate-400 flex-shrink-0"></svg>
              <div class="flex items-center gap-1.5">
                <button 
                  *ngFor="let col of aColorOptions"
                  (click)="sEditColor = col.sKey"
                  class="w-5 h-5 rounded-full border transition-all duration-150 relative"
                  [ngClass]="col.sBgClass"
                  [class.scale-115]="sEditColor === col.sKey"
                  [class.border-slate-500]="sEditColor === col.sKey"
                  [title]="col.sLabel"
                >
                  <span *ngIf="sEditColor === col.sKey" class="absolute inset-0 flex items-center justify-center text-[9px] text-white">✓</span>
                </button>
              </div>
            </div>

            <!-- 通知 (使用自訂單選下拉元件，支援 icon 投射) -->
            <app-single-select-dropdown
              [aOptions]="aNotificationOptions"
              [(sValue)]="sEditNotification"
              sPlaceholder="選擇通知設定"
            >
              <svg icon lucideBell class="w-4 h-4 text-slate-400 flex-shrink-0"></svg>
            </app-single-select-dropdown>

            <!-- 關聯商品 (可重用自訂多選下拉元件) -->
            <app-multi-select-dropdown
              [aOptions]="aProductOptions"
              [(aSelectedIds)]="aEditSelectedProductIds"
              sPlaceholder="選擇關聯商品"
            ></app-multi-select-dropdown>

            <!-- 備註說明 -->
            <div class="flex items-start space-x-3">
              <svg lucideFileText class="w-4 h-4 text-slate-400 mt-1 flex-shrink-0"></svg>
              <textarea 
                [(ngModel)]="sEditDescription"
                placeholder="輸入備註或行程描述..." 
                rows="3"
                class="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-brand-primary placeholder-slate-350"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 底部操作按鈕 (取消, 儲存, 刪除) -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0 gap-2">
          <!-- 刪除按鈕 (僅在編輯既有行程時顯示) -->
          <div>
            <button 
              *ngIf="oSelectedEvent"
              (click)="fnDeleteEvent()"
              class="bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 px-3 py-2 rounded text-xs font-semibold transition flex items-center justify-center space-x-1"
              title="刪除行程"
            >
              <svg lucideTrash2 class="w-3.5 h-3.5"></svg>
              <span>刪除</span>
            </button>
          </div>
          
          <div class="flex space-x-2">
            <button 
              (click)="fnCancelEdit()"
              class="bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800 px-4 py-2 rounded text-xs font-semibold transition"
            >
              取消
            </button>
            <button 
              (click)="fnSaveEvent()"
              class="bg-brand-primary text-white hover:bg-brand-primary-hover px-4 py-2 rounded text-xs font-semibold transition shadow-sm shadow-brand-primary/10"
            >
              儲存
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* 隱藏原生捲動軸以維持美感，窄版自訂捲動軸 */
    .custom-scrollbar::-webkit-scrollbar {
      width: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 1.5px;
    }
  `]
})
export class ProductCalendarComponent implements OnInit {
  // 當前選取年份與月份 (0-indexed，預設由 ngOnInit 動態設定為今日)
  nCurrentYear: number = new Date().getFullYear();
  nCurrentMonth: number = new Date().getMonth();
  sCurrentMonthYearLabel: string = '';

  // 當前滑鼠懸停的行程 ID (用於多天行程條同步 hover 狀態，符合匈牙利命名法)
  nHoveredEventId: number | null = null;

  // 當前選取日期的日期物件 (用於顯示當日其他行程清單，符合匈牙利命名法)
  dateSelectedDay: Date | null = null;

  // 42 格日曆網格資料
  aMonthDays: DayGridCell[] = [];

  // 全域行程列表 (叫貨/入庫/出貨相關 Mock 資料，由 ngOnInit 動態初始化以契合當前月份)
  aEvents: CalendarEvent[] = [];

  // 右側編輯面板顯示狀態 (預設隱藏)
  bShowEditPanel: boolean = false;

  // 編輯變數
  bEditIsStockIn: boolean = false;       // 是否為入庫行程
  bEditIsStockOrder: boolean = false;    // 是否為叫貨行程
  aEditSelectedProductIds: number[] = [];// 關聯商品 ID 陣列

  // 關聯商品 Mock 選項 (附帶圖片)
  aProductOptions = [
    { id: 1, name: '耶加雪菲精品咖啡豆 (250g)', imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=80', price: 450 },
    { id: 2, name: '極簡磨砂陶瓷馬克杯', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=80', price: 350 },
    { id: 3, name: '重磅落肩連帽衫', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=80', price: 1280 },
    { id: 4, name: '日系原色帆布托特包', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=80', price: 590 }
  ];

  // 通知設定單選選單選項列表 (符合匈牙利命名法與繁體中文註解)
  aNotificationOptions: SelectOption[] = [
    { sValue: 'none', sLabel: '不進行通知' },
    { sValue: '0', sLabel: '行程開始時' },
    { sValue: '15', sLabel: '15 分鐘前' },
    { sValue: '60', sLabel: '1 小時前' }
  ];

  // 右側行程編輯器欄位變數
  oSelectedEvent: CalendarEvent | null = null;
  sEditTitle: string = '';
  sEditDateStart: string = '';
  sEditDateEnd: string = '';
  bEditIsAllDay: boolean = true;
  bEditSaveAsMemo: boolean = false;
  sEditColor: string = 'blue';
  sEditNotification: string = 'none';
  sEditDescription: string = '';

  // 顏色選項配置 (中文化標籤)
  aColorOptions = [
    { sKey: 'blue', sBgClass: 'bg-sky-500 border-sky-600', sLabel: '天空藍' },
    { sKey: 'red', sBgClass: 'bg-rose-500 border-rose-600', sLabel: '玫瑰紅' },
    { sKey: 'green', sBgClass: 'bg-emerald-500 border-emerald-600', sLabel: '翡翠綠' },
    { sKey: 'amber', sBgClass: 'bg-amber-500 border-amber-600', sLabel: '琥珀黃' },
    { sKey: 'gray', sBgClass: 'bg-slate-400 border-slate-500', sLabel: '冷灰色' }
  ];

  ngOnInit(): void {
    const today = new Date();
    this.nCurrentYear = today.getFullYear();
    this.nCurrentMonth = today.getMonth();

    // 格式化今日的 YYYY-MM-DD
    const sTodayStr = this.fnFormatDateString(today);
    this.sEditDateStart = sTodayStr;
    this.sEditDateEnd = sTodayStr;

    // 動態初始化與當前月份相符的叫貨/入庫/出貨行程 Mock 資料
    const nY = this.nCurrentYear;
    const nM = this.nCurrentMonth;
    
    // 設定 1 號、今天、後 4 天、後 8 天的叫貨/入庫/出貨行程
    this.aEvents = [
      { id: 1, sTitle: '精品咖啡豆 進貨入庫', dateStart: new Date(nY, nM, today.getDate()), dateEnd: new Date(nY, nM, today.getDate()), bIsAllDay: true, sColor: 'green', sDescription: '耶加雪菲精品咖啡豆共 120 包入庫盤點與抽檢工作', bIsStockIn: true, bIsStockOrder: false, aAssociatedProductIds: [1] },
      { id: 2, sTitle: '連帽衫大批叫貨 (追加採購)', dateStart: new Date(nY, nM, Math.max(1, today.getDate() - 5)), dateEnd: new Date(nY, nM, Math.max(1, today.getDate() - 5)), bIsAllDay: true, sColor: 'blue', sDescription: '向主要供應商發起冬季重磅落肩連帽衫大額追單', bIsStockIn: false, bIsStockOrder: true, aAssociatedProductIds: [3] },
      { id: 3, sTitle: '日系帆布包 出貨配送 (海外訂單)', dateStart: new Date(nY, nM, Math.min(28, today.getDate() + 4)), dateEnd: new Date(nY, nM, Math.min(28, today.getDate() + 4)), bIsAllDay: true, sColor: 'amber', sDescription: '日系原色帆布托特包共 50 組大宗出口配送物流登記', bIsStockIn: false, bIsStockOrder: false, aAssociatedProductIds: [4] },
      { id: 4, sTitle: '陶瓷馬克杯 庫存盤點', dateStart: new Date(nY, nM, Math.min(28, today.getDate() + 8)), dateEnd: new Date(nY, nM, Math.min(28, today.getDate() + 8)), bIsAllDay: true, sColor: 'gray', sDescription: '極簡磨砂陶瓷馬克杯年度中期庫存損耗盤點作業', bIsStockIn: true, bIsStockOrder: false, aAssociatedProductIds: [2] }
    ];

    this.fnRenderCalendar();
  }

  // 取得 42 格日曆網格 (生成並與行程比對，繁體中文註解)
  fnRenderCalendar() {
    const aCells: DayGridCell[] = [];
    const dateToday = new Date();
    
    // 當月第一天是星期幾
    const nFirstDayOfWeek = new Date(this.nCurrentYear, this.nCurrentMonth, 1).getDay();
    // 當月總天數
    const nTotalDays = new Date(this.nCurrentYear, this.nCurrentMonth + 1, 0).getDate();
    // 上月總天數
    const nPrevMonthTotalDays = new Date(this.nCurrentYear, this.nCurrentMonth, 0).getDate();

    // 1. 填充上月餘日
    for (let i = nFirstDayOfWeek - 1; i >= 0; i--) {
      const nDayNum = nPrevMonthTotalDays - i;
      const dateCell = new Date(this.nCurrentYear, this.nCurrentMonth - 1, nDayNum);
      aCells.push(this.fnCreateCellObject(nDayNum, dateCell, false, dateToday));
    }

    // 2. 填充當月日期
    for (let i = 1; i <= nTotalDays; i++) {
      const dateCell = new Date(this.nCurrentYear, this.nCurrentMonth, i);
      aCells.push(this.fnCreateCellObject(i, dateCell, true, dateToday));
    }

    // 3. 填充下月首日 (補滿 42 格)
    const nRemaining = 42 - aCells.length;
    for (let i = 1; i <= nRemaining; i++) {
      const dateCell = new Date(this.nCurrentYear, this.nCurrentMonth + 1, i);
      aCells.push(this.fnCreateCellObject(i, dateCell, false, dateToday));
    }

    this.aMonthDays = aCells;
    this.fnUpdateLabel();
  }

  // 建立日曆單一格子物件 (繁體中文註解)
  private fnCreateCellObject(nDayNum: number, dateCell: Date, bIsCurrentMonth: boolean, dateToday: Date): DayGridCell {
    const bIsSunday = dateCell.getDay() === 0;
    const bIsSaturday = dateCell.getDay() === 6;
    
    const bIsToday = dateCell.getDate() === dateToday.getDate() &&
                     dateCell.getMonth() === dateToday.getMonth() &&
                     dateCell.getFullYear() === dateToday.getFullYear();

    // 過濾出屬於該日期的行程
    const aEvents = this.fnGetEventsForDate(dateCell);

    return {
      nDay: nDayNum,
      date: dateCell,
      bIsCurrentMonth: bIsCurrentMonth,
      bIsToday: bIsToday,
      bIsSunday: bIsSunday,
      bIsSaturday: bIsSaturday,
      aEvents: aEvents
    };
  }

  // 篩選日期所屬行程 (跨日判斷，繁體中文註解)
  fnGetEventsForDate(date: Date): CalendarEvent[] {
    return this.aEvents.filter(event => {
      const dStart = new Date(event.dateStart);
      const dEnd = new Date(event.dateEnd);
      
      const dCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dS = new Date(dStart.getFullYear(), dStart.getMonth(), dStart.getDate());
      const dE = new Date(dEnd.getFullYear(), dEnd.getMonth(), dEnd.getDate());
      
      return dCheck >= dS && dCheck <= dE;
    });
  }

  // 更新標頭年月份文字 (繁體中文格式)
  fnUpdateLabel() {
    this.sCurrentMonthYearLabel = `${this.nCurrentYear}年 ${this.nCurrentMonth + 1}月`;
  }

  // 前進/後退月份
  fnPrevMonth() {
    if (this.nCurrentMonth === 0) {
      this.nCurrentMonth = 11;
      this.nCurrentYear--;
    } else {
      this.nCurrentMonth--;
    }
    this.fnRenderCalendar();
  }

  fnNextMonth() {
    if (this.nCurrentMonth === 11) {
      this.nCurrentMonth = 0;
      this.nCurrentYear++;
    } else {
      this.nCurrentMonth++;
    }
    this.fnRenderCalendar();
  }

  fnGoToday() {
    const today = new Date();
    this.nCurrentYear = today.getFullYear();
    this.nCurrentMonth = today.getMonth();
    this.fnRenderCalendar();
  }

  // 點選某個日期格 (開啟快速新增行程，設定右側面板為 true，繁體中文註解)
  fnOnDateClick(date: Date) {
    this.bShowEditPanel = true;
    this.dateSelectedDay = date;
    this.oSelectedEvent = null;
    this.sEditTitle = '';
    this.sEditDateStart = this.fnFormatDateString(date);
    this.sEditDateEnd = this.fnFormatDateString(date);
    this.bEditIsAllDay = true;
    this.bEditSaveAsMemo = false;
    this.bEditIsStockIn = false;
    this.bEditIsStockOrder = false;
    this.aEditSelectedProductIds = [];
    this.sEditColor = 'blue';
    this.sEditDescription = '';
    this.sEditNotification = 'none';
  }

  // 載入行程資料到編輯器 (符合繁體中文註解與匈牙利命名法)
  fnLoadEventToEdit(oEvent: CalendarEvent) {
    this.oSelectedEvent = oEvent;
    this.sEditTitle = oEvent.sTitle;
    this.sEditDateStart = this.fnFormatDateString(new Date(oEvent.dateStart));
    this.sEditDateEnd = this.fnFormatDateString(new Date(oEvent.dateEnd));
    this.bEditIsAllDay = oEvent.bIsAllDay;
    this.bEditSaveAsMemo = oEvent.bSaveAsMemo || false;
    this.bEditIsStockIn = oEvent.bIsStockIn || false;
    this.bEditIsStockOrder = oEvent.bIsStockOrder || false;
    this.aEditSelectedProductIds = oEvent.aAssociatedProductIds ? [...oEvent.aAssociatedProductIds] : [];
    this.sEditColor = oEvent.sColor;
    this.sEditDescription = oEvent.sDescription || '';
    this.sEditNotification = oEvent.sNotification || 'none';
  }

  // 點選日曆中的行程色條 (載入並開啟編輯模式，設定右側面板為 true，繁體中文註解)
  fnOnEventClick(event: CalendarEvent, mouseEvent: MouseEvent) {
    mouseEvent.stopPropagation(); // 阻止事件冒泡以防觸發日期格點擊
    this.bShowEditPanel = true;
    this.dateSelectedDay = new Date(event.dateStart);
    this.fnLoadEventToEdit(event);
  }

  // 點擊頂部 + 新增行程按鈕開啟全新空白行程
  fnStartNewEvent() {
    this.fnOnDateClick(new Date());
  }

  // 儲存行程 (新增與更新)
  fnSaveEvent() {
    if (!this.sEditTitle.trim()) {
      alert('請輸入行程主題！');
      return;
    }

    const dS = new Date(this.sEditDateStart);
    const dE = new Date(this.sEditDateEnd);
    if (dS > dE) {
      alert('結束日期不能早於開始日期！');
      return;
    }

    if (this.oSelectedEvent) {
      // 1. 更新既有行程
      this.oSelectedEvent.sTitle = this.sEditTitle;
      this.oSelectedEvent.dateStart = dS;
      this.oSelectedEvent.dateEnd = dE;
      this.oSelectedEvent.bIsAllDay = this.bEditIsAllDay;
      this.oSelectedEvent.bSaveAsMemo = this.bEditSaveAsMemo;
      this.oSelectedEvent.bIsStockIn = this.bEditIsStockIn;
      this.oSelectedEvent.bIsStockOrder = this.bEditIsStockOrder;
      this.oSelectedEvent.aAssociatedProductIds = [...this.aEditSelectedProductIds];
      this.oSelectedEvent.sColor = this.sEditColor;
      this.oSelectedEvent.sDescription = this.sEditDescription;
      this.oSelectedEvent.sNotification = this.sEditNotification;
    } else {
      // 2. 新增行程
      const nNewId = this.aEvents.length > 0 ? Math.max(...this.aEvents.map(e => e.id)) + 1 : 1;
      const newEvent: CalendarEvent = {
        id: nNewId,
        sTitle: this.sEditTitle,
        dateStart: dS,
        dateEnd: dE,
        bIsAllDay: this.bEditIsAllDay,
        bSaveAsMemo: this.bEditSaveAsMemo,
        bIsStockIn: this.bEditIsStockIn,
        bIsStockOrder: this.bEditIsStockOrder,
        aAssociatedProductIds: [...this.aEditSelectedProductIds],
        sColor: this.sEditColor,
        sDescription: this.sEditDescription,
        sNotification: this.sEditNotification
      };
      this.aEvents.push(newEvent);
    }

    // 重新排序並刷新月曆渲染
    this.fnRenderCalendar();
    this.fnCancelEdit();
  }

  // 刪除行程
  fnDeleteEvent() {
    if (!this.oSelectedEvent) return;
    if (confirm(`確定要刪除「${this.oSelectedEvent.sTitle}」此行程嗎？`)) {
      this.aEvents = this.aEvents.filter(e => e.id !== this.oSelectedEvent!.id);
      this.fnRenderCalendar();
      this.fnCancelEdit();
    }
  }

  // 取消編輯，重設編輯區並隱藏右側面板
  fnCancelEdit() {
    this.oSelectedEvent = null;
    this.sEditTitle = '';
    this.sEditDescription = '';
    this.bShowEditPanel = false;
    this.aEditSelectedProductIds = [];
  }

  // 格式化 Date 為 YYYY-MM-DD
  private fnFormatDateString(date: Date): string {
    const nY = date.getFullYear();
    const sM = (date.getMonth() + 1).toString().padStart(2, '0');
    const sD = date.getDate().toString().padStart(2, '0');
    return `${nY}-${sM}-${sD}`;
  }

  // 依顏色字串反查 CSS class (符合繁體中文註解)
  fnGetEventColorClasses(sColor: string): string {
    switch (sColor) {
      case 'red': 
        return 'bg-rose-500 text-white border-rose-600';
      case 'green': 
        return 'bg-emerald-500 text-white border-emerald-600';
      case 'amber': 
        return 'bg-amber-500 text-white border-amber-600';
      case 'gray': 
        return 'bg-slate-400 text-white border-slate-500';
      case 'blue':
      default:
        return 'bg-sky-500 text-white border-sky-600';
    }
  }

  // 清除日期的時間資訊以利精確比較日期 (符合繁體中文註解與匈牙利命名法)
  private fnClearTime(dateSource: Date): Date {
    return new Date(dateSource.getFullYear(), dateSource.getMonth(), dateSource.getDate());
  }

  // 判斷行程是否於此日期格向左延續 (符合繁體中文註解與匈牙利命名法)
  fnIsEventContinuingLeft(oEvent: CalendarEvent, oCell: DayGridCell): boolean {
    if (oCell.bIsSunday) return false; // 跨周 (星期日) 需斷開
    const dateStart = this.fnClearTime(new Date(oEvent.dateStart));
    const dateCell = this.fnClearTime(oCell.date);
    return dateStart < dateCell;
  }

  // 判斷行程是否於此日期格向右延續 (符合繁體中文註解與匈牙利命名法)
  fnIsEventContinuingRight(oEvent: CalendarEvent, oCell: DayGridCell): boolean {
    if (oCell.bIsSaturday) return false; // 跨周 (星期六) 需斷開
    const dateEnd = this.fnClearTime(new Date(oEvent.dateEnd));
    const dateCell = this.fnClearTime(oCell.date);
    return dateEnd > dateCell;
  }

  // 根據行程連續性動態返回樣式類別以達成連貫效果 (符合繁體中文註解與匈牙利命名法)
  fnGetEventStyleClasses(oEvent: CalendarEvent, oCell: DayGridCell): string {
    let sClasses = this.fnGetEventColorClasses(oEvent.sColor);

    const bContLeft = this.fnIsEventContinuingLeft(oEvent, oCell);
    const bContRight = this.fnIsEventContinuingRight(oEvent, oCell);

    if (bContLeft && bContRight) {
      sClasses += ' rounded-none border-l-0 border-r-0 ml-[-1px] mr-[-1px]';
    } else if (bContLeft) {
      sClasses += ' rounded-l-none border-l-0 ml-[-1px] mr-1';
    } else if (bContRight) {
      sClasses += ' rounded-r-none border-r-0 ml-1 mr-[-1px]';
    } else {
      sClasses += ' mx-1';
    }

    return sClasses;
  }

  // 判斷是否應該在此日期格顯示行程標題 (僅在事件首日或星期日顯示) (符合繁體中文註解與匈牙利命名法)
  fnShouldShowEventTitle(oEvent: CalendarEvent, oCell: DayGridCell): boolean {
    return !this.fnIsEventContinuingLeft(oEvent, oCell);
  }

  // 滑鼠進入行程條事件，記錄目前 Hover 的事件 ID (符合繁體中文註解與匈牙利命名法)
  fnOnEventMouseEnter(oEvent: CalendarEvent) {
    this.nHoveredEventId = oEvent.id;
  }

  // 滑鼠離開行程條事件，重設暫存的事件 ID (符合繁體中文註解與匈牙利命名法)
  fnOnEventMouseLeave() {
    this.nHoveredEventId = null;
  }

  // 獲取當前選取日期之所有行程列表 (符合繁體中文註解與匈牙利命名法)
  get aSelectedDayEvents(): CalendarEvent[] {
    if (!this.dateSelectedDay) return [];
    return this.fnGetEventsForDate(this.dateSelectedDay);
  }

  // 將當日行程列表轉換為自訂下拉選單需要的選項陣列格式 (符合繁體中文註解與匈牙利命名法)
  get aSelectedDayEventOptions(): SelectOption[] {
    return this.aSelectedDayEvents.map(oEvent => ({
      sValue: oEvent.id.toString(),
      sLabel: oEvent.sTitle
    }));
  }

  // 依選取的行程 ID 切換編輯器內容 (符合繁體中文註解與匈牙利命名法)
  fnSelectEventById(nEventId: any) {
    const nId = Number(nEventId);
    const oEvent = this.aEvents.find(e => e.id === nId);
    if (oEvent) {
      this.fnLoadEventToEdit(oEvent);
    }
  }

  // 點選省略號圖示預設載入該日第三個行程 (符合繁體中文註解與匈牙利命名法)
  fnOnEllipsisClick(oCell: DayGridCell, oMouseEvent: MouseEvent) {
    oMouseEvent.stopPropagation();
    this.bShowEditPanel = true;
    this.dateSelectedDay = oCell.date;
    if (oCell.aEvents && oCell.aEvents.length >= 3) {
      this.fnLoadEventToEdit(oCell.aEvents[2]);
    }
  }


}
