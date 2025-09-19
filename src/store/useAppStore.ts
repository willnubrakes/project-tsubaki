import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, PartOrder, PartEvent, ItemStatus, OrderStatus, FilterType } from '../types';
import { seedData } from '../data/seedData';

// Helper function to compute order status based on item statuses
const computeOrderStatus = (items: PartOrder['items']): OrderStatus => {
  const statuses = items.map(item => item.status);
  
  // If any item is READY_FOR_PICKUP → order READY_FOR_PICKUP
  if (statuses.some(status => status === 'READY_FOR_PICKUP')) {
    return 'READY_FOR_PICKUP';
  }
  
  // Else if all items are PICKED_UP → order PICKED_UP
  if (statuses.every(status => status === 'PICKED_UP')) {
    return 'PICKED_UP';
  }
  
  // Else if any item is READY_FOR_RETURN → order READY_FOR_RETURN
  if (statuses.some(status => status === 'READY_FOR_RETURN')) {
    return 'READY_FOR_RETURN';
  }
  
  // Else if all items are RETURNED → order RETURNED
  if (statuses.every(status => status === 'RETURNED')) {
    return 'RETURNED';
  }
  
  // Default fallback
  return 'READY_FOR_PICKUP';
};

// Helper function to update order status after item status change
const updateOrderStatus = (orders: PartOrder[], orderId: string): PartOrder[] => {
  return orders.map(order => {
    if (order.id === orderId) {
      return {
        ...order,
        status: computeOrderStatus(order.items)
      };
    }
    return order;
  });
};

export const useAppStore = create<AppState>((set, get) => ({
  orders: [],
  outboxEvents: [],
  filter: 'ALL',
  expandedOrders: new Set(),

  setOrders: (orders: PartOrder[]) => set({ orders }),

  updateItemStatus: (itemId: string, status: ItemStatus) => {
    const { orders } = get();
    const updatedOrders = orders.map(order => {
      const updatedItems = order.items.map(item => {
        if (item.id === itemId) {
          return { ...item, status };
        }
        return item;
      });
      
      return {
        ...order,
        items: updatedItems
      };
    });

    // Find the order that contains this item to update its status
    const orderWithItem = updatedOrders.find(order => 
      order.items.some(item => item.id === itemId)
    );
    
    if (orderWithItem) {
      const finalOrders = updateOrderStatus(updatedOrders, orderWithItem.id);
      set({ orders: finalOrders });
    } else {
      set({ orders: updatedOrders });
    }
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const { orders } = get();
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status };
      }
      return order;
    });
    set({ orders: updatedOrders });
  },

  addEvent: (event: PartEvent) => {
    const { outboxEvents } = get();
    set({ outboxEvents: [...outboxEvents, event] });
  },

  syncEvents: () => {
    const { outboxEvents } = get();
    const syncedEvents = outboxEvents.map(event => ({ ...event, synced: true }));
    set({ outboxEvents: syncedEvents });
  },

  setFilter: (filter: FilterType) => set({ filter }),

  toggleOrderExpansion: (orderId: string) => {
    const { expandedOrders } = get();
    const newExpanded = new Set(expandedOrders);
    
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    
    set({ expandedOrders: newExpanded });
  },

  loadData: async () => {
    try {
      const [storedOrders, storedEvents] = await Promise.all([
        AsyncStorage.getItem('orders'),
        AsyncStorage.getItem('outboxEvents')
      ]);

      const orders = storedOrders ? JSON.parse(storedOrders) : seedData;
      const outboxEvents = storedEvents ? JSON.parse(storedEvents) : [];

      set({ orders, outboxEvents });
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to seed data
      set({ orders: seedData, outboxEvents: [] });
    }
  },

  saveData: async () => {
    try {
      const { orders, outboxEvents } = get();
      await Promise.all([
        AsyncStorage.setItem('orders', JSON.stringify(orders)),
        AsyncStorage.setItem('outboxEvents', JSON.stringify(outboxEvents))
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
}));
