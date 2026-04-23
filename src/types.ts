export type ListType = 'prepare' | 'store';

export interface Item {
  id: string;
  user_id?: string;
  device_id?: string;
  name: string;
  price: number;
  is_favorite: boolean;
  to_buy: boolean;
  in_cart: boolean;
  list_type: ListType;
  store: string;
  created_at: string;
}

export interface Scan {
  id: string;
  device_id: string;
  store: string;
  total: number;
  items_count: number;
  scanned_at: string;
}

export const STORES = ['E.Leclerc', 'Run Market', 'Jumbo', 'Leader Price', 'Score', 'Marché'] as const;
export type Store = typeof STORES[number];

export type Tab = 'list' | 'scanner' | 'compare' | 'stats';

export interface Receipt {
  id: string;
  user_id?: string;
  device_id?: string;
  store: string;
  store_address: string;
  ticket_number: string;
  cashier: string;
  total: number;
  items_count: number;
  purchased_at: string;
  created_at: string;
  image_path: string;
}

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  name: string;
  quantity: number;
  unit: 'unit' | 'kg';
  unit_price: number;
  total_price: number;
  tva_code: string;
  position: number;
}
