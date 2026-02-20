// src/screens/member/GivingScreen.js  (REPLACE your file)
import React from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppData } from "../../context/AppDataContext";

export default function GivingScreen() {
  const { churchConfig } = useAppData();
  const links = Array.isArray(churchConfig?.donationLinks) ? churchConfig.donationLinks : [];

  async function openLink(url) {
    const u = String(url || "").trim();
    if (!u) return;
    try {
      await Linking.openURL(u);
    } catch {
      Alert.alert("Error", "Could not open the link.");
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>GIVING</Text>
        <Text style={styles.title}>Support {churchConfig?.churchName || "the Church"}</Text>
        <Text style={styles.sub}>Tap a button to give securely.</Text>

        {links.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={28} color="#0f172a" />
            <Text style={styles.emptyText}>No donation links yet.</Text>
            <Text style={styles.emptySub}>Your Pastor can add them in Admin → Branding.</Text>
          </View>
        ) : (
          <View style={{ marginTop: 14, gap: 10 }}>
            {links.map((d) => (
              <Pressable key={d.donationId || d.url} style={styles.donateBtn} onPress={() => openLink(d.url)}>
                <View style={styles.donateLeft}>
                  <Ionicons name="heart" size={18} color="#0f172a" />
                  <Text style={styles.donateLabel}>{d.label || "Donate"}</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#0f172a" />
              </Pressable>
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

  card: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    borderRadius: 24,
    padding: 16,
  },

  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b" },
  title: { marginTop: 6, fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 6, fontSize: 13, color: "#586174" },

  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 24, gap: 6 },
  emptyText: { color: "#0f172a", fontWeight: "900" },
  emptySub: { color: "#586174", fontWeight: "700", textAlign: "center" },

  donateBtn: {
    height: 54,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  donateLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  donateLabel: { fontWeight: "900", color: "#0f172a" },
});