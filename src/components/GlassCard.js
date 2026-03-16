// src/components/GlassCard.js

import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { colors, radius } from "../theme";

export default function GlassCard({ children, style }) {
  return (
    <View style={[styles.shell, style]}>
      <BlurView
        intensity={Platform.OS === "ios" ? 38 : 20}
        tint="dark"
        style={styles.blur}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.panel,
  },
  blur: {
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});