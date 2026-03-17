// src/components/AmbientBackground.js

import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";
import { useAppData } from "../context/AppDataContext";
import { safeImageSource } from "../utils/media";

const { width, height } = Dimensions.get("window");
const fallbackBackground = require("../../assets/church-bg.jpg");

export default function AmbientBackground({ children }) {
  let remoteBackground = null;

  try {
    const { config } = useAppData();
    remoteBackground = safeImageSource(config?.backgroundImageUrl || "");
  } catch {
    remoteBackground = null;
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bg, colors.bgSoft, colors.bg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Image source={fallbackBackground} style={styles.baseImage} resizeMode="cover" />
      {remoteBackground ? <Image source={remoteBackground} style={styles.baseImage} resizeMode="cover" /> : null}
      <View style={styles.imageScrim} />

      <LinearGradient
        colors={["rgba(124,58,237,0.32)", "rgba(34,211,238,0.16)", "rgba(236,72,153,0.02)"]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={styles.orbTop}
      />

      <LinearGradient
        colors={["rgba(34,211,238,0.22)", "rgba(236,72,153,0.12)", "rgba(124,58,237,0.00)"]}
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
