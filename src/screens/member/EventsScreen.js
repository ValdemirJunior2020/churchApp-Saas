// src/screens/member/EventsScreen.js

import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAppData } from "../../context/AppDataContext";
import { colors, typography } from "../../theme";

export default function EventsScreen() {
  const { events } = useAppData();
  const list = Array.isArray(events) ? events : [];

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>EVENTS</Text>
          <Text style={styles.title}>Church calendar</Text>
          <Text style={styles.sub}>A clean timeline with premium iOS depth.</Text>

          <View style={styles.stack}>
            {list.length === 0 ? (
              <GlassCard>
                <View style={styles.empty}>
                  <Ionicons name="calendar-clear-outline" size={34} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>No events yet</Text>
                  <Text style={styles.emptyText}>Next events added by admins will show here.</Text>
                </View>
              </GlassCard>
            ) : (
              list.map((item, index) => (
                <GlassCard key={item.eventId || `${item.title}-${index}`}>
                  <View style={styles.row}>
                    <View style={styles.dot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>{item.title || "Church Event"}</Text>
                      <Text style={styles.eventMeta}>
                        {item.dateTimeISO ? new Date(item.dateTimeISO).toLocaleString() : "Date pending"}
                        {item.location ? ` • ${item.location}` : ""}
                      </Text>
                      {!!item.description && <Text style={styles.eventDesc}>{item.description}</Text>}
                    </View>
                  </View>
                </GlassCard>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 120,
  },
  kicker: {
    ...typography.kicker,
  },
  title: {
    ...typography.h2,
    marginTop: 8,
  },
  sub: {
    ...typography.body,
    marginTop: 8,
  },
  stack: {
    marginTop: 16,
    gap: 12,
  },
  empty: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: 10,
  },
  emptyText: {
    ...typography.body,
    marginTop: 8,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  dot: {
    width: 12,
    height: 12,
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: colors.magenta,
  },
  eventTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  eventMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  eventDesc: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    marginTop: 10,
  },
});