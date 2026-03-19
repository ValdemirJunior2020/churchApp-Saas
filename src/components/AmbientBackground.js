// File: src/components/AmbientBackground.js

import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";
import { useAppData } from "../context/AppDataContext";
import { safeImageSource } from "../utils/media";

const { width, height } = Dimensions.get("window");
const fallbackBackground = require("../../assets/church-bg.jpg");

function normalizeHex(value = "", fallback = "#22D3EE") {
  const raw = String(value || "")
    .trim()
    .replace(/[^a-fA-F0-9]/g, "");

  if (raw.length === 3 || raw.length === 6) {
    return `#${raw.toUpperCase()}`;
  }

  return fallback;
}

function hexToRgba(hex, alpha) {
  const clean = normalizeHex(hex, "#22D3EE").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function AmbientBackground({ children }) {
  let remoteBackground = null;
  let primaryHex = colors.violet;
  let accentHex = colors.cyan;

  try {
    const { config } = useAppData();
    remoteBackground = safeImageSource(config?.backgroundImageUrl || "");
    primaryHex = normalizeHex(config?.themePrimaryHex || colors.violet, colors.violet);
    accentHex = normalizeHex(config?.themeAccentHex || colors.cyan, colors.cyan);
  } catch {
    remoteBackground = null;
    primaryHex = colors.violet;
    accentHex = colors.cyan;
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bg, hexToRgba(primaryHex, 0.26), colors.bgSoft, colors.bg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Image source={fallbackBackground} style={styles.baseImage} resizeMode="cover" />
      {remoteBackground ? (
        <Image source={remoteBackground} style={styles.baseImage} resizeMode="cover" />
      ) : null}

      <View style={styles.imageScrim} />

      <LinearGradient
        colors={[
          hexToRgba(primaryHex, 0.34),
          hexToRgba(accentHex, 0.18),
          "rgba(236,72,153,0.03)",
        ]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={styles.orbTop}
      />

      <LinearGradient
        colors={[
          hexToRgba(accentHex, 0.24),
          "rgba(236,72,153,0.12)",
          hexToRgba(primaryHex, 0.02),
        ]}
        start={{ x: 0.2, y: 0.2 }}
        end={{ x: 1, y: 1 }}
        style={styles.orbBottom}
      />

      <View style={styles.noiseSoft} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  baseImage: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
    opacity: 0.28,
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.58)",
  },
  orbTop: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 999,
    top: -width * 0.25,
    right: -width * 0.15,
  },
  orbBottom: {
    position: "absolute",
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 999,
    bottom: -width * 0.25,
    left: -width * 0.15,
  },
  noiseSoft: {
    position: "absolute",
    inset: 0,
    width,
    height,
    backgroundColor: "rgba(255,255,255,0.015)",
  },
});