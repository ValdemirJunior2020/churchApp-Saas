// src/screens/auth/LoginScreen.js
import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

const LOGO_LOCAL = require("../../logo.jpg");

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [churchCode, setChurchCode] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit() {
    setError("");
    setLoading(true);
    try {
      await login({ churchCode, emailOrPhone, password });
    } catch (e) {
      const msg = e?.message || "Something went wrong";
      setError(msg);
      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F5F7FB" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <Image source={LOGO_LOCAL} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>Congregate</Text>
            <Text style={styles.sub}>Welcome back! Enter your details to log in.</Text>
          </View>

          <TextInput
            value={churchCode}
            onChangeText={setChurchCode}
            placeholder="Church Code"
            autoCapitalize="characters"
            style={styles.input}
          />
          <TextInput
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            placeholder="Phone or Email"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable onPress={onSubmit} disabled={loading} style={styles.btn}>
            <Text style={styles.btnText}>{loading ? "Please wait..." : "Login"}</Text>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: "#5B667A", fontWeight: "600" }}>← Back to Welcome Screen</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 18 },
  card: { width: "100%", maxWidth: 420, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 18, padding: 18 },
  header: { alignItems: "center", marginBottom: 14 },
  logo: { width: 86, height: 86, borderRadius: 18, marginBottom: 10 },
  appName: { fontSize: 22, fontWeight: "800", color: "#0B1220" },
  sub: { marginTop: 6, color: "#5B667A", fontWeight: "600", textAlign: "center" },
  input: { height: 48, borderRadius: 14, paddingHorizontal: 14, backgroundColor: "#F2F4F8", marginTop: 10, fontWeight: "700" },
  btn: { height: 52, borderRadius: 16, backgroundColor: "#0B1220", alignItems: "center", justifyContent: "center", marginTop: 14 },
  btnText: { color: "white", fontWeight: "900", fontSize: 16 },
  error: { marginTop: 10, color: "#B42318", fontWeight: "800", textAlign: "center" },
});