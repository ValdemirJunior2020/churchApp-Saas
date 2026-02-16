// src/screens/member/EventsScreen.js
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EventsScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.glass}>
        <Text style={styles.kicker}>EVENTS</Text>
        <Text style={styles.title}>Church Events</Text>
        <Text style={styles.sub}>Admin-managed events coming next.</Text>

        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={28} color="#0f172a" />
          <Text style={styles.emptyTitle}>No events yet</Text>
          <Text style={styles.emptySub}>
            This screen is ready. Next we can add an Admin “Events Manager” to create and publish events here.
          </Text>
        </View>
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
});
