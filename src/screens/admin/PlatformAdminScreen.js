// File: src/screens/admin/PlatformAdminScreen.js

import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { colors, typography } from "../../theme";

export default function PlatformAdminScreen() {
  const { members, newGuests, testimonies } = useAppData();
  const { tenant, profile } = useAuth();
  const isSuperAdmin = profile?.role === "SUPER_ADMIN";

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <GlassCard>
            <Text style={styles.title}>Platform Admin</Text>
            <Text style={styles.helper}>Church: {tenant?.churchName || "-"}</Text>
            <Text style={styles.helper}>Role: {profile?.role || "MEMBER"}</Text>
            <Text style={styles.note}>{isSuperAdmin ? "You can inspect members, guests, and testimonies for this church from one place." : "Super admin email required for full platform-wide control."}</Text>
          </GlassCard>

          <GlassCard>
            <Text style={styles.section}>Members ({members.length})</Text>
            {members.map((item) => <Text key={item.id || item.uid} style={styles.line}>• {item.fullName} — {item.role}</Text>)}
          </GlassCard>

          <GlassCard>
            <Text style={styles.section}>New Guests ({newGuests.length})</Text>
            {newGuests.map((item) => <Text key={item.guestId} style={styles.line}>• {item.fullName} — {item.email || item.phone || ""}</Text>)}
          </GlassCard>

          <GlassCard>
            <Text style={styles.section}>Testimonies ({testimonies.length})</Text>
            {testimonies.map((item) => <Text key={item.testimonyId} style={styles.line}>• {item.fullName} — {item.status || "PENDING"}</Text>)}
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 140, gap: 14 },
  title: { ...typography.h2, marginBottom: 8 },
  helper: { ...typography.body },
  note: { color: colors.textSoft, marginTop: 10, lineHeight: 22 },
  section: { ...typography.h3, marginBottom: 8 },
  line: { color: colors.textSoft, marginTop: 6 },
});
