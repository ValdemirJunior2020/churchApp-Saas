// src/screens/auth/LoginScreen.js
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
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../../config";

function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(15,23,42,0.45)"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || "none"}
        style={styles.input}
      />
    </View>
  );
}

export default function LoginScreen() {
  const { login } = useAuth();
  const { addMember } = useAppData();

  const [mode, setMode] = useState("login"); // login | signup
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const title = useMemo(() => (isSignup ? "Create Account" : "Welcome Back"), [isSignup]);

  async function onSubmit() {
    try {
      if (isSignup) {
        await addMember({ name, phone, password, email });
        Alert.alert("Success", "Account created. Now login with your phone + password.");
        setMode("login");
        setIdentifier(phone);
        setName("");
        setPhone("");
        setEmail("");
        setPassword("");
        return;
      }

      await login({ identifier, password });
    } catch (err) {
      Alert.alert("Error", String(err?.message || err));
    }
  }

  function fillAdmin() {
    setMode("login");
    setIdentifier(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.kicker}>CHURCH SAAS</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>
            {isSignup ? "Sign up as a Member (default role)." : "Login as Member (phone) or Admin (email)."}
          </Text>

          {isSignup ? (
            <>
              <Field label="Name" value={name} onChangeText={setName} placeholder="John Doe" autoCapitalize="words" />
              <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="5615551234" keyboardType="phone-pad" />
              <Field label="Email (optional)" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" />
              <Field label="Password" value={password} onChangeText={setPassword} placeholder="Create a password" secureTextEntry />
            </>
          ) : (
            <>
              <Field
                label="Phone (Member) OR Email (Admin)"
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="5615551234  or  admin@church.com"
                keyboardType="default"
              />
              <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
            </>
          )}

          <Pressable style={styles.primaryBtn} onPress={onSubmit}>
            <Text style={styles.primaryBtnText}>{isSignup ? "Create Account" : "Login"}</Text>
          </Pressable>

          <View style={styles.row}>
            <Text style={styles.muted}>{isSignup ? "Already have an account?" : "New here?"}</Text>
            <Pressable onPress={() => setMode(isSignup ? "login" : "signup")}>
              <Text style={styles.link}>{isSignup ? "Login" : "Create one"}</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.secondaryBtn} onPress={fillAdmin}>
            <Text style={styles.secondaryBtnText}>Fill Admin Login</Text>
          </Pressable>

          <Text style={styles.hint}>
            Admin credentials: {ADMIN_EMAIL} / {ADMIN_PASSWORD}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  container: { padding: 16, paddingBottom: 28, flexGrow: 1, justifyContent: "center" },

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

  label: { fontSize: 12, fontWeight: "900", color: "#0f172a", marginBottom: 6 },
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

  primaryBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  primaryBtnText: { color: "white", fontWeight: "900", fontSize: 14 },

  row: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 12 },
  muted: { color: "#586174", fontWeight: "700" },
  link: { color: "#0f172a", fontWeight: "900" },

  divider: { height: 1, backgroundColor: "rgba(15,23,42,0.08)", marginVertical: 14 },

  secondaryBtn: {
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { color: "#0f172a", fontWeight: "900" },

  hint: { marginTop: 10, fontSize: 11, color: "#64748b", textAlign: "center", fontWeight: "700" },
});