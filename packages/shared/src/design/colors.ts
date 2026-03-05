// ─── Color Palette ─────────────────────────────────────────────────────────────
// Primary brand color: Warm Coral — energetic, approachable
// Secondary: Trust Blue — reliability, professionalism
// Tertiary: Fresh Green — success, growth

export const colors = {
  // ── Primary (Warm Coral) ──────────────────────────────────────────────────
  primary: {
    50: '#fef2f0',
    100: '#fde4de',
    200: '#fcc8bc',
    300: '#faa48f',
    400: '#f67a5e',
    500: '#f25842',
    600: '#d94432',
    700: '#b53526',
    800: '#912b1f',
    900: '#6e2118',
  },

  // ── Secondary (Trust Blue) ────────────────────────────────────────────────
  secondary: {
    50: '#eef4fe',
    100: '#dce8fc',
    200: '#b8d1fa',
    300: '#8bb4f6',
    400: '#6199f2',
    500: '#4285F4',
    600: '#326fd8',
    700: '#2558b3',
    800: '#1d448f',
    900: '#15326b',
  },

  // ── Tertiary (Fresh Green) ────────────────────────────────────────────────
  tertiary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // ── Semantic ──────────────────────────────────────────────────────────────
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#4285F4',

  // ── Status ────────────────────────────────────────────────────────────────
  status: {
    pending: '#f59e0b',
    confirmed: '#10b981',
    completed: '#6366f1',
    cancelled: '#ef4444',
    noShow: '#6b7280',
  },

  // ── Gray ──────────────────────────────────────────────────────────────────
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // ── Surfaces (Material Design 3 style) ────────────────────────────────────
  surface: {
    base: '#ffffff',
    variant: '#f3f4f6',
    container: '#f9fafb',
    containerHigh: '#f3f4f6',
    containerHighest: '#e5e7eb',
    inverse: '#1f2937',
  },

  // ── Vibrant (accent palette from Coolors) ─────────────────────────────────
  vibrant: {
    yellow: '#fff07c',
    green: '#80ff72',
    cyan: '#7ee8fa',
    pink: '#e83f6f',
    blue: '#2274a5',
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    tertiary: '#6b7280',
    disabled: '#9ca3af',
    inverse: '#ffffff',
    link: '#4285F4',
  },

  // ── Absolute ──────────────────────────────────────────────────────────────
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorToken = typeof colors;
