import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiClientService } from '../../services/api-client.service';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { 
  LucideLayoutDashboard, 
  LucideTrendingUp, 
  LucidePackage, 
  LucideClipboardList, 
  LucideUsers, 
  LucideSparkles, 
  LucideArrowUpRight, 
  LucideArrowDownRight,
  LucidePercent,
  LucideDollarSign
} from '@lucide/angular';

// 導入環境設定與 Standalone 元件
import { environment } from '../../../environments/environment';
import { LayoutComponent } from '../layout/layout.component';
import { AuthService } from '../../services/auth.service';

Chart.register(...registerables);

// 報表主資料介面
interface SalesReport {
  merchantId: string;
  reportingMonth: string;
  revenue: number;
  revenueGrowth: number;       // 營收環比升降率
  orderCount: number;
  orderCountGrowth: number;    // 訂單環比升降率
  prevRevenue: number;
  prevOrderCount: number;
  aov: number;                 // 平均客單價 (Average Order Value)
  aovGrowth: number;           // 客單價環比
  conversionRate: number;      // 商品轉換率
  conversionRateGrowth: number;// 轉換率環比
  topProducts: Array<{
    name: string;
    qty: number;
    targetQty: number;         // 目標銷量，用以展示進度條
    percentage: number;        // 達成率百分比
  }>;
}

// 近期訂單資料介面
interface RecentOrder {
  orderId: string;
  customerName: string;
  status: 'Completed' | 'Shipped' | 'Pending';
  amount: number;
  time: string;
}

// AI 營運建議介面
interface AIInsight {
  title: string;
  description: string;
  iconType: 'time' | 'stock' | 'sale';
}

// 本地 Mock 銷售報表數據
const MOCK_REPORTS: Record<string, SalesReport> = {
  'store-a': {
    merchantId: 'store-a',
    reportingMonth: '2026-05',
    revenue: 15450,
    revenueGrowth: 37.95,
    orderCount: 38,
    orderCountGrowth: 31.03,
    prevRevenue: 11200,
    prevOrderCount: 29,
    aov: 406.5,
    aovGrowth: 5.28,
    conversionRate: 3.82,
    conversionRateGrowth: 1.25,
    topProducts: [
      { name: '耶加雪菲精品咖啡豆 (250g)', qty: 24, targetQty: 30, percentage: 80.0 },
      { name: '極簡磨砂陶瓷馬克杯', qty: 14, targetQty: 25, percentage: 56.0 },
      { name: '手沖精品玻璃分享壺', qty: 10, targetQty: 15, percentage: 66.6 }
    ]
  },
  'store-b': {
    merchantId: 'store-b',
    reportingMonth: '2026-05',
    revenue: 45890,
    revenueGrowth: -10.37,
    orderCount: 42,
    orderCountGrowth: -12.50,
    prevRevenue: 51200,
    prevOrderCount: 48,
    aov: 1092.6,
    aovGrowth: 2.43,
    conversionRate: 2.45,
    conversionRateGrowth: -0.52,
    topProducts: [
      { name: '重磅落肩寬版連帽衫', qty: 28, targetQty: 35, percentage: 80.0 },
      { name: '日系原色帆布托特包', qty: 18, targetQty: 30, percentage: 60.0 },
      { name: '水洗復古牛仔棒球帽', qty: 8, targetQty: 20, percentage: 40.0 }
    ]
  }
};

// 歷史趨勢圖 Mock 數據
const MOCK_TRENDS: Record<string, { revenue: number[], orders: number[], visitors: number[] }> = {
  'store-a': {
    revenue: [12000, 14000, 11000, 13500, 15450, 16200],
    orders: [30, 35, 28, 33, 38, 40],
    visitors: [800, 920, 750, 890, 990, 1050]
  },
  'store-b': {
    revenue: [48000, 50000, 52000, 51200, 45890, 47000],
    orders: [45, 48, 50, 49, 42, 44],
    visitors: [1800, 1950, 2100, 2050, 1870, 1900]
  }
};

// 商品分類銷量佔比 Mock 數據 (用於圓環圖)
const MOCK_CATEGORIES: Record<string, { labels: string[], data: number[], centerText: string, centerVal: string }> = {
  'store-a': {
    labels: ['精品咖啡豆', '現調飲品', '馬克杯周邊'],
    data: [50, 35, 15],
    centerText: '咖啡豆',
    centerVal: '50%'
  },
  'store-b': {
    labels: ['重磅衛衣', '機能包袋', '復古配飾'],
    data: [60, 22, 18],
    centerText: '上衣類',
    centerVal: '60%'
  }
};

