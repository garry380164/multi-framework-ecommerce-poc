import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableColumn } from '../common-table/common-table.component';

// 商品資料結構介面
export interface Product {
  id: number;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  orderedQty?: number;
  shortageQty?: number;
  selected?: boolean;
  categoryId?: number;
  categoryName?: string;
}

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CommonTableComponent
  ],
  template: `
    <!-- 調用通用表格元件，傳遞商品專屬 columns 與 ng-templates 樣板對照 -->
    <app-common-table
      [sTitle]="sTitle"
      [aColumns]="aProductColumns"
      [aData]="aProducts"
      [bShowSelection]="true"
      [bShowHeaderBadge]="true"
      [sHeaderBadgeText]="sTitle"
      [sHeaderBadgeClass]="bIsLowStock ? 'bg-[#FFF9F0] text-[#C2410C] border border-[#FED7AA]' : 'bg-[#F5F6FF] text-[#4F46E5] border border-[#E0E7FF]'"
      [sHeaderBadgeIcon]="bIsLowStock ? 'alert' : 'check'"
      [bCanCreate]="bCanCreate"
      sCreateText="新增商品"
      [bCanEdit]="bCanEdit"
      [bCanDelete]="bCanDelete"
      [bServerSide]="bServerSide"
      [nTotalItems]="nTotalItems"
      [nPageSize]="nPageSize"
      [nPageIndex]="nPageIndex"
      [sExternalSortKey]="sExternalSortKey"
      [sExternalSortOrder]="sExternalSortOrder"
      [oTemplates]="{
        id: idCol,
        name: nameCol,
        description: descCol,
        stock: stockCol,
        orderedQty: orderedCol,
        shortageQty: shortageCol
      }"
      (createClick)="fnOnCreateClick()"
      (editClick)="fnOnEditClick($event)"
      (deleteClick)="fnOnDeleteClick($event)"
      (sortChange)="fnOnSortChange($event)"
      (pageChange)="fnOnPageChange($event)"
      (selectionChange)="fnOnSelectionChange($event)"
    ></app-common-table>

    <!-- 商品編號自訂樣板 -->
    <ng-template #idCol let-product>
      <span class="font-mono font-bold text-xs text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded whitespace-nowrap">
        PD{{ fnPadProductId(product.id) }}
      </span>
    </ng-template>

    <!-- 商品名稱自訂樣板 -->
    <ng-template #nameCol let-product>
      <span class="font-bold text-slate-800">{{ product.name }}</span>
    </ng-template>

    <!-- 商品描述自訂樣板 -->
    <ng-template #descCol let-product>
      <span class="text-xs text-slate-400 max-w-[200px] truncate block" [title]="product.description">
        {{ product.description }}
      </span>
    </ng-template>

    <!-- 庫存紅綠燈狀態樣板 -->
    <ng-template #stockCol let-product>
      <!-- 低庫存 (紅燈) -->
      <span 
        *ngIf="product.stock <= 50"
        class="inline-flex items-center space-x-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-xs font-semibold"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        <span>{{ product.stock }}</span>
      </span>
      
      <!-- 充足庫存 (綠燈) -->
      <span 
        *ngIf="product.stock > 50"
        class="inline-flex items-center space-x-1.5 bg-[#F0FDF9] text-[#0F766E] border border-[#CCFBF1] px-2 py-0.5 rounded-full text-xs font-semibold"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-[#14B8A6]"></span>
        <span>{{ product.stock }}</span>
      </span>
    </ng-template>

    <!-- 訂購量自訂樣板 -->
    <ng-template #orderedCol let-product>
      <span class="font-mono font-semibold text-slate-600">
        {{ product.orderedQty !== undefined ? product.orderedQty : 0 }}
      </span>
    </ng-template>

    <!-- 缺貨量紅燈警告樣板 -->
    <ng-template #shortageCol let-product>
      <span 
        *ngIf="product.shortageQty && product.shortageQty > 0; else noShortage" 
        class="inline-flex items-center space-x-1.5 bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full text-xs font-semibold"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        <span>{{ product.shortageQty }}</span>
      </span>
      <ng-template #noShortage>
        <span class="text-xs text-slate-400 font-mono">0</span>
      </ng-template>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProductTableComponent {
  // 元件屬性輸入
  @Input() sTitle: string = '';
  @Input() aProducts: Product[] = [];
  @Input() bIsLowStock: boolean = false;
  @Input() bCanCreate: boolean = false;
  @Input() bCanEdit: boolean = false;
  @Input() bCanDelete: boolean = false;

  // 伺服器端分頁與外部排序參數 (符合匈牙利命名法與繁體中文註解)
  @Input() bServerSide: boolean = false; // 是否啟用伺服器端分頁與排序
  @Input() nTotalItems: number = 0;      // 總資料筆數
  @Input() nPageSize: number = 10;       // 每頁資料筆數
  @Input() nPageIndex: number = 1;       // 當前頁碼 (1-indexed)
  @Input() sExternalSortKey: string | null = null;
  @Input() sExternalSortOrder: 'asc' | 'desc' | null = null;

  // 元件事件輸出 (由父元件接收，代理事件發射)
  @Output() editProduct = new EventEmitter<Product>();
  @Output() deleteProduct = new EventEmitter<Product>();
  @Output() addProductClick = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<Product[]>();

  // 排序與分頁事件輸出
  @Output() sortChange = new EventEmitter<{ sKey: string | null, sOrder: 'asc' | 'desc' | null }>();
  @Output() pageChange = new EventEmitter<number>();

  // 商品專用表格表頭欄位配置 (符合匈牙利命名法與繁體中文註解)
  aProductColumns: TableColumn[] = [
    { sKey: 'id', sLabel: '商品編號', sType: 'custom', sClass: 'w-24', bSortable: true },
    { sKey: 'imageUrl', sLabel: '商品圖片', sType: 'image' },
    { sKey: 'name', sLabel: '商品名稱', sType: 'custom' },
    { sKey: 'description', sLabel: '描述', sType: 'custom', sClass: 'max-w-[200px]' },
    { sKey: 'price', sLabel: '價格', sType: 'currency', bSortable: true, sClass: 'text-right', sHeaderClass: 'text-right' },
    { sKey: 'stock', sLabel: '庫存', sType: 'custom', bSortable: true },
    { sKey: 'orderedQty', sLabel: '訂購量', sType: 'custom', bSortable: true },
    { sKey: 'shortageQty', sLabel: '缺貨量', sType: 'custom', bSortable: true },
    { sKey: 'actions', sLabel: '操作', sType: 'actions', sClass: 'text-right' }
  ];

  // 格式化商品 ID 為四位數，如 PD0001
  fnPadProductId(nId: number): string {
    return nId.toString().padStart(4, '0');
  }

  // 轉送事件至父元件 (代理事件發射方法)
  fnOnCreateClick() {
    this.addProductClick.emit();
  }

  fnOnEditClick(product: Product) {
    this.editProduct.emit(product);
  }

  fnOnDeleteClick(product: Product) {
    this.deleteProduct.emit(product);
  }

  fnOnSortChange(event: { sKey: string | null, sOrder: 'asc' | 'desc' | null }) {
    this.sortChange.emit(event);
  }

  fnOnPageChange(nPage: number) {
    this.pageChange.emit(nPage);
  }

  fnOnSelectionChange(aSelected: Product[]) {
    this.selectionChange.emit(aSelected);
  }
}
