// src/screens/member/GivingScreen.js
import React from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppData } from "../../context/AppDataContext";
import { Ionicons } from "@expo/vector-icons";

export default function GivingScreen() {
  const { churchConfig } = useAppData();
  const links = Array.isArray(churchConfig?.donationLinks) ? churchConfig.donationLinks : [];

  const open = async (url) => {
    const u = String(url || "").trim();
    if (!u) return;
    try {
      await Linking.openURL(u);
    } catch {
      Alert.alert("Error", "Could not open link.");
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.glass}>
        <Text style={styles.kicker}>GIVING</Text>
        <Text style={styles.title}>Support the Ministry</Text>
        <Text style={styles.sub}>These buttons are set by the Pastor in Admin Settings.</Text>

        {links.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={26} color="#0f172a" />
            <Text style={styles.emptyText}>No donation links yet.</Text>
          </View>
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            {links.map((d, idx) => (
              <Pressable key={`${d.donationId || d.label || "Give"}_${idx}`} style={styles.btn} onPress={() => open(d.url)}>
                <Text style={styles.btnText}>{d.label || "Give"}</Text>
                <Ionicons name="arrow-forward" size={18} color="#0f172a" />
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
  btn: {
    height: 52,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  btnText: { fontSize: 14, fontWeight: "900", color: "#0f172a" },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 26, gap: 8 },
  emptyText: { color: "#586174", fontWeight: "800" },
});