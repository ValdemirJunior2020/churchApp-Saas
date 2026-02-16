// src/screens/admin/AdminSettingsScreen.js
import React, { useMemo, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppData } from "../../context/AppDataContext";

export default function AdminSettingsScreen() {
  const { churchConfig, updateChurchConfig } = useAppData();

  const [churchName, setChurchName] = useState(churchConfig.churchName || "");
  const [address, setAddress] = useState(churchConfig.address || "");
  const [logoUrl, setLogoUrl] = useState(churchConfig.logoUrl || "");
  const [youtubeId, setYoutubeId] = useState(churchConfig.youtubeId || "");

  const initial = useMemo(() => {
    const map = {};
    (churchConfig.donationLinks || []).forEach((d) => (map[d.label] = d.url));
    return map;
  }, [churchConfig.donationLinks]);

  const [paypal, setPaypal] = useState(initial["Give (PayPal)"] || "");
  const [cashapp, setCashapp] = useState(initial["Give (Cash App)"] || "");
  const [websiteGive, setWebsiteGive] = useState(initial["Give (Website)"] || "");

  async function onSave() {
    try {
      const donationLinks = [
        { label: "Give (PayPal)", url: String(paypal || "").trim() },
        { label: "Give (Cash App)", url: String(cashapp || "").trim() },
        { label: "Give (Website)", url: String(websiteGive || "").trim() },
      ].filter((x) => x.url);

      await updateChurchConfig({
        churchName: String(churchName || "").trim() || "SANCTUARY",
        address: String(address || "").trim(),
        logoUrl: String(logoUrl || "").trim(),
        youtubeId: String(youtubeId || "").trim(),
        donationLinks,
      });

      Alert.alert("Saved", "Your app branding is updated locally.");
    } catch (e) {
      Alert.alert("Error", e?.message || "Could not save.");
    }
  }

  function openYouTubePreview() {
    const id = String(youtubeId || "").trim();
    if (!id) return Alert.alert("Missing", "Enter a YouTube video ID first.");
    Linking.openURL(`https://www.youtube.com/watch?v=${id}`).catch(() => {});
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.glass}>
        <Text style={styles.kicker}>ADMIN CONTROL PANEL</Text>
        <Text style={styles.title}>App Branding</Text>
        <Text style={styles.sub}>Everything here updates the Member view instantly (stored in AsyncStorage).</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Church Name</Text>
          <TextInput value={churchName} onChangeText={setChurchName} style={styles.input} placeholder="SANCTUARY" placeholderTextColor="#8b95a7" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Address</Text>
          <TextInput value={address} onChangeText={setAddress} style={styles.input} placeholder="Address" placeholderTextColor="#8b95a7" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Logo URL</Text>
          <TextInput value={logoUrl} onChangeText={setLogoUrl} style={styles.input} placeholder="https://..." placeholderTextColor="#8b95a7" autoCapitalize="none" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>YouTube Video ID</Text>
          <TextInput value={youtubeId} onChangeText={setYoutubeId} style={styles.input} placeholder="dQw4w9WgXcQ" placeholderTextColor="#8b95a7" autoCapitalize="none" />
          <Pressable style={styles.smallBtn} onPress={openYouTubePreview}>
            <Text style={styles.smallBtnText}>Preview YouTube</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Donation Links</Text>

        <View style={styles.field}>
          <Text style={styles.label}>PayPal</Text>
          <TextInput value={paypal} onChangeText={setPaypal} style={styles.input} placeholder="https://paypal.me/..." placeholderTextColor="#8b95a7" autoCapitalize="none" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Cash App</Text>
          <TextInput value={cashapp} onChangeText={setCashapp} style={styles.input} placeholder="https://cash.app/..." placeholderTextColor="#8b95a7" autoCapitalize="none" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Website Give Link</Text>
          <TextInput value={websiteGive} onChangeText={setWebsiteGive} style={styles.input} placeholder="https://yourchurch.com/give" placeholderTextColor="#8b95a7" autoCapitalize="none" />
        </View>

        <Pressable style={styles.primaryBtn} onPress={onSave}>
          <Text style={styles.primaryBtnText}>Save Changes</Text>
        </Pressable>
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b", textAlign: "center" },
  title: { marginTop: 8, fontSize: 24, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  sub: { marginTop: 8, fontSize: 13, color: "#586174", textAlign: "center" },
  sectionTitle: { marginTop: 8, fontSize: 16, fontWeight: "900", color: "#0f172a" },
  divider: { height: 1, backgroundColor: "rgba(15, 23, 42, 0.10)", marginVertical: 14 },
  field: { marginTop: 12 },
  label: { fontSize: 12, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  input: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    color: "#0f172a",
  },
  smallBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
  },
  smallBtnText: { fontWeight: "900", color: "#0f172a", fontSize: 12 },
  primaryBtn: {
    height: 50,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 15 },
});
