// src/screens/admin/AdminSettingsScreen.js

import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { extractYouTubeVideoId } from "../../utils/youtube";
import { safeImageSource } from "../../utils/media";

export default function AdminSettingsScreen() {
  const { tenant } = useAuth();
  const { config, donations, saveConfig, addDonation, removeDonation, refreshChurchData } = useAppData();

  const [churchName, setChurchName] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [primaryHex, setPrimaryHex] = useState("#0F172A");
  const [accentHex, setAccentHex] = useState("#22D3EE");

  const [donLabel, setDonLabel] = useState("");
  const [donUrl, setDonUrl] = useState("");
  const [donProvider, setDonProvider] = useState("PAYPAL");
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setChurchName(config?.churchName || "");
    setAddress(config?.address || "");
    setLogoUrl(config?.logoUrl || "");
    setBackgroundImageUrl(config?.backgroundImageUrl || "");
    setYoutubeUrl(config?.youtubeUrl || config?.youtubeVideoId || "");
    setPrimaryHex(config?.themePrimaryHex || "#0F172A");
    setAccentHex(config?.themeAccentHex || "#22D3EE");
    setLogoFailed(false);
  }, [config]);

  const liveDonations = useMemo(() => (Array.isArray(donations) ? donations : []), [donations]);
  const liveVideoId = extractYouTubeVideoId(youtubeUrl);
  const logoSource = safeImageSource(logoUrl);

  async function onSave() {
    try {
      await saveConfig({
        churchName,
        address,
        logoUrl,
        backgroundImageUrl,
        youtubeUrl,
        youtubeVideoId: liveVideoId,
        themePrimaryHex: primaryHex,
        themeAccentHex: accentHex,
      });
      Alert.alert("Saved", "Settings synced to Firebase. Your Live tab and church branding are ready.");
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
      await addDonation({ label: donLabel.trim(), url: donUrl.trim(), provider: donProvider.trim() || "LINK" });
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
      Alert.alert("Removed", "Donation button removed.");
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    }
  }

  async function onRefresh() {
    try {
      await refreshChurchData();
      Alert.alert("Updated", "Latest church data loaded.");
    } catch {
      Alert.alert("Offline", "Could not refresh right now.");
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>ADMIN</Text>
            <Text style={styles.title}>Church Settings</Text>
            <Text style={styles.sub}>Glassmorphism branding, live stream setup, background art, and giving links.</Text>
          </View>

          <Pressable style={styles.refreshBtn} onPress={onRefresh}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>

        <Text style={styles.meta}>Church Code: {tenant?.churchCode || "-"}</Text>

        {!!logoSource && !logoFailed ? (
          <Image source={logoSource} style={styles.previewLogo} onError={() => setLogoFailed(true)} />
        ) : null}

        <TextInput style={styles.input} value={churchName} onChangeText={setChurchName} placeholder="Church name" placeholderTextColor="#7c8598" />
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor="#7c8598" />
        <TextInput style={styles.input} value={logoUrl} onChangeText={setLogoUrl} placeholder="Logo URL (.png .jpg .jpeg .webp .svg .gif)" placeholderTextColor="#7c8598" autoCapitalize="none" />
        <TextInput style={styles.input} value={backgroundImageUrl} onChangeText={setBackgroundImageUrl} placeholder="Optional background image URL" placeholderTextColor="#7c8598" autoCapitalize="none" />
        <TextInput style={styles.input} value={youtubeUrl} onChangeText={setYoutubeUrl} placeholder="YouTube live URL or video ID" placeholderTextColor="#7c8598" autoCapitalize="none" />

        <View style={styles.row}>
          <TextInput style={[styles.input, styles.half]} value={primaryHex} onChangeText={setPrimaryHex} placeholder="Primary hex" placeholderTextColor="#7c8598" autoCapitalize="none" />
          <TextInput style={[styles.input, styles.half]} value={accentHex} onChangeText={setAccentHex} placeholder="Accent hex" placeholderTextColor="#7c8598" autoCapitalize="none" />
        </View>

        <Pressable style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveText}>Save Church Settings</Text>
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.sectionTitle}>Donation Buttons</Text>
        <TextInput style={styles.input} value={donLabel} onChangeText={setDonLabel} placeholder="Button label" placeholderTextColor="#7c8598" />
        <TextInput style={styles.input} value={donUrl} onChangeText={setDonUrl} placeholder="Donation URL" placeholderTextColor="#7c8598" autoCapitalize="none" />
        <TextInput style={styles.input} value={donProvider} onChangeText={setDonProvider} placeholder="Provider" placeholderTextColor="#7c8598" />
        <Pressable style={styles.addBtn} onPress={onAddDonation}>
          <Text style={styles.saveText}>Add Donation Link</Text>
        </Pressable>

        <View style={{ gap: 10, marginTop: 14 }}>
          {liveDonations.map((item) => (
            <View key={item.donationId} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{item.label}</Text>
                <Text style={styles.listSub}>{item.url}</Text>
              </View>
              <Pressable style={styles.removeBtn} onPress={() => onRemoveDonation(item.donationId)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#eef2ff" },
  container: { padding: 16, paddingBottom: 28, gap: 16 },
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    borderRadius: 24,
    padding: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  kicker: { color: "#475569", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#0f172a", fontSize: 28, fontWeight: "900", marginTop: 6 },
  sub: { color: "#475569", fontSize: 14, lineHeight: 20, fontWeight: "600", marginTop: 8 },
  meta: { color: "#0f172a", fontSize: 13, fontWeight: "700", marginTop: 12 },
  previewLogo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    marginTop: 14,
    backgroundColor: "#fff",
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    backgroundColor: "rgba(255,255,255,0.78)",
    color: "#0f172a",
    paddingHorizontal: 14,
    marginTop: 12,
  },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  refreshBtn: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  refreshText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  saveBtn: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    marginTop: 14,
  },
  addBtn: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1d4ed8",
    marginTop: 14,
  },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  sectionTitle: { color: "#0f172a", fontSize: 18, fontWeight: "900" },
  listRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
  },
  listTitle: { color: "#0f172a", fontSize: 14, fontWeight: "800" },
  listSub: { color: "#475569", fontSize: 12, fontWeight: "600", marginTop: 4 },
  removeBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
  },
  removeText: { color: "#991b1b", fontWeight: "800", fontSize: 13 },
});
