// REPLACE: src/screens/auth/LoginScreen.js
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { DEMO_CHURCH_CODE } from "../../config";

export default function LoginScreen() {
  const { login, demoLogin } = useAuth();
  const [churchCode, setChurchCode] = useState(DEMO_CHURCH_CODE || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onLogin() {
    try {
      setBusy(true);
      await login({ churchCode, email, password });
    } catch (e) {
      Alert.alert("Login failed", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function onDemo() {
    try {
      setBusy(true);
      await demoLogin();
    } catch (e) {
      Alert.alert("Demo failed", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.sub}>Email + Password (Firebase)</Text>

        <TextInput
          value={churchCode}
          onChangeText={setChurchCode}
          placeholder="Church Code (ex: HOLYAPPLE)"
          autoCapitalize="characters"
          style={styles.input}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />

        <Pressable style={styles.primary} onPress={onLogin} disabled={busy}>
          <Text style={styles.primaryText}>{busy ? "Please wait..." : "Login"}</Text>
        </Pressable>

        <Pressable style={styles.demo} onPress={onDemo} disabled={busy}>
          <Text style={styles.demoText}>{busy ? "Please wait..." : "Try Demo Mode (Apple)"}</Text>
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
  demo: { marginTop: 10, height: 48, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(37,99,235,0.12)", borderWidth: 1, borderColor: "rgba(37,99,235,0.25)" },
  demoText: { color: "#2563eb", fontWeight: "900" },
});