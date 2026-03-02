// REPLACE: src/screens/auth/CreateChurchScreen.js
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function CreateChurchScreen() {
  const { createChurchAndLogin } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    churchName: "",
    pastorName: "",
    phone: "",
    email: "",
    password: "",
  });

  async function onSubmit() {
    try {
      setBusy(true);
      await createChurchAndLogin(form);
    } catch (e) {
      Alert.alert("Create failed", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Church</Text>
        <Text style={styles.sub}>Creates Admin account + Firestore church.</Text>

        <TextInput value={form.churchName} onChangeText={(v) => setForm((p) => ({ ...p, churchName: v }))} placeholder="Church Name" style={styles.input} />
        <TextInput value={form.pastorName} onChangeText={(v) => setForm((p) => ({ ...p, pastorName: v }))} placeholder="Pastor Name" style={styles.input} />
        <TextInput value={form.phone} onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))} placeholder="Phone (optional)" keyboardType="phone-pad" style={styles.input} />
        <TextInput value={form.email} onChangeText={(v) => setForm((p) => ({ ...p, email: v }))} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput value={form.password} onChangeText={(v) => setForm((p) => ({ ...p, password: v }))} placeholder="Password (min 6 chars)" secureTextEntry style={styles.input} />

        <Pressable style={styles.primary} onPress={onSubmit} disabled={busy}>
          <Text style={styles.primaryText}>{busy ? "Creating..." : "Create Church"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb", padding: 16, justifyContent: "center" },
  card: { backgroundColor: "white", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "rgba(15,23,42,0.10)" },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 6, color: "#586174", fontWeight: "700" },
  input: { height: 48, borderRadius: 16, paddingHorizontal: 14, backgroundColor: "#F2F4F8", marginTop: 10, fontWeight: "800" },
  primary: { marginTop: 14, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" },
  primaryText: { color: "white", fontWeight: "900" },
});