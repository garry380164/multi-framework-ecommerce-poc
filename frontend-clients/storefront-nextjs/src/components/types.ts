export interface Product {
  id: number;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  createdAt: string;
  sBadgeText?: string;
  sPriceFormatted?: string;
  bIsFullImage?: boolean;
  sCategory?: string;
  categoryName?: string;
}

export interface UserSession {
  token: string;
  username: string;
  role: string;
  merchantId: string;
}

export interface CategoryCount {
  name: string;
  count: number;
}