// 新顧客增長 Mock 數據 (用於柱狀圖)
const MOCK_CUSTOMER_GROWTH: Record<string, { months: string[], data: number[] }> = {
  'store-a': {
    months: ['10月', '11月', '12月', '1月', '2月', '3月'],
    data: [150, 180, 290, 210, 230, 310] // 3月為當前月 (高亮)
  },
  'store-b': {
    months: ['10月', '11月', '12月', '1月', '2月', '3月'],
    data: [450, 520, 680, 590, 610, 720] // 3月為當前月 (高亮)
  }
};

// 近期訂單列表 Mock 數據
const MOCK_RECENT_ORDERS: Record<string, RecentOrder[]> = {
  'store-a': [
    { orderId: 'ORD-2026-001', customerName: '陳小明', status: 'Completed', amount: 1250, time: '今日 14:32' },
    { orderId: 'ORD-2026-002', customerName: '林志玲', status: 'Shipped', amount: 450, time: '今日 11:15' },
    { orderId: 'ORD-2026-003', customerName: '周杰倫', status: 'Pending', amount: 930, time: '昨日 18:20' },
    { orderId: 'ORD-2026-004', customerName: '蔡依林', status: 'Completed', amount: 350, time: '05-24 10:05' }
  ],
  'store-b': [
    { orderId: 'ORD-2026-009', customerName: '張學友', status: 'Completed', amount: 2560, time: '今日 15:40' },
    { orderId: 'ORD-2026-010', customerName: '劉德華', status: 'Shipped', amount: 1280, time: '今日 09:20' },
    { orderId: 'ORD-2026-011', customerName: '郭富城', status: 'Pending', amount: 3450, time: '昨日 15:10' },
    { orderId: 'ORD-2026-012', customerName: '黎明', status: 'Completed', amount: 590, time: '05-23 16:30' }
  ]
};

