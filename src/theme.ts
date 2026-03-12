import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4f46e5',
    primaryContainer: '#e0e7ff',
    secondary: '#10b981',
    secondaryContainer: '#d1fae5',
    tertiary: '#f59e0b',
    tertiaryContainer: '#fef3c7',
    surface: '#ffffff',
    surfaceVariant: '#f9fafb',
    background: '#f9fafb',
    error: '#ef4444',
    errorContainer: '#fee2e2',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onSurface: '#111827',
    onSurfaceVariant: '#6b7280',
    outline: '#e5e7eb',
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#f9fafb',
      level3: '#f3f4f6',
      level4: '#e5e7eb',
      level5: '#d1d5db',
    },
  },
  roundness: 16,
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
