import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiClientService } from './api-client.service';

// 訂單狀態類型
export type OrderStatus = 'ToDispatch' | 'ToPick' | 'ToShip' | 'ToCollect' | 'Completed';

// 付款狀態類型
export type PaymentStatus = 'Unpaid' | 'PartiallyPaid' | 'Paid';

// 訂單明細資料介面
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName?: string;
  productImageUrl?: string;
  productSpecId?: number;
  specName?: string;
  quantity: number;
  originalUnitPrice: number;
  discountUnitPrice?: number;
  totalAmount: number;
}

// 訂單主表資料介面
export interface Order {
  id: number;
  merchantId: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  receiverName?: string;
  shippingAddress?: string;
  orderDate: string;
  totalAmount: number;
  receivableAmount: number;
  receivedAmount: number;
  discountAmount: number;
  pointsAmount: number;
  promoAmount: number;
  ordStatus: OrderStatus;
  payStatus: PaymentStatus;
  orderItems: OrderItem[];
  selected?: boolean; // 用於表格核取狀態
}

// 本地 Mock 訂單資料
const MOCK_ORDERS: Record<string, Order[]> = {
  'store-a': [
    {
      id: 1,
      merchantId: 'store-a',
      userId: 101,
      userName: '林志明',
      userEmail: 'jimmy.lin@example.com',
      userPhone: '0912345678',
      receiverName: '林志明',
      shippingAddress: '台北市信義區信義路五段7號 (台北101)',
      orderDate: '2026-05-28T02:30:00.000Z', // UTC
      totalAmount: 1730,
      receivableAmount: 1630,
      receivedAmount: 1630,
      discountAmount: 100,
      pointsAmount: 0,
      promoAmount: 0,
      ordStatus: 'ToShip',
      payStatus: 'Paid',
      orderItems: [
        {
          id: 11,
          orderId: 1,
          productId: 1,
          productName: '耶加雪菲精品咖啡豆 (250g)',
          productImageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
          productSpecId: 201,
          specName: '中淺烘焙 / 半磅',
          quantity: 2,
          originalUnitPrice: 450,
          totalAmount: 900
        },
        {
          id: 12,
          orderId: 1,
          productId: 5,
          productName: '手沖精品玻璃分享壺',
          productImageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500',
          productSpecId: 202,
          specName: '500ml / 高硼矽耐熱',
          quantity: 1,
          originalUnitPrice: 480,
          totalAmount: 480
        },
        {
          id: 17,
          orderId: 1,
          productId: 2,
          productName: '極簡磨砂陶瓷馬克杯',
          productImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
          productSpecId: 203,
          specName: '磨砂黑 / 350ml',
          quantity: 1,
          originalUnitPrice: 350,
          totalAmount: 350
        }
      ]
    },
    {
      id: 2,
      merchantId: 'store-a',
      userId: 102,
      userName: '陳美玲',
      userEmail: 'meiling.chen@example.com',
      userPhone: '0987654321',
      receiverName: '陳美玲',
      shippingAddress: '台中市西屯區台灣大道三段99號',
      orderDate: '2026-05-28T07:45:00.000Z',
      totalAmount: 1050,
      receivableAmount: 1000,
      receivedAmount: 0,
      discountAmount: 0,
      pointsAmount: 50,
      promoAmount: 0,
      ordStatus: 'ToDispatch',
      payStatus: 'Unpaid',
      orderItems: [
        {
          id: 13,
          orderId: 2,
          productId: 2,
          productName: '極簡磨砂陶瓷馬克杯',
          productImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
          productSpecId: 203,
          specName: '磨砂黑 / 350ml',
          quantity: 3,
          originalUnitPrice: 350,
          totalAmount: 1050
        }
      ]
    },
    {
      id: 5,
      merchantId: 'store-a',
      userId: 103,
      userName: '王大同',
      userEmail: 'datong.wang@example.com',
      userPhone: '0933111222',
      receiverName: '王大同',
      shippingAddress: '台北市大安區信義路三段100號',
      orderDate: '2026-05-29T04:00:00.000Z',
      totalAmount: 800,
      receivableAmount: 800,
      receivedAmount: 400,
      discountAmount: 0,
      pointsAmount: 0,
      promoAmount: 0,
      ordStatus: 'ToPick',
      payStatus: 'PartiallyPaid',
      orderItems: [
        {
          id: 18,
          orderId: 5,
          productId: 1,
          productName: '耶加雪菲精品咖啡豆 (250g)',
          productImageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
          productSpecId: 201,
          specName: '中淺烘焙 / 半磅',
          quantity: 1,
          originalUnitPrice: 450,
          totalAmount: 450
        },
        {
          id: 19,
          orderId: 5,
          productId: 2,
          productName: '極簡磨砂陶瓷馬克杯',
          productImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
          productSpecId: 203,
          specName: '磨砂黑 / 350ml',
          quantity: 1,
          originalUnitPrice: 350,
          totalAmount: 350
        }
      ]
    },
    {
      id: 6,
      merchantId: 'store-a',
      userId: 101,
      userName: '林志明',
      userEmail: 'jimmy.lin@example.com',
      userPhone: '0912345678',
      receiverName: '林志明',
      shippingAddress: '台北市中正區重慶南路一段122號',
      orderDate: '2026-05-28T16:00:00.000Z',
      totalAmount: 350,
      receivableAmount: 350,
      receivedAmount: 350,
      discountAmount: 0,
      pointsAmount: 0,
      promoAmount: 0,
      ordStatus: 'ToCollect',
      payStatus: 'Paid',
      orderItems: [
        {
          id: 20,
          orderId: 6,
          productId: 2,
          productName: '極簡磨砂陶瓷馬克杯',
          productImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
          productSpecId: 203,
          specName: '磨砂黑 / 350ml',
          quantity: 1,
          originalUnitPrice: 350,
          totalAmount: 350
        }
      ]
    },
    {
      id: 7,
      merchantId: 'store-a',
      userId: 104,
      userName: '張小華',
      userEmail: 'xiaohua.zhang@example.com',
      userPhone: '0955888999',
      receiverName: '張小華',
      shippingAddress: '台北市信義區忠孝東路五段2號',
      orderDate: '2026-05-25T08:00:00.000Z',
      totalAmount: 900,
      receivableAmount: 800,
      receivedAmount: 800,
      discountAmount: 100,
      pointsAmount: 0,
      promoAmount: 0,
      ordStatus: 'Completed',
      payStatus: 'Paid',
      orderItems: [
        {
          id: 21,
          orderId: 7,
          productId: 1,
          productName: '耶加雪菲精品咖啡豆 (250g)',
          productImageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
          productSpecId: 201,
          specName: '中淺烘焙 / 半磅',
          quantity: 2,
          originalUnitPrice: 450,
          totalAmount: 900
        }
      ]
    }
  ],
  'store-b': [
    {
      id: 3,
      merchantId: 'store-b',
      userId: 103,
      userName: '王大同',
      userEmail: 'datong.wang@example.com',
      userPhone: '0933111222',
      receiverName: '王大同',
      shippingAddress: '高雄市苓雅區自強三路5號 (高雄85大樓)',
      orderDate: '2026-05-27T10:20:00.000Z',
      totalAmount: 2180,
      receivableAmount: 2180,
      receivedAmount: 2180,
      discountAmount: 0,
      pointsAmount: 0,
      promoAmount: 0,
      ordStatus: 'ToCollect',
      payStatus: 'Paid',
      orderItems: [
        {
          id: 14,
          orderId: 3,
          productId: 3,
          productName: '重磅落肩連帽衫',
          productImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500',
          productSpecId: 204,
          specName: '極致黑 / XL',
          quantity: 1,
          originalUnitPrice: 1280,
          totalAmount: 1280
        },
        {
          id: 15,
          orderId: 3,
          productId: 6,
          productName: '水洗復古牛仔棒棒帽',
          productImageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
          productSpecId: 205,
          specName: '復古藍 / 可調節',
          quantity: 2,
          originalUnitPrice: 450,
          totalAmount: 900
        }
      ]
    },
    {
      id: 4,
      merchantId: 'store-b',
      userId: 104,
      userName: '張小華',
      userEmail: 'xiaohua.zhang@example.com',
      userPhone: '0955888999',
      receiverName: '張小華',
      shippingAddress: '新北市板橋區縣民大道二段7號',
      orderDate: '2026-05-28T01:15:00.000Z',
      totalAmount: 590,
      receivableAmount: 590,
      receivedAmount: 0,
      discountAmount: 0,
      pointsAmount: 0,
      promoAmount: 0,
      ordStatus: 'Completed',
      payStatus: 'Unpaid',
      orderItems: [
        {
          id: 16,
          orderId: 4,
          productId: 4,
          productName: '日系原色帆布托特包',
          productImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
          productSpecId: 206,
          specName: '原色米白 / 單一規格',
          quantity: 1,
          originalUnitPrice: 590,
          totalAmount: 590
        }
      ]
    },
    {
      id: 8,
      merchantId: 'store-b',
      userId: 102,
      userName: '陳美玲',
      userEmail: 'meiling.chen@example.com',
      userPhone: '0987654321',
      receiverName: '陳美玲',
      shippingAddress: '台中市南屯區公益路二段51號',
      orderDate: '2026-05-29T14:00:00.000Z',
      totalAmount: 1280,
      receivableAmount: 1280,
      receivedAmount: 0,
      discountAmount: 0,
      pointsAmount: 0,
      promoAmount: 0,
      ordStatus: 'ToDispatch',
      payStatus: 'Unpaid',
      orderItems: [
        {
          id: 22,
          orderId: 8,
          productId: 3,
          productName: '重磅落肩連帽衫',
          productImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500',
          productSpecId: 204,
          specName: '極致黑 / XL',
          quantity: 1,
          originalUnitPrice: 1280,
          totalAmount: 1280
        }
      ]
    },
    {
      id: 9,
      merchantId: 'store-b',
      userId: 101,
      userName: '林志明',
      userEmail: 'jimmy.lin@example.com',
      userPhone: '0912345678',
      receiverName: '林志明',
      shippingAddress: '台北市松山區南京東路四段2號',
      orderDate: '2026-05-28T22:00:00.000Z',
      totalAmount: 2560,
      receivableAmount: 2560,
      receivedAmount: 1280,
      discountAmount: 0,
      pointsAmount: 0,
      promoAmount: 0,
      ordStatus: 'ToPick',
      payStatus: 'PartiallyPaid',
      orderItems: [
        {
          id: 23,
          orderId: 9,
          productId: 3,
          productName: '重磅落肩連帽衫',
          productImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500',
          productSpecId: 204,
          specName: '極致黑 / XL',
          quantity: 2,
          originalUnitPrice: 1280,
          totalAmount: 2560
        }
      ]
    },
    {
      id: 10,
      merchantId: 'store-b',
      userId: 103,
      userName: '王大同',
      userEmail: 'datong.wang@example.com',
      userPhone: '0933111222',
      receiverName: '王大同',
      shippingAddress: '高雄市三民區建國二路318號',
      orderDate: '2026-05-28T08:00:00.000Z',
      totalAmount: 590,
      receivableAmount: 590,
      receivedAmount: 590,
      discountAmount: 0,
      pointsAmount: 0,
      promoAmount: 0,
      ordStatus: 'ToShip',
      payStatus: 'Paid',
      orderItems: [
        {
          id: 24,
          orderId: 10,
          productId: 4,
          productName: '日系原色帆布托特包',
          productImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
          productSpecId: 206,
          specName: '原色米白 / 單一規格',
          quantity: 1,
          originalUnitPrice: 590,
          totalAmount: 590
        }
      ]
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private apiClient: ApiClientService) {}

  /**
   * 根據商家 ID 獲取分頁與排序後的訂單
   */
  fnGetPagedOrders(
    sMerchantId: string,
    params: {
      ordStatus?: string;
      payStatus?: string;
      page: number;
      pageSize: number;
      sortBy?: string | null;
      sortOrder?: 'asc' | 'desc' | null;
      search?: string;
    }
  ): Observable<{ items: Order[], total: number } | Order[]> {
    const oHeaders = { 'X-Merchant-Id': sMerchantId };
    let oHttpParams: any = {
      page: params.page.toString(),
      pageSize: params.pageSize.toString()
    };
    if (params.ordStatus && params.ordStatus !== 'all') {
      oHttpParams.ordStatus = params.ordStatus;
    }
    if (params.payStatus && params.payStatus !== 'all') {
      oHttpParams.payStatus = params.payStatus;
    }
    if (params.sortBy && params.sortOrder) {
      oHttpParams.sortBy = params.sortBy;
      oHttpParams.sortOrder = params.sortOrder;
    }
    if (params.search && params.search.trim()) {
      oHttpParams.search = params.search.trim();
    }

    return this.apiClient.get<any>('/api/orders', { headers: oHeaders, params: oHttpParams }).pipe(
      map(oRes => {
        if (oRes.success && oRes.data) {
          return oRes.data;
        }
        throw new Error(oRes.message);
      }),
      catchError(oErr => {
        console.warn(`後端 Orders 分頁 API 請求失敗，啟用本地 Mock 訂單資料:`, oErr);
        const aMock = MOCK_ORDERS[sMerchantId] || [];
        return of(aMock);
      })
    );
  }

  /**
   * 根據商家 ID 獲取所有訂單 (支援 API 連線，連線失敗則使用 Mock)
   * @param sMerchantId 商家識別碼
   */
  fnGetOrders(sMerchantId: string): Observable<Order[]> {
    const oHeaders = { 'X-Merchant-Id': sMerchantId };
    
    return this.apiClient.get<any>('/api/orders', { headers: oHeaders }).pipe(
      map(oRes => {
        if (oRes.success && oRes.data) {
          if (Array.isArray(oRes.data)) {
            return oRes.data;
          } else if (oRes.data.items && Array.isArray(oRes.data.items)) {
            return oRes.data.items;
          }
        }
        throw new Error(oRes?.message || '回傳格式無效');
      }),
      catchError(oErr => {
        console.warn(`後端 Orders API 請求失敗，啟用本地 Mock 訂單資料:`, oErr);
        const aMock = MOCK_ORDERS[sMerchantId] || [];
        return of(aMock);
      })
    );
  }

  /**
   * 根據訂單 ID 獲取訂單詳情 (支援 API 連線)
   * @param nOrderId 訂單唯一識別碼
   */
  fnGetOrderById(nOrderId: number, sMerchantId: string): Observable<Order | null> {
    const oHeaders = { 'X-Merchant-Id': sMerchantId };

    return this.apiClient.get<Order>(`/api/orders/${nOrderId}`, { headers: oHeaders }).pipe(
      map(oRes => {
        if (oRes.success && oRes.data) {
          return oRes.data;
        }
        throw new Error(oRes.message);
      }),
      catchError(oErr => {
        console.warn(`後端 OrderDetail API 請求失敗，啟用本地 Mock 查詢:`, oErr);
        const aMock = MOCK_ORDERS[sMerchantId] || [];
        const oFound = aMock.find(o => o.id === nOrderId) || null;
        return of(oFound);
      })
    );
  }
}
