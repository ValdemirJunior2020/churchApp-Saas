// src/components/AmbientBackground.js

import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";

const { width, height } = Dimensions.get("window");

export default function AmbientBackground({ children }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bg, colors.bgSoft, colors.bg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={["rgba(124,58,237,0.28)", "rgba(34,211,238,0.10)", "rgba(236,72,153,0.00)"]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={styles.orbTop}
      />

      <LinearGradient
        colors={["rgba(34,211,238,0.20)", "rgba(236,72,153,0.12)", "rgba(124,58,237,0.00)"]}
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