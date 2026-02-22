// src/screens/auth/LoginScreen.js
import React, { useState } from "react";
import {
  Alert,
  Image,
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

const LOGO_LOCAL = require("../../logo.jpg");

export default function LoginScreen() {
  const { login, signup } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [churchCode, setChurchCode] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function onSubmit() {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        console.log("[LOGIN] submit", { churchCode, emailOrPhone });
        await login({ churchCode, emailOrPhone, password });
      } else {
        console.log("[SIGNUP] submit", { churchCode, name, emailOrPhone });
        const emailLooksLikeEmail = String(emailOrPhone || "").includes("@");
        await signup({
          churchCode,
          name,
          email: emailLooksLikeEmail ? emailOrPhone : "",
          phone: emailLooksLikeEmail ? "" : emailOrPhone,
          password,
        });
      }
    } catch (e) {
      console.error("[AUTH] error", e);
      const msg = e?.message || "Something went wrong";
      setError(msg);
      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F5F7FB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <Image source={LOGO_LOCAL} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>Congregate</Text>
            <Text style={styles.sub}>Members: Ask your Pastor for your Church Code to log in.</Text>
          </View>

          <View style={styles.segment}>
            <Pressable
              onPress={() => setMode("login")}
              style={[styles.segBtn, mode === "login" && styles.segBtnActive]}
            >
              <Text style={[styles.segText, mode === "login" && styles.segTextActive]}>Login</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("signup")}
              style={[styles.segBtn, mode === "signup" && styles.segBtnActive]}
            >
              <Text style={[styles.segText, mode === "signup" && styles.segTextActive]}>Sign Up</Text>
            </Pressable>
          </View>

          <TextInput
            value={churchCode}
            onChangeText={setChurchCode}
            placeholder="Church Code"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect={false}
            style={styles.input}
          />

          {mode === "signup" && (
            <TextInput 
              value={name} 
              onChangeText={setName} 
              placeholder="Full Name" 
              autoComplete="off"
              autoCorrect={false}
              style={styles.input} 
            />
          )}

          <TextInput
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            placeholder="Phone or Email"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            textContentType="none"
            keyboardType={String(emailOrPhone).includes("@") ? "email-address" : "phone-pad"}
            style={styles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            autoComplete="off"
            autoCorrect={false}
            textContentType="none"
            style={styles.input}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            onPress={onSubmit}
            disabled={loading}
            style={({ pressed }) => [
              styles.btn,
              loading && { opacity: 0.6 },
              pressed && !loading && { transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={styles.btnText}>{loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}</Text>
          </Pressable>

          <Text style={styles.hint}>Don't know your Church Code? Check your church's website or bulletin, or ask your church admin!</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 18 },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  header: { alignItems: "center", marginBottom: 14 },
  logo: { width: 86, height: 86, borderRadius: 18, marginBottom: 10 },
  appName: { fontSize: 22, fontWeight: "800", color: "#0B1220" },
  sub: { marginTop: 6, color: "#5B667A", fontWeight: "600", textAlign: "center" },

  segment: {
    flexDirection: "row",
    backgroundColor: "#EEF2F7",
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  segBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12 },
  segBtnActive: { backgroundColor: "#0B1220" },
  segText: { fontWeight: "800", color: "#5B667A" },
  segTextActive: { color: "white" },

  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#F2F4F8",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginTop: 10,
    fontWeight: "700",
    color: "#0B1220",
  },
  btn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  btnText: { color: "white", fontWeight: "900", fontSize: 16 },
  hint: { marginTop: 14, color: "#5B667A", fontWeight: "600", fontSize: 12, textAlign: "center", lineHeight: 18 },
  error: { marginTop: 10, color: "#B42318", fontWeight: "800", textAlign: "center" },
});