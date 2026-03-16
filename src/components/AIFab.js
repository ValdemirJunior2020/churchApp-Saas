// src/components/AIFab.js

import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "../theme";

export default function AIFab({ label = "Ask AI", onPress }) {
  const pulse = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.92, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.glow, { transform: [{ scale: pulse }] }]} />
      <Pressable onPress={onPress} style={styles.pressable}>
        <LinearGradient
          colors={[colors.violet, colors.cyan, colors.magenta]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 20,
    bottom: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 160,
    height: 64,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.28)",
    ...shadows.glow,
  },
  pressable: {
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  button: {
    minHeight: 58,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
  },
  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
});