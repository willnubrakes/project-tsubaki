import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        icon: '⏳'
      };
    case 'PICKED_UP':
      return {
        backgroundColor: Colors.pickedUp,
        textColor: '#ffffff',
        text: 'Picked Up',
        icon: '📦'
      };
    case 'READY_FOR_RETURN':
      return {
        backgroundColor: Colors.readyForReturn,
        textColor: '#ffffff',
        text: 'Ready for Return',
        icon: '🔄'
      };
    case 'RETURNED':
      return {
        backgroundColor: Colors.returned,
        textColor: '#ffffff',
        text: 'Returned',
        icon: '✅'
      };
    default:
      return {
        backgroundColor: Colors.systemFill,
        textColor: Colors.label,
        text: status,
        icon: ''
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
          icon: styles.smallIcon,
        };
      case 'large':
        return {
          container: styles.largePill,
          text: styles.largeText,
          icon: styles.largeIcon,
        };
      default:
        return {
          container: styles.mediumPill,
          text: styles.mediumText,
          icon: styles.mediumIcon,
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
        <Text style={[sizeStyles.icon, { color: config.textColor }]}>
          {config.icon}
        </Text>
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
  smallIcon: {
    fontSize: 10,
  },
  mediumIcon: {
    fontSize: 12,
  },
  largeIcon: {
    fontSize: 14,
  },
});
