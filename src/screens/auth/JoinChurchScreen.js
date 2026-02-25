// File: src/screens/auth/JoinChurchScreen.js (REPLACE)

import React, { useState } from "react";
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
import { useAuth } from "../../context/AuthContext";

export default function JoinChurchScreen({ navigation }) {
  const { joinChurchAndLogin } = useAuth();

  const [form, setForm] = useState({
    churchCode: "",
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    try {
      setBusy(true);
      await joinChurchAndLogin(form);
      // ✅ After saving session, AppNavigator will automatically route to MemberTabs/AdminTabs
    } catch (e) {
      Alert.alert("Join failed", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F5F7FB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.kicker}>MEMBER</Text>
          <Text style={styles.title}>Join a Church</Text>
          <Text style={styles.sub}>
            Enter the Church Code + create your account. After that, you won’t need to type the code again.
          </Text>

          <TextInput
            value={form.churchCode}
            onChangeText={(v) => setForm((p) => ({ ...p, churchCode: v }))}
            placeholder="Church Code (example: HOLYA-301)"
            autoCapitalize="characters"
            style={styles.input}
          />

          <TextInput
            value={form.name}
            onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
            placeholder="Your Name"
            style={styles.input}
          />

          <TextInput
            value={form.phone}
            onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
            placeholder="Phone"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            value={form.email}
            onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            value={form.password}
            onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />

          <Pressable onPress={onSubmit} disabled={busy} style={[styles.primary, busy && { opacity: 0.75 }]}>
            <Text style={styles.primaryText}>{busy ? "Creating..." : "Join & Create Account"}</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Login")} style={styles.link}>
            <Text style={styles.linkText}>I already have an account → Login</Text>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, padding: 18, justifyContent: "center" },
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b", fontWeight: "900" },
  title: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 8, color: "#586174", fontWeight: "700", lineHeight: 18 },

  input: {
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "#F2F4F8",
    marginTop: 10,
    fontWeight: "800",
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },

  primary: {
    marginTop: 14,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  primaryText: { color: "white", fontWeight: "900" },

  link: { marginTop: 14, alignItems: "center" },
  linkText: { color: "#2563eb", fontWeight: "900" },

  back: { marginTop: 12, alignItems: "center" },
  backText: { color: "#64748b", fontWeight: "800" },
});