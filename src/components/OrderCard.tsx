import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PartOrder, PartOrderItem, ItemStatus, ReportedIssue, IssueType } from '../types';
import { StatusPill } from './StatusPill';
import { PartSelectionModal } from './PartSelectionModal';
import { IssueReportModal } from './IssueReportModal';
import { Colors, Typography, Spacing, BorderRadius } from '../design/colors';

interface OrderCardProps {
  order: PartOrder;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onItemAction: (item: PartOrderItem, action: 'PICKED_UP' | 'RETURNED') => void;
  onOrderAction: (order: PartOrder, selectedItems: PartOrderItem[], action: 'PICKED_UP' | 'RETURNED') => void;
  onReportIssue: (order: PartOrder, issueType: IssueType, scope: 'SOME_PARTS' | 'ALL_PARTS', affectedPartIds?: string[], description?: string) => void;
  reportedIssue?: ReportedIssue;
  filter: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isExpanded,
  onToggleExpansion,
  onItemAction,
  onOrderAction,
  onReportIssue,
  reportedIssue,
  filter
}) => {
  const [partSelectionVisible, setPartSelectionVisible] = useState(false);
  const [issueReportVisible, setIssueReportVisible] = useState(false);
  // Filter items based on current filter
  const getFilteredItems = () => {
    if (filter === 'ALL') return order.items;
    
    // For partial orders, show items based on their individual status
    if (order.status === 'PARTIALLY_PICKED_UP') {
      return order.items.filter(item => item.status === filter);
    }
    
    // For other orders, show items based on order status matching filter
    if (filter === 'READY_FOR_PICKUP' && order.status === 'READY_FOR_PICKUP') {
      return order.items;
    }
    if (filter === 'PICKED_UP' && order.status === 'PICKED_UP') {
      return order.items;
    }
    if (filter === 'READY_FOR_RETURN' && order.status === 'READY_FOR_RETURN') {
      return order.items;
    }
    
    return [];
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
    setIssueReportVisible(true);
  };

  const handleIssueConfirm = (issueType: IssueType, scope: 'SOME_PARTS' | 'ALL_PARTS', affectedPartIds?: string[], description?: string) => {
    onReportIssue(order, issueType, scope, affectedPartIds, description);
    setIssueReportVisible(false);
  };

  const getIssueTypeLabel = (type: IssueType) => {
    switch (type) {
      case 'MISSING_PARTS': return 'Missing Parts';
      case 'DAMAGED_PARTS': return 'Damaged Parts';
      case 'WRONG_PARTS': return 'Wrong Parts';
      case 'DELIVERY_ISSUE': return 'Delivery Issue';
      case 'OTHER': return 'Other';
      default: return type;
    }
  };

  // Determine which button to show
  const hasReadyForPickup = filteredItems.some(item => item.status === 'READY_FOR_PICKUP');
  const hasNotPickedUp = filteredItems.some(item => item.status === 'NOT_PICKED_UP');
  const hasPickedUp = filteredItems.some(item => item.status === 'PICKED_UP');
  
  // Show pickup button if there are items ready for pickup OR not picked up
  const showPickupButton = hasReadyForPickup || hasNotPickedUp;

  // Get status configuration for the header
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return {
          backgroundColor: Colors.readyForPickup,
          text: 'Ready for Pickup',
          textColor: '#ffffff'
        };
      case 'PICKED_UP':
        return {
          backgroundColor: Colors.pickedUp,
          text: 'On Van',
          textColor: '#ffffff'
        };
      case 'READY_FOR_RETURN':
        return {
          backgroundColor: Colors.readyForReturn,
          text: 'Ready for Return',
          textColor: '#000000' // Black text for better contrast on amber
        };
      case 'RETURNED':
        return {
          backgroundColor: Colors.returned,
          text: 'Returned',
          textColor: '#ffffff'
        };
      case 'PARTIALLY_PICKED_UP':
        return {
          backgroundColor: '#5856d6', // Indigo for partial
          text: 'Partially Picked Up',
          textColor: '#ffffff'
        };
      case 'ORDERED':
        return {
          backgroundColor: Colors.systemFill,
          text: 'Ordered',
          textColor: Colors.label
        };
      default:
        return {
          backgroundColor: Colors.systemFill,
          text: status,
          textColor: Colors.label
        };
    }
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <View style={styles.card}>
      {/* Order Status Header - Full width bar */}
      <View style={[styles.statusHeader, { backgroundColor: statusConfig.backgroundColor }]}>
        <Text style={[styles.statusHeaderText, { color: statusConfig.textColor }]}>
          {statusConfig.text}
        </Text>
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
        
        {/* Reported Issue Display */}
        {reportedIssue && (
          <View style={styles.issueSection}>
            <View style={styles.issueHeader}>
              <Ionicons name="warning" size={16} color={Colors.warning} />
              <Text style={styles.issueTitle}>Issue Reported</Text>
            </View>
            <Text style={styles.issueType}>{getIssueTypeLabel(reportedIssue.type)}</Text>
            <Text style={styles.issueScope}>
              {reportedIssue.scope === 'ALL_PARTS' ? 'All parts affected' : 'Some parts affected'}
            </Text>
            {reportedIssue.description && (
              <Text style={styles.issueDescription}>{reportedIssue.description}</Text>
            )}
            <Text style={styles.issueTimestamp}>
              Reported {new Date(reportedIssue.timestamp).toLocaleDateString()} at {new Date(reportedIssue.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
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

      {/* Issue Report Modal */}
      <IssueReportModal
        visible={issueReportVisible}
        onClose={() => setIssueReportVisible(false)}
        onConfirm={handleIssueConfirm}
        order={order}
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
    overflow: 'hidden', // Ensure the header bar respects the card's border radius
  },
  statusHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  statusHeaderText: {
    ...Typography.headline,
    fontWeight: '700',
    textAlign: 'left',
  },
  orderRow: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
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
  issueSection: {
    backgroundColor: `${Colors.warning}15`,
    borderWidth: 1,
    borderColor: `${Colors.warning}30`,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 4,
  },
  issueTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.warning,
  },
  issueType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: 2,
  },
  issueScope: {
    fontSize: 12,
    color: Colors.secondaryLabel,
    marginBottom: 2,
  },
  issueDescription: {
    fontSize: 12,
    color: Colors.label,
    marginBottom: 2,
    fontStyle: 'italic',
  },
  issueTimestamp: {
    fontSize: 10,
    color: Colors.tertiaryLabel,
  },
});
