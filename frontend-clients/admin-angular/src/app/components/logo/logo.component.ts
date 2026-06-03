import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      [class]="sClass" 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- 頂面漸層：靛藍至紫紅 -->
        <linearGradient id="gradTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366F1" />
          <stop offset="100%" stop-color="#A855F7" />
        </linearGradient>
        <!-- 左面漸層：青藍至亮藍 -->
        <linearGradient id="gradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8" />
          <stop offset="100%" stop-color="#2563EB" />
        </linearGradient>
        <!-- 右面漸層：薄荷綠至深綠 -->
        <linearGradient id="gradRight" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#34D399" />
          <stop offset="100%" stop-color="#059669" />
        </linearGradient>
      </defs>
      
      <!-- 深 Slate 圓角背景框 (移除所有陰影，呈現俐落扁平化設計) -->
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#0F172A" />
      
      <!-- 3D 解構立體方塊 (Hardedge Isometric Cube Geometry) -->
      <!-- 1. 頂面 (Top Face) -->
      <path d="M16 6.5 L24.5 11.4 L16 16.3 L7.5 11.4 Z" fill="url(#gradTop)" />
      <!-- 2. 左面 (Left Face) -->
      <path d="M6.5 12.6 L15 17.5 L15 25.5 L6.5 20.6 Z" fill="url(#gradLeft)" />
      <!-- 3. 右面 (Right Face) -->
      <path d="M17 17.5 L25.5 12.6 L25.5 20.6 L17 25.5 Z" fill="url(#gradRight)" />
    </svg>
  `
})
export class LogoComponent {
  @Input() sClass: string = 'w-8 h-8';
}
