// REPLACE: src/screens/auth/JoinChurchScreen.js
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function JoinChurchScreen() {
  const { joinChurchAndLogin } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    churchCode: "",
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  async function onSubmit() {
    try {
      setBusy(true);
      await joinChurchAndLogin(form);
    } catch (e) {
      Alert.alert("Join failed", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Join Church</Text>
        <Text style={styles.sub}>Creates Member account in Firebase + Firestore.</Text>

        <TextInput value={form.churchCode} onChangeText={(v) => setForm((p) => ({ ...p, churchCode: v }))} placeholder="Church Code" autoCapitalize="characters" style={styles.input} />
        <TextInput value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Your Name" style={styles.input} />
        <TextInput value={form.phone} onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))} placeholder="Phone (optional)" keyboardType="phone-pad" style={styles.input} />
        <TextInput value={form.email} onChangeText={(v) => setForm((p) => ({ ...p, email: v }))} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput value={form.password} onChangeText={(v) => setForm((p) => ({ ...p, password: v }))} placeholder="Password (min 6 chars)" secureTextEntry style={styles.input} />

        <Pressable style={styles.primary} onPress={onSubmit} disabled={busy}>
          <Text style={styles.primaryText}>{busy ? "Creating..." : "Join & Create Account"}</Text>
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