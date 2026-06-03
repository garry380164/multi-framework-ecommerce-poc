<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useSalesStore } from './stores/sales';

const oStore = useSalesStore();

const fnOnMerchantChange = () => {
  oStore.fnLoadReport(oStore.sCurrentMerchant);
};

onMounted(() => {
  oStore.fnLoadReport('store-a');
});
</script>

<template>
  <div class="app-container">
    <!-- 頂部欄 -->
    <header class="navbar">
      <div class="logo">
        <span class="logo-text">CMS METRICS</span>
        <span class="badge">Vue 3 + Pinia</span>
      </div>
      
      <div class="controls">
        <span class="label">分析商家:</span>
        <select 
          v-model="oStore.sCurrentMerchant" 
          @change="fnOnMerchantChange"
          class="select"
        >
          <option value="store-a">極簡咖啡館 (Store A)</option>
          <option value="store-b">潮流服飾店 (Store B)</option>
        </select>
      </div>
    </header>

    <!-- 主區塊 -->
    <main class="dashboard-main">
      <div class="status-banner" :class="oStore.bIsOnline ? 'online' : 'offline'">
        <span>{{ oStore.bIsOnline ? '● 連線中 (後端 Dapper Stored Procedure 載入)' : '○ 展示中 (後端未啟動，改用本地 Pinia 靜態數據)' }}</span>
      </div>

      <div v-if="oStore.bIsLoading" class="loading">
        正在加載銷售數據...
      </div>

      <div v-else-if="oStore.oReport" class="grid-layout">
        <!-- 卡片一：月營收 -->
        <section class="card">
          <div class="card-header">
            <span class="card-title">本月營收</span>
            <span class="card-icon">💰</span>
          </div>
          <div class="card-value">${{ oStore.oReport.revenue.toLocaleString() }}</div>
          <div class="card-sub">
            上月營收: ${{ oStore.oReport.prevRevenue.toLocaleString() }}
          </div>
        </section>

        <!-- 卡片二：訂單數 -->
        <section class="card">
          <div class="card-header">
            <span class="card-title">本月訂單數</span>
            <span class="card-icon">📦</span>
          </div>
          <div class="card-value">{{ oStore.oReport.orderCount }} 筆</div>
          <div class="card-sub">
            上月訂單數: {{ oStore.oReport.prevOrderCount }} 筆
          </div>
        </section>

        <!-- 卡片三：環比增長率 -->
        <section class="card">
          <div class="card-header">
            <span class="card-title">月營收環比 (MoM)</span>
            <span class="card-icon">📈</span>
          </div>
          <div 
            class="card-value" 
            :class="oStore.oReport.revenueGrowthRatePercent >= 0 ? 'text-success' : 'text-error'"
          >
            {{ oStore.oReport.revenueGrowthRatePercent >= 0 ? '+' : '' }}{{ oStore.oReport.revenueGrowthRatePercent }}%
          </div>
          <div class="card-sub">
            相較上月份的營收變動率
          </div>
        </section>

        <!-- 商品銷售排行 -->
        <section class="card col-span-2">
          <div class="card-header border-b">
            <h3 class="panel-title">🏆 本月熱銷商品排行</h3>
          </div>
          <div class="ranking-list">
            <div class="ranking-item">
              <div class="rank rank-1">1</div>
              <div class="rank-name">{{ oStore.oReport.topProduct1_Name || '尚無資料' }}</div>
              <div class="rank-value">{{ oStore.oReport.topProduct1_Qty }} 件</div>
            </div>
            <div class="ranking-item">
              <div class="rank rank-2">2</div>
              <div class="rank-name">{{ oStore.oReport.topProduct2_Name || '尚無資料' }}</div>
              <div class="rank-value">{{ oStore.oReport.topProduct2_Qty }} 件</div>
            </div>
            <div class="ranking-item">
              <div class="rank rank-3">3</div>
              <div class="rank-name">{{ oStore.oReport.topProduct3_Name || '尚無資料' }}</div>
              <div class="rank-value">{{ oStore.oReport.topProduct3_Qty }} 件</div>
            </div>
          </div>
        </section>

        <!-- 銷售走勢 PoC 展示 -->
        <section class="card">
          <div class="card-header border-b">
            <h3 class="panel-title">📊 銷售目標達成率</h3>
          </div>
          <div class="gauge-container">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: oStore.sCurrentMerchant === 'store-a' ? '78%' : '62%' }"></div>
            </div>
            <div class="gauge-label">
              已達成年度目標的 {{ oStore.sCurrentMerchant === 'store-a' ? '78%' : '62%' }}
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Scoped CSS 實作精緻扁平風格 */
.app-container {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
}

.navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-text {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.badge {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.select {
  padding: 0.4rem 1.5rem 0.4rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #ffffff;
  font-weight: 500;
  cursor: pointer;
  outline: none;
}

.select:focus {
  border-color: #6366f1;
}

.dashboard-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.status-banner {
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 2rem;
}

.status-banner.online {
  background-color: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}

.status-banner.offline {
  background-color: #fff1f2;
  color: #e11d48;
  border-color: #fecdd3;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #64748b;
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* 卡片與容器元件 - 去除陰影，著重邊框與圓角 */
.card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.col-span-2 {
  grid-column: span 1;
}

@media (min-width: 768px) {
  .col-span-2 {
    grid-column: span 2;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.border-b {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.75rem;
  margin-bottom: 0.25rem;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.card-value {
  font-family: 'Outfit', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.card-sub {
  font-size: 0.75rem;
  color: #94a3b8;
}

.text-success {
  color: #10b981;
}

.text-error {
  color: #f43f5e;
}

/* 排行榜 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.rank {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
}

.rank-1 {
  background-color: #fef3c7;
  color: #d97706;
}

.rank-2 {
  background-color: #f1f5f9;
  color: #475569;
}

.rank-3 {
  background-color: #ffedd5;
  color: #ea580c;
}

.rank-name {
  flex: 1;
  font-weight: 500;
}

.rank-value {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  color: #475569;
}

/* 數據進度條 */
.gauge-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  gap: 0.75rem;
}

.progress-bar-bg {
  width: 100%;
  height: 12px;
  background-color: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.progress-bar-fill {
  height: 100%;
  background-color: #0f172a;
  border-radius: 6px;
  transition: width 0.5s ease-out;
}

.gauge-label {
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
}
</style>
