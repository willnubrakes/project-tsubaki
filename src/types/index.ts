// Data Models for Tsubaki Inventory Control App

export type OrderStatus = 
  | "READY_FOR_PICKUP" 
  | "PICKED_UP" 
  | "READY_FOR_RETURN" 
  | "RETURNED"
  | "ORDERED";

export type ItemStatus = 
  | "READY_FOR_PICKUP" 
  | "PICKED_UP" 
  | "READY_FOR_RETURN" 
  | "RETURNED"
  | "NOT_PICKED_UP";

export type EventType = "PICKED_UP" | "RETURNED";

export interface PartOrderItem {
  id: string;
  partNumber: string; // SKU
  name: string;
  units: number;
  status: ItemStatus;
  orderId: string;
  jobId: string;
  jobNumber: string;
}

export interface PartOrder {
  id: string;
  orderNumber: string;
  storeName: string;
  storeLocation: string;
  createdAt: number; // ms timestamp
  status: OrderStatus;
  items: PartOrderItem[];
}

export interface PartEvent {
  id: string;
  partOrderItemId?: string; // For single item events
  partOrderId?: string; // For order-level events
  partOrderItemIds?: string[]; // For order-level events with multiple items
  type: EventType;
  photoUri: string;
  timestamp: number;
  geo?: {
    lat?: number;
    lng?: number;
    acc?: number;
  };
  synced: boolean;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  acc: number;
}

// Filter types for the main screen
export type FilterType = "ALL" | "READY_FOR_PICKUP" | "PICKED_UP" | "READY_FOR_RETURN";

// Store state interface
export interface AppState {
  orders: PartOrder[];
  outboxEvents: PartEvent[];
  filter: FilterType;
  expandedOrders: Set<string>;
  
  // Actions
  setOrders: (orders: PartOrder[]) => void;
  updateItemStatus: (itemId: string, status: ItemStatus) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addEvent: (event: PartEvent) => void;
  syncEvents: () => void;
  setFilter: (filter: FilterType) => void;
  toggleOrderExpansion: (orderId: string) => void;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}
