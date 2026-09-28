import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FFC629',
    primaryContainer: '#FFF3CC',
    secondary: '#3B82F6',
    secondaryContainer: '#DBEAFE',
    tertiary: '#10B981',
    tertiaryContainer: '#D1FAE5',
    surface: '#ffffff',
    surfaceVariant: '#FAFAFA',
    background: '#FAFAFA',
    error: '#ef4444',
    errorContainer: '#fee2e2',
    onPrimary: '#3F3F3F',
    onSecondary: '#ffffff',
    onSurface: '#3F3F3F',
    onSurfaceVariant: '#707070',
    outline: '#E8E8E8',
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#FAFAFA',
      level3: '#F5F5F5',
      level4: '#F0F0F0',
      level5: '#E8E8E8',
    },
  },
  roundness: 24,
  fonts: {
    ...MD3LightTheme.fonts,
    default: { fontFamily: 'sans-serif', fontWeight: '400' as const },
    regular: { fontFamily: 'sans-serif', fontWeight: '400' as const },
    medium: { fontFamily: 'sans-serif', fontWeight: '500' as const },
    light: { fontFamily: 'sans-serif', fontWeight: '300' as const },
    thin: { fontFamily: 'sans-serif', fontWeight: '100' as const },
  },
};

export const colors = {
  indigo: { bg: '#eef2ff', text: '#4f46e5' },
  green: { bg: '#ecfdf5', text: '#10b981' },
  blue: { bg: '#eff6ff', text: '#3b82f6' },
  orange: { bg: '#fff7ed', text: '#f97316' },
  yellow: { bg: '#fefce8', text: '#eab308' },
  red: { bg: '#fef2f2', text: '#ef4444' },
  gray: { bg: '#f9fafb', text: '#6b7280' },
};
