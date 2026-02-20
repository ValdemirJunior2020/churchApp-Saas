// src/screens/admin/AdminSettingsScreen.js  (REPLACE)
import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";

export default function AdminSettingsScreen() {
  const { tenant } = useAuth();
  const { config, donations, saveConfig, addDonation, removeDonation, refreshChurchData } = useAppData();

  const [churchName, setChurchName] = useState(config?.churchName || "");
  const [address, setAddress] = useState(config?.address || "");
  const [logoUrl, setLogoUrl] = useState(config?.logoUrl || "");
  const [youtubeVideoId, setYoutubeVideoId] = useState(config?.youtubeVideoId || "");
  const [primaryHex, setPrimaryHex] = useState(config?.themePrimaryHex || "#0F172A");
  const [accentHex, setAccentHex] = useState(config?.themeAccentHex || "#2563EB");

  const [donLabel, setDonLabel] = useState("");
  const [donUrl, setDonUrl] = useState("");
  const [donProvider, setDonProvider] = useState("PAYPAL");

  const churchCode = tenant?.inviteCode || "";
  const planStatus = tenant?.planStatus || "";

  const liveDonations = useMemo(() => (Array.isArray(donations) ? donations : []), [donations]);

  async function onSave() {
    try {
      await saveConfig({
        churchName,
        address,
        logoUrl,
        youtubeVideoId,
        themePrimaryHex: primaryHex,
        themeAccentHex: accentHex,
      });
      Alert.alert("Saved", "Settings updated in Google Sheet.");
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    }
  }

  async function onAddDonation() {
    try {
      if (!donLabel.trim() || !donUrl.trim()) {
        Alert.alert("Missing", "Enter label and URL.");
        return;
      }
      await addDonation({ label: donLabel.trim(), url: donUrl.trim(), provider: donProvider });
      setDonLabel("");
      setDonUrl("");
      setDonProvider("PAYPAL");
      Alert.alert("Added", "Donation button added.");
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    }
  }

  async function onRemoveDonation(id) {
    try {
      await removeDonation(id);
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    }
  }

  async function onRefresh() {
    try {
      await refreshChurchData();
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kicker}>PASTOR SETTINGS</Text>
            <Text style={styles.title}>Branding & Giving</Text>
            <Text style={styles.sub}>These save directly into your Google Sheet.</Text>
          </View>
          <Pressable style={styles.refreshBtn} onPress={onRefresh}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>

        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Church Code</Text>
            <Text style={styles.chipValue}>{churchCode || "-"}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Plan</Text>
            <Text style={styles.chipValue}>{planStatus || "-"}</Text>
          </View>
        </View>

        <Text style={styles.label}>Church Name</Text>
        <TextInput value={churchName} onChangeText={setChurchName} style={styles.input} placeholder="SANCTUARY" />

        <Text style={styles.label}>Address</Text>
        <TextInput value={address} onChangeText={setAddress} style={styles.input} placeholder="Street, City, State" />

        <Text style={styles.label}>Logo URL</Text>
        <TextInput value={logoUrl} onChangeText={setLogoUrl} style={styles.input} placeholder="https://..." autoCapitalize="none" />

        <Text style={styles.label}>YouTube Video ID</Text>
        <TextInput value={youtubeVideoId} onChangeText={setYoutubeVideoId} style={styles.input} placeholder="dQw4w9WgXcQ" autoCapitalize="none" />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Theme Primary</Text>
            <TextInput value={primaryHex} onChangeText={setPrimaryHex} style={styles.input} placeholder="#0F172A" autoCapitalize="characters" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Theme Accent</Text>
            <TextInput value={accentHex} onChangeText={setAccentHex} style={styles.input} placeholder="#2563EB" autoCapitalize="characters" />
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>Donation Buttons</Text>

        <View style={styles.donRow}>
          <TextInput value={donLabel} onChangeText={setDonLabel} style={[styles.input, { flex: 1 }]} placeholder="Label (PayPal / Cash App)" />
          <TextInput value={donProvider} onChangeText={setDonProvider} style={[styles.input, { width: 110 }]} placeholder="PAYPAL" autoCapitalize="characters" />
        </View>

        <TextInput value={donUrl} onChangeText={setDonUrl} style={styles.input} placeholder="https://..." autoCapitalize="none" />

        <Pressable style={styles.softBtn} onPress={onAddDonation}>
          <Text style={styles.softBtnText}>+ Add Donation Button</Text>
        </Pressable>

        {liveDonations.length === 0 ? (
          <Text style={styles.empty}>No donation links yet.</Text>
        ) : (
          <View style={{ marginTop: 10, gap: 10 }}>
            {liveDonations.map((d) => (
              <View key={d.donationId} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{d.label}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>
                    {d.url}
                  </Text>
                </View>
                <Pressable style={styles.delBtn} onPress={() => onRemoveDonation(d.donationId)}>
                  <Text style={styles.delText}>Delete</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Pressable style={styles.primary} onPress={onSave}>
          <Text style={styles.primaryText}>Save Settings</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  container: { padding: 16, paddingBottom: 28 },
  card: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
    borderRadius: 26,
    padding: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b", fontWeight: "900" },
  title: { marginTop: 6, fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 6, fontSize: 13, color: "#586174", fontWeight: "700" },
  refreshBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.08)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshText: { color: "#0f172a", fontWeight: "900" },
  chipRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  chip: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  chipLabel: { color: "#64748b", fontWeight: "900", fontSize: 12 },
  chipValue: { marginTop: 4, color: "#0f172a", fontWeight: "900" },

  label: { marginTop: 12, color: "#0f172a", fontWeight: "900" },
  input: {
    marginTop: 8,
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    color: "#0f172a",
    fontWeight: "800",
  },
  divider: { height: 1, backgroundColor: "rgba(15,23,42,0.10)", marginTop: 16 },
  donRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  softBtn: {
    marginTop: 10,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.08)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
  },
  softBtnText: { color: "#0f172a", fontWeight: "900" },
  empty: { marginTop: 10, color: "#64748b", fontWeight: "800" },

  itemRow: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    alignItems: "center",
  },
  itemTitle: { fontWeight: "900", color: "#0f172a" },
  itemSub: { marginTop: 2, color: "#64748b", fontWeight: "800" },
  delBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.10)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  delText: { color: "#b91c1c", fontWeight: "900" },

  primary: {
    marginTop: 16,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  primaryText: { color: "white", fontWeight: "900" },
});