// File: src/screens/auth/JoinChurchScreen.js

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

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function sanitizePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

function uiLog(label, payload) {
  try {
    console.log(`[JOIN_SCREEN] ${label}`, payload ?? "");
  } catch {
    console.log(`[JOIN_SCREEN] ${label}`);
  }
}

export default function JoinChurchScreen({ navigation }) {
  const { joinChurchAccount } = useAuth();

  const [churchCode, setChurchCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  const canSubmit = useMemo(() => {
    return (
      normalizeCode(churchCode).length >= 4 &&
      fullName.trim().length > 1 &&
      phone.trim().length >= 7 &&
      /\S+@\S+\.\S+/.test(normalizeEmail(email)) &&
      password.length >= 6
    );
  }, [churchCode, fullName, phone, email, password]);

  async function handleSubmit() {
    uiLog("handleSubmit:start", {
      churchCode,
      fullName,
      phone,
      email,
      passwordLength: password.length,
    });

    if (loading) {
      uiLog("handleSubmit:blockedBecauseLoading");
      return;
    }

    try {
      setLoading(true);
      setStatusText("Checking church code...");
      uiLog("handleSubmit:callingJoinChurchAccount");

      const result = await joinChurchAccount({
        churchCode: normalizeCode(churchCode),
        fullName: fullName.trim(),
        phone: sanitizePhone(phone),
        email: normalizeEmail(email),
        password,
      });

      uiLog("handleSubmit:joinSuccess", result);

      setStatusText("Success. Your member account is ready.");

      Alert.alert(
        "Joined church",
        "Your member account was created successfully. You can now log in and access your church.",
        [
          {
            text: "Go to Login",
            onPress: () => {
              uiLog("handleSubmit:navigateLogin");
              if (navigation?.navigate) {
                navigation.navigate("Login");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.log("[JOIN_SCREEN] handleSubmit:error", error);
      setStatusText("");
      Alert.alert("Could not join church", error?.message || "Please try again.");
    } finally {
      setLoading(false);
      uiLog("handleSubmit:finally");
    }
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
                <Ionicons name="people-outline" size={28} color={colors.cyan} />
              </View>

              <Text style={styles.title}>Join Your Church</Text>
              <Text style={styles.sub}>
                Use the church code your pastor shared with you so your account connects to the correct church.
              </Text>
            </GlassCard>

            <GlassCard>
              <Text style={styles.sectionTitle}>Member Access</Text>

              <Text style={styles.label}>Church Code</Text>
              <TextInput
                style={styles.input}
                placeholder="APPCHU-WRJ3"
                placeholderTextColor={colors.textMuted}
                value={churchCode}
                onChangeText={(value) => {
                  const next = normalizeCode(value);
                  uiLog("churchCode:onChange", next);
                  setChurchCode(next);
                }}
                autoCapitalize="characters"
                editable={!loading}
              />

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={(value) => {
                  uiLog("fullName:onChange", value);
                  setFullName(value);
                }}
                editable={!loading}
              />

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="7543669922"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={(value) => {
                  const next = sanitizePhone(value);
                  uiLog("phone:onChange", next);
                  setPhone(next);
                }}
                editable={!loading}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="member@email.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={(value) => {
                  uiLog("email:onChange", value);
                  setEmail(value);
                }}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={(value) => {
                  uiLog("password:onChange", { length: value.length });
                  setPassword(value);
                }}
                editable={!loading}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Pressable
                style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}
                onPress={() => {
                  uiLog("joinButton:pressed", { canSubmit, loading });
                  handleSubmit();
                }}
                disabled={!canSubmit || loading}
              >
                {loading ? (
                  <>
                    <ActivityIndicator color="#041217" />
                    <Text style={styles.buttonText}>Joining...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="enter-outline" size={18} color="#041217" />
                    <Text style={styles.buttonText}>Join Church</Text>
                  </>
                )}
              </Pressable>

              {!!statusText && <Text style={styles.statusText}>{statusText}</Text>}
            </GlassCard>

            <GlassCard>
              <Text style={styles.sectionTitle}>Need help?</Text>

              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>Ask your pastor for the exact church code.</Text>
              </View>

              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>Use your own email. Each member needs their own login.</Text>
              </View>

              <View style={styles.tipRowLast}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>If you already created an account before, tap Login instead of joining again.</Text>
              </View>
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
  statusText: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  tipRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke,
  },
  tipRowLast: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingTop: 10,
  },
  tipDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.cyan,
    marginTop: 6,
  },
  tipText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    flex: 1,
  },
});