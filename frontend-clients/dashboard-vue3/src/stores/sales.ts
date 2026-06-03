import { defineStore } from 'pinia';

interface SalesReport {
  merchantId: string;
  reportingMonth: string;
  revenue: number;
  orderCount: number;
  prevRevenue: number;
  prevOrderCount: number;
  revenueGrowthRatePercent: number;
  topProduct1_Name: string;
  topProduct1_Qty: number;
  topProduct2_Name: string;
  topProduct2_Qty: number;
  topProduct3_Name: string;
  topProduct3_Qty: number;
}

const MOCK_REPORTS: Record<string, SalesReport> = {
  'store-a': {
    merchantId: 'store-a',
    reportingMonth: '2026-05',
    revenue: 15450,
    orderCount: 38,
    prevRevenue: 11200,
    prevOrderCount: 29,
    revenueGrowthRatePercent: 37.95,
    topProduct1_Name: '耶加雪菲精品咖啡豆 (250g)',
    topProduct1_Qty: 24,
    topProduct2_Name: '極簡磨砂陶瓷馬克杯',
    topProduct2_Qty: 14,
    topProduct3_Name: '無名商品',
    topProduct3_Qty: 0
  },
  'store-b': {
    merchantId: 'store-b',
    reportingMonth: '2026-05',
    revenue: 45890,
    orderCount: 42,
    prevRevenue: 51200,
    prevOrderCount: 48,
    revenueGrowthRatePercent: -10.37,
    topProduct1_Name: '重磅落肩寬版連帽衫',
    topProduct1_Qty: 28,
    topProduct2_Name: '日系原色帆布托特包',
    topProduct2_Qty: 18,
    topProduct3_Name: '無名商品',
    topProduct3_Qty: 0
  }
};

export const useSalesStore = defineStore('sales', {
  state: () => ({
    sCurrentMerchant: 'store-a',
    oReport: null as SalesReport | null,
    bIsLoading: false,
    bIsOnline: false
  }),
  actions: {
    async fnLoadReport(sMerchantId: string) {
      this.sCurrentMerchant = sMerchantId;
      this.bIsLoading = true;
      try {
        // 在真實情況下，我們會去調用後端的 Dapper SP 專屬報表端點
        // 例如：GET http://localhost:5000/api/reports/monthly
        const oRes = await fetch(`http://localhost:5000/api/reports/monthly`, {
          method: 'GET',
          headers: {
            'X-Merchant-Id': sMerchantId
          }
        });

        if (oRes.ok) {
          const oData = await oRes.json();
          this.oReport = oData;
          this.bIsOnline = true;
        } else {
          throw new Error('API 異常');
        }
      } catch (oErr) {
        console.warn('報表 API 連線失敗，改用本地 Mock 銷售數據。');
        this.oReport = MOCK_REPORTS[sMerchantId] || null;
        this.bIsOnline = false;
      } finally {
        this.bIsLoading = false;
      }
    }
  }
});
