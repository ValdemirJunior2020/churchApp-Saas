// src/screens/auth/WelcomeScreen.js

import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { colors, radius, typography } from "../../theme";

export default function WelcomeScreen({ navigation }) {
  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.hero}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={14} color={colors.text} />
              <Text style={styles.badgeText}>Ambient Church AI</Text>
            </View>

            <Text style={styles.title}>One premium church app for pastors and members.</Text>
            <Text style={styles.sub}>
              Elegant dark design, live content, giving, events, and a modern experience that feels native on iPhone.
            </Text>
          </View>

          <GlassCard style={styles.card}>
            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>AI</Text>
                <Text style={styles.metricLabel}>Guided setup</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>24/7</Text>
                <Text style={styles.metricLabel}>Member access</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>∞</Text>
                <Text style={styles.metricLabel}>Scalable feel</Text>
              </View>
            </View>

            <Pressable style={styles.primaryWrap} onPress={() => navigation.navigate("JoinChurch")}>
              <LinearGradient
                colors={[colors.violet, colors.cyan, colors.magenta]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primary}
              >
                <Ionicons name="enter-outline" size={18} color="#fff" />
                <Text style={styles.primaryText}>Join Existing Church</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.ghost} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.ghostText}>I Already Have Access</Text>
            </Pressable>
          </GlassCard>
        </View>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  hero: {
    marginTop: 28,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  badgeText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    ...typography.h1,
    marginTop: 20,
    maxWidth: 330,
  },
  sub: {
    ...typography.body,
    marginTop: 14,
    maxWidth: 330,
  },
  card: {
    marginBottom: 18,
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  metric: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 14,
  },
  metricValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  primaryWrap: {
    overflow: "hidden",
    borderRadius: radius.pill,
  },
  primary: {
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  primaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  ghost: {
    marginTop: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
});