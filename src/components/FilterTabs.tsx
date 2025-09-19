import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterType } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../design/colors';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filterOptions: { key: FilterType; label: string; icon: string; accessibilityLabel: string }[] = [
  { key: 'ALL', label: 'All', icon: 'grid-outline', accessibilityLabel: 'Show all orders' },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: 'time-outline', accessibilityLabel: 'Show orders ready for pickup' },
  { key: 'PICKED_UP', label: 'On Van', icon: 'car-outline', accessibilityLabel: 'Show orders on van' },
  { key: 'READY_FOR_RETURN', label: 'Ready for Return', icon: 'return-up-back-outline', accessibilityLabel: 'Show orders ready for return' },
];

export const FilterTabs: React.FC<FilterTabsProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <View style={styles.container}>
      <View 
        style={styles.tabsContainer}
        accessibilityRole="tablist"
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.tab,
              activeFilter === option.key && styles.activeTab
            ]}
            onPress={() => onFilterChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeFilter === option.key }}
            accessibilityLabel={option.accessibilityLabel}
            accessibilityHint={`Tap to filter orders by ${option.label.toLowerCase()}`}
          >
            <Ionicons 
              name={option.icon as any} 
              size={16} 
              color={activeFilter === option.key ? Colors.label : Colors.tertiaryLabel} 
            />
            <Text style={[
              styles.tabText,
              activeFilter === option.key && styles.activeTabText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.systemBackground,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'transparent',
    gap: Spacing.xs,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: Colors.systemFill,
    borderColor: Colors.separator,
  },
  tabText: {
    ...Typography.caption1,
    fontWeight: '500',
    color: Colors.tertiaryLabel,
    fontSize: 11,
    textAlign: 'center',
    flexShrink: 1,
  },
  activeTabText: {
    color: Colors.label,
    fontWeight: '600',
  },
});
