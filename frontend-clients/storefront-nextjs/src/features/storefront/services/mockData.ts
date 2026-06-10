import { Product } from '../types';

// 降級 Mock 資料 - 採用繁體中文內容，並融入日系極簡 UI 風格
export const MOCK_PRODUCTS: Record<string, Product[]> = {
  'store-a': [
    {
      id: 1,
      merchantId: 'store-a',
      name: '耶加雪菲精品咖啡豆 (250g)',
      description: '帶有豐富的柑橘與花香調性，中淺烘焙，酸質明亮細緻。',
      price: 450,
      stock: 120,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 450',
      bIsFullImage: false,
      sCategory: '精選豆'
    },
    {
      id: 2,
      merchantId: 'store-a',
      name: '極簡磨砂陶瓷馬克杯 (售罄)',
      description: '質感磨砂黑，350ml 容量，保溫效果佳，辦公室必備。',
      price: 350,
      stock: 0,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
      createdAt: new Date().toISOString(),
      sBadgeText: 'SOLD OUT',
      sPriceFormatted: 'NT$ 350',
      bIsFullImage: false,
      sCategory: '器具'
    },
    {
      id: 3,
      merchantId: 'store-a',
      name: '冰滴咖啡專用玻璃壺',
      description: '耐熱高矽硼玻璃，極簡線條設計，滴漏流速穩定。',
      price: 1200,
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 1,200',
      bIsFullImage: false,
      sCategory: '器具'
    },
    {
      id: 4,
      merchantId: 'store-a',
      name: '巴拿馬藝妓精品咖啡豆 (250g)',
      description: '頂級莊園藝妓，帶有茉莉花香與檸檬紅茶風味，餘韻綿長。',
      price: 980,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 980',
      bIsFullImage: false,
      sCategory: '精選豆'
    },
    {
      id: 5,
      merchantId: 'store-a',
      name: '極簡咖啡館 16 期終身會員方案',
      description: '加入終身會員，可獲得精選咖啡豆與專屬限量馬克杯一份！',
      price: 6800,
      stock: 99,
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500',
      createdAt: new Date().toISOString(),
      sBadgeText: '新規入會',
      sPriceFormatted: 'NT$ 6,800',
      bIsFullImage: true,
      sCategory: '專案'
    }
  ],
  'store-b': [
    {
      id: 6,
      merchantId: 'store-b',
      name: '重磅落肩寬版連帽衫',
      description: '420g 重磅純棉，寬鬆落肩版型，親膚保暖，美式街頭風格。',
      price: 1280,
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 1,280',
      bIsFullImage: true,
      sCategory: '服飾'
    },
    {
      id: 7,
      merchantId: 'store-b',
      name: '日系原色帆布托特包',
      description: '厚實耐磨帆布，附內部拉鍊小袋，大容量可裝 15 吋筆電。',
      price: 590,
      stock: 110,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 590',
      bIsFullImage: false,
      sCategory: '包袋'
    },
    {
      id: 8,
      merchantId: 'store-b',
      name: '極簡機能防風外套 (售罄)',
      description: '防潑水機能面料，俐落版型，適合城市通勤與戶外穿搭。',
      price: 2480,
      stock: 0,
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500',
      createdAt: new Date().toISOString(),
      sBadgeText: 'SOLD OUT',
      sPriceFormatted: 'NT$ 2,480',
      bIsFullImage: false,
      sCategory: '服飾'
    },
    {
      id: 9,
      merchantId: 'store-b',
      name: '復古水洗老帽',
      description: '水洗斜紋棉布，可調式金屬扣，呈現獨特復古洗舊質感。',
      price: 450,
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
      createdAt: new Date().toISOString(),
      sPriceFormatted: 'NT$ 450',
      bIsFullImage: false,
      sCategory: '配件'
    }
  ]
};

// 商店名稱對照表
export const STORE_NAMES: Record<string, string> = {
  'store-a': '極簡咖啡館 (Store A)',
  'store-b': '潮流服飾店 (Store B)'
};
