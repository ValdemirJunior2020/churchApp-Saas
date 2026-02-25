// File: src/screens/member/GivingScreen.js (REPLACE)

import React, { useMemo } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppData } from "../../context/AppDataContext";

export default function GivingScreen() {
  const appData = useAppData();

  // ✅ Support both possible context shapes while you are still wiring things
  const config = appData?.config || appData?.churchConfig || {};
  const rawDonations =
    appData?.donations ||
    config?.donations ||
    config?.donationLinks ||
    [];

  // ✅ Normalize to one shape so UI works with either GAS response or old local shape
  const links = useMemo(() => {
    if (!Array.isArray(rawDonations)) return [];

    return rawDonations
      .map((item, index) => ({
        id:
          item?.id ||
          item?.donationId ||
          `donation_${index}`,
        label: String(item?.label || item?.name || "Donate").trim(),
        url: String(item?.url || item?.link || "").trim(),
        sortOrder: Number(item?.sortOrder || index + 1),
        status: String(item?.status || "ACTIVE").toUpperCase(),
      }))
      .filter((x) => x.url && x.status !== "DELETED")
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [rawDonations]);

  const churchName = config?.churchName || "the Church";

  async function openLink(url) {
    const u = String(url || "").trim();
    if (!u) return;

    try {
      const supported = await Linking.canOpenURL(u);
      if (!supported) {
        Alert.alert("Invalid Link", "This donation link cannot be opened.");
        return;
      }
      await Linking.openURL(u);
    } catch (err) {
      console.log("[GivingScreen] openLink error:", err);
      Alert.alert("Error", "Could not open the link.");
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>GIVING</Text>
        <Text style={styles.title}>Support {churchName}</Text>
        <Text style={styles.sub}>Tap a button to give securely.</Text>

        {/* ✅ Debug block while wiring data (remove later if you want) */}
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>Debug</Text>
          <Text style={styles.debugText}>
            rawDonations: {Array.isArray(rawDonations) ? rawDonations.length : 0}
          </Text>
          <Text style={styles.debugText}>normalizedLinks: {links.length}</Text>
        </View>

        {links.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={28} color="#0f172a" />
            <Text style={styles.emptyText}>No donation links yet.</Text>
            <Text style={styles.emptySub}>
              Your Pastor can add them in Admin Dashboard → Save Settings.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {links.map((d) => (
              <Pressable
                key={d.id || d.url}
                style={({ pressed }) => [
                  styles.donateBtn,
                  pressed && styles.donateBtnPressed,
                ]}
                onPress={() => openLink(d.url)}
              >
                <View style={styles.donateLeft}>
                  <Ionicons name="heart" size={18} color="#0f172a" />
                  <View style={{ flexShrink: 1 }}>
                    <Text style={styles.donateLabel} numberOfLines={1}>
                      {d.label || "Donate"}
                    </Text>
                    <Text style={styles.donateUrl} numberOfLines={1}>
                      {d.url}
                    </Text>
                  </View>
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
    backgroundColor: "rgba(255,255,255,0.90)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  kicker: {
    fontSize: 11,
    letterSpacing: 2.5,
    color: "#64748b",
    fontWeight: "900",
  },

  title: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
  },

  sub: {
    marginTop: 6,
    fontSize: 13,
    color: "#586174",
    fontWeight: "600",
  },

  debugBox: {
    marginTop: 12,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    backgroundColor: "rgba(15,23,42,0.03)",
  },

  debugTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#475569",
    marginBottom: 4,
    letterSpacing: 1,
  },

  debugText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 6,
    marginTop: 8,
  },

  emptyText: { color: "#0f172a", fontWeight: "900" },

  emptySub: {
    color: "#586174",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },

  list: { marginTop: 14, gap: 10 },

  donateBtn: {
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(15,23,42,0.05)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },

  donateBtnPressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: "rgba(15,23,42,0.08)",
  },

  donateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },

  donateLabel: {
    fontWeight: "900",
    color: "#0f172a",
    fontSize: 14,
  },

  donateUrl: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748b",
    fontWeight: "700",
  },
});