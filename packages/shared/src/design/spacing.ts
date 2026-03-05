// ─── Spacing Scale ─────────────────────────────────────────────────────────────
// Based on a 4px grid system

export const spacing = {
  /** 0px */
  0: 0,
  /** 2px */
  px: 1,
  /** 2px */
  '0.5': 2,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px */
  '2xl': 24,
  /** 32px */
  '3xl': 32,
  /** 40px */
  '4xl': 40,
  /** 48px */
  '5xl': 48,
  /** 64px */
  '6xl': 64,
  /** 80px */
  '7xl': 80,
  /** 96px */
  '8xl': 96,
} as const;

export type SpacingToken = keyof typeof spacing;
