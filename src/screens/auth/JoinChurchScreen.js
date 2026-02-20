// src/screens/auth/JoinChurchScreen.js  (CREATE)
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function JoinChurchScreen() {
  const { joinChurchAndLogin } = useAuth();

  const [inviteCode, setInviteCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    try {
      setBusy(true);
      await joinChurchAndLogin({ inviteCode, name, phone, email, password });
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Join Church</Text>
        <Text style={styles.sub}>Enter the Church Code your Pastor gave you.</Text>

        <TextInput
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="Church Code (example: SANCT-001)"
          style={styles.input}
          autoCapitalize="characters"
          placeholderTextColor="#94a3b8"
        />

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your Name"
          style={styles.input}
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
          style={styles.input}
          keyboardType="phone-pad"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email (optional)"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />

        <Pressable style={[styles.primary, busy && { opacity: 0.6 }]} onPress={onSubmit} disabled={busy}>
          <Text style={styles.primaryText}>{busy ? "Joining..." : "Join & Login"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb", padding: 16, justifyContent: "center" },
  card: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
    borderRadius: 26,
    padding: 18,
  },
  title: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 6, color: "#586174", fontWeight: "700" },
  input: {
    marginTop: 10,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    color: "#0f172a",
    fontWeight: "800",
  },
  primary: {
    marginTop: 14,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  primaryText: { color: "white", fontWeight: "900" },
});