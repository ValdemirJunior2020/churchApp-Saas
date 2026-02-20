// src/screens/member/EventsScreen.js
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppData } from "../../context/AppDataContext";

export default function EventsScreen() {
  const { events } = useAppData();
  const list = Array.isArray(events) ? events : [];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.glass}>
        <Text style={styles.kicker}>EVENTS</Text>
        <Text style={styles.title}>Church Events</Text>
        <Text style={styles.sub}>Loaded from Google Sheets.</Text>

        {list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={28} color="#0f172a" />
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptySub}>Next we’ll add an Admin Events Manager to create events.</Text>
          </View>
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            {list.map((e) => (
              <View key={e.eventId} style={styles.eventRow}>
                <Text style={styles.eventTitle}>{e.title}</Text>
                <Text style={styles.eventMeta}>
                  {e.dateTimeISO ? new Date(e.dateTimeISO).toLocaleString() : ""} {e.location ? `• ${e.location}` : ""}
                </Text>
                {!!e.description && <Text style={styles.eventDesc}>{e.description}</Text>}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  container: { padding: 16, paddingBottom: 28 },
  glass: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    borderRadius: 24,
    padding: 16,
  },
  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b", textAlign: "center" },
  title: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  sub: { marginTop: 6, fontSize: 13, color: "#586174", textAlign: "center" },

  empty: { marginTop: 18, alignItems: "center", gap: 8, paddingVertical: 20 },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
  emptySub: { fontSize: 13, color: "#586174", textAlign: "center", maxWidth: 320 },

  eventRow: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  eventTitle: { fontWeight: "900", color: "#0f172a", fontSize: 14 },
  eventMeta: { marginTop: 4, color: "#586174", fontWeight: "700", fontSize: 12 },
  eventDesc: { marginTop: 8, color: "#0f172a", fontWeight: "600", fontSize: 13 },
});