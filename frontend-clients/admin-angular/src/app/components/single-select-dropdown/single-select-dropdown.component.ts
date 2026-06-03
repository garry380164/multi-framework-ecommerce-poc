import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 單選下拉選單選項介面
export interface SelectOption {
  sValue: string;
  sLabel: string;
}

@Component({
  selector: 'app-single-select-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="flex flex-col space-y-1">
      <div class="flex items-center space-x-3">
        <!-- 投射外部傳入的 icon (可選) -->
        <ng-content select="[icon]"></ng-content>
        <div class="flex-1 relative">
          <button
            type="button"
            (click)="bShowDropdown = !bShowDropdown"
            class="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-left text-slate-700 text-xs font-semibold focus:outline-none focus:border-brand-primary flex items-center justify-between cursor-pointer"
          >
            <span class="truncate">
              {{ fnGetSelectedLabel() }}
            </span>
            <span class="text-slate-400 text-[10px]">▼</span>
          </button>

          <!-- 下拉單選浮動面板 (z-index 確保蓋在下方元件上，預設不折行並支援自訂對齊與 Class 控制寬度) -->
          <div 
            *ngIf="bShowDropdown" 
            class="absolute top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto p-1 space-y-0.5 min-w-max"
            [ngClass]="[fnGetAlignClass(), sPanelClass]"
          >
            <div 
              *ngFor="let opt of aOptions"
              (click)="fnSelectOption(opt.sValue)"
              class="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded cursor-pointer transition select-none flex items-center justify-between"
              [class.bg-slate-50]="sValue === opt.sValue"
              [class.text-brand-primary]="sValue === opt.sValue"
            >
              <span>{{ opt.sLabel }}</span>
              <!-- 選中時顯示小勾勾 -->
              <svg 
                *ngIf="sValue === opt.sValue"
                class="w-3.5 h-3.5 text-brand-primary flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                stroke-width="3"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
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
export class SingleSelectDropdownComponent {
  // 下拉選項清單 (包含 sValue, sLabel)
  @Input() aOptions: SelectOption[] = [];
  
  // 被選取的值 (雙向綁定)
  @Input() sValue: string = '';
  @Output() sValueChange = new EventEmitter<string>();

  // 預設 Placeholder
  @Input() sPlaceholder: string = '請選擇';

  // 外部自訂下拉面板樣式類別 (用來控制寬度等)
  @Input() sPanelClass: string = '';

  // 下拉面板對齊方式 (靠左、靠右、置中，符合匈牙利命名法)
  @Input() sAlign: 'left' | 'right' | 'center' = 'left';

  // 下拉選單顯示狀態
  bShowDropdown: boolean = false;

  constructor(private el: ElementRef) {}

  // 偵測點擊元件外部，點在外部則收合選單 (Click Outside)
  @HostListener('document:click', ['$event'])
  fnClickOutside(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.bShowDropdown = false;
    }
  }

  // 選擇選項並關閉選單，發送 EventEmitter
  fnSelectOption(sVal: string) {
    this.sValue = sVal;
    this.sValueChange.emit(sVal);
    this.bShowDropdown = false;
  }

  // 動態反查 Label 進行按鈕文字顯示
  fnGetSelectedLabel(): string {
    const option = this.aOptions.find(opt => opt.sValue === this.sValue);
    return option ? option.sLabel : this.sPlaceholder;
  }

  // 根據對齊參數計算並返回對齊的 Tailwind CSS 類別 (符合繁體中文註解)
  fnGetAlignClass(): string {
    switch (this.sAlign) {
      case 'right':
        return 'right-0';
      case 'center':
        return 'left-1/2 -translate-x-1/2';
      case 'left':
      default:
        return 'left-0';
    }
  }
}
