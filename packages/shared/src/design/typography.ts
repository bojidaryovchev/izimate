// ─── Typography Scale ──────────────────────────────────────────────────────────

export const fontFamilies = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace',
} as const;

export const fontSizes = {
  /** 12px */
  xs: 12,
  /** 14px */
  sm: 14,
  /** 16px */
  base: 16,
  /** 18px */
  lg: 18,
  /** 20px */
  xl: 20,
  /** 24px */
  '2xl': 24,
  /** 30px */
  '3xl': 30,
  /** 36px */
  '4xl': 36,
  /** 48px */
  '5xl': 48,
  /** 60px */
  '6xl': 60,
  /** 72px */
  '7xl': 72,
  /** 96px - for hero text */
  '8xl': 96,
} as const;

export const fontWeights = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// ─── Preset Text Styles ───────────────────────────────────────────────────────

export const textStyles = {
  h1: { fontSize: fontSizes['4xl'], fontWeight: fontWeights.bold, lineHeight: lineHeights.tight },
  h2: { fontSize: fontSizes['3xl'], fontWeight: fontWeights.bold, lineHeight: lineHeights.tight },
  h3: { fontSize: fontSizes['2xl'], fontWeight: fontWeights.semibold, lineHeight: lineHeights.tight },
  h4: { fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, lineHeight: lineHeights.tight },
  h5: { fontSize: fontSizes.lg, fontWeight: fontWeights.medium, lineHeight: lineHeights.normal },
  body: { fontSize: fontSizes.base, fontWeight: fontWeights.normal, lineHeight: lineHeights.normal },
  bodySmall: { fontSize: fontSizes.sm, fontWeight: fontWeights.normal, lineHeight: lineHeights.normal },
  caption: { fontSize: fontSizes.xs, fontWeight: fontWeights.normal, lineHeight: lineHeights.normal },
  button: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold, lineHeight: lineHeights.tight },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium, lineHeight: lineHeights.tight },
} as const;
