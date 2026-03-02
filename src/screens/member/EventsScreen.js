// REPLACE: src/screens/member/EventsScreen.js
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppData } from "../../context/AppDataContext";

export default function EventsScreen() {
  const { events } = useAppData();

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Events</Text>

      {events?.length ? (
        events.map((e) => (
          <View key={e.id} style={styles.card}>
            <Text style={styles.cardTitle}>{e.title || "Event"}</Text>
            <Text style={styles.cardSub}>{e.date || ""}{e.location ? ` • ${e.location}` : ""}</Text>
            {!!e.description && <Text style={styles.desc}>{e.description}</Text>}
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No events yet.</Text>
          <Text style={styles.emptySub}>Admin can add events later (Firestore).</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb", padding: 16 },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  card: { marginTop: 12, backgroundColor: "white", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(15,23,42,0.10)" },
  cardTitle: { fontWeight: "900", color: "#0f172a", fontSize: 16 },
  cardSub: { marginTop: 6, color: "#586174", fontWeight: "800" },
  desc: { marginTop: 8, color: "#0f172a", fontWeight: "600" },
  empty: { marginTop: 12, borderRadius: 18, padding: 14, backgroundColor: "white", borderWidth: 1, borderColor: "rgba(15,23,42,0.10)" },
  emptyText: { fontWeight: "900", color: "#0f172a" },
  emptySub: { marginTop: 6, color: "#586174", fontWeight: "700" },
});