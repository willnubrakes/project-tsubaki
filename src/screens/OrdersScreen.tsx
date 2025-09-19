import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { OrderCard } from '../components/OrderCard';
import { FilterTabs } from '../components/FilterTabs';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { PartOrderItem, FilterType } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../design/colors';

export const OrdersScreen: React.FC = () => {
  const {
    orders,
    outboxEvents,
    filter,
    expandedOrders,
    setFilter,
    toggleOrderExpansion,
    updateItemStatus,
    updateOrderStatus,
    addEvent,
    syncEvents,
    loadData,
    saveData,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    item: PartOrderItem;
    action: 'PICKED_UP' | 'RETURNED';
    order?: any;
    selectedItems?: PartOrderItem[];
  } | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    };
    
    initializeData();
  }, [loadData]);

  const pendingUploads = outboxEvents.filter(event => !event.synced).length;

  const handleItemAction = (item: PartOrderItem, action: 'PICKED_UP' | 'RETURNED') => {
    setPendingAction({ item, action });
    setCameraModalVisible(true);
  };

  const handleOrderAction = (order: any, selectedItems: PartOrderItem[], action: 'PICKED_UP' | 'RETURNED') => {
    setPendingAction({ 
      item: selectedItems[0], // Use first item as reference, but we'll handle multiple items
      action,
      order,
      selectedItems 
    });
    setCameraModalVisible(true);
  };

  const handlePhotoCapture = (photoUri: string, location?: { lat: number; lng: number; acc: number }) => {
    if (!pendingAction) return;

    const { item, action, order, selectedItems } = pendingAction;
    const newStatus = action === 'PICKED_UP' ? 'PICKED_UP' : 'RETURNED';
    
    if (order && selectedItems) {
      // Order-level action - update multiple items and order status
      selectedItems.forEach(selectedItem => {
        updateItemStatus(selectedItem.id, newStatus);
      });
      
      // For partial pickup, set remaining items to NOT_PICKED_UP
      if (action === 'PICKED_UP') {
        const selectedItemIds = new Set(selectedItems.map(item => item.id));
        const remainingItems = order.items.filter(item => 
          (item.status === 'READY_FOR_PICKUP' || item.status === 'NOT_PICKED_UP') && !selectedItemIds.has(item.id)
        );
        
        remainingItems.forEach(remainingItem => {
          updateItemStatus(remainingItem.id, 'NOT_PICKED_UP');
        });
        
        // Force order status update after all item status changes
        // The computeOrderStatus function will determine the correct status based on item statuses
        const orderWithUpdatedItems = {
          ...order,
          items: order.items.map(item => {
            if (selectedItemIds.has(item.id)) {
              return { ...item, status: 'PICKED_UP' };
            } else if (remainingItems.some(remaining => remaining.id === item.id)) {
              return { ...item, status: 'NOT_PICKED_UP' };
            }
            return item;
          })
        };
        
        // Update the order status based on the new item statuses
        const newOrderStatus = orderWithUpdatedItems.items.some(item => 
          item.status === 'PICKED_UP' || item.status === 'NOT_PICKED_UP'
        ) ? 'PICKED_UP' : 'READY_FOR_PICKUP';
        
        updateOrderStatus(order.id, newOrderStatus);
      }
      
      // Create a single event for the order-level action
      const event = {
        id: `event_${Date.now()}`,
        partOrderId: order.id,
        partOrderItemIds: selectedItems.map(item => item.id),
        type: action,
        photoUri,
        timestamp: Date.now(),
        geo: location,
        synced: false,
      };
      
      addEvent(event);
    } else {
      // Single item action (legacy)
      const event = {
        id: `event_${Date.now()}`,
        partOrderItemId: item.id,
        type: action,
        photoUri,
        timestamp: Date.now(),
        geo: location,
        synced: false,
      };

      updateItemStatus(item.id, newStatus);
      addEvent(event);
    }
    
    saveData(); // Persist changes

    // Reset state
    setPendingAction(null);
    setCameraModalVisible(false);

    const itemCount = selectedItems ? selectedItems.length : 1;
    const itemText = itemCount === 1 ? 'Item' : `${itemCount} items`;
    Alert.alert(
      'Success',
      `${itemText} ${action === 'PICKED_UP' ? 'picked up' : 'returned'} successfully!`,
      [{ text: 'OK' }]
    );
  };

  const handleCameraClose = () => {
    setCameraModalVisible(false);
    setPendingAction(null);
  };

  const handleSync = () => {
    syncEvents();
    saveData();
    Alert.alert('Sync Complete', 'All pending uploads have been synced.', [
      { text: 'OK' }
    ]);
  };

  const renderOrder = ({ item: order }: { item: any }) => (
    <OrderCard
      order={order}
      isExpanded={true}
      onToggleExpansion={() => {}}
      onItemAction={handleItemAction}
      onOrderAction={handleOrderAction}
      filter={filter}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Part Orders</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {pendingUploads > 0 ? `Pending: ${pendingUploads}` : 'Up to date'}
            </Text>
            <TouchableOpacity style={styles.syncIcon} onPress={handleSync}>
              <Ionicons 
                name="sync-outline" 
                size={18} 
                color={pendingUploads > 0 ? Colors.warning : Colors.tertiaryLabel} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <FilterTabs activeFilter={filter} onFilterChange={setFilter} />

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        visible={cameraModalVisible}
        onClose={handleCameraClose}
        onCapture={handlePhotoCapture}
        title={pendingAction ? 
          (pendingAction.order && pendingAction.selectedItems) ?
            `${pendingAction.action === 'PICKED_UP' ? 'Pickup' : 'Return'} - Order ${pendingAction.order.orderNumber}` :
            `${pendingAction.action === 'PICKED_UP' ? 'Pickup' : 'Return'} - ${pendingAction.item.name}` :
          'Capture Evidence'
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondarySystemBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondarySystemBackground,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.tertiaryLabel,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 60, // Account for status bar
    paddingBottom: Spacing.md,
    backgroundColor: Colors.systemBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.label,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusText: {
    ...Typography.caption1,
    color: Colors.tertiaryLabel,
    fontWeight: '500',
  },
  syncIcon: {
    padding: Spacing.xs,
  },
  listContainer: {
    paddingBottom: Spacing.lg,
  },
});
