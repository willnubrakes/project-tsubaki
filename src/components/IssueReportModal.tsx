import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PartOrder, PartOrderItem, IssueType, IssueScope } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../design/colors';

interface IssueReportModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (issueType: IssueType, scope: IssueScope, affectedPartIds?: string[], description?: string) => void;
  order: PartOrder;
}

const issueTypes: { key: IssueType; label: string; icon: string }[] = [
  { key: 'MISSING_PARTS', label: 'Missing Parts', icon: 'close-circle-outline' },
  { key: 'DAMAGED_PARTS', label: 'Damaged Parts', icon: 'warning-outline' },
  { key: 'WRONG_PARTS', label: 'Wrong Parts', icon: 'swap-horizontal-outline' },
  { key: 'DELIVERY_ISSUE', label: 'Delivery Issue', icon: 'car-outline' },
  { key: 'OTHER', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export const IssueReportModal: React.FC<IssueReportModalProps> = ({
  visible,
  onClose,
  onConfirm,
  order,
}) => {
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);
  const [selectedScope, setSelectedScope] = useState<IssueScope | null>(null);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const handleIssueTypeSelect = (issueType: IssueType) => {
    setSelectedIssueType(issueType);
    setSelectedScope(null);
    setSelectedPartIds([]);
    setDescription('');
  };

  const handleScopeSelect = (scope: IssueScope) => {
    setSelectedScope(scope);
    if (scope === 'ALL_PARTS') {
      setSelectedPartIds([]);
    }
  };

  const handlePartToggle = (partId: string) => {
    setSelectedPartIds(prev => 
      prev.includes(partId) 
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    );
  };

  const handleConfirm = () => {
    if (!selectedIssueType || !selectedScope) {
      Alert.alert('Error', 'Please select an issue type and scope.');
      return;
    }

    if (selectedScope === 'SOME_PARTS' && selectedPartIds.length === 0) {
      Alert.alert('Error', 'Please select at least one affected part.');
      return;
    }

    if (selectedIssueType === 'OTHER' && !description.trim()) {
      Alert.alert('Error', 'Please provide a description for this issue.');
      return;
    }

    onConfirm(
      selectedIssueType,
      selectedScope,
      selectedScope === 'SOME_PARTS' ? selectedPartIds : undefined,
      selectedIssueType === 'OTHER' ? description.trim() : undefined
    );
  };

  const handleClose = () => {
    setSelectedIssueType(null);
    setSelectedScope(null);
    setSelectedPartIds([]);
    setDescription('');
    onClose();
  };

  const getIssueTypeLabel = (type: IssueType) => {
    return issueTypes.find(t => t.key === type)?.label || type;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.label} />
          </TouchableOpacity>
          <Text style={styles.title}>Report Issue</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Info */}
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Order: {order.orderNumber}</Text>
            <Text style={styles.storeName}>{order.storeName}</Text>
          </View>

          {/* Issue Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What type of issue?</Text>
            {issueTypes.map((issueType) => (
              <TouchableOpacity
                key={issueType.key}
                style={[
                  styles.optionButton,
                  selectedIssueType === issueType.key && styles.selectedOption
                ]}
                onPress={() => handleIssueTypeSelect(issueType.key)}
              >
                <Ionicons 
                  name={issueType.icon as any} 
                  size={20} 
                  color={selectedIssueType === issueType.key ? Colors.primary : Colors.tertiaryLabel} 
                />
                <Text style={[
                  styles.optionText,
                  selectedIssueType === issueType.key && styles.selectedOptionText
                ]}>
                  {issueType.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Scope Selection */}
          {selectedIssueType && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Which parts are affected?</Text>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedScope === 'ALL_PARTS' && styles.selectedOption
                ]}
                onPress={() => handleScopeSelect('ALL_PARTS')}
              >
                <Ionicons 
                  name="layers-outline" 
                  size={20} 
                  color={selectedScope === 'ALL_PARTS' ? Colors.primary : Colors.tertiaryLabel} 
                />
                <Text style={[
                  styles.optionText,
                  selectedScope === 'ALL_PARTS' && styles.selectedOptionText
                ]}>
                  All Parts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedScope === 'SOME_PARTS' && styles.selectedOption
                ]}
                onPress={() => handleScopeSelect('SOME_PARTS')}
              >
                <Ionicons 
                  name="list-outline" 
                  size={20} 
                  color={selectedScope === 'SOME_PARTS' ? Colors.primary : Colors.tertiaryLabel} 
                />
                <Text style={[
                  styles.optionText,
                  selectedScope === 'SOME_PARTS' && styles.selectedOptionText
                ]}>
                  Some Parts
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Part Selection */}
          {selectedScope === 'SOME_PARTS' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select affected parts:</Text>
              {order.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.partOption,
                    selectedPartIds.includes(item.id) && styles.selectedPart
                  ]}
                  onPress={() => handlePartToggle(item.id)}
                >
                  <View style={styles.partInfo}>
                    <Text style={styles.partName}>{item.name}</Text>
                    <Text style={styles.partNumber}>{item.partNumber}</Text>
                  </View>
                  {selectedPartIds.includes(item.id) && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Description for Other */}
          {selectedIssueType === 'OTHER' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Please describe the issue:</Text>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the issue..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedIssueType || !selectedScope || 
               (selectedScope === 'SOME_PARTS' && selectedPartIds.length === 0) ||
               (selectedIssueType === 'OTHER' && !description.trim())) && styles.disabledButton
            ]}
            onPress={handleConfirm}
            disabled={!selectedIssueType || !selectedScope || 
                     (selectedScope === 'SOME_PARTS' && selectedPartIds.length === 0) ||
                     (selectedIssueType === 'OTHER' && !description.trim())}
          >
            <Text style={styles.confirmButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </ScrollView>
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
    paddingTop: 60,
    paddingBottom: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.title2,
    color: Colors.label,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl, // Extra bottom padding for the button
  },
  orderInfo: {
    backgroundColor: Colors.secondarySystemBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  orderNumber: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  storeName: {
    ...Typography.body,
    color: Colors.secondaryLabel,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.secondarySystemBackground,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  selectedOption: {
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  optionText: {
    ...Typography.body,
    color: Colors.label,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  partOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.secondarySystemBackground,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  selectedPart: {
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  partInfo: {
    flex: 1,
  },
  partName: {
    ...Typography.body,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  partNumber: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
  },
  textInput: {
    ...Typography.body,
    backgroundColor: Colors.secondarySystemBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.separator,
    minHeight: 100,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg, // Extra bottom margin
  },
  disabledButton: {
    backgroundColor: Colors.tertiaryLabel,
  },
  confirmButtonText: {
    ...Typography.headline,
    color: '#ffffff',
    fontWeight: '600',
  },
});
