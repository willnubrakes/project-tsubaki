// Brand Colors for Tsubaki Inventory App
export const Colors = {
  // Brand Colors
  primary: '#f04f23',        // Red-Orange (Primary)
  black: '#000000',          // Black
  gray: '#edf2f7',          // Gray
  navy: '#03182a',          // Navy Blue
  green: '#34BB4B',         // Green
  
  // iOS System Colors
  systemBackground: '#ffffff',
  secondarySystemBackground: '#f2f2f7',
  tertiarySystemBackground: '#ffffff',
  
  // Text Colors
  label: '#000000',
  secondaryLabel: '#3c3c43',
  tertiaryLabel: '#3c3c4399',
  quaternaryLabel: '#3c3c4366',
  
  // Separator Colors
  separator: '#3c3c4349',
  opaqueSeparator: '#c6c6c8',
  
  // Fill Colors
  systemFill: '#78788033',
  secondarySystemFill: '#78788028',
  tertiarySystemFill: '#7676801e',
  quaternarySystemFill: '#74748014',
  
  // Status Colors (using brand colors)
  success: '#34BB4B',       // Green
  warning: '#f04f23',       // Red-Orange for warnings
  error: '#ff3b30',         // iOS Red
  info: '#007aff',          // iOS Blue
  
  // Custom Status Colors
  readyForPickup: '#007aff',    // iOS Blue
  pickedUp: '#f04f23',          // Brand Red-Orange
  readyForReturn: '#ff9500',    // iOS Orange
  returned: '#34BB4B',          // Brand Green
  
  // Shadow Colors
  shadow: '#0000001a',
  cardShadow: '#0000000f',
};

// iOS Typography
export const Typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
  },
};

// iOS Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// iOS Border Radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};
