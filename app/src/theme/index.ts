/**
 * Design tokens HSM — extraits des maquettes web (source de vérité).
 * Noir #0a0a0a · Rouge #E31C25 (hover #ff3b44) · Or #E8B23D · police Inter.
 * L'app mobile et le site web DOIVENT partager ces valeurs.
 */
export const colors = {
  bg: '#0a0a0a',
  surface: '#141414',
  surfaceAlt: '#1c1c1c',
  surfaceHi: '#242424',
  border: '#2a2a2a',

  red: '#E31C25',
  redHover: '#ff3b44',
  gold: '#E8B23D',
  offline: '#3a3a3a',

  text: '#ffffff',
  textMuted: '#b3b3b3',
  textDim: '#7a7a7a',

  live: '#E31C25',
  premium: '#E8B23D',
  success: '#34c759',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
} as const;

export const theme = { colors, spacing, radius, fonts, shadow };
export type Theme = typeof theme;
