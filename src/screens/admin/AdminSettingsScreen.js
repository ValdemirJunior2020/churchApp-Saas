// REPLACE: src/screens/admin/AdminSettingsScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppData } from "../../context/AppDataContext";

export default function AdminSettingsScreen() {
  const { churchSettings, donations, saveChurchSettings, saveDonations } = useAppData();

  const [churchName, setChurchName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const [donationItems, setDonationItems] = useState([]);

  useEffect(() => {
    setChurchName(churchSettings?.churchName || "");
    setLogoUrl(churchSettings?.logoUrl || "");
    setYoutubeUrl(churchSettings?.youtubeUrl || "");
  }, [churchSettings]);

  useEffect(() => {
    setDonationItems(Array.isArray(donations) ? donations : []);
  }, [donations]);

  const canSave = useMemo(() => !!churchName.trim(), [churchName]);

  async function onSave() {
    try {
      setBusy(true);
      await saveChurchSettings({ churchName, logoUrl, youtubeUrl, planStatus: "ACTIVE" });
      await saveDonations(donationItems);
      Alert.alert("Saved", "Church settings updated.");
    } catch (e) {
      Alert.alert("Save failed", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  function addDonation() {
    setDonationItems((p) => [...p, { label: "", url: "" }]);
  }

  function updateDonation(idx, key, val) {
    setDonationItems((p) => p.map((x, i) => (i === idx ? { ...x, [key]: val } : x)));
  }

  function removeDonation(idx) {
    setDonationItems((p) => p.filter((_, i) => i !== idx));
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.sub}>Firestore settings (no Google Apps Script)</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Church Name</Text>
        <TextInput value={churchName} onChangeText={setChurchName} style={styles.input} placeholder="Church Name" />

        <Text style={styles.label}>Logo URL (optional)</Text>
        <TextInput value={logoUrl} onChangeText={setLogoUrl} style={styles.input} placeholder="https://..." autoCapitalize="none" />

        <Text style={styles.label}>YouTube URL or Video ID (optional)</Text>
        <TextInput value={youtubeUrl} onChangeText={setYoutubeUrl} style={styles.input} placeholder="https://youtube.com/..." autoCapitalize="none" />
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.label}>Giving Links</Text>
          <Pressable onPress={addDonation} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>+ Add</Text>
          </Pressable>
        </View>

        {donationItems.map((d, idx) => (
          <View key={idx} style={styles.donationRow}>
            <TextInput
              value={d.label}
              onChangeText={(v) => updateDonation(idx, "label", v)}
              style={[styles.input, { flex: 1, marginTop: 0 }]}
              placeholder="Label (Tithes, Missions...)"
            />
            <TextInput
              value={d.url}
              onChangeText={(v) => updateDonation(idx, "url", v)}
              style={[styles.input, { flex: 1, marginTop: 0 }]}
              placeholder="https://..."
              autoCapitalize="none"
            />
            <Pressable onPress={() => removeDonation(idx)} style={styles.trash}>
              <Text style={{ fontWeight: "900", color: "#b42318" }}>X</Text>
            </Pressable>
          </View>
        ))}

        <Pressable onPress={onSave} disabled={busy || !canSave} style={[styles.primary, (!canSave || busy) && { opacity: 0.6 }]}>
          <Text style={styles.primaryText}>{busy ? "Saving..." : "Save Changes"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb", padding: 16 },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 6, color: "#586174", fontWeight: "700" },
  card: { marginTop: 12, backgroundColor: "white", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(15,23,42,0.10)" },
  label: { fontWeight: "900", color: "#0f172a", marginTop: 8 },
  input: { height: 46, borderRadius: 14, paddingHorizontal: 12, backgroundColor: "#F2F4F8", marginTop: 8, fontWeight: "800" },
  primary: { marginTop: 14, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" },
  primaryText: { color: "white", fontWeight: "900" },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(37,99,235,0.12)", borderWidth: 1, borderColor: "rgba(37,99,235,0.25)" },
  smallBtnText: { color: "#2563eb", fontWeight: "900" },
  donationRow: { marginTop: 10, flexDirection: "row", gap: 8, alignItems: "center" },
  trash: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(180,35,24,0.08)", borderWidth: 1, borderColor: "rgba(180,35,24,0.25)", alignItems: "center", justifyContent: "center" },
});