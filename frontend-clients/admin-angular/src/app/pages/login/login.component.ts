import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiClientService } from '../../services/api-client.service';
import { environment } from '../../../environments/environment';
import { LucideArrowRight } from '@lucide/angular';
import { LogoComponent } from '../../components/logo/logo.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideArrowRight,
    LogoComponent
  ],
  template: `
    <!-- 滿版雙欄佈局 (移除卡片外框) -->
    <div class="min-h-screen w-full flex flex-col md:flex-row font-sans bg-white">
      
      <!-- 左側：SaaS 儀表板 UI 組件圖 (滿版漸層背景，桌機版顯示) -->
      <div class="hidden md:flex md:w-1/2 bg-gradient-to-tr from-violet-600 via-indigo-600 to-indigo-500 p-16 text-white flex-col justify-between relative overflow-hidden min-h-screen">
        <!-- 背景光暈裝飾 -->
        <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-400/20 blur-3xl"></div>
        
        <div class="z-10">
          <!-- 小徽章 (字體設為 12px (text-xs)) -->
          <span class="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 mb-6 backdrop-blur-sm tracking-wide">
            Next gen automation e-commerce builder
          </span>
          <!-- 標題與簡介 (大氣 text-3xl 字體) -->
          <h1 class="text-3xl font-extrabold tracking-tight mb-4 leading-snug">
            一站式自動化多商家整合，<br>輕鬆管理商品、訂單與會員數據。
          </h1>
          <p class="text-indigo-100 text-sm leading-relaxed max-w-sm">
            透過高防禦性的多租戶 JWT 隔離機制與 SQLite 資料庫串接，協助您在極致流暢且安全的後台管理環境中，輕鬆掌握數位商店全局。
          </p>
        </div>

        <!-- 下方：平整白底、具備 Topbar/Sidebar 的真實 SaaS 儀表板預覽 (純 HTML/CSS 刻出以防模糊，字體皆 >= 12px) -->
        <div class="z-10 bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto flex flex-col overflow-hidden text-slate-800 font-sans min-h-[440px] pointer-events-none select-none opacity-95"
             style="mask-image: linear-gradient(to top, transparent 0%, black 35%); -webkit-mask-image: linear-gradient(to top, transparent 0%, black 35%);">
          
          <!-- 1. 瀏覽器視窗與網址列模擬 (Browser Chrome) -->
          <div class="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center space-x-4">
            <!-- 三色控制按鈕 -->
            <div class="flex items-center space-x-1.5 flex-shrink-0">
              <span class="w-3 h-3 rounded-full bg-[#FF5F56] inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-[#27C93F] inline-block"></span>
            </div>
            
           
          </div>

          <!-- 2. 真實 Web 頂部導航欄 (Top Bar) -->
          <div class="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm">
            <div class="flex items-center space-x-3">
              <!-- 標誌 -->
              <app-logo sClass="w-7 h-7"></app-logo>
              <div class="flex flex-col">
                 <span class="text-xs font-black text-slate-800 tracking-tight leading-none">智慧電商管理系統</span>
                <!-- <span class="text-xs text-slate-400 font-medium mt-0.5 leading-none">多商家自動化系統</span> -->
              </div>
            </div>
            
            <!-- 搜尋欄 -->
            <div class="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-44 text-xs text-slate-400 space-x-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="truncate">搜尋商品、訂單...</span>
            </div>

            <!-- 用戶頭像與通知 -->
            <div class="flex items-center space-x-2.5">
              <!-- 通知圖示 (帶紅點) -->
              <div class="relative p-1 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg hover:bg-slate-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 ring-1 ring-white"></span>
              </div>
              <!-- 設定圖示 -->
              <div class="p-1 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg hover:bg-slate-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span class="w-[1px] h-4 bg-slate-200"></span>
              <!-- 商家使用者 -->
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 scale-90">超級店長</span>
                <span class="text-xs text-slate-700 font-semibold max-w-[65px] truncate">CoffeeManager</span>
                <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border border-indigo-100 shadow-sm">
                  CM
                </div>
              </div>
            </div>
          </div>

          <!-- 3. 下半部：側邊欄 (Sidebar) + 儀表板主體內容 -->
          <div class="flex flex-1 min-h-[350px]">
            
            <!-- 側邊欄 (Sidebar) - 使用精緻的 SVG 圖示 -->
            <div class="w-[130px] bg-slate-50 border-r border-slate-200 p-2.5 flex flex-col justify-between flex-shrink-0">
              <div class="flex flex-col space-y-1">
                <!-- 營運分析 (Active) -->
                <div class="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1.5 rounded-lg flex items-center space-x-2 border border-indigo-100/50">
                  <svg class="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span class="tracking-wide">營運分析</span>
                </div>
                <!-- 商品管理 -->
                <div class="text-slate-500 hover:text-slate-800 text-xs font-medium px-2 py-1.5 rounded-lg flex items-center space-x-2 hover:bg-slate-100 transition cursor-pointer">
                  <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span class="tracking-wide">商品管理</span>
                </div>
                <!-- 訂單總覽 -->
                <div class="text-slate-500 hover:text-slate-800 text-xs font-medium px-2 py-1.5 rounded-lg flex items-center space-x-2 hover:bg-slate-100 transition cursor-pointer">
                  <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span class="tracking-wide">訂單總覽</span>
                </div>
                <!-- 員工管理 -->
                <div class="text-slate-500 hover:text-slate-800 text-xs font-medium px-2 py-1.5 rounded-lg flex items-center space-x-2 hover:bg-slate-100 transition cursor-pointer">
                  <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span class="tracking-wide">員工管理</span>
                </div>
                <!-- 系統設定 -->
                <div class="text-slate-500 hover:text-slate-800 text-xs font-medium px-2 py-1.5 rounded-lg flex items-center space-x-2 hover:bg-slate-100 transition cursor-pointer">
                  <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  <span class="tracking-wide">系統設定</span>
                </div>
              </div>

              <!-- 側邊欄底部商家卡片 -->
              <div class="border-t border-slate-200 pt-2.5 mt-2">
                <div class="bg-slate-100 rounded-lg p-1.5 text-center">
                  <span class="text-xs text-slate-400 block font-semibold uppercase">目前登入</span>
                  <span class="text-xs text-slate-700 font-bold block truncate mt-0.5">極簡咖啡館</span>
                </div>
              </div>
            </div>

            <!-- 主內容區 (Main Area) - 灰底、白卡片圖表 -->
            <div class="flex-1 bg-[#F8FAFC] p-4 flex flex-col space-y-4 overflow-hidden">
              <div class="flex justify-between items-center pb-0.5 border-b border-slate-100">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-slate-800 tracking-tight">數據總覽</span>
                  <span class="text-xs text-slate-400">更新時間：剛剛 (Mocked API)</span>
                </div>
                <span class="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-600 font-semibold shadow-sm flex items-center space-x-1 hover:bg-slate-50 cursor-pointer">
                  <span>本月數據</span>
                  <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>

              <!-- 2x2 指標網格卡片 (白底 border) -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition shadow-sm relative overflow-hidden group">
                  <div class="flex justify-between items-start">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">今日營業額</span>
                    <span class="text-indigo-600 bg-indigo-50 p-1 rounded-lg text-xs scale-90">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div class="mt-2 flex items-baseline justify-between">
                    <span class="text-base font-extrabold font-mono text-slate-800 tracking-tight">$45,800</span>
                    <span class="text-xs text-emerald-600 font-bold flex items-center">↑ 14.2%</span>
                  </div>
                </div>

                <div class="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition shadow-sm relative overflow-hidden group">
                  <div class="flex justify-between items-start">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">總訂單數</span>
                    <span class="text-emerald-600 bg-emerald-50 p-1 rounded-lg text-xs scale-90">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </span>
                  </div>
                  <div class="mt-2 flex items-baseline justify-between">
                    <span class="text-base font-extrabold font-mono text-slate-800 tracking-tight">12,840 筆</span>
                    <span class="text-xs text-emerald-600 font-bold flex items-center">↑ 8.5%</span>
                  </div>
                </div>

                <div class="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition shadow-sm relative overflow-hidden group">
                  <div class="flex justify-between items-start">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">平均客單價</span>
                    <span class="text-amber-600 bg-amber-50 p-1 rounded-lg text-xs scale-90">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </span>
                  </div>
                  <div class="mt-2 flex items-baseline justify-between">
                    <span class="text-base font-extrabold font-mono text-slate-800 tracking-tight">$3,560</span>
                    <span class="text-xs text-emerald-600 font-bold flex items-center">↑ 4.1%</span>
                  </div>
                </div>

                <div class="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition shadow-sm relative overflow-hidden group">
                  <div class="flex justify-between items-start">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">平均轉換率</span>
                    <span class="text-rose-600 bg-rose-50 p-1 rounded-lg text-xs scale-90">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div class="mt-2 flex items-baseline justify-between">
                    <span class="text-base font-extrabold font-mono text-slate-800 tracking-tight">3.82%</span>
                    <span class="text-xs text-rose-500 font-bold flex items-center">↓ 0.3%</span>
                  </div>
                </div>
              </div>

              <!-- 雙欄圖表：營收折線圖 (左) + 圓環佔比圖 (右) -->
              <div class="flex gap-3">
                <!-- 營收折線圖 (白卡片) -->
                <div class="flex-1 bg-white border border-slate-200 rounded-xl p-3 flex flex-col space-y-2 shadow-sm relative overflow-hidden">
                  <div class="flex justify-between items-center text-xs">
                    <span class="font-bold text-slate-700">營收趨勢圖 (半年度)</span>
                    <span class="text-emerald-600 font-bold font-mono bg-emerald-50 px-1.5 py-0.5 rounded text-xs">+15.8%</span>
                  </div>
                  <div class="relative w-full h-24">
                    <svg class="w-full h-full overflow-visible" viewBox="0 0 300 100">
                      <defs>
                        <linearGradient id="chartGradWhite" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#6366F1" stop-opacity="0.2"/>
                          <stop offset="100%" stop-color="#6366F1" stop-opacity="0"/>
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(0,0,0,0.04)" stroke-dasharray="2 2" stroke-width="1" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(0,0,0,0.04)" stroke-dasharray="2 2" stroke-width="1" />
                      <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(0,0,0,0.04)" stroke-dasharray="2 2" stroke-width="1" />
                      
                      <text x="5" y="16" fill="#94A3B8" font-size="9" font-family="monospace">$100k</text>
                      <text x="5" y="46" fill="#94A3B8" font-size="9" font-family="monospace">$50k</text>
                      <text x="5" y="76" fill="#94A3B8" font-size="9" font-family="monospace">$10k</text>
                      
                      <path d="M 0,80 Q 50,30 100,60 T 200,35 T 300,10 L 300,100 L 0,100 Z" fill="url(#chartGradWhite)"/>
                      <path d="M 0,80 Q 50,30 100,60 T 200,35 T 300,10" fill="none" stroke="#6366F1" stroke-width="2.5" stroke-linecap="round"/>
                      <circle cx="200" cy="35" r="4" fill="#6366F1" stroke="#fff" stroke-width="1.5"/>
                      
                      <g transform="translate(160, -2)">
                        <rect width="80" height="28" rx="4" fill="#1E293B" />
                        <text x="40" y="12" fill="#fff" font-size="8" text-anchor="middle" font-weight="bold">5月: $82,400</text>
                        <text x="40" y="22" fill="#A5B4FC" font-size="7" text-anchor="middle">成長 +15.8%</text>
                      </g>
                    </svg>
                  </div>
                  <div class="flex justify-between text-xs text-slate-400 px-1 pt-1 font-mono">
                    <span>1月</span>
                    <span>2月</span>
                    <span>3月</span>
                    <span>4月</span>
                    <span>5月</span>
                    <span>6月</span>
                  </div>
                </div>

                <!-- 多商家佔比 Donut Chart (白卡片) -->
                <div class="w-[130px] bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-between space-y-1.5 flex-shrink-0 shadow-sm">
                  <div class="text-xs font-bold text-slate-700 self-start">多商家佔比</div>
                  <div class="relative flex items-center justify-center h-20 w-20">
                    <svg class="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="28" stroke="#F1F5F9" stroke-width="6" fill="transparent" />
                      <circle cx="40" cy="40" r="28" stroke="#6366F1" stroke-width="6" fill="transparent" 
                              stroke-dasharray="176" stroke-dashoffset="61" stroke-linecap="round" />
                      <circle cx="40" cy="40" r="28" stroke="#10B981" stroke-width="6" fill="transparent" 
                      stroke-dasharray="176" stroke-dashoffset="132" stroke-linecap="round" />
                    </svg>
                    <div class="absolute text-center flex flex-col">
                      <span class="text-xs font-extrabold text-slate-800 leading-tight">營收佔比</span>
                      <span class="text-xs text-slate-400 font-semibold leading-tight">兩家分店</span>
                    </div>
                  </div>
                  <div class="flex flex-col space-y-1 w-full text-xs font-semibold text-slate-500 pt-1 border-t border-slate-100">
                    <div class="flex items-center justify-between">
                      <span class="flex items-center text-slate-600"><span class="w-2 h-2 rounded-full bg-[#6366F1] mr-1.5"></span>咖啡館</span>
                      <span class="font-bold text-slate-700">65%</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="flex items-center text-slate-600"><span class="w-2 h-2 rounded-full bg-[#10B981] mr-1.5"></span>服飾店</span>
                      <span class="font-bold text-slate-700">35%</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- 右側：白底登入表單區域 (滿版 min-h-screen) -->
      <div class="w-full md:w-1/2 p-8 sm:p-16 lg:p-20 flex flex-col justify-between bg-white min-h-screen">
        
        <!-- 最上方：Logo 區塊 (字體放大，text-lg) -->
        <div class="flex items-center space-x-3 mb-8">
          <app-logo sClass="w-8 h-8"></app-logo>
          <span class="font-title text-lg font-black tracking-tight text-slate-800">智慧電商管理系統</span>
        </div>

        <!-- 中間：登入表單 (字體放大，標題使用 text-3xl) -->
        <div class="max-w-md w-full mx-auto">
          <h2 class="text-3xl font-extrabold tracking-tight text-slate-800 mb-2">
            登入管理後台
          </h2>
          <p class="text-sm text-slate-400 mb-8">
            請輸入您的電子郵件與密碼以繼續。
          </p>


          <!-- 錯誤訊息提示卡片 (字體放大為 14px (text-sm)) -->
          <div *ngIf="sErrorMessage" class="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-100 text-sm text-rose-600 font-medium">
            {{ sErrorMessage }}
          </div>

          <form class="space-y-5" (submit)="fnOnLogin($event)">
            <!-- 電子郵件輸入框 (Label 設為 14px，Input 設為 16px 與大氣 py-3.5) -->
            <div>
              <label for="email" class="block text-sm font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">電子郵件</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                [(ngModel)]="sEmail"
                placeholder="johndoe&#64;gmail.com"
                class="block w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-4 py-3.5 text-base text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition duration-150"
              />
            </div>

            <!-- 密碼輸入框 (Label 設為 14px，Input 設為 16px 與大氣 py-3.5) -->
            <div>
              <label for="password" class="block text-sm font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">密碼</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                [(ngModel)]="sPassword"
                placeholder="輸入您的密碼"
                class="block w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-4 py-3.5 text-base text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition duration-150"
              />
            </div>

            <!-- 記住我與忘記密碼 (字體皆設為 12px (text-xs) 以上) -->
            <div class="flex items-center justify-between text-sm pt-1">
              <label class="flex items-center text-slate-500 cursor-pointer">
                <input type="checkbox" [(ngModel)]="bRememberMe" name="rememberMe" class="custom-checkbox mr-2">
                <span>記住我的登入資訊</span>
              </label>
              <a href="#" (click)="fnPoCForgot($event)" class="text-violet-600 hover:text-violet-700 font-bold transition">忘記密碼？</a>
            </div>

            <!-- 登入按鈕 (字體放大為 16px (text-base) 與 py-3.5) -->
            <div class="pt-4">
              <button
                type="submit"
                [disabled]="bIsLoading"
                class="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-lg text-base font-bold text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 cursor-pointer shadow-sm shadow-violet-600/10"
              >
                <span>{{ bIsLoading ? '安全登入中...' : '登入系統' }}</span>
                <svg *ngIf="!bIsLoading" lucideArrowRight class="w-5 h-5"></svg>
              </button>
            </div>

            <!-- 建立新帳號 PoC 連結 (字體設為 12px (text-xs)) -->
            <div class="mt-5 text-center">
              <a href="#" (click)="fnPoCRegister($event)" class="text-sm text-slate-400 hover:text-slate-600 transition font-bold">建立新商家帳號</a>
            </div>
          </form>
        </div>

        <!-- 最下方：測試人員帳號與統一密碼提示 -->
        <div class="mt-8 pt-5 border-t border-slate-100 text-left max-w-md w-full mx-auto">
          <div class="text-xs text-slate-500 space-y-3">
            <div class="text-sm font-semibold text-slate-800">測試帳號與權限對照</div>
            
            <!-- 密碼統一提示 -->
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
              <span class="font-medium text-slate-700">測試登入密碼皆為：</span>
              <code class="bg-slate-200/80 px-1.5 py-0.5 rounded text-xs text-slate-800 font-mono font-bold">password123</code>
              <p class="text-slate-400 mt-1">複製下方任一信箱，輸入此密碼即可登入驗證權限隔離效果。</p>
            </div>

            <!-- 帳號與角色清單 -->
            <div class="space-y-2.5">
              <!-- 全域系統管理員 -->
              <!-- <div class="border border-slate-100 rounded-lg p-3 flex flex-col space-y-1.5 bg-white">
                <span class="font-medium text-slate-800 text-xs">全域系統管理員</span>
                <code class="text-slate-700 font-mono font-bold select-all bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit text-xs">system-admin&#64;test.com</code>
              </div> -->

              <!-- 極簡咖啡館 (Store A) -->
              <div class="border border-slate-100 rounded-lg p-3 flex flex-col space-y-2.5 bg-white">
                <span class="font-medium text-slate-800 text-xs">極簡咖啡館 (Store A)</span>
                <div class="grid grid-cols-1 gap-2 pl-1">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-50 pb-2">
                    <span class="text-xs text-slate-400">管理員</span>
                    <code class="text-slate-700 font-mono font-bold select-all bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-xs">store-a-admin&#64;test.com</code>
                  </div>
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span class="text-xs text-slate-400">店務員</span>
                    <code class="text-slate-700 font-mono font-bold select-all bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-xs">store-a-staff&#64;test.com</code>
                  </div>
                </div>
              </div>

              <!-- 潮流服飾店 (Store B) -->
              <div class="border border-slate-100 rounded-lg p-3 flex flex-col space-y-2.5 bg-white">
                <span class="font-medium text-slate-800 text-xs">潮流服飾店 (Store B)</span>
                <div class="grid grid-cols-1 gap-2 pl-1">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-50 pb-2">
                    <span class="text-xs text-slate-400">管理員</span>
                    <code class="text-slate-700 font-mono font-bold select-all bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-xs">store-b-admin&#64;test.com</code>
                  </div>
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span class="text-xs text-slate-400">店務員</span>
                    <code class="text-slate-700 font-mono font-bold select-all bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-xs">store-b-staff&#64;test.com</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  // 雙向綁定輸入值
  sEmail: string = '';
  sPassword: string = '';
  bRememberMe: boolean = false;
  
  // 狀態控制與錯誤處理
  bIsLoading: boolean = false;
  sErrorMessage: string = '';

  constructor(private apiClient: ApiClientService, private router: Router, private authService: AuthService) {}

  /**
   * 提交登入表單
   */
  fnOnLogin(oEvent: Event) {
    oEvent.preventDefault();
    if (!this.sEmail || !this.sPassword) {
      this.sErrorMessage = '請輸入電子郵件與密碼。';
      return;
    }

    this.bIsLoading = true;
    this.sErrorMessage = '';

    // 直接發送全域登入請求 (不需要 Header 中的商家 ID) (繁體中文註解)
    this.apiClient.post<any>('/api/Auth/login', {
      email: this.sEmail,
      password: this.sPassword
    }).subscribe({
      next: (oRes: any) => {
        this.bIsLoading = false;

        // 相容 data 包裝與原始無包裝之 API 回傳結構 (繁體中文註解)
        const oResAny = oRes as any;
        const sToken = oRes.data?.token || oResAny.token;
        const sUsername = oRes.data?.username || oResAny.username;
        const sRole = oRes.data?.role || oResAny.role;
        const sMerchantId = oRes.data?.merchantId || oResAny.merchantId;
        const aPermissions = oRes.data?.permissions || oResAny.permissions || [];

        if (oRes.success && sToken) {
          // 登入成功：寫入本地與記憶體
          this.authService.fnLogin(
            sToken,
            sUsername,
            sRole,
            sMerchantId,
            aPermissions
          );
          
          this.router.navigate(['/dashboard']);
        } else {
          // 只要 API 回傳失敗，不管是密碼錯誤還是連線失敗，都嘗試進行本地 Mock 離線驗證
          console.warn('API 登入請求失敗，嘗試進行本地 Mock 離線驗證...');
          this.fnRunMockLogin();
        }
      },
      error: (oErr: any) => {
        console.warn('API 登入請求出錯，嘗試進行本地 Mock 離線驗證...');
        this.fnRunMockLogin();
      }
    });
  }

  /**
   * 離線 Mock 登入 Fallback (保障後端服務未啟動時的正常測試與展示) (繁體中文註解)
   */
  private fnRunMockLogin() {
    setTimeout(() => {
      this.bIsLoading = false;
      const sNormalizedEmail = this.sEmail.trim().toLowerCase();
      const sNormalizedPassword = this.sPassword;
      
      let sMockUsername = '';
      let bIsValid = false;
      let sMockRole = 'MerchantAdmin';
      let sMockMerchantId = 'store-a';
      
      // 自動依據 Email 判斷離線商家的歸屬與角色權限
      if (sNormalizedEmail === 'system-admin@test.com' && sNormalizedPassword === 'password123') {
        sMockUsername = 'SystemManager';
        sMockRole = 'SystemAdmin';
        sMockMerchantId = 'store-a';
        bIsValid = true;
      } else if (sNormalizedEmail === 'store-a-admin@test.com' && sNormalizedPassword === 'password123') {
        sMockUsername = 'CoffeeManager';
        sMockRole = 'MerchantAdmin';
        sMockMerchantId = 'store-a';
        bIsValid = true;
      } else if (sNormalizedEmail === 'store-a-staff@test.com' && sNormalizedPassword === 'password123') {
        sMockUsername = 'CoffeeStaff';
        sMockRole = 'MerchantStaff';
        sMockMerchantId = 'store-a';
        bIsValid = true;
      } else if (sNormalizedEmail === 'store-b-admin@test.com' && sNormalizedPassword === 'password123') {
        sMockUsername = 'ApparelManager';
        sMockRole = 'MerchantAdmin';
        sMockMerchantId = 'store-b';
        bIsValid = true;
      } else if (sNormalizedEmail === 'store-b-staff@test.com' && sNormalizedPassword === 'password123') {
        sMockUsername = 'ApparelStaff';
        sMockRole = 'MerchantStaff';
        sMockMerchantId = 'store-b';
        bIsValid = true;
      }

      if (bIsValid) {
        // 生成一個模擬的 Mock JWT Token (以 . 隔開的簡單 token 字串，包含模擬 payload 以過 Guard 檢校)
        const oMockHeader = { alg: 'HS256', typ: 'JWT' };
        const oMockPayload = {
          sub: '1',
          name: sMockUsername,
          email: sNormalizedEmail,
          role: sMockRole,
          merchantId: sMockMerchantId,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 七天過期
        };
        
        const sEncodedHeader = btoa(JSON.stringify(oMockHeader));
        const sEncodedPayload = btoa(JSON.stringify(oMockPayload));
        const sMockToken = `${sEncodedHeader}.${sEncodedPayload}.mocksignature`;

        let aMockPermissions: string[] = [];
        if (sMockRole === 'SystemAdmin') {
          aMockPermissions = ['Product.Create', 'Product.Edit', 'Product.Delete', 'Employee.Manage'];
        } else if (sMockRole === 'MerchantAdmin') {
          aMockPermissions = ['Product.Create', 'Product.Edit', 'Product.Delete'];
        } else if (sMockRole === 'MerchantStaff') {
          aMockPermissions = ['Product.Edit'];
        }

        this.authService.fnLogin(
          sMockToken,
          sMockUsername,
          sMockRole,
          sMockMerchantId,
          aMockPermissions
        );
        
        this.router.navigate(['/dashboard']);
      } else {
        this.sErrorMessage = '電子郵件或密碼錯誤 (離線模式)。';
      }
    }, 800);
  }

  /**
   * 第三方登入 PoC 提示
   * @param sProvider 登入提供者名稱 (如 Google, Apple)
   */
  fnPoCThirdParty(sProvider: string) {
    alert(`[第三方整合 PoC]\n即將透過 ${sProvider} 服務發起 OAuth2 認證，這會在正式環境下連接安全憑證伺服器。`);
  }

  /**
   * 忘記密碼 PoC 提示
   */
  fnPoCForgot(oEvent: Event) {
    oEvent.preventDefault();
    alert(`[忘記密碼 PoC]\n後端將會發送一封密碼重設信件到您輸入的電子郵件信箱。`);
  }

  /**
   * 註冊新商家 PoC 提示
   */
  fnPoCRegister(oEvent: Event) {
    oEvent.preventDefault();
    alert(`[建立商家帳號 PoC]\n即將開啟註冊嚮導以引導您創立新商家，並自動在資料庫內生成對應的租戶與 Users 實體。`);
  }
}
