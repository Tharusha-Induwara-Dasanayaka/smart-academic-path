// Color palette matching the design reference
export const COLORS = {
  primary: '#6C3BFF',
  primaryDark: '#5028CC',
  primaryLight: '#8B6FFF',
  primaryGradientStart: '#6C3BFF',
  primaryGradientEnd: '#8B5CF6',

  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',

  background: '#F3F4F8',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0EEFF',

  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  tabIconDefault: '#9CA3AF',
  tabIconSelected: '#6C3BFF',

  clashRed: '#EF4444',
  clashRedLight: '#FEE2E2',
  moduleBlue: '#3B82F6',
  moduleBlueLight: '#DBEAFE',
  moduleGreen: '#10B981',
  moduleGreenLight: '#D1FAE5',
  moduleOrange: '#F59E0B',
  moduleOrangeLight: '#FEF3C7',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 26,
    xxxl: 32,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6C3BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const MODULE_COLORS = {
  IT3060: { bg: '#DBEAFE', text: '#3B82F6' },
  IT3070: { bg: '#D1FAE5', text: '#10B981' },
  IT3080: { bg: '#FEF3C7', text: '#F59E0B' },
  IT3090: { bg: '#FCE7F3', text: '#EC4899' },
  IT3050: { bg: '#EDE9FE', text: '#8B5CF6' },
  default: { bg: '#F3F4F6', text: '#6B7280' },
};

export const getModuleColor = (moduleCode) => {
  return MODULE_COLORS[moduleCode] || MODULE_COLORS.default;
};

// Days of week display
export const DAY_SHORT = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
};

export const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
