// Paleta de cores estilo Yango
export const colors = {
  // Primária - Laranja/Vermelho
  primary: '#FF4D3A',
  primaryDark: '#E03A2A',
  primaryLight: '#FF6B5A',
  
  // Secundária - Azul claro
  secondary: '#EAF3FF',
  secondaryDark: '#D0E5FF',
  
  // Neutras
  white: '#FFFFFF',
  grayLight: '#F5F5F5',
  grayMedium: '#A0A0A0',
  grayDark: '#666666',
  black: '#222222',
  
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
  background: '#FFFFFF',
  surface: '#F5F5F5',
  
  // Texto
  textPrimary: '#222222',
  textSecondary: '#666666',
  textTertiary: '#A0A0A0',
  
  // Bordas
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  
  // Sombra
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  
  // Transparente
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
};

export const borderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
  xxl: 12,
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
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
