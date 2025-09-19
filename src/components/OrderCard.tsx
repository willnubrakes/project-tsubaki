import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PartOrder, PartOrderItem, ItemStatus } from '../types';
import { StatusPill } from './StatusPill';
import { PartSelectionModal } from './PartSelectionModal';
import { Colors, Typography, Spacing, BorderRadius } from '../design/colors';

interface OrderCardProps {
  order: PartOrder;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onItemAction: (item: PartOrderItem, action: 'PICKED_UP' | 'RETURNED') => void;
  onOrderAction: (order: PartOrder, selectedItems: PartOrderItem[], action: 'PICKED_UP' | 'RETURNED') => void;
  filter: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isExpanded,
  onToggleExpansion,
  onItemAction,
  onOrderAction,
  filter
}) => {
  const [partSelectionVisible, setPartSelectionVisible] = useState(false);
  // Filter items based on current filter
  const getFilteredItems = () => {
    if (filter === 'ALL') return order.items;
    return order.items.filter(item => item.status === filter);
  };

  const filteredItems = getFilteredItems();
  
  // Don't show order if no items match the filter
  if (filteredItems.length === 0) return null;

  // Get unique job numbers from items
  const jobNumbers = [...new Set(filteredItems.map(item => item.jobNumber))];

  const handleConfirmPickup = () => {
    setPartSelectionVisible(true);
  };

  const handlePartSelectionConfirm = (selectedItems: PartOrderItem[]) => {
    setPartSelectionVisible(false);
    onOrderAction(order, selectedItems, 'PICKED_UP');
  };

  const handleConfirmReturn = () => {
    // For now, we'll trigger return for the first item that's picked up
    const pickedUpItem = filteredItems.find(item => item.status === 'PICKED_UP');
    if (pickedUpItem) {
      onItemAction(pickedUpItem, 'RETURNED');
    }
  };

  const handleReportIssue = () => {
    // No functionality for now
    console.log('Report Issue clicked');
  };

  // Determine which button to show
  const hasReadyForPickup = filteredItems.some(item => item.status === 'READY_FOR_PICKUP');
  const hasNotPickedUp = filteredItems.some(item => item.status === 'NOT_PICKED_UP');
  const hasPickedUp = filteredItems.some(item => item.status === 'PICKED_UP');
  
  // Show pickup button if there are items ready for pickup OR not picked up
  const showPickupButton = hasReadyForPickup || hasNotPickedUp;

  return (
    <View style={styles.card}>
      {/* Order Status - Small field on top */}
      <View style={styles.orderStatusContainer}>
        <StatusPill status={order.status} size="small" />
      </View>

      {/* Order Number */}
      <View style={styles.orderRow}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
      </View>

      {/* Store Name */}
      <View style={styles.storeRow}>
        <Text style={styles.storeName}>{order.storeName}</Text>
      </View>

      {/* Details Section */}
      <View style={styles.detailsSection}>
        <Text style={styles.storeAddress} numberOfLines={1}>
          {order.storeLocation}
        </Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Job #:</Text>
          <Text style={styles.detailValue}>{jobNumbers.join(', ')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Parts:</Text>
          <Text style={styles.detailValue}>{filteredItems.length} items</Text>
        </View>
      </View>

      {/* Parts Details Section */}
      <View style={styles.partsDetails}>
        {filteredItems.map((item) => (
          <View key={item.id} style={styles.partItem}>
            <View style={styles.partInfo}>
              <Text style={styles.partName}>{item.name}</Text>
              <Text style={styles.partDetails}>
                {item.units}x {item.partNumber}
              </Text>
            </View>
            <StatusPill status={item.status} size="small" />
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {showPickupButton ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmPickupButton]}
            onPress={handleConfirmPickup}
          >
            <Ionicons name="camera" size={16} color="white" />
            <Text style={styles.actionButtonText}>Confirm Pickup</Text>
          </TouchableOpacity>
        ) : hasPickedUp ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmReturnButton]}
            onPress={handleConfirmReturn}
          >
            <Ionicons name="return-up-back" size={16} color="white" />
            <Text style={styles.actionButtonText}>Confirm Return</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.actionButton, styles.reportIssueButton]}
          onPress={handleReportIssue}
        >
          <Ionicons name="warning" size={16} color="white" />
          <Text style={styles.actionButtonText}>Report Issue</Text>
        </TouchableOpacity>
      </View>

      {/* Part Selection Modal */}
      <PartSelectionModal
        visible={partSelectionVisible}
        onClose={() => setPartSelectionVisible(false)}
        onConfirm={handlePartSelectionConfirm}
        items={filteredItems.filter(item => item.status === 'READY_FOR_PICKUP' || item.status === 'NOT_PICKED_UP')}
        orderNumber={order.orderNumber}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: Colors.separator,
  },
  orderStatusContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    alignItems: 'flex-start',
  },
  orderRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.label,
  },
  storeRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.label,
  },
  detailsSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  storeAddress: {
    fontSize: 14,
    color: Colors.tertiaryLabel,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.tertiaryLabel,
    width: 60,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.label,
    flex: 1,
  },
  partsDetails: {
    paddingVertical: Spacing.sm,
  },
  partItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  partInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  partName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: 2,
  },
  partDetails: {
    fontSize: 14,
    color: Colors.tertiaryLabel,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  confirmPickupButton: {
    backgroundColor: Colors.primary,
  },
  confirmReturnButton: {
    backgroundColor: Colors.primary,
  },
  reportIssueButton: {
    backgroundColor: Colors.secondaryLabel,
  },
  actionButtonText: {
    ...Typography.subhead,
    fontWeight: '600',
    color: 'white',
  },
});
