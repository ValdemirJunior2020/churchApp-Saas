// src/theme/index.js

export const colors = {
  bg: "#000000",
  bgSoft: "#0A0A0C",
  panel: "rgba(255,255,255,0.08)",
  panelStrong: "rgba(255,255,255,0.12)",
  stroke: "rgba(255,255,255,0.14)",
  strokeStrong: "rgba(255,255,255,0.22)",
  text: "#F8FAFC",
  textSoft: "rgba(248,250,252,0.70)",
  textMuted: "rgba(248,250,252,0.52)",
  success: "#34D399",
  danger: "#FB7185",
  violet: "#7C3AED",
  cyan: "#22D3EE",
  magenta: "#EC4899",
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  pill: 999,
};

export const typography = {
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.6,
    color: colors.textMuted,
  },
  h1: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1.1,
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: colors.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
    color: colors.text,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSoft,
    fontWeight: "500",
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    fontWeight: "600",
  },
};

export const shadows = {
  glow: {
    shadowColor: "#7C3AED",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
};