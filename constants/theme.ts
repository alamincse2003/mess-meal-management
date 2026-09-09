import { Platform } from 'react-native';

const tintColorLight = '#4F46E5';
const tintColorDark = '#818CF8';

export const Colors = {
  light: {
    text: '#0F172A',
    textMuted: '#64748B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    success: '#059669',
    successSurface: '#D1FAE5',
    danger: '#DC2626',
    dangerSurface: '#FEE2E2',
    warning: '#D97706',
    warningSurface: '#FEF3C7',
  },
  dark: {
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    background: '#0B0F19',
    surface: '#161B26',
    border: '#232A38',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    success: '#34D399',
    successSurface: '#0F2E22',
    danger: '#F87171',
    dangerSurface: '#3A1418',
    warning: '#FBBF24',
    warningSurface: '#3A2A0F',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
