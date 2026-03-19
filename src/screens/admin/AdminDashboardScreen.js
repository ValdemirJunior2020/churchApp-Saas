// File: src/screens/admin/AdminDashboardScreen.js

import React, { useMemo } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import ChurchBrandHeader from "../../components/ChurchBrandHeader";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

function StatCard({ icon, label, value, accent = colors.cyan }) {
  return (
    <GlassCard style={styles.statCard}>
      <View style={[styles.iconWrap, { borderColor: `${accent}55` }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassCard>
  );
}

export default function AdminDashboardScreen() {
  const { tenant, profile } = useAuth();
  const { config, members, events, donations } = useAppData();

  const metrics = useMemo(() => {
    const now = Date.now();
    const safeMembers = Array.isArray(members) ? members : [];
    const safeEvents = Array.isArray(events) ? events : [];
    const safeDonations = Array.isArray(donations) ? donations : [];

    const upcomingCount = safeEvents.filter((item) => {
      if (item?.isActive === false) return false;
      if (!item?.dateTimeISO) return true;
      const time = new Date(item.dateTimeISO).getTime();
      return Number.isNaN(time) ? true : time >= now;
    }).length;

    const liveReady = config?.youtubeUrl || config?.youtubeVideoId || tenant?.youtubeUrl || tenant?.youtubeVideoId;

    return {
      members: safeMembers.length,
      events: upcomingCount,
      links: safeDonations.length,
      liveReady: liveReady ? "Yes" : "No",
    };
  }, [members, events, donations, config, tenant]);

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <ChurchBrandHeader
            title={config?.churchName || tenant?.churchName || "Church Dashboard"}
            subtitle="A polished command center for pastors to manage members, giving, events, and live worship."
            centered
            showChurchCode
          />

          <View style={styles.statsGrid}>
            <StatCard
              icon="people-outline"
              label="Members"
              value={String(metrics.members)}
              accent={colors.cyan}
            />
            <StatCard
              icon="calendar-outline"
              label="Upcoming Events"
              value={String(metrics.events)}
              accent={colors.magenta}
            />
            <StatCard
              icon="heart-outline"
              label="Giving Links"
              value={String(metrics.links)}
              accent={colors.success}
            />
            <StatCard
              icon="radio-outline"
              label="Live Ready"
              value={metrics.liveReady}
              accent={colors.warning}
            />
          </View>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Church Overview</Text>

            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={18} color={colors.cyan} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Church Name</Text>
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

            <View style={styles.infoRow}>
              <Ionicons name="person-circle-outline" size={18} color={colors.cyan} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Admin</Text>
                <Text style={styles.infoValue}>{profile?.fullName || "Admin"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={colors.cyan} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Admin Email</Text>
                <Text style={styles.infoValue}>{profile?.email || "-"}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Ionicons name="pin-outline" size={18} color={colors.cyan} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>
                  {config?.address || "Add the church address in Admin Settings."}
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Pastor Notes</Text>

            <View style={styles.noteRow}>
              <View style={styles.noteDot} />
              <Text style={styles.noteText}>
                Your logo, live link, giving links, colors, and background are now controlled from
                Admin Settings.
              </Text>
            </View>

            <View style={styles.noteRow}>
              <View style={styles.noteDot} />
              <Text style={styles.noteText}>
                Members can use their own settings screen to log out or delete only their own
                account.
              </Text>
            </View>

            <View style={styles.noteRow}>
              <View style={styles.noteDot} />
              <Text style={styles.noteText}>
                If you want a more premium pastor home later, the next step is a real dynamic church
                theme across cards, buttons, and tabs.
              </Text>
            </View>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "47%",
    minHeight: 138,
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
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
  noteRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke,
  },
  noteDot: {
    width: 9,
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.cyan,
    marginTop: 6,
  },
  noteText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    flex: 1,
  },
});