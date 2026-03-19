// File: src/screens/member/MemberSettingsScreen.js

import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import ChurchBrandHeader from "../../components/ChurchBrandHeader";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";
import { colors, radius, typography } from "../../theme";

export default function MemberSettingsScreen() {
  const { profile, tenant, logout, deleteAccount } = useAuth();
  const { config, donations, events } = useAppData();
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => {
    const donationCount = Array.isArray(donations) ? donations.length : 0;
    const eventCount = Array.isArray(events) ? events.length : 0;

    return {
      donationCount,
      eventCount,
    };
  }, [donations, events]);

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
      "This will permanently delete your member account and remove your church access. This cannot be undone.",
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
          <ChurchBrandHeader
            title={config?.churchName || tenant?.churchName || "My Church"}
            subtitle="Manage your member account clearly and safely."
            centered
            showChurchCode
          />

          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Ionicons name="calendar-outline" size={20} color={colors.cyan} />
              <Text style={styles.statValue}>{stats.eventCount}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Ionicons name="heart-outline" size={20} color={colors.cyan} />
              <Text style={styles.statValue}>{stats.donationCount}</Text>
              <Text style={styles.statLabel}>Giving Links</Text>
            </GlassCard>
          </View>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>My Account</Text>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={colors.cyan} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{profile?.fullName || "Member"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={colors.cyan} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile?.email || "-"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={18} color={colors.cyan} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Church</Text>
                <Text style={styles.infoValue}>
                  {config?.churchName || tenant?.churchName || "-"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="key-outline" size={18} color={colors.cyan} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Church Code</Text>
                <Text style={styles.infoValue}>{tenant?.churchCode || "-"}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.cyan} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{String(profile?.role || "MEMBER").toUpperCase()}</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Account Actions</Text>
            <Text style={styles.helper}>
              These are the exact options Apple reviewers expect to find clearly inside the app.
            </Text>

            <Pressable
              style={[styles.primaryAction, busy && styles.actionDisabled]}
              onPress={handleLogout}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={18} color={colors.text} />
                  <Text style={styles.primaryActionText}>Log Out</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={[styles.dangerAction, busy && styles.actionDisabled]}
              onPress={handleDeleteAccount}
              disabled={busy}
            >
              <Ionicons name="trash-outline" size={18} color="#ffb3ad" />
              <Text style={styles.dangerActionText}>Delete My Account</Text>
            </Pressable>
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Helpful Note</Text>
            <Text style={styles.helper}>
              Deleting your account removes your member login. It does not delete the whole church.
            </Text>
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
    paddingBottom: 140,
    gap: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 120,
    justifyContent: "space-between",
  },
  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 12,
  },
  statLabel: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
  section: {},
  sectionTitle: {
    ...typography.h3,
    marginBottom: 8,
  },
  helper: {
    ...typography.body,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke,
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  primaryAction: {
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    flexDirection: "row",
    gap: 10,
  },
  primaryActionText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15,
  },
  dangerAction: {
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255, 59, 48, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  dangerActionText: {
    color: "#ffb3ad",
    fontWeight: "900",
    fontSize: 15,
  },
  actionDisabled: {
    opacity: 0.65,
  },
});