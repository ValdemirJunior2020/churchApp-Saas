// File: src/screens/auth/WelcomeScreen.js

import React from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { colors, radius, typography } from "../../theme";

export default function WelcomeScreen({ navigation }) {
  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <GlassCard style={styles.heroCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✦ Ambient Church AI</Text>
            </View>

            <Text style={styles.title}>
              One premium church{"\n"}
              app for pastors and{"\n"}
              members.
            </Text>

            <Text style={styles.sub}>
              Elegant glassmorphism, live stream viewing, giving,
              events, and a modern iPhone-first church
              experience.
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>LIVE</Text>
                <Text style={styles.statLabel}>YouTube inside app</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>24/7</Text>
                <Text style={styles.statLabel}>Member access</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>∞</Text>
                <Text style={styles.statLabel}>Scalable feel</Text>
              </View>
            </View>

            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={() => navigation.navigate("CreateChurch")}
            >
              <Text style={styles.primaryButtonText}>Create My Church</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate("JoinChurch")}
            >
              <Text style={styles.secondaryButtonText}>Join Existing Church</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.ghostButton]}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.ghostButtonText}>I Already Have Access</Text>
            </Pressable>
          </GlassCard>
        </View>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  heroCard: {
    width: "100%",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.stroke,
    marginBottom: 18,
  },
  badgeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    ...typography.h1,
    marginBottom: 16,
    maxWidth: 420,
  },
  sub: {
    ...typography.body,
    color: colors.textSoft,
    maxWidth: 520,
    marginBottom: 22,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    minHeight: 74,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: colors.cyan,
  },
  primaryButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  ghostButtonText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "800",
  },
});