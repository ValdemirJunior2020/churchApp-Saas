// REPLACE: src/screens/member/GivingScreen.js
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppData } from "../../context/AppDataContext";

export default function GivingScreen() {
  const { donations } = useAppData();

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Giving</Text>

      {donations?.length ? (
        donations.map((d, idx) => (
          <Pressable
            key={`${d.label}-${idx}`}
            style={styles.card}
            onPress={() => Linking.openURL(d.url).catch(() => {})}
          >
            <Text style={styles.cardTitle}>{d.label}</Text>
            <Text style={styles.cardSub}>{d.url}</Text>
          </Pressable>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No giving links yet.</Text>
          <Text style={styles.emptySub}>Admin can add them in Admin Dashboard.</Text>
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
  cardSub: { marginTop: 6, color: "#586174", fontWeight: "700" },
  empty: { marginTop: 12, borderRadius: 18, padding: 14, backgroundColor: "white", borderWidth: 1, borderColor: "rgba(15,23,42,0.10)" },
  emptyText: { fontWeight: "900", color: "#0f172a" },
  emptySub: { marginTop: 6, color: "#586174", fontWeight: "700" },
});