// src/screens/auth/AuthEntryScreen.js

import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

const COLORS = {
  bg: "#05060A",
  card: "rgba(22,22,28,0.9)",
  border: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.72)",
  active: "#2ED8F3",
  warning: "#F4C27A",
};

const MODES = {
  LOGIN: "LOGIN",
  JOIN: "JOIN",
  CREATE: "CREATE",
};

function TabButton({ active, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.modeButton, active && styles.modeButtonActive]}>
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function AuthEntryScreen() {
  const { login, joinChurchAccount, createChurchAccount } = useAuth();

  const [mode, setMode] = useState(MODES.LOGIN);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [churchName, setChurchName] = useState("");
  const [churchCode, setChurchCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const title = useMemo(() => {
    if (mode === MODES.CREATE) return "Create Your Church";
    if (mode === MODES.JOIN) return "Join Existing Church";
    return "Welcome Back";
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === MODES.CREATE) {
      return "Create a new church workspace and become the church admin.";
    }
    if (mode === MODES.JOIN) {
      return "Use your church code to join your church and access its app.";
    }
    return "Log back in any time after signing out.";
  }, [mode]);

  async function handleSubmit() {
    if (loading) return;

    setErrorText("");

    try {
      setLoading(true);

      if (mode === MODES.LOGIN) {
        await login(email, password);
        return;
      }

      if (mode === MODES.JOIN) {
        await joinChurchAccount({
          churchCode,
          fullName,
          phone,
          email,
          password,
        });
        return;
      }

      await createChurchAccount({
        churchName,
        fullName,
        phone,
        email,
        password,
      });
    } catch (error) {
      setErrorText(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="people-circle-outline" size={34} color={COLORS.active} />
            </View>
            <Text style={styles.heroTitle}>Congregate</Text>
            <Text style={styles.heroSubtitle}>
              Log in, join a church, or create a new church.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.modeTabs}>
              <TabButton
                label="Login"
                active={mode === MODES.LOGIN}
                onPress={() => setMode(MODES.LOGIN)}
              />
              <TabButton
                label="Join Church"
                active={mode === MODES.JOIN}
                onPress={() => setMode(MODES.JOIN)}
              />
              <TabButton
                label="Create Church"
                active={mode === MODES.CREATE}
                onPress={() => setMode(MODES.CREATE)}
              />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            {mode === MODES.CREATE ? (
              <TextInput
                value={churchName}
                onChangeText={setChurchName}
                placeholder="Church name"
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={styles.input}
              />
            ) : null}

            {mode !== MODES.LOGIN ? (
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full name"
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={styles.input}
              />
            ) : null}

            {mode !== MODES.LOGIN ? (
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone"
                placeholderTextColor="rgba(255,255,255,0.45)"
                keyboardType="phone-pad"
                style={styles.input}
              />
            ) : null}

            {mode === MODES.JOIN ? (
              <TextInput
                value={churchCode}
                onChangeText={(value) => setChurchCode(value.toUpperCase())}
                placeholder="Church code"
                placeholderTextColor="rgba(255,255,255,0.45)"
                autoCapitalize="characters"
                style={styles.input}
              />
            ) : null}

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.45)"
              secureTextEntry
              style={styles.input}
            />

            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.primaryButton, loading && styles.disabled]}
            >
              {loading ? (
                <ActivityIndicator color="#041217" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === MODES.LOGIN
                    ? "Log In"
                    : mode === MODES.JOIN
                      ? "Join Church"
                      : "Create Church"}
                </Text>
              )}
            </Pressable>

            <Text style={styles.helper}>
              After you log out, this is the screen the app should always return to.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
    justifyContent: "center",
    flexGrow: 1,
  },
  hero: {
    alignItems: "center",
    marginBottom: 18,
  },
  heroIcon: {
    width: 74,
    height: 74,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(46,216,243,0.12)",
    borderWidth: 1,
    borderColor: "rgba(46,216,243,0.25)",
    marginBottom: 12,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "900",
  },
  heroSubtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  modeButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  modeButtonActive: {
    backgroundColor: "rgba(46,216,243,0.12)",
    borderColor: "rgba(46,216,243,0.28)",
  },
  modeButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  modeButtonTextActive: {
    color: COLORS.active,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  input: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 12,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: COLORS.active,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#041217",
    fontSize: 18,
    fontWeight: "900",
  },
  helper: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
    lineHeight: 18,
  },
  errorText: {
    color: "#FF8F8F",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  disabled: {
    opacity: 0.6,
  },
});