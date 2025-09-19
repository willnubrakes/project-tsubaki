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

  const handlePhotoCapture = (photoUri: string, location?: { lat: number; lng: number; acc: number }) => {
    if (!pendingAction) return;

    const { item, action } = pendingAction;
    const newStatus = action === 'PICKED_UP' ? 'PICKED_UP' : 'RETURNED';
    
    // Create the event with the captured photo
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
    saveData(); // Persist changes

    // Reset state
    setPendingAction(null);
    setCameraModalVisible(false);

    Alert.alert(
      'Success',
      `Item ${action === 'PICKED_UP' ? 'picked up' : 'returned'} successfully!`,
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
      isExpanded={expandedOrders.has(order.id)}
      onToggleExpansion={() => toggleOrderExpansion(order.id)}
      onItemAction={handleItemAction}
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
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Chain of Custody</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
            <Ionicons name="sync-outline" size={20} color={Colors.primary} />
            <Text style={styles.syncText}>Sync</Text>
          </TouchableOpacity>
          {pendingUploads > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending: {pendingUploads}</Text>
            </View>
          )}
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
  subtitle: {
    ...Typography.subhead,
    color: Colors.tertiaryLabel,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.systemFill,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  syncText: {
    ...Typography.subhead,
    fontWeight: '600',
    color: Colors.primary,
  },
  pendingBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  pendingText: {
    ...Typography.caption1,
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: Spacing.lg,
  },
});
