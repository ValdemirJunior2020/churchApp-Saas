// File: src/hooks/useChurchTheme.js

import { useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { colors as baseColors } from "../theme";

function normalizeHex(value = "", fallback = "#22D3EE") {
  const raw = String(value || "")
    .trim()
    .replace(/[^a-fA-F0-9]/g, "");

  if (raw.length === 3 || raw.length === 6) {
    return `#${raw.toUpperCase()}`;
  }

  return fallback;
}

function hexToRgb(hex) {
  const clean = normalizeHex(hex).replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  return { r, g, b };
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function useChurchTheme() {
  const { config } = useAppData();

  return useMemo(() => {
    const primary = normalizeHex(config?.themePrimaryHex || baseColors.violet, baseColors.violet);
    const accent = normalizeHex(config?.themeAccentHex || baseColors.cyan, baseColors.cyan);

    return {
      primary,
      accent,
      tabActive: accent,
      tabInactive: baseColors.textMuted,
      tabBackground: withAlpha(primary, 0.28),
      tabBorder: withAlpha(accent, 0.22),
      cardBorder: withAlpha(accent, 0.18),
      navCard: withAlpha(primary, 0.35),
      navPrimary: accent,
      chipBg: withAlpha(accent, 0.12),
      chipBorder: withAlpha(accent, 0.24),
      glow: withAlpha(accent, 0.16),
    };
  }, [config?.themePrimaryHex, config?.themeAccentHex]);
}