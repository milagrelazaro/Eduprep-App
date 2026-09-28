// Paleta de cores — Modern Mobile Dashboard (Soft Cards + Floating Nav)
export const colors = {
  // Primária - Amarelo/Dourado
  primary: '#FFC629',
  primaryDark: '#E6B21F',
  primaryLight: '#FFD966',

  // Secundária - Azul suave
  secondary: '#EAF3FF',
  secondaryDark: '#D0E5FF',

  // Neutras
  white: '#FFFFFF',
  grayLight: '#F5F5F5',
  grayMedium: '#A0A0A0',
  grayDark: '#707070',
  black: '#3F3F3F',

  // Sucesso
  success: '#10B981',
  successLight: '#D1FAE5',

  // Aviso
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  // Erro
  error: '#EF4444',
  errorLight: '#FEE2E2',

  // Info
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Background
  background: '#FAFAFA',
  surface: '#F5F5F5',

  // Texto
  textPrimary: '#3F3F3F',
  textSecondary: '#707070',
  textTertiary: '#A0A0A0',

  // Bordas
  border: '#E8E8E8',
  borderLight: '#F0F0F0',

  // Sombra
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowLight: 'rgba(0, 0, 0, 0.04)',

  // Transparente
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  round: 9999,
};

export const typography = {
  // Títulos
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    fontFamily: 'System',
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    fontFamily: 'System',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    fontFamily: 'System',
  },
  
  // Corpo
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'System',
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontFamily: 'System',
  },
  bodySmall: {
    fontSize: 12,
    fontFamily: 'System',
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  
  // Menus
  menuTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    fontFamily: 'System',
  },
  menuSubtitle: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    fontFamily: 'System',
  },
  
  // Botões
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    fontFamily: 'System',
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    fontFamily: 'System',
  },
};

export const shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 10,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
