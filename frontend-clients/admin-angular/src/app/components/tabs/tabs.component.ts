import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- 分頁籤 (Tabs) -->
    <div class="border-b border-slate-200 flex justify-between items-center">
      <div class="flex space-x-6 text-sm font-semibold text-slate-400">
        <a 
          *ngFor="let tab of aTabs"
          href="javascript:void(0)"
          (click)="fnOnTabSelect(tab, $event)"
          class="py-2 border-b-2 transition"
          [ngClass]="sActiveTab === tab ? 'border-brand-primary text-slate-800' : 'border-transparent hover:text-slate-600'"
        >
          {{ tab }}
        </a>
      </div>
      
    </div>
  `,
  styles: []
})
export class TabsComponent {
  // 分頁清單
  @Input() aTabs: string[] = [];
  // 當前選取的分頁
  @Input() sActiveTab: string = '';

  // 分頁切換事件
  @Output() activeTabChange = new EventEmitter<string>();

  // 當點擊分頁標籤時觸發
  fnOnTabSelect(sTab: string, event: Event) {
    event.preventDefault();
    this.sActiveTab = sTab;
    this.activeTabChange.emit(sTab);
  }
}
