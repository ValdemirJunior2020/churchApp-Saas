// File: src/screens/member/MemberSettingsScreen.js

import React, { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

export default function MemberSettingsScreen() {
  const { profile, tenant, logout, deleteAccount } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;

    try {
      setBusy(true);
      await logout();
    } catch (error) {
      Alert.alert("Error", error?.message || "Could not log out.");
    } finally {
      setBusy(false);
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete account",
      "This will permanently delete your account and remove you from this church. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setBusy(true);
              await deleteAccount();
            } catch (error) {
              Alert.alert("Error", error?.message || "Could not delete account.");
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <GlassCard>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.sub}>Manage your member account.</Text>

            <View style={styles.infoBlock}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{profile?.fullName || "Member"}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{profile?.email || "-"}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.label}>Church</Text>
              <Text style={styles.value}>{tenant?.churchName || "-"}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.label}>Church Code</Text>
              <Text style={styles.value}>{tenant?.churchCode || "-"}</Text>
            </View>

            <Pressable
              style={[styles.secondaryAction, busy && styles.actionDisabled]}
              onPress={handleLogout}
              disabled={busy}
            >
              <Text style={styles.secondaryActionText}>
                {busy ? "Please wait..." : "Log Out"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.dangerAction, busy && styles.actionDisabled]}
              onPress={handleDeleteAccount}
              disabled={busy}
            >
              <Text style={styles.dangerActionText}>Delete Account</Text>
            </Pressable>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 120,
  },
  title: {
    ...typography.h2,
    marginBottom: 8,
  },
  sub: {
    ...typography.body,
    marginBottom: 20,
  },
  infoBlock: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke,
  },
  label: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryAction: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  secondaryActionText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15,
  },
  dangerAction: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255, 59, 48, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  dangerActionText: {
    color: "#ffb3ad",
    fontWeight: "800",
    fontSize: 15,
  },
  actionDisabled: {
    opacity: 0.65,
  },
});