// AI 營運建議 Mock 數據
const MOCK_AI_INSIGHTS: Record<string, AIInsight[]> = {
  'store-a': [
    { title: '最佳銷售時段', description: '每週五下午 2:00 - 4:00 是手沖咖啡銷量高峰，建議推出「精品豆+壺具」限時組合促銷。', iconType: 'time' },
    { title: '客單價優化建議', description: '馬克杯加購率達 18%，建議在結帳頁面新增「咖啡豆加購陶瓷杯享 85 折」之組合提示。', iconType: 'sale' }
  ],
  'store-b': [
    { title: '庫存補貨預警', description: '「重磅落肩連帽衫」本月銷量增長 35%，庫存僅剩 45 件，預估 10 天內售罄，請及早向工廠追單。', iconType: 'stock' },
    { title: '熱銷促銷策略', description: '復古棒球帽的網頁點擊轉換率提升 5%，可配合初夏行銷主題發起「服飾滿額贈老帽」活動。', iconType: 'sale' }
  ]
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    LucideLayoutDashboard,
    LucideTrendingUp,
    LucidePackage,
    LucideClipboardList,
    LucideUsers,
    LucideSparkles,
    LucideArrowUpRight,
    LucideArrowDownRight,
    LucidePercent,
    LucideDollarSign,
    LayoutComponent
  ],
  template: `
    <!-- 使用獨立的版面配置元件 (bLockMerchant 設為 true，鎖定商家權限隔離) -->
    <app-layout
      [sCurrentMerchant]="sCurrentMerchant"
      [sSearchQuery]="sSearchQuery"
      [bIsOnline]="bIsOnline"
      [sApiUrl]="sApiUrl"
      [sUserName]="sUserName"
      [sUserRole]="sUserRole"
      [bLockMerchant]="true"
      (logoutClick)="fnOnLogout()"
    >
      <div class="max-w-7xl mx-auto space-y-4">
        
        <!-- 頂部歡迎與快捷按鈕區 (Welcome Banner) -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div class="space-y-1">
            <h1 class="font-title text-2xl font-bold tracking-tight text-slate-800">
              歡迎回來，{{ sUserName }}！
            </h1>
            
          </div>
          
          <div class="flex flex-wrap items-center gap-3">
            <button (click)="fnPoCAction('New Campaign')" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer">
              新建推廣活動
            </button>
            <button (click)="fnPoCAction('Create Automation')" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer">
              建立自動化任務
            </button>
            <!-- 炫彩漸層 AI 按鈕 -->
            <button 
              (click)="fnOpenAIInsightAlert()"
              class="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <svg lucideSparkles class="w-3.5 h-3.5"></svg>
              <span>產生 AI 營運分析</span>
            </button>
          </div>
        </div>

        <!-- 載入中狀態 -->
        <div *ngIf="bIsLoading" class="text-center py-16 text-slate-500">
          正在載入銷售數據...
        </div>

        <div *ngIf="!bIsLoading && oReport" class="space-y-4">
          
          <!-- 4x1 精細指標卡片網格 (Metric Cards) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- 指標 1：月營收 -->
            <section class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 transition shadow-sm">
              <div class="flex justify-between items-start">
                <span class="text-sm font-semibold text-slate-400 uppercase tracking-wider">本月營收</span>
                <span class="text-slate-400 bg-slate-50 p-1.5 rounded-lg text-sm scale-90 border border-slate-100">
                  <svg lucideDollarSign class="w-4 h-4"></svg>
                </span>
              </div>
              <div class="mt-4 flex items-baseline justify-between">
                <span class="font-title text-2xl font-extrabold text-slate-800 tracking-tight">
                  \${{ oReport.revenue.toLocaleString() }}
                </span>
                <!-- 環比小藥丸 -->
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold"
                      [ngClass]="oReport.revenueGrowth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
                  <svg *ngIf="oReport.revenueGrowth >= 0" lucideArrowUpRight class="w-3 h-3 mr-0.5"></svg>
                  <svg *ngIf="oReport.revenueGrowth < 0" lucideArrowDownRight class="w-3 h-3 mr-0.5"></svg>
                  {{ oReport.revenueGrowth >= 0 ? '+' : '' }}{{ oReport.revenueGrowth }}%
                </span>
              </div>
              <div class="mt-2 text-xs text-slate-400 font-medium">
                相較上月：\${{ oReport.prevRevenue.toLocaleString() }}
              </div>
            </section>

            <!-- 指標 2：總訂單數 -->
            <section class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 transition shadow-sm">
              <div class="flex justify-between items-start">
                <span class="text-sm font-semibold text-slate-400 uppercase tracking-wider">本月訂單數</span>
                <span class="text-slate-400 bg-slate-50 p-1.5 rounded-lg text-sm scale-90 border border-slate-100">
                  <svg lucideClipboardList class="w-4 h-4"></svg>
                </span>
              </div>
              <div class="mt-4 flex items-baseline justify-between">
                <span class="font-title text-2xl font-extrabold text-slate-800 tracking-tight">
                  {{ oReport.orderCount.toLocaleString() }} 筆
                </span>
                <!-- 環比小藥丸 -->
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold"
                      [ngClass]="oReport.orderCountGrowth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
                  <svg *ngIf="oReport.orderCountGrowth >= 0" lucideArrowUpRight class="w-3 h-3 mr-0.5"></svg>
                  <svg *ngIf="oReport.orderCountGrowth < 0" lucideArrowDownRight class="w-3 h-3 mr-0.5"></svg>
                  {{ oReport.orderCountGrowth >= 0 ? '+' : '' }}{{ oReport.orderCountGrowth }}%
                </span>
              </div>
              <div class="mt-2 text-xs text-slate-400 font-medium">
                相較上月：{{ oReport.prevOrderCount }} 筆
              </div>
            </section>

            <!-- 指標 3：平均客單價 (AOV) -->
            <section class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 transition shadow-sm">
              <div class="flex justify-between items-start">
                <span class="text-sm font-semibold text-slate-400 uppercase tracking-wider">平均客單價 (AOV)</span>
                <span class="text-slate-400 bg-slate-50 p-1.5 rounded-lg text-sm scale-90 border border-slate-100">
                  <svg lucideTrendingUp class="w-4 h-4"></svg>
                </span>
              </div>
              <div class="mt-4 flex items-baseline justify-between">
                <span class="font-title text-2xl font-extrabold text-slate-800 tracking-tight">
                  \${{ oReport.aov.toLocaleString() }}
                </span>
                <!-- 環比小藥丸 -->
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold"
                      [ngClass]="oReport.aovGrowth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
                  <svg *ngIf="oReport.aovGrowth >= 0" lucideArrowUpRight class="w-3 h-3 mr-0.5"></svg>
                  <svg *ngIf="oReport.aovGrowth < 0" lucideArrowDownRight class="w-3 h-3 mr-0.5"></svg>
                  {{ oReport.aovGrowth >= 0 ? '+' : '' }}{{ oReport.aovGrowth }}%
                </span>
              </div>
              <div class="mt-2 text-xs text-slate-400 font-medium">
                客流量付費轉化品質
              </div>
            </section>

            <!-- 指標 4：商品轉換率 (Conversion Rate) -->
            <section class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 transition shadow-sm">
              <div class="flex justify-between items-start">
                <span class="text-sm font-semibold text-slate-400 uppercase tracking-wider">商品購買轉換率</span>
                <span class="text-slate-400 bg-slate-50 p-1.5 rounded-lg text-sm scale-90 border border-slate-100">
                  <svg lucidePercent class="w-4 h-4"></svg>
                </span>
              </div>
              <div class="mt-4 flex items-baseline justify-between">
                <span class="font-title text-2xl font-extrabold text-slate-800 tracking-tight">
                  {{ oReport.conversionRate }}%
                </span>
                <!-- 環比小藥丸 -->
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold"
                      [ngClass]="oReport.conversionRateGrowth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
                  <svg *ngIf="oReport.conversionRateGrowth >= 0" lucideArrowUpRight class="w-3 h-3 mr-0.5"></svg>
                  <svg *ngIf="oReport.conversionRateGrowth < 0" lucideArrowDownRight class="w-3 h-3 mr-0.5"></svg>
                  {{ oReport.conversionRateGrowth >= 0 ? '+' : '' }}{{ oReport.conversionRateGrowth }}%
                </span>
              </div>
              <div class="mt-2 text-xs text-slate-400 font-medium">
                商品詳情頁付費轉換
              </div>
            </section>

          </div>

          <!-- 中層版面：銷售業績多線趨勢圖 (左) + 商品分類銷量佔比圓環圖 (右) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <!-- 銷售多線業績趨勢圖 (Line Chart - 佔 2 欄) -->
            <div class="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 class="font-title text-base font-bold text-slate-700">銷售業績走勢</h3>
                  <p class="text-xs text-slate-400 font-medium">近半年營收、訂單數與客流量對比</p>
                </div>
                <span class="text-[11px] font-semibold bg-brand-primary-light border border-brand-primary/10 px-2.5 py-1 rounded-xl text-brand-primary">
                  半年期數據
                </span>
              </div>
              
              <!-- 雙 Y 軸折線圖 canvas -->
              <div class="relative w-full" style="height: 300px;">
                <canvas #trendCanvas></canvas>
              </div>
            </div>

            <!-- 商品分類分佈圖 (Doughnut Chart - 佔 1 欄) -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div class="pb-2 border-b border-slate-100">
                <h3 class="font-title text-base font-bold text-slate-700">商品分類分佈</h3>
                <p class="text-xs text-slate-400 font-medium">主力商品分類之銷售佔比</p>
              </div>

              <!-- Doughnut 圓環圖 -->
              <div class="relative flex justify-center items-center my-4" style="height: 180px;">
                <canvas #pieCanvas></canvas>
              </div>

              <div class="flex items-center justify-around text-sm font-semibold text-slate-500 pt-2 border-t border-slate-100">
                <span class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-[#5d5fef] mr-1.5"></span>分類 A</span>
                <span class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-[#10b981] mr-1.5"></span>分類 B</span>
                <span class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-[#cbd5e1] mr-1.5"></span>其他</span>
              </div>
            </div>

          </div>

          <!-- 下層版面：新顧客成長柱狀圖 (左) + 近期訂單列表 (中) + 熱銷排行與 AI 建議 (右) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <!-- 顧客成長柱狀圖 (Bar Chart - 佔 1 欄) -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
              <div class="pb-2 border-b border-slate-100">
                <h3 class="font-title text-base font-bold text-slate-700">顧客成長趨勢</h3>
                <p class="text-xs text-slate-400 font-medium">月度新註冊/消費顧客成長</p>
              </div>

              <!-- Bar 柱狀圖 -->
              <div class="relative w-full" style="height: 250px;">
                <canvas #customerBarCanvas></canvas>
              </div>
            </div>

            <!-- 近期訂單列表 (Recent Orders Table - 佔 1 欄) -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 class="font-title text-base font-bold text-slate-700">近期訂單交易</h3>
                  <p class="text-xs text-slate-400 font-medium">最新成立的交易資料</p>
                </div>
                <button (click)="fnPoCAction('View All Orders')" class="text-brand-primary hover:text-brand-primary-hover text-[11px] font-bold cursor-pointer transition">
                  查看全部
                </button>
              </div>

              <!-- 訂單簡易表格 -->
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th class="pb-2">訂單號</th>
                      <th class="pb-2">顧客</th>
                      <th class="pb-2">狀態</th>
                      <th class="pb-2 text-right">金額</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-sm">
                    <tr *ngFor="let order of aRecentOrders" class="hover:bg-slate-50/50 transition">
                      <td class="py-2.5 font-mono font-medium text-slate-600">{{ order.orderId }}</td>
                      <td class="py-2.5 font-medium text-slate-700">{{ order.customerName }}</td>
                      <td class="py-2.5">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
                              [ngClass]="{
                                'bg-emerald-50 text-emerald-600': order.status === 'Completed',
                                'bg-blue-50 text-blue-600': order.status === 'Shipped',
                                'bg-amber-50 text-amber-600': order.status === 'Pending'
                              }">
                          {{ order.status === 'Completed' ? '已完成' : order.status === 'Shipped' ? '已出貨' : '待處理' }}
                        </span>
                      </td>
                      <td class="py-2.5 text-right font-semibold text-slate-700">\${{ order.amount.toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 熱銷排行進度條與 AI Insights (佔 1 欄) -->
            <div class="flex flex-col space-y-6">
              
              <!-- 熱銷商品進度條清單 -->
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
                <div class="pb-2 border-b border-slate-100">
                  <h3 class="font-title text-base font-bold text-slate-700">🏆 本月熱銷排行榜</h3>
                </div>

                <div class="space-y-4">
                  <div *ngFor="let product of oReport.topProducts; let i = index" class="space-y-1.5">
                    <div class="flex justify-between items-center text-sm">
                      <div class="flex items-center space-x-2">
                        <span class="w-4 h-4 rounded text-xs font-bold flex items-center justify-center"
                              [ngClass]="{
                                'bg-amber-100 text-amber-700': i === 0,
                                'bg-slate-100 text-slate-700': i === 1,
                                'bg-orange-100 text-orange-700': i === 2
                              }">{{ i + 1 }}</span>
                        <span class="font-medium text-slate-700 truncate max-w-[150px]" [title]="product.name">{{ product.name }}</span>
                      </div>
                      <span class="font-bold text-slate-600">{{ product.percentage }}% ({{ product.qty }}件)</span>
                    </div>
                    <!-- 進度條 -->
                    <div class="w-full bg-slate-100 border border-slate-200/50 rounded-full h-2.5 overflow-hidden">
                      <div class="bg-brand-primary h-full rounded-full transition-all duration-500"
                           [style.width]="product.percentage + '%'"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- AI Insights 建議卡片 -->
              

            </div>

          </div>

        </div>
      </div>
    </app-layout>
  `,
  styles: []
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  sCurrentMerchant: string = 'store-a';
  sSearchQuery: string = '';
  oReport: SalesReport | null = null;
  bIsLoading: boolean = false;
  bIsOnline: boolean = false;

  // 登入與 API 環境資訊
  sUserName: string = '管理員';
  sUserRole: string = '店家管理員';
  sApiUrl: string = environment.apiUrl;

  // 近期訂單、AI Insights 與圓環中心文字狀態
  aRecentOrders: RecentOrder[] = [];
  aInsights: AIInsight[] = [];
  sCategoryCenterText: string = '咖啡豆';
  sCategoryCenterVal: string = '50%';

  // Canvas 元素參照
  @ViewChild('trendCanvas') trendCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas') pieCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('customerBarCanvas') customerBarCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Chart.js 圖表實例
  private oTrendChartInstance: Chart | null = null;
  private oPieChartInstance: Chart | null = null;
  private oCustomerBarChartInstance: Chart | null = null;

  constructor(private apiClient: ApiClientService, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.sUserName = this.authService.sUserName;
    const sRoleName = this.authService.sUserRole;
    if (sRoleName === 'SystemAdmin') {
      this.sUserRole = '系統管理員';
    } else if (sRoleName === 'MerchantAdmin') {
      this.sUserRole = '店家管理員';
    } else if (sRoleName === 'MerchantStaff') {
      this.sUserRole = '店家店務人員';
    } else {
      this.sUserRole = sRoleName;
    }
    
    // 鎖定當前使用者所屬的商家
    this.sCurrentMerchant = this.authService.sCurrentMerchant;

    // 載入該商家的非圖表結構性 Mock 欄位 (例如 Recent Orders 與 AI Insights)
    this.fnLoadLocalMockStructure();

    // 載入銷售月度報表
    this.fnLoadReport();
  }

  ngAfterViewInit() {
    // 圖表渲染等待 API 資料成功獲取後觸發
  }

  ngOnDestroy() {
    this.fnDestroyCharts();
  }

  /**
   * 載入本地商家的非 API 欄位 (Recent Orders, AI Insights)
   */
  fnLoadLocalMockStructure() {
    this.aRecentOrders = MOCK_RECENT_ORDERS[this.sCurrentMerchant] || [];
    this.aInsights = MOCK_AI_INSIGHTS[this.sCurrentMerchant] || [];
    const oCatMeta = MOCK_CATEGORIES[this.sCurrentMerchant];
    if (oCatMeta) {
      this.sCategoryCenterText = oCatMeta.centerText;
      this.sCategoryCenterVal = oCatMeta.centerVal;
    }
  }

  /**
   * 載入月度銷售數據 (API 請求，帶 X-Merchant-Id，異常則 fallback)
   */
  fnLoadReport() {
    this.bIsLoading = true;

    this.apiClient.get<any>('/api/reports/monthly', {
      headers: { 'X-Merchant-Id': this.sCurrentMerchant }
    }).subscribe({
      next: (oRes: any) => {
        // 相容 data 包裝與原始無包裝之 API 回傳結構 (繁體中文註解)
        const oData = oRes.data || oRes;
        if (oRes.success && oData && oData.revenue !== undefined) {
          const oLocalReport = MOCK_REPORTS[this.sCurrentMerchant];
          this.oReport = {
            merchantId: oData.merchantId || this.sCurrentMerchant,
            reportingMonth: oData.reportingMonth || '2026-05',
            revenue: oData.revenue,
            revenueGrowth: oData.revenueGrowthRatePercent || oLocalReport.revenueGrowth,
            orderCount: oData.orderCount,
            orderCountGrowth: oLocalReport.orderCountGrowth,
            prevRevenue: oData.prevRevenue,
            prevOrderCount: oData.prevOrderCount,
            aov: oLocalReport.aov,
            aovGrowth: oLocalReport.aovGrowth,
            conversionRate: oLocalReport.conversionRate,
            conversionRateGrowth: oLocalReport.conversionRateGrowth,
            topProducts: [
              { name: oData.topProduct1_Name || oLocalReport.topProducts[0].name, qty: oData.topProduct1_Qty || 0, targetQty: 30, percentage: oLocalReport.topProducts[0].percentage },
              { name: oData.topProduct2_Name || oLocalReport.topProducts[1].name, qty: oData.topProduct2_Qty || 0, targetQty: 25, percentage: oLocalReport.topProducts[1].percentage },
              { name: oData.topProduct3_Name || oLocalReport.topProducts[2].name, qty: oData.topProduct3_Qty || 0, targetQty: 15, percentage: oLocalReport.topProducts[2].percentage }
            ]
          };
          this.bIsOnline = true;
          this.bIsLoading = false;
          setTimeout(() => this.fnRenderCharts(), 50);
        } else {
          this.fnFallbackMockReport();
        }
      },
      error: (oErr: any) => {
        this.fnFallbackMockReport();
      }
    });
  }

  /**
   * 啟用豐富化本地 Mock 銷售數據之回退處理 (繁體中文註解)
   */
  private fnFallbackMockReport() {
    console.warn('報表 API 連線失敗或格式不合，啟用豐富化本地 Mock 銷售數據。');
    this.oReport = MOCK_REPORTS[this.sCurrentMerchant] || null;
    this.bIsOnline = false;
    this.bIsLoading = false;
    setTimeout(() => this.fnRenderCharts(), 50);
  }

  /**
   * 初始化與渲染 3 組 Chart.js 圖表 (折線圖、圓環圖、柱狀圖)
   */
  fnRenderCharts() {
    if (!this.oReport) return;
    this.fnDestroyCharts();

    // 1. 初始化銷售業績多線趨勢圖 (雙 Y 軸：y 軸為營收/顧客，y1 軸為訂單數)
    const elTrend = this.trendCanvasRef?.nativeElement;
    if (elTrend) {
      const oCtx = elTrend.getContext('2d');
      if (oCtx) {
        // 建立漸層色背景
        const oGradientIndigo = oCtx.createLinearGradient(0, 0, 0, 250);
        oGradientIndigo.addColorStop(0, 'rgba(93, 95, 239, 0.15)');
        oGradientIndigo.addColorStop(1, 'rgba(93, 95, 239, 0.00)');

        const oGradientEmerald = oCtx.createLinearGradient(0, 0, 0, 250);
        oGradientEmerald.addColorStop(0, 'rgba(16, 185, 129, 0.10)');
        oGradientEmerald.addColorStop(1, 'rgba(16, 185, 129, 0.00)');

        const oTrendData = MOCK_TRENDS[this.sCurrentMerchant] || { revenue: [], orders: [], visitors: [] };

        this.oTrendChartInstance = new Chart(oCtx, {
          type: 'line',
          data: {
            labels: ['10月', '11月', '12月', '1月', '2月', '3月'],
            datasets: [
              {
                label: '月營收 (USD)',
                data: oTrendData.revenue,
                borderColor: '#5d5fef',
                borderWidth: 2.5,
                backgroundColor: oGradientIndigo,
                fill: true,
                tension: 0.3,
                yAxisID: 'y',
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#5d5fef',
                pointHoverBorderWidth: 2
              },
              {
                label: '顧客流量 (人)',
                data: oTrendData.visitors,
                borderColor: '#f59e0b',
                borderWidth: 2,
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.3,
                yAxisID: 'y',
                pointStyle: 'rectRot',
                pointHoverRadius: 6
              },
              {
                label: '訂單數 (筆)',
                data: oTrendData.orders,
                borderColor: '#10b981',
                borderWidth: 2,
                backgroundColor: oGradientEmerald,
                fill: true,
                tension: 0.3,
                yAxisID: 'y1',
                pointHoverRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  boxWidth: 10,
                  font: { size: 10, weight: 500 },
                  color: '#64748b'
                }
              },
              tooltip: {
                backgroundColor: '#0f172a',
                padding: 10,
                cornerRadius: 8,
                titleFont: { size: 11, weight: 'bold' },
                bodyFont: { size: 11 }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 10 } }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: { color: '#f1f5f9' },
                ticks: { color: '#94a3b8', font: { size: 9 } }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false }, // 不重疊主網格線
                ticks: { color: '#94a3b8', font: { size: 9 } }
              }
            }
          }
        });
      }
    }

    // 2. 初始化商品分類銷量佔比圓環圖 (Doughnut Chart)
    const elPie = this.pieCanvasRef?.nativeElement;
    if (elPie) {
      const oCtxPie = elPie.getContext('2d');
      if (oCtxPie) {
        const oCatData = MOCK_CATEGORIES[this.sCurrentMerchant] || { labels: [], data: [] };

        // 自訂圓心文字插件，將文字直接繪製於 Canvas 內部，防止 z-index 遮擋 Tooltip
        const centerTextPlugin = {
          id: 'centerText',
          beforeDraw: (chart: any) => {
            const { ctx, chartArea } = chart;
            const sText1 = this.sCategoryCenterText;
            const sText2 = this.sCategoryCenterVal;
            ctx.save();
            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;
            
            // 繪製分類標籤
            ctx.font = 'bold 11px "Noto Sans TC", Inter, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sText1, centerX, centerY - 10);
            
            // 繪製百分比數值
            ctx.font = 'bold 16px Outfit, "Noto Sans TC", sans-serif';
            ctx.fillStyle = '#1e293b';
            ctx.fillText(sText2, centerX, centerY + 10);
            ctx.restore();
          }
        };

        this.oPieChartInstance = new Chart(oCtxPie, {
          type: 'doughnut',
          data: {
            labels: oCatData.labels,
            datasets: [{
              data: oCatData.data,
              backgroundColor: ['#5d5fef', '#10b981', '#cbd5e1'],
              borderWidth: 3,
              borderColor: '#ffffff',
              hoverOffset: 4
            }]
          },
          plugins: [centerTextPlugin],
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0f172a',
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: (oItem: any) => ' ' + oItem.label + ': ' + oItem.raw + '%'
                }
              }
            },
            cutout: '72%'
          }
        });
      }
    }

    // 3. 初始化顧客成長柱狀圖 (Bar Chart)
    const elBar = this.customerBarCanvasRef?.nativeElement;
    if (elBar) {
      const oCtxBar = elBar.getContext('2d');
      if (oCtxBar) {
        const oBarData = MOCK_CUSTOMER_GROWTH[this.sCurrentMerchant] || { months: [], data: [] };
        
        // 建立 Indigo 漸層色，供高亮柱子使用
        const oGradHighlight = oCtxBar.createLinearGradient(0, 0, 0, 250);
        oGradHighlight.addColorStop(0, '#5d5fef');
        oGradHighlight.addColorStop(1, '#818cf8');

        // 生成每根柱子的背景色 (最後一個月份為當前月，實施高亮，其餘為半透明淡灰色)
        const aBgColors = oBarData.data.map((_, index) => 
          index === oBarData.data.length - 1 ? oGradHighlight : 'rgba(203, 213, 225, 0.5)'
        );

        const aHoverBgColors = oBarData.data.map((_, index) => 
          index === oBarData.data.length - 1 ? '#4f46e5' : 'rgba(148, 163, 184, 0.7)'
        );

        this.oCustomerBarChartInstance = new Chart(oCtxBar, {
          type: 'bar',
          data: {
            labels: oBarData.months,
            datasets: [{
              label: '新顧客成長 (人)',
              data: oBarData.data,
              backgroundColor: aBgColors,
              hoverBackgroundColor: aHoverBgColors,
              borderRadius: 6,
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0f172a',
                padding: 10,
                cornerRadius: 8
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 10 } }
              },
              y: {
                grid: { color: '#f1f5f9' },
                ticks: { color: '#94a3b8', font: { size: 9 } }
              }
            }
          }
        });
      }
    }
  }

  /**
   * 銷毀現有三組圖表實例
   */
  private fnDestroyCharts() {
    if (this.oTrendChartInstance) {
      this.oTrendChartInstance.destroy();
      this.oTrendChartInstance = null;
    }
    if (this.oPieChartInstance) {
      this.oPieChartInstance.destroy();
      this.oPieChartInstance = null;
    }
    if (this.oCustomerBarChartInstance) {
      this.oCustomerBarChartInstance.destroy();
      this.oCustomerBarChartInstance = null;
    }
  }

  /**
   * 登出系統
   */
  fnOnLogout() {
    this.authService.fnLogout();
    this.router.navigate(['/login']);
  }

  /**
   * 快捷動作 PoC 演示
   */
  fnPoCAction(sActionName: string) {
    alert(`[\${sActionName}動作]\n動作驗證成功！此為 PoC 快捷按鈕功能演示，將觸發對應後台業務模組。`);
  }

  /**
   * 產生 AI 營運分析 PoC
   */
  fnOpenAIInsightAlert() {
    const sMerchantName = this.sCurrentMerchant === 'store-a' ? '極簡咖啡館' : '潮流服飾店';
    alert(`[AI 營運診斷 PoC]\n\n正在呼叫 OpenAI GPT-4 進行商家「\${sMerchantName}」診斷...\n分析結果：\n1. 客流量與營收關聯係數高達 0.89。\n2. 商品轉換率目前處於穩定區間，但發現有客單價 (AOV) 增長放緩趨勢。\n3. 建議立即啟動組合搭配優惠與加購促銷。`);
  }

  /**
   * 開啟 AI 營運助手對話方塊 PoC
   */
  fnOpenAIAssistantModal() {
    alert(`[AI 營運助手 PoC]\n\n已成功喚起 AI Copilot 助手面板！\n「您好！我是您的專屬電商營運導師。已為您整理好了本月的營運漏洞報告，請問需要針對庫存預警還是銷量下降的商品類別進行分析？」`);
  }
}
