// ─── Shadows ───────────────────────────────────────────────────────────────────
// Both CSS box-shadow strings and React Native elevation values

export const shadows = {
  none: {
    css: 'none',
    elevation: 0,
  },
  sm: {
    css: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  md: {
    css: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  lg: {
    css: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    elevation: 6,
  },
  xl: {
    css: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    elevation: 12,
  },
} as const;

// ─── Animations ────────────────────────────────────────────────────────────────

export const animations = {
  /** 150ms — micro-interactions, hover */
  fast: 150,
  /** 300ms — standard transitions */
  normal: 300,
  /** 500ms — emphasis, large elements */
  slow: 500,
} as const;

// ─── Z-Index Scale ─────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
} as const;
