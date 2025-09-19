import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatus, ItemStatus } from '../types';
import { Colors, Typography, BorderRadius } from '../design/colors';

type Status = OrderStatus | ItemStatus;

interface StatusPillProps {
  status: Status;
  size?: 'small' | 'medium' | 'large';
}

const getStatusConfig = (status: Status) => {
  switch (status) {
    case 'READY_FOR_PICKUP':
      return {
        backgroundColor: Colors.readyForPickup,
        textColor: '#ffffff',
        text: 'Ready for Pickup',
        icon: 'time-outline'
      };
    case 'PICKED_UP':
      return {
        backgroundColor: Colors.pickedUp,
        textColor: '#ffffff',
        text: 'On Van',
        icon: 'car-outline'
      };
    case 'READY_FOR_RETURN':
      return {
        backgroundColor: Colors.readyForReturn,
        textColor: '#ffffff',
        text: 'Ready for Return',
        icon: 'return-up-back-outline'
      };
    case 'RETURNED':
      return {
        backgroundColor: Colors.returned,
        textColor: '#ffffff',
        text: 'Returned',
        icon: 'checkmark-circle-outline'
      };
    case 'ORDERED':
      return {
        backgroundColor: Colors.systemFill,
        textColor: Colors.label,
        text: 'Ordered',
        icon: 'document-text-outline'
      };
    case 'NOT_PICKED_UP':
      return {
        backgroundColor: Colors.systemFill,
        textColor: Colors.secondaryLabel,
        text: 'Not Picked Up',
        icon: 'close-circle-outline'
      };
    default:
      return {
        backgroundColor: Colors.systemFill,
        textColor: Colors.label,
        text: status,
        icon: 'help-outline'
      };
  }
};

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'medium' }) => {
  const config = getStatusConfig(status);
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallPill,
          text: styles.smallText,
        };
      case 'large':
        return {
          container: styles.largePill,
          text: styles.largeText,
        };
      default:
        return {
          container: styles.mediumPill,
          text: styles.mediumText,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  
  return (
    <View style={[
      styles.pill,
      sizeStyles.container,
      { backgroundColor: config.backgroundColor }
    ]}>
      {config.icon && (
        <Ionicons 
          name={config.icon as any} 
          size={size === 'small' ? 12 : size === 'large' ? 16 : 14} 
          color={config.textColor} 
        />
      )}
      <Text style={[
        sizeStyles.text,
        { color: config.textColor }
      ]}>
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  smallPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  mediumPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  largePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  smallText: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  mediumText: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  largeText: {
    ...Typography.footnote,
    fontWeight: '600',
  },
});
