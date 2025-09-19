import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterType } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../design/colors';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filterOptions: { key: FilterType; label: string; icon: string }[] = [
  { key: 'ALL', label: 'All', icon: 'grid-outline' },
  { key: 'READY_FOR_PICKUP', label: 'Ready', icon: 'time-outline' },
  { key: 'PICKED_UP', label: 'On Van', icon: 'car-outline' },
  { key: 'READY_FOR_RETURN', label: 'Return', icon: 'return-up-back-outline' },
];

export const FilterTabs: React.FC<FilterTabsProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.tab,
              activeFilter === option.key && styles.activeTab
            ]}
            onPress={() => onFilterChange(option.key)}
          >
            <Ionicons 
              name={option.icon as any} 
              size={16} 
              color={activeFilter === option.key ? Colors.primary : Colors.tertiaryLabel} 
            />
            <Text style={[
              styles.tabText,
              activeFilter === option.key && styles.activeTabText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondarySystemBackground,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.systemFill,
    gap: Spacing.xs,
    minWidth: 80,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    ...Typography.caption1,
    fontWeight: '500',
    color: Colors.tertiaryLabel,
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
});
