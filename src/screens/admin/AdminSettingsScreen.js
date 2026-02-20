// src/screens/admin/AdminSettingsScreen.js
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppData } from "../../context/AppDataContext";

function Field({ label, value, onChangeText, placeholder, autoCapitalize }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(15,23,42,0.45)"
        autoCapitalize={autoCapitalize || "none"}
        style={styles.input}
      />
    </View>
  );
}

function DonationRow({ item, onChange, onRemove }) {
  return (
    <View style={styles.dRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.smallLabel}>Label</Text>
        <TextInput
          value={item.label}
          onChangeText={(t) => onChange({ ...item, label: t })}
          placeholder="Give (PayPal)"
          placeholderTextColor="rgba(15,23,42,0.45)"
          style={styles.inputSm}
        />
        <Text style={[styles.smallLabel, { marginTop: 8 }]}>URL</Text>
        <TextInput
          value={item.url}
          onChangeText={(t) => onChange({ ...item, url: t })}
          placeholder="https://paypal.me/yourname  OR  https://cash.app/$cashtag"
          placeholderTextColor="rgba(15,23,42,0.45)"
          style={styles.inputSm}
          autoCapitalize="none"
        />
        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.smallLabel}>Provider</Text>
            <TextInput
              value={item.provider}
              onChangeText={(t) => onChange({ ...item, provider: t })}
              placeholder="PayPal / CashApp / Website"
              placeholderTextColor="rgba(15,23,42,0.45)"
              style={styles.inputSm}
            />
          </View>
          <View style={{ width: 90 }}>
            <Text style={styles.smallLabel}>Order</Text>
            <TextInput
              value={String(item.sortOrder ?? "")}
              onChangeText={(t) => onChange({ ...item, sortOrder: t })}
              placeholder="1"
              placeholderTextColor="rgba(15,23,42,0.45)"
              style={styles.inputSm}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      <Pressable onPress={onRemove} style={styles.trashBtn}>
        <Ionicons name="trash" size={18} color="#0f172a" />
      </Pressable>
    </View>
  );
}

export default function AdminSettingsScreen() {
  const { churchConfig, updateChurchConfig, saveDonationLinks, refreshConfig } = useAppData();

  const [churchName, setChurchName] = useState(churchConfig.churchName || "");
  const [address, setAddress] = useState(churchConfig.address || "");
  const [logoUrl, setLogoUrl] = useState(churchConfig.logoUrl || "");
  const [youtubeVideoId, setYoutubeVideoId] = useState(churchConfig.youtubeVideoId || "");

  const [donations, setDonations] = useState(() => {
    const list = Array.isArray(churchConfig.donationLinks) ? churchConfig.donationLinks : [];
    return list.map((d, idx) => ({
      donationId: d.donationId || "",
      label: d.label || "",
      url: d.url || "",
      provider: d.provider || "",
      sortOrder: d.sortOrder ?? idx + 1,
      isActive: true,
    }));
  });

  const cleanDonations = useMemo(
    () =>
      donations.map((d, idx) => ({
        ...d,
        sortOrder: Number.isFinite(Number(d.sortOrder)) ? Number(d.sortOrder) : idx + 1,
        isActive: true,
      })),
    [donations]
  );

  async function onSave() {
    try {
      await updateChurchConfig({
        configId: "main",
        churchName,
        address,
        logoUrl,
        youtubeVideoId,
      });

      await saveDonationLinks(cleanDonations);

      Alert.alert("Saved", "Your settings were saved to Google Sheets.");
      await refreshConfig();
    } catch (err) {
      Alert.alert("Error", String(err?.message || err));
    }
  }

  function addPayPal() {
    setDonations((prev) => [
      ...prev,
      { donationId: "", label: "Give (PayPal)", url: "https://paypal.me/yourname", provider: "PayPal", sortOrder: prev.length + 1, isActive: true },
    ]);
  }

  function addCashApp() {
    setDonations((prev) => [
      ...prev,
      { donationId: "", label: "Give (Cash App)", url: "https://cash.app/$yourcashtag", provider: "CashApp", sortOrder: prev.length + 1, isActive: true },
    ]);
  }

  function addCustom() {
    setDonations((prev) => [
      ...prev,
      { donationId: "", label: "Give", url: "", provider: "Website", sortOrder: prev.length + 1, isActive: true },
    ]);
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.kicker}>PASTOR SETTINGS</Text>
          <Text style={styles.title}>Branding & Giving</Text>
          <Text style={styles.sub}>These save directly into your Google Sheet.</Text>

          <Field label="Church Name" value={churchName} onChangeText={setChurchName} placeholder="SANCTUARY" autoCapitalize="words" />
          <Field label="Address" value={address} onChangeText={setAddress} placeholder="Street, City, State" autoCapitalize="words" />
          <Field label="Logo URL" value={logoUrl} onChangeText={setLogoUrl} placeholder="https://..." />
          <Field label="YouTube Video ID" value={youtubeVideoId} onChangeText={setYoutubeVideoId} placeholder="dQw4w9WgXcQ" />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Donation Buttons</Text>
            <Text style={styles.sectionSub}>Add PayPal / Cash App links (or any link).</Text>

            <View style={styles.quickRow}>
              <Pressable style={styles.quickBtn} onPress={addPayPal}>
                <Ionicons name="add" size={16} color="#0f172a" />
                <Text style={styles.quickText}>PayPal</Text>
              </Pressable>
              <Pressable style={styles.quickBtn} onPress={addCashApp}>
                <Ionicons name="add" size={16} color="#0f172a" />
                <Text style={styles.quickText}>Cash App</Text>
              </Pressable>
              <Pressable style={styles.quickBtn} onPress={addCustom}>
                <Ionicons name="add" size={16} color="#0f172a" />
                <Text style={styles.quickText}>Custom</Text>
              </Pressable>
            </View>

            {donations.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="heart-outline" size={26} color="#0f172a" />
                <Text style={styles.emptyText}>No donation links yet.</Text>
              </View>
            ) : (
              <View style={{ marginTop: 10, gap: 10 }}>
                {donations.map((d, idx) => (
                  <DonationRow
                    key={`${d.donationId || "new"}_${idx}`}
                    item={d}
                    onChange={(next) =>
                      setDonations((prev) => prev.map((x, i) => (i === idx ? next : x)))
                    }
                    onRemove={() => setDonations((prev) => prev.filter((_, i) => i !== idx))}
                  />
                ))}
              </View>
            )}
          </View>

          <Pressable style={styles.primaryBtn} onPress={onSave}>
            <Text style={styles.primaryBtnText}>Save Settings</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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

  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b", textAlign: "center" },
  title: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  sub: { marginTop: 6, fontSize: 13, color: "#586174", textAlign: "center" },

  label: { fontSize: 12, fontWeight: "900", color: "#0f172a", marginBottom: 6, marginTop: 6 },
  input: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    color: "#0f172a",
    fontWeight: "700",
  },

  section: { marginTop: 18 },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: "#0f172a" },
  sectionSub: { marginTop: 4, fontSize: 12, color: "#586174" },

  quickRow: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  quickText: { fontWeight: "900", color: "#0f172a" },

  dRow: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  smallLabel: { fontSize: 11, fontWeight: "900", color: "#0f172a", marginBottom: 6 },
  inputSm: {
    height: 42,
    borderRadius: 14,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    color: "#0f172a",
    fontWeight: "700",
  },
  trashBtn: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },

  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 20, gap: 8 },
  emptyText: { color: "#586174", fontWeight: "800" },

  primaryBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  primaryBtnText: { color: "white", fontWeight: "900", fontSize: 14 },
});