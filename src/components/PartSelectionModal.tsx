import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PartOrderItem } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../design/colors';

interface PartSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedItems: PartOrderItem[]) => void;
  items: PartOrderItem[];
  orderNumber: string;
}

export const PartSelectionModal: React.FC<PartSelectionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  items,
  orderNumber,
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState<'all' | 'some' | null>(null);

  const handleSelectAll = () => {
    setSelectionMode('all');
    setSelectedItems(new Set(items.map(item => item.id)));
  };

  const handleSelectSome = () => {
    setSelectionMode('some');
    setSelectedItems(new Set());
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleConfirm = () => {
    if (selectionMode === 'all') {
      onConfirm(items);
    } else if (selectionMode === 'some') {
      if (selectedItems.size === 0) {
        Alert.alert('No Items Selected', 'Please select at least one item to pick up.');
        return;
      }
      const selected = items.filter(item => selectedItems.has(item.id));
      onConfirm(selected);
    }
    onClose();
  };

  const handleClose = () => {
    setSelectionMode(null);
    setSelectedItems(new Set());
    onClose();
  };

  const renderItem = ({ item }: { item: PartOrderItem }) => (
    <TouchableOpacity
      style={[
        styles.itemRow,
        selectedItems.has(item.id) && styles.selectedItemRow
      ]}
      onPress={() => selectionMode === 'some' && toggleItemSelection(item.id)}
      disabled={selectionMode !== 'some'}
    >
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>
          {item.units}x {item.partNumber}
        </Text>
      </View>
      {selectionMode === 'some' && (
        <View style={[
          styles.checkbox,
          selectedItems.has(item.id) && styles.checkedBox
        ]}>
          {selectedItems.has(item.id) && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.label} />
          </TouchableOpacity>
          <Text style={styles.title}>Confirm Pickup</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.orderNumber}>Order: {orderNumber}</Text>
          
          {!selectionMode ? (
            /* Initial Selection Mode */
            <View style={styles.selectionModeContainer}>
              <Text style={styles.question}>
                Are you picking up all associated parts?
              </Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[styles.optionButton, styles.allOption]}
                  onPress={handleSelectAll}
                >
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.optionText}>Yes - All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, styles.someOption]}
                  onPress={handleSelectSome}
                >
                  <Ionicons name="list" size={24} color="white" />
                  <Text style={styles.optionText}>No - Only Some</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Item Selection or Confirmation */
            <View style={styles.itemsContainer}>
              <Text style={styles.itemsTitle}>
                {selectionMode === 'all' 
                  ? `Picking up all ${items.length} items:`
                  : 'Select items to pick up:'
                }
              </Text>
              
              <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={styles.itemsList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>

        {/* Footer */}
        {selectionMode && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                selectionMode === 'some' && selectedItems.size === 0 && styles.disabledButton
              ]}
              onPress={handleConfirm}
              disabled={selectionMode === 'some' && selectedItems.size === 0}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.confirmButtonText}>
                Take Photo Evidence
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.systemBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.headline,
    fontWeight: '600',
    color: Colors.label,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  orderNumber: {
    ...Typography.subhead,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  selectionModeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: {
    ...Typography.title2,
    fontWeight: '600',
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  optionsContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  allOption: {
    backgroundColor: Colors.primary,
  },
  someOption: {
    backgroundColor: Colors.secondaryLabel,
  },
  optionText: {
    ...Typography.headline,
    fontWeight: '600',
    color: 'white',
  },
  itemsContainer: {
    flex: 1,
  },
  itemsTitle: {
    ...Typography.subhead,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.md,
  },
  itemsList: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.systemFill,
  },
  selectedItemRow: {
    backgroundColor: Colors.primary + '20',
    borderWidth: 1,
    borderColor: Colors.primary,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.tertiaryLabel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.separator,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  disabledButton: {
    backgroundColor: Colors.tertiaryLabel,
  },
  confirmButtonText: {
    ...Typography.headline,
    fontWeight: '600',
    color: 'white',
  },
});
