import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucidePackage, 
  LucideAlertTriangle, 
  LucideCheckCircle, 
  LucidePencil, 
  LucideTrash2, 
  LucidePlus,
  LucideArrowRight,
  LucideInfo,
  LucideCheck
} from '@lucide/angular';
import { 
  CdkDragDrop, 
  DragDropModule, 
  moveItemInArray, 
  transferArrayItem 
} from '@angular/cdk/drag-drop';
import { Product } from '../product-table/product-table.component';

export interface CategoryColumn {
  nId: number;
  sName: string;
  aProducts: Product[];
}

@Component({
  selector: 'app-product-kanban',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucidePackage,
    LucideAlertTriangle,
    LucideCheckCircle,
    LucidePencil,
    LucideTrash2,
    LucidePlus,
    LucideArrowRight,
    LucideInfo,
    LucideCheck,
    DragDropModule
  ],
  template: `
    <!-- Trello 風格看板容器 (依分類動態分組，橫向滾動) -->
    <div 
      class="flex flex-row overflow-x-auto gap-6 pb-4 select-none trello-board-container" 
      cdkDropListGroup
    >
      
      <!-- 動態直欄 -->
      <div 
        *ngFor="let col of aColumns"
        class="flex-1 min-w-[300px] max-w-[340px] bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col transition-colors duration-200"
        [ngClass]="{ 'bg-indigo-50/10 border-indigo-200': sDragOverColumnId === col.nId }"
      >
        <!-- 欄位標頭 -->
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80 flex-shrink-0">
          <div class="flex items-center space-x-2 flex-1 min-w-0">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
            
            <!-- 分類名稱標題 -->
            <h3 
              *ngIf="nEditingColumnId !== col.nId" 
              class="font-title font-medium text-slate-800 text-sm tracking-tight truncate cursor-pointer hover:text-indigo-600 transition"
              (click)="fnStartColumnEdit(col)"
              title="點擊編輯分類名稱"
            >
              {{ col.sName }}
            </h3>

            <!-- 原地編輯分類名稱輸入框 (加大字體與 Padding) -->
            <input 
              *ngIf="nEditingColumnId === col.nId"
              type="text"
              [(ngModel)]="sEditingColumnName"
              (blur)="fnSaveColumnName(col)"
              (keyup.enter)="fnSaveColumnName(col)"
              (keyup.escape)="fnCancelColumnNameEdit()"
              class="bg-white border border-slate-350 rounded px-2.5 py-1 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 font-medium flex-1 min-w-0"
              title="輸入新分類名稱"
            />

            <!-- 商品計數標籤 (非編輯狀態) -->
            <span 
              *ngIf="nEditingColumnId !== col.nId"
              class="bg-slate-150/70 text-slate-700 border border-slate-200/80 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
            >
              {{ col.aProducts.length }}
            </span>

            <!-- 儲存分類名稱按鈕 (編輯狀態替換為打勾 icon，繁體中文註解) -->
            <button 
              *ngIf="nEditingColumnId === col.nId"
              (mousedown)="fnSaveColumnName(col); $event.preventDefault();"
              class="p-1 bg-emerald-50 text-emerald-600 border border-emerald-250 rounded hover:bg-emerald-100 hover:text-emerald-700 transition flex-shrink-0"
              title="儲存分類名稱"
            >
              <svg lucideCheck class="w-3.5 h-3.5"></svg>
            </button>
          </div>

          <!-- 編輯分類名稱按鈕 (鉛筆圖示) -->
          <button 
            *ngIf="nEditingColumnId !== col.nId"
            (click)="fnStartColumnEdit(col)"
            class="p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded transition flex-shrink-0 ml-1"
            title="編輯分類名稱"
          >
            <svg lucidePencil class="w-3.5 h-3.5"></svg>
          </button>
        </div>

        <!-- 卡片列表容器 (CDK Drop List) -->
        <div 
          [id]="col.nId.toString()"
          cdkDropList
          [cdkDropListData]="col.aProducts"
          (cdkDropListDropped)="fnOnDrop($event)"
          class="space-y-3 flex-grow min-h-[350px]"
        >
          <div 
            *ngFor="let oProd of col.aProducts"
            cdkDrag
            [cdkDragData]="oProd"
            class="bg-white border border-slate-200 rounded-lg p-4 hover:border-indigo-400 hover:bg-slate-50/10 transition-colors duration-150 cursor-grab active:cursor-grabbing relative group flex flex-col gap-2"
          >
            <!-- CDK 拖曳預覽卡片時的原位佔位格 -->
            <div class="cdk-drag-placeholder" *cdkDragPlaceholder></div>

            <!-- 卡片頂部資訊 (字級調大至 text-xs) -->
            <div class="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span class="font-mono">PD{{ fnPadProductId(oProd.id) }}</span>
              <!-- 庫存狀態點與徽章 -->
              <span 
                *ngIf="oProd.stock <= 50; else normalStock"
                class="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[11px]"
              >
                低庫存 ({{ oProd.stock }})
              </span>
              <ng-template #normalStock>
                <span class="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-700 border border-indigo-150 px-1.5 py-0.5 rounded text-[11px]">
                  充足 ({{ oProd.stock }})
                </span>
              </ng-template>
            </div>

            <!-- 卡片主體 (標題與說明字型調大一號) -->
            <div class="flex space-x-3 items-start">
              <img 
                [src]="oProd.imageUrl" 
                class="w-12 h-12 object-cover rounded-md border border-slate-100 flex-shrink-0" 
                [alt]="oProd.name"
              />
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-slate-800 text-sm truncate group-hover:text-indigo-600 transition" [title]="oProd.name">
                  {{ oProd.name }}
                </h4>
                <p class="text-xs text-slate-400 mt-1 line-clamp-2" [title]="oProd.description">
                  {{ oProd.description }}
                </p>
              </div>
            </div>

            <!-- 庫存進度條與數據 (字級調大至 text-xs) -->
            <div class="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
              <div class="flex items-center justify-between text-xs font-medium">
                <span class="text-slate-400">目前庫存: <span class="font-mono text-slate-600 font-bold">{{ oProd.stock }}</span></span>
                <span class="font-mono font-bold text-slate-700">\${{ oProd.price }}</span>
              </div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  class="h-full rounded-full" 
                  [ngClass]="oProd.stock <= 50 ? 'bg-amber-500' : 'bg-indigo-600'"
                  [style.width.%]="fnCalculateStockPercentage(oProd.stock)"
                ></div>
              </div>
            </div>

            <!-- 卡片內嵌屬性微調區 (可直接就地調整庫存與價格) -->
            <div *ngIf="nEditingProductId === oProd.id" class="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
              <div class="text-xs font-semibold text-slate-500 font-title">快速微調商品</div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[11px] text-slate-400">庫存</label>
                  <input type="number" [(ngModel)]="nEditStockValue" class="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono" />
                </div>
                <div>
                  <label class="block text-[11px] text-slate-400">價格</label>
                  <input type="number" [(ngModel)]="nEditPriceValue" class="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono" />
                </div>
              </div>
              <div class="flex justify-end space-x-1.5 pt-1">
                <button (click)="fnCancelInlineEdit()" class="bg-white border border-slate-300 text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded text-[10px] font-medium">取消</button>
                <button (click)="fnSaveInlineEdit(oProd)" class="bg-slate-900 text-white hover:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-medium">保存</button>
              </div>
            </div>

            <!-- 滑過顯示操作面板 -->
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center space-x-1 bg-white pl-1.5 py-0.5 rounded border border-slate-100 shadow-sm">
              <button 
                *ngIf="bCanEdit"
                (click)="fnOnEdit(oProd, $event)"
                class="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                title="編輯商品"
              >
                <svg lucidePencil class="w-3.5 h-3.5"></svg>
              </button>
              <button 
                *ngIf="bCanDelete"
                (click)="fnOnDelete(oProd, $event)"
                class="p-1 hover:bg-rose-50 rounded text-rose-500 hover:text-rose-700 transition"
                title="刪除商品"
              >
                <svg lucideTrash2 class="w-3.5 h-3.5"></svg>
              </button>
            </div>
          </div>

          <!-- 空白狀態佔位 -->
          <div 
            *ngIf="col.aProducts.length === 0"
            class="h-32 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-xs text-slate-400 font-semibold"
          >
            本分類尚無商品
          </div>
        </div>

        <!-- 各直欄下方新增商品入口 (Trello 風格卡片底部按鈕，繁體中文註解) -->
        <div 
          *ngIf="bCanCreate"
          (click)="fnAddProductToColumn(col.nId, col.sName)"
          class="mt-3 px-3 py-2 border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10 rounded-lg cursor-pointer transition flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-650 flex-shrink-0 bg-white/50"
          title="新增商品至此分類"
        >
          <svg lucidePlus class="w-3.5 h-3.5"></svg>
          <span>新增商品</span>
        </div>
      </div>

    </div>

    <!-- Trello 風格滑入式 Toast 提示 (右下角固定) -->
    <div 
      *ngIf="bShowToast"
      class="fixed bottom-6 right-6 bg-white border border-slate-200 rounded-lg px-4 py-3.5 shadow-lg shadow-slate-200/40 flex items-center justify-between space-x-6 z-[99999] toast-slide-in max-w-sm"
    >
      <div class="flex items-center space-x-2 min-w-0">
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0 animate-ping"></span>
        <span class="text-xs font-semibold text-slate-700 truncate leading-tight">{{ sToastMessage }}</span>
      </div>
      <div class="flex items-center space-x-2 flex-shrink-0 border-l border-slate-100 pl-3">
        <button 
          (click)="fnTriggerInlineEdit()"
          class="text-indigo-600 hover:text-indigo-800 text-xs font-bold hover:underline transition"
        >
          微調
        </button>
        <span class="text-slate-300 text-xs">|</span>
        <button 
          (click)="fnUndo()"
          class="text-rose-600 hover:text-rose-800 text-xs font-bold hover:underline transition"
        >
          撤銷
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Trello 看板滾動條美化 (Refined UI Style) */
    .trello-board-container {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 transparent;
    }
    .trello-board-container::-webkit-scrollbar {
      height: 6px;
    }
    .trello-board-container::-webkit-scrollbar-track {
      background: transparent;
    }
    .trello-board-container::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 3px;
    }
    .trello-board-container::-webkit-scrollbar-thumb:hover {
      background-color: #94a3b8;
    }

    /* CDK Drag - 拖曳預覽卡片樣式 */
    .cdk-drag-preview {
      box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.04), 
                  0 4px 6px -2px rgba(15, 23, 42, 0.02);
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background-color: #ffffff;
      transform: rotate(1.5deg);
      pointer-events: none;
      z-index: 100000;
    }

    /* CDK Drag - 拖曳時在直欄產生的佔位虛線格 */
    .cdk-drag-placeholder {
      opacity: 0.3;
      border: 2px dashed #cbd5e1 !important;
      background-color: #f8fafc !important;
      box-shadow: none !important;
      border-radius: 8px;
      height: 120px;
      margin-bottom: 12px;
    }

    /* 拖曳時強制停用卡片自身的 transition 避免跟手延遲 (繁體中文註解) */
    .cdk-drag-dragging {
      transition: none !important;
    }

    /* 拖曳中與回彈的過渡動畫 */
    .cdk-drag-animating {
      transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
    }
    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
    }

    /* Toast 滑入動畫 */
    .toast-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideIn {
      from {
        transform: translateY(80px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class ProductKanbanComponent implements OnChanges {
  @Input() aLowStockProducts: Product[] = [];
  @Input() aSufficientProducts: Product[] = [];
  @Input() bCanCreate: boolean = false; // 新增 bCanCreate 輸入，用來控制新增入口的權限 (繁體中文註解)
  @Input() bCanEdit: boolean = false;
  @Input() bCanDelete: boolean = false;

  @Output() editProduct = new EventEmitter<Product>();
  @Output() deleteProduct = new EventEmitter<Product>();
  
  // 輸出事件 (繁體中文註解：跨直欄拖曳觸發分類變更)
  @Output() productCategoryChange = new EventEmitter<{
    oProduct: Product;
    nNewCategoryId: number;
    sNewCategoryName: string;
  }>();

  // 輸出分類名稱變更事件 (繁體中文註解：直欄右上角鉛筆編輯)
  @Output() columnNameChange = new EventEmitter<{
    nCategoryId: number;
    sNewName: string;
  }>();

  // 輸出新增商品事件，帶有分類資訊 (繁體中文註解：直欄底部新增商品入口)
  @Output() addProductToCategory = new EventEmitter<{
    nCategoryId: number;
    sCategoryName: string;
  }>();

  // 動態生成的直欄列表
  aColumns: CategoryColumn[] = [];

  // CDK Drag & Drop 狀態標識
  sDragOverColumnId: number | null = null;

  // 撤銷快照 (包含原來的 categoryId 與 categoryName)
  oUndoSnapshot: {
    oProduct: Product;
    nPrevCategoryId: number;
    sPrevCategoryName: string;
    nPrevStock: number;
    nPrevPrice: number;
  } | null = null;

  // Toast 狀態
  bShowToast: boolean = false;
  sToastMessage: string = '';
  private oToastTimer: any = null;

  // 行內 (Inline) 編輯狀態 (卡片內屬性編輯)
  nEditingProductId: number | null = null;
  nEditStockValue: number = 0;
  nEditPriceValue: number = 0;

  // 原地編輯直欄標頭名稱變數 (繁體中文註解)
  nEditingColumnId: number | null = null;
  sEditingColumnName: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    // 若正在進行行內微調，則暫時不重整看板分類，防止畫面重繪閃爍
    if ((changes['aLowStockProducts'] || changes['aSufficientProducts']) && !this.nEditingProductId && !this.nEditingColumnId) {
      this.fnCategorizeProducts();
    }
  }

  // 依商品分類動態分組 (categoryId)
  fnCategorizeProducts() {
    const aAll = [...this.aLowStockProducts, ...this.aSufficientProducts];
    
    // Set 排除重複 ID 商品
    const oSeenIds = new Set<number>();
    const aUniqueProducts = aAll.filter(p => {
      if (oSeenIds.has(p.id)) return false;
      oSeenIds.add(p.id);
      return true;
    });

    const oColumnsMap = new Map<number, { sName: string; aProducts: Product[] }>();

    aUniqueProducts.forEach(oProd => {
      const nCatId = oProd.categoryId || 0;
      const sCatName = oProd.categoryName || '未分類';

      if (!oColumnsMap.has(nCatId)) {
        oColumnsMap.set(nCatId, { sName: sCatName, aProducts: [] });
      }
      oColumnsMap.get(nCatId)!.aProducts.push(oProd);
    });

    // 依 categoryId 的順序轉為直欄陣列
    this.aColumns = Array.from(oColumnsMap.entries()).map(([nId, oData]) => ({
      nId: nId,
      sName: oData.sName,
      aProducts: oData.aProducts
    }));
  }

  // CDK Drag and Drop 核心拖放事件
  fnOnDrop(event: CdkDragDrop<Product[]>) {
    if (event.previousContainer === event.container) {
      // 1. 同一直欄內的卡片排序調整
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // 2. 跨直欄拖曳變更商品分類
      const oProd = event.previousContainer.data[event.previousIndex];
      const nSourceCatId = Number(event.previousContainer.id);
      const nTargetCatId = Number(event.container.id);

      const sSourceCatName = this.fnGetCategoryNameById(nSourceCatId);
      const sTargetCatName = this.fnGetCategoryNameById(nTargetCatId);

      // 建立撤銷快照備份
      this.oUndoSnapshot = {
        oProduct: oProd,
        nPrevCategoryId: nSourceCatId,
        sPrevCategoryName: sSourceCatName,
        nPrevStock: oProd.stock,
        nPrevPrice: oProd.price
      };

      // 前端直接搬移 (確保平滑過渡動畫)
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // 更新商品本身的分類屬性
      oProd.categoryId = nTargetCatId;
      oProd.categoryName = sTargetCatName;

      // 發射事件更新資料庫或 Mock
      this.productCategoryChange.emit({
        oProduct: oProd,
        nNewCategoryId: nTargetCatId,
        sNewCategoryName: sTargetCatName
      });

      // 顯示 Toast 提示
      this.sToastMessage = `已將商品移至「${sTargetCatName}」分類`;
      this.bShowToast = true;

      // 啟動 5 秒 Toast 自動關閉定時器
      if (this.oToastTimer) {
        clearTimeout(this.oToastTimer);
      }
      this.oToastTimer = setTimeout(() => {
        this.bShowToast = false;
      }, 5000);
    }
  }

  // 撤銷分類更新
  fnUndo() {
    if (!this.oUndoSnapshot) return;
    const { oProduct, nPrevCategoryId, sPrevCategoryName } = this.oUndoSnapshot;

    // 還原商品本身的分類屬性
    oProduct.categoryId = nPrevCategoryId;
    oProduct.categoryName = sPrevCategoryName;

    // 再次通知父元件同步還原
    this.productCategoryChange.emit({
      oProduct: oProduct,
      nNewCategoryId: nPrevCategoryId,
      sNewCategoryName: sPrevCategoryName
    });

    // 關閉 Toast 與定時器
    this.bShowToast = false;
    this.oUndoSnapshot = null;
    if (this.oToastTimer) {
      clearTimeout(this.oToastTimer);
    }
  }

  // 開啟行內微調編輯
  fnTriggerInlineEdit() {
    if (!this.oUndoSnapshot) return;
    const oProd = this.oUndoSnapshot.oProduct;
    this.nEditingProductId = oProd.id;
    this.nEditStockValue = oProd.stock;
    this.nEditPriceValue = oProd.price;

    // 關閉 Toast 與清除 timer
    this.bShowToast = false;
    if (this.oToastTimer) {
      clearTimeout(this.oToastTimer);
    }
  }

  // 儲存行內微調
  fnSaveInlineEdit(oProd: Product) {
    oProd.stock = this.nEditStockValue;
    oProd.price = this.nEditPriceValue;

    // 再次通知父元件同步資料
    this.productCategoryChange.emit({
      oProduct: oProd,
      nNewCategoryId: oProd.categoryId || 0,
      sNewCategoryName: oProd.categoryName || '未分類'
    });

    this.nEditingProductId = null;
    // 重新分流排列
    setTimeout(() => {
      this.fnCategorizeProducts();
    }, 100);
  }

  // 取消行內微調
  fnCancelInlineEdit() {
    this.nEditingProductId = null;
    this.fnCategorizeProducts();
  }

  // 直欄標題原地編輯方法 (繁體中文註解)
  fnStartColumnEdit(col: CategoryColumn) {
    this.nEditingColumnId = col.nId;
    this.sEditingColumnName = col.sName;
    setTimeout(() => {
      const el = document.querySelector(`input[type="text"]`) as HTMLInputElement;
      if (el) el.focus();
    }, 50);
  }

  fnSaveColumnName(col: CategoryColumn) {
    if (this.nEditingColumnId === null) return;
    const sTrimmed = this.sEditingColumnName.trim();
    if (sTrimmed && sTrimmed !== col.sName) {
      col.sName = sTrimmed;
      this.columnNameChange.emit({
        nCategoryId: col.nId,
        sNewName: sTrimmed
      });
    }
    this.nEditingColumnId = null;
  }

  fnCancelColumnNameEdit() {
    this.nEditingColumnId = null;
  }

  // 點擊新增商品入口發射事件 (繁體中文註解)
  fnAddProductToColumn(nCatId: number, sCatName: string) {
    this.addProductToCategory.emit({
      nCategoryId: nCatId,
      sCategoryName: sCatName
    });
  }

  // 計算庫存百分比 (200 為基準充足水位)
  fnCalculateStockPercentage(nStock: number): number {
    const nPercentage = (nStock / 200) * 100;
    return Math.min(100, Math.max(0, nPercentage));
  }

  fnOnEdit(oProd: Product, oEvent: MouseEvent) {
    oEvent.stopPropagation();
    this.editProduct.emit(oProd);
  }

  fnOnDelete(oProd: Product, oEvent: MouseEvent) {
    oEvent.stopPropagation();
    this.deleteProduct.emit(oProd);
  }

  fnPadProductId(nId: number): string {
    return nId.toString().padStart(4, '0');
  }

  // 根據 ID 反查直欄分類名稱
  fnGetCategoryNameById(nId: number): string {
    const col = this.aColumns.find(c => c.nId === nId);
    return col ? col.sName : '未分類';
  }
}
