// src/screens/auth/LoginScreen.js
import React, { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth, AUTH_ADMIN_HINT } from "../../context/AuthContext";

export default function LoginScreen() {
  const { login, signup } = useAuth();

  const [mode, setMode] = useState("LOGIN"); // LOGIN | SIGNUP
  const isSignup = mode === "SIGNUP";

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState(""); // phone OR admin email
  const [password, setPassword] = useState("");

  const title = useMemo(() => (isSignup ? "Create Account" : "Welcome Back"), [isSignup]);

  async function onSubmit() {
    try {
      if (isSignup) {
        await signup({ name, phone: identifier, password });
      } else {
        await login({ identifier, password });
      }
    } catch (e) {
      Alert.alert("Error", e?.message || "Something went wrong.");
    }
  }

  function fillAdmin() {
    setMode("LOGIN");
    setIdentifier(AUTH_ADMIN_HINT.email);
    setPassword(AUTH_ADMIN_HINT.password);
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>SANCTUARY</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {isSignup ? "Sign up as a Member (mocked locally)" : "Login with Phone (Member) or admin@church.com"}
        </Text>

        {isSignup && (
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#8b95a7"
              style={styles.input}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>{isSignup ? "Phone" : "Phone or Admin Email"}</Text>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            placeholder={isSignup ? "Phone (ex: 5615850130)" : "Phone or admin@church.com"}
            placeholderTextColor="#8b95a7"
            style={styles.input}
            autoCapitalize="none"
            keyboardType={isSignup ? "phone-pad" : "default"}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#8b95a7"
            style={styles.input}
            secureTextEntry
          />
        </View>

        <Pressable style={styles.primaryBtn} onPress={onSubmit}>
          <Text style={styles.primaryBtnText}>{isSignup ? "Create Account" : "Login"}</Text>
        </Pressable>

        <View style={styles.row}>
          <Pressable onPress={() => setMode(isSignup ? "LOGIN" : "SIGNUP")}>
            <Text style={styles.link}>
              {isSignup ? "Already have an account? Login" : "New here? Create an account"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <Pressable style={styles.secondaryBtn} onPress={fillAdmin}>
          <Text style={styles.secondaryBtnText}>Use Admin Demo</Text>
        </Pressable>

        <Text style={styles.hint}>
          Admin: {AUTH_ADMIN_HINT.email} / {AUTH_ADMIN_HINT.password}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb", alignItems: "center", justifyContent: "center", padding: 18 },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderColor: "rgba(30, 41, 59, 0.10)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  brand: { fontSize: 12, letterSpacing: 2.8, color: "#5b6474", textAlign: "center", marginBottom: 8 },
  title: { fontSize: 26, fontWeight: "800", color: "#0f172a", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#586174", textAlign: "center", marginTop: 8, marginBottom: 14 },
  field: { marginTop: 10 },
  label: { fontSize: 12, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  input: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    color: "#0f172a",
  },
  primaryBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  row: { marginTop: 12, alignItems: "center" },
  link: { color: "#2563eb", fontWeight: "700" },
  divider: { height: 1, backgroundColor: "rgba(15, 23, 42, 0.10)", marginVertical: 14 },
  secondaryBtn: {
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { color: "#0f172a", fontWeight: "800" },
  hint: { marginTop: 10, fontSize: 11, color: "#64748b", textAlign: "center" },
});
