// src/screens/auth/PaymentRequiredScreen.js

import React from "react";
import { Alert, Linking, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { PAYMENT_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

export default function PaymentRequiredScreen() {
  const { tenant, logout } = useAuth();

  async function openPay() {
    try {
      if (!PAYMENT_URL) {
        Alert.alert("Missing payment link", "Add PAYMENT_URL in src/config.js");
        return;
      }
      await Linking.openURL(PAYMENT_URL);
    } catch {
      Alert.alert("Error", "Could not open payment page.");
    }
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <GlassCard style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="lock-closed" size={24} color="#fff" />
            </View>

            <Text style={styles.title}>Subscription required</Text>
            <Text style={styles.sub}>
              Finish activation to unlock your church dashboard and member experience.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.meta}>Church: {tenant?.churchName || "-"}</Text>
              <Text style={styles.meta}>Status: {tenant?.planStatus || "-"}</Text>
              <Text style={styles.meta}>Trial Ends: {tenant?.trialEndsAt || "-"}</Text>
            </View>

            <Pressable style={styles.primaryWrap} onPress={openPay}>
              <LinearGradient
                colors={[colors.violet, colors.cyan, colors.magenta]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primary}
              >
                <Ionicons name="card-outline" size={18} color="#fff" />
                <Text style={styles.primaryText}>Open Payment Page</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.secondary} onPress={logout}>
              <Text style={styles.secondaryText}>Logout</Text>
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
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  card: {},
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124,58,237,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  title: {
    ...typography.h2,
    marginTop: 16,
  },
  sub: {
    ...typography.body,
    marginTop: 10,
  },
  infoBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.04)",
    gap: 8,
  },
  meta: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  primaryWrap: {
    marginTop: 18,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  primary: {
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  primaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  secondary: {
    marginTop: 12,
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  secondaryText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
});