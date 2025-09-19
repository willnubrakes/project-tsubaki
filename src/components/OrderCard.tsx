import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PartOrder, PartOrderItem, ItemStatus } from '../types';
import { StatusPill } from './StatusPill';
import { Colors, Typography, Spacing, BorderRadius } from '../design/colors';

interface OrderCardProps {
  order: PartOrder;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onItemAction: (item: PartOrderItem, action: 'PICKED_UP' | 'RETURNED') => void;
  filter: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isExpanded,
  onToggleExpansion,
  onItemAction,
  filter
}) => {
  // Filter items based on current filter
  const getFilteredItems = () => {
    if (filter === 'ALL') return order.items;
    return order.items.filter(item => item.status === filter);
  };

  const filteredItems = getFilteredItems();
  
  // Don't show order if no items match the filter
  if (filteredItems.length === 0) return null;

  const getActionButton = (item: PartOrderItem) => {
    if (item.status === 'READY_FOR_PICKUP') {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.pickupButton]}
          onPress={() => onItemAction(item, 'PICKED_UP')}
        >
          <Ionicons name="checkmark-circle" size={16} color="white" />
          <Text style={styles.actionButtonText}>Pick up</Text>
        </TouchableOpacity>
      );
    }
    
    if (item.status === 'PICKED_UP' || item.status === 'READY_FOR_RETURN') {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.returnButton]}
          onPress={() => onItemAction(item, 'RETURNED')}
        >
          <Ionicons name="return-up-back" size={16} color="white" />
          <Text style={styles.actionButtonText}>Return</Text>
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={onToggleExpansion}>
        <View style={styles.headerContent}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.storeName}>{order.storeName}</Text>
            <Text style={styles.storeLocation}>{order.storeLocation}</Text>
          </View>
          <View style={styles.headerRight}>
            <StatusPill status={order.status} />
            <Text style={styles.partsCount}>Parts ({filteredItems.length})</Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.itemsContainer}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                  {item.partNumber} • {item.units} unit{item.units !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.itemRight}>
                <StatusPill status={item.status} size="small" />
                {getActionButton(item)}
              </View>
            </View>
          ))}
        </View>
      )}
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
  header: {
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    ...Typography.title3,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  storeName: {
    ...Typography.subhead,
    fontWeight: '600',
    color: Colors.secondaryLabel,
    marginBottom: 2,
  },
  storeLocation: {
    ...Typography.caption1,
    color: Colors.tertiaryLabel,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  partsCount: {
    ...Typography.caption1,
    color: Colors.tertiaryLabel,
    marginTop: Spacing.xs,
  },
  itemsContainer: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.separator,
    paddingTop: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.subhead,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: 2,
  },
  itemDetails: {
    ...Typography.caption1,
    color: Colors.tertiaryLabel,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  pickupButton: {
    backgroundColor: Colors.primary,
  },
  returnButton: {
    backgroundColor: Colors.readyForReturn,
  },
  actionButtonText: {
    ...Typography.caption1,
    fontWeight: '600',
    color: 'white',
  },
});
