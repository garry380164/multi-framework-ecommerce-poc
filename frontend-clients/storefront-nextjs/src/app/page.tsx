import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function RootPage() {
  const oCookieStore = cookies();
  const sMerchantId = oCookieStore.get('selected_merchant')?.value || 'store-a';
  
  // 伺服器端直接重導向至商家的動態網址
  redirect(`/${sMerchantId}`);
}

