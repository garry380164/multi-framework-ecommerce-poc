import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucidePackage } from '@lucide/angular';

// 可重用下拉選單選項介面
export interface DropdownOption {
  id: number;
  name: string;
  imageUrl?: string;
  [key: string]: any; // 支援額外自訂屬性
}

@Component({
  selector: 'app-multi-select-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucidePackage
  ],
  template: `
    <div class="flex flex-col space-y-1 relative">
      <div class="flex items-center space-x-3">
        <!-- 預設 Package 圖示 (可重用包裝) -->
        <svg lucidePackage class="w-4 h-4 text-slate-400 flex-shrink-0"></svg>
        <div class="flex-1">
          <button
            type="button"
            (click)="bShowDropdown = !bShowDropdown"
            class="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-left text-slate-700 font-semibold focus:outline-none focus:border-brand-primary flex items-center justify-between cursor-pointer"
          >
            <span class="truncate">
              {{ fnGetSelectedLabel() }}
            </span>
            <span class="text-slate-400 text-[10px]">▼</span>
          </button>
        </div>
      </div>

      <!-- 下拉多選浮動面板 -->
      <div 
        *ngIf="bShowDropdown" 
        class="absolute left-7 right-0 top-9 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto p-2 space-y-1"
      >
        <div 
          *ngFor="let opt of aOptions"
          (click)="fnToggleSelection(opt.id)"
          class="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded cursor-pointer transition select-none"
        >
          <div class="flex items-center space-x-2">
            <!-- 當有傳入圖片時，才渲染圖片區 -->
            <img 
              *ngIf="opt.imageUrl"
              [src]="opt.imageUrl" 
              class="w-8 h-8 object-cover rounded border border-slate-200 flex-shrink-0" 
            />
            <span class="text-xs text-slate-700 font-semibold">{{ opt.name }}</span>
          </div>
          
          <!-- 自訂現代 Checkbox (無 input checkbox) -->
          <div 
            class="w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 shadow-xs flex-shrink-0"
            [ngClass]="fnIsSelected(opt.id) ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-slate-350 text-transparent'"
          >
            <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
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
export class MultiSelectDropdownComponent {
  // 下拉選單資料來源 (包含 id, name, imageUrl)
  @Input() aOptions: DropdownOption[] = [];
  
  // 被選取的 id 陣列 (支援雙向綁定)
  @Input() aSelectedIds: number[] = [];
  @Output() aSelectedIdsChange = new EventEmitter<number[]>();

  // 預設無選取時的 placeholder
  @Input() sPlaceholder: string = '選擇關聯商品';

  // 下拉選單開關狀態
  bShowDropdown: boolean = false;

  constructor(private el: ElementRef) {}

  // 偵測點擊元件外部，若點在外部則自動關閉下拉選單 (Click Outside 機制)
  @HostListener('document:click', ['$event'])
  fnClickOutside(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.bShowDropdown = false;
    }
  }

  // 判斷某選項是否被選中 (匈牙利命名法)
  fnIsSelected(nId: number): boolean {
    return this.aSelectedIds.includes(nId);
  }

  // 切換選中狀態並發送 emitter
  fnToggleSelection(nId: number) {
    let aNextSelected = [...this.aSelectedIds];
    if (aNextSelected.includes(nId)) {
      aNextSelected = aNextSelected.filter(id => id !== nId);
    } else {
      aNextSelected.push(nId);
    }
    this.aSelectedIds = aNextSelected;
    this.aSelectedIdsChange.emit(aNextSelected);
  }

  // 動態算出目前按鈕上應該顯示的文字
  fnGetSelectedLabel(): string {
    if (!this.aSelectedIds || this.aSelectedIds.length === 0) {
      return this.sPlaceholder;
    }
    const aNames = this.aOptions
      .filter(opt => this.aSelectedIds.includes(opt.id))
      .map(opt => opt.name);
    
    if (aNames.length === 0) {
      return this.sPlaceholder;
    }
    if (aNames.length <= 1) {
      return aNames[0];
    }
    return `${aNames[0]} 等 ${aNames.length} 項`;
  }
}
