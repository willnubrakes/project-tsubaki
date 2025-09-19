import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, PartOrder, PartEvent, ReportedIssue, ItemStatus, OrderStatus, FilterType } from '../types';
import { seedData } from '../data/seedData';

// Helper function to compute order status based on item statuses
const computeOrderStatus = (items: PartOrder['items']): OrderStatus => {
  const statuses = items.map(item => item.status);
  
  // If all items are PICKED_UP → order PICKED_UP (fully on van)
  if (statuses.every(status => status === 'PICKED_UP')) {
    return 'PICKED_UP';
  }
  
  // If some items are PICKED_UP and some are NOT_PICKED_UP → PARTIALLY_PICKED_UP
  if (statuses.some(status => status === 'PICKED_UP') && 
      statuses.some(status => status === 'NOT_PICKED_UP')) {
    return 'PARTIALLY_PICKED_UP';
  }
  
  // If any item is READY_FOR_PICKUP → order READY_FOR_PICKUP
  if (statuses.some(status => status === 'READY_FOR_PICKUP')) {
    return 'READY_FOR_PICKUP';
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
  reportedIssues: [],
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

  addReportedIssue: (issue: ReportedIssue) => {
    const { reportedIssues } = get();
    set({ reportedIssues: [...reportedIssues, issue] });
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
      const [storedOrders, storedEvents, storedIssues] = await Promise.all([
        AsyncStorage.getItem('orders'),
        AsyncStorage.getItem('outboxEvents'),
        AsyncStorage.getItem('reportedIssues')
      ]);

      const orders = storedOrders ? JSON.parse(storedOrders) : seedData;
      const outboxEvents = storedEvents ? JSON.parse(storedEvents) : [];
      const reportedIssues = storedIssues ? JSON.parse(storedIssues) : [];

      set({ orders, outboxEvents, reportedIssues });
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to seed data
      set({ orders: seedData, outboxEvents: [], reportedIssues: [] });
    }
  },

  saveData: async () => {
    try {
      const { orders, outboxEvents, reportedIssues } = get();
      await Promise.all([
        AsyncStorage.setItem('orders', JSON.stringify(orders)),
        AsyncStorage.setItem('outboxEvents', JSON.stringify(outboxEvents)),
        AsyncStorage.setItem('reportedIssues', JSON.stringify(reportedIssues))
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },

  resetData: async () => {
    try {
      // Clear all stored data
      await Promise.all([
        AsyncStorage.removeItem('orders'),
        AsyncStorage.removeItem('outboxEvents'),
        AsyncStorage.removeItem('reportedIssues')
      ]);
      
      // Reset to fresh seed data
      set({ 
        orders: seedData, 
        outboxEvents: [], 
        reportedIssues: [],
        expandedOrders: new Set()
      });
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  }
}));
