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
import { BlurView } from 'expo-blur';
import { useAppStore } from '../store/useAppStore';
import { OrderCard } from '../components/OrderCard';
import { FilterTabs } from '../components/FilterTabs';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { PartOrderItem, FilterType, ReportedIssue, IssueType } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../design/colors';

export const OrdersScreen: React.FC = () => {
  const {
    orders,
    outboxEvents,
    reportedIssues,
    filter,
    expandedOrders,
    setFilter,
    toggleOrderExpansion,
    updateItemStatus,
    updateOrderStatus,
    addEvent,
    addReportedIssue,
    syncEvents,
    loadData,
    saveData,
    resetData,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    item: PartOrderItem;
    action: 'PICKED_UP' | 'RETURNED';
    order?: any;
    selectedItems?: PartOrderItem[];
  } | null>(null);
  const [titleTapCount, setTitleTapCount] = useState(0);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    };
    
    initializeData();
  }, [loadData]);

  const pendingUploads = outboxEvents.filter(event => !event.synced).length;

  const getFilteredOrders = () => {
    if (filter === 'ALL') return orders;
    
    return orders.filter(order => {
      // For partial orders, check if any items match the filter
      if (order.status === 'PARTIALLY_PICKED_UP') {
        return order.items.some(item => item.status === filter);
      }
      
      // For other orders, check if order status matches filter
      return order.status === filter;
    });
  };

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
        
        // Note: Order status will be automatically updated by the store's computeOrderStatus function
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
    const totalQuantity = selectedItems ? 
      selectedItems.reduce((total, item) => total + item.units, 0) : 
      item.units;
    const itemText = itemCount === 1 ? 'Item' : `${totalQuantity} items`;
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

  const handleTitleTap = () => {
    const newCount = titleTapCount + 1;
    setTitleTapCount(newCount);
    
    if (newCount === 3) {
      setTitleTapCount(0);
      Alert.alert(
        'Reset Data',
        'This will reset all orders to "Ready for Pickup" status and clear all reported issues. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reset', 
            style: 'destructive',
            onPress: async () => {
              await resetData();
              Alert.alert('Data Reset', 'All data has been reset to initial state.', [
                { text: 'OK' }
              ]);
            }
          }
        ]
      );
    } else {
      // Reset counter after 2 seconds if not completed
      setTimeout(() => {
        setTitleTapCount(0);
      }, 2000);
    }
  };

  const handleReportIssue = (order: any, issueType: IssueType, scope: 'SOME_PARTS' | 'ALL_PARTS', affectedPartIds?: string[], description?: string) => {
    const issue: ReportedIssue = {
      id: `issue_${Date.now()}`,
      partOrderId: order.id,
      type: issueType,
      scope,
      affectedPartIds,
      description,
      reportedBy: 'Driver', // In a real app, this would be the actual user ID
      timestamp: Date.now(),
      synced: false,
    };

    addReportedIssue(issue);
    saveData();

    Alert.alert(
      'Issue Reported',
      'The issue has been reported and will be synced with the server.',
      [{ text: 'OK' }]
    );
  };

  const renderOrder = ({ item: order }: { item: any }) => {
    const reportedIssue = reportedIssues.find(issue => issue.partOrderId === order.id);
    
    return (
      <OrderCard
        order={order}
        isExpanded={true}
        onToggleExpansion={() => {}}
        onItemAction={handleItemAction}
        onOrderAction={handleOrderAction}
        onReportIssue={handleReportIssue}
        reportedIssue={reportedIssue}
        filter={filter}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header with Frosted Glass */}
      <BlurView intensity={80} tint="light" style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleTitleTap}>
              <Text style={styles.title}>Part Orders</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            {pendingUploads > 0 ? (
              <View style={styles.pendingContainer}>
                <Text style={styles.pendingText}>Pending: {pendingUploads}</Text>
                <TouchableOpacity style={styles.syncIcon} onPress={handleSync}>
                  <Ionicons 
                    name="sync-outline" 
                    size={20} 
                    color={Colors.primary} 
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.syncIcon} onPress={handleSync}>
                <Ionicons 
                  name="sync-outline" 
                  size={20} 
                  color={Colors.primary} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>

      {/* Filter Tabs */}
      <FilterTabs activeFilter={filter} onFilterChange={setFilter} />

      {/* Orders List */}
      <FlatList
        data={getFilteredOrders()}
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
    paddingTop: 60, // Account for status bar
    paddingBottom: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24, // 20% bigger than 20px
    fontWeight: '700',
    color: Colors.primary, // NuBrakes orange
    letterSpacing: -0.4,
  },
  headerRight: {
    alignItems: 'center',
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pendingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary, // NuBrakes orange
    letterSpacing: -0.2,
  },
  syncIcon: {
    padding: Spacing.xs,
  },
  listContainer: {
    paddingBottom: Spacing.lg,
  },
});
