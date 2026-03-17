// src/screens/admin/AdminDashboardScreen.js

import React, { useMemo } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { colors, typography } from "../../theme";

function StatCard({ icon, label, value }) {
  return (
    <GlassCard style={styles.statCard}>
      <Ionicons name={icon} size={20} color={colors.cyan} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassCard>
  );
}

export default function AdminDashboardScreen() {
  const { tenant } = useAuth();
  const { config, members, events, donations } = useAppData();

  const upcomingCount = useMemo(() => {
    const now = Date.now();
    return (events || []).filter((item) => item?.isActive !== false && item?.dateTimeISO && new Date(item.dateTimeISO).getTime() >= now).length;
  }, [events]);

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>ADMIN</Text>
          <Text style={styles.title}>{config?.churchName || tenant?.churchName || "Church Dashboard"}</Text>
          <Text style={styles.sub}>A premium command center for your church SaaS app.</Text>

          <View style={styles.grid}>
            <StatCard icon="people-outline" label="Members" value={String((members || []).length)} />
            <StatCard icon="calendar-outline" label="Upcoming Events" value={String(upcomingCount)} />
            <StatCard icon="heart-outline" label="Giving Links" value={String((donations || []).length)} />
            <StatCard icon="radio-outline" label="Live Ready" value={config?.youtubeVideoId ? "Yes" : "No"} />
          </View>

          <GlassCard>
            <Text style={styles.sectionTitle}>Plan</Text>
            <Text style={styles.info}>Status: {tenant?.planStatus || "ACTIVE"}</Text>
            <Text style={styles.info}>Church Code: {tenant?.churchCode || "-"}</Text>
            <Text style={styles.info}>Address: {config?.address || "Add your church address in Settings."}</Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 120 },
  kicker: { ...typography.kicker },
  title: { ...typography.h2, marginTop: 8 },
  sub: { ...typography.body, marginTop: 8 },
  grid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "47%",
    minHeight: 132,
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
  sectionTitle: {
    ...typography.h3,
  },
  info: {
    ...typography.body,
    marginTop: 10,
  },
});
