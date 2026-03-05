// ─── Border Radius ─────────────────────────────────────────────────────────────

export const borderRadius = {
  /** 0px */
  none: 0,
  /** 4px */
  sm: 4,
  /** 8px */
  md: 8,
  /** 12px */
  lg: 12,
  /** 16px */
  xl: 16,
  /** 24px */
  '2xl': 24,
  /** 32px */
  '3xl': 32,
  /** 9999px — pill / circle */
  full: 9999,
} as const;

export type BorderRadiusToken = keyof typeof borderRadius;
