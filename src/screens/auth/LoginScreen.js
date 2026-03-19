// File: src/screens/auth/LoginScreen.js

import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

const APPLE_REVIEW_EMAIL = "apple-review@yourapp.com";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return /\S+@\S+\.\S+/.test(String(email || "").trim()) && password.length >= 6;
  }, [email, password]);

  async function handleLogin() {
    if (loading) return;

    try {
      setLoading(true);
      await login(String(email || "").trim().toLowerCase(), password);
    } catch (error) {
      Alert.alert("Login failed", error?.message || "Could not log in.");
    } finally {
      setLoading(false);
    }
  }

  function fillAppleReviewEmail() {
    setEmail(APPLE_REVIEW_EMAIL);
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <GlassCard style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <Ionicons name="sparkles-outline" size={28} color={colors.cyan} />
              </View>

              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.sub}>
                Log in to enter your church space, watch live, chat, give, and stay connected.
              </Text>

              <View style={styles.quickRow}>
                <Pressable style={styles.quickBtn} onPress={fillAppleReviewEmail}>
                  <Ionicons name="mail-outline" size={16} color={colors.text} />
                  <Text style={styles.quickBtnText}>Use Apple Review Email</Text>
                </Pressable>
              </View>
            </GlassCard>

            <GlassCard>
              <Text style={styles.sectionTitle}>Login</Text>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Your password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />

              <Pressable
                style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={!canSubmit || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#041217" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={18} color="#041217" />
                    <Text style={styles.buttonText}>Log In</Text>
                  </>
                )}
              </Pressable>
            </GlassCard>

            <GlassCard>
              <Text style={styles.sectionTitle}>Need access?</Text>

              <Pressable
                style={styles.secondaryAction}
                onPress={() => navigation?.navigate?.("CreateChurch")}
              >
                <Ionicons name="business-outline" size={18} color={colors.text} />
                <Text style={styles.secondaryActionText}>I am a pastor creating a church</Text>
              </Pressable>

              <Pressable
                style={styles.secondaryAction}
                onPress={() => navigation?.navigate?.("JoinChurch")}
              >
                <Ionicons name="people-outline" size={18} color={colors.text} />
                <Text style={styles.secondaryActionText}>I have a church code from my pastor</Text>
              </Pressable>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 140,
    gap: 14,
  },
  heroCard: {
    alignItems: "center",
  },
  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,211,238,0.16)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.26)",
    marginBottom: 14,
  },
  title: {
    ...typography.h1,
    fontSize: 26,
    textAlign: "center",
  },
  sub: {
    ...typography.body,
    textAlign: "center",
    marginTop: 8,
  },
  quickRow: {
    width: "100%",
    marginTop: 14,
  },
  quickBtn: {
    minHeight: 44,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  quickBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 10,
  },
  label: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.06)",
    color: colors.text,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#041217",
    fontWeight: "900",
    fontSize: 15,
  },
  secondaryAction: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  secondaryActionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    flexShrink: 1,
  },
});