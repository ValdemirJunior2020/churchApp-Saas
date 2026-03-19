// File: src/screens/auth/CreateChurchScreen.js

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

function sanitizePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export default function CreateChurchScreen({ navigation }) {
  const { createChurchAccount } = useAuth();

  const [churchName, setChurchName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      churchName.trim().length > 1 &&
      fullName.trim().length > 1 &&
      phone.trim().length >= 7 &&
      /\S+@\S+\.\S+/.test(normalizeEmail(email)) &&
      password.length >= 6
    );
  }, [churchName, fullName, phone, email, password]);

  function validateForm() {
    if (!churchName.trim()) {
      Alert.alert("Missing field", "Please enter the church name.");
      return false;
    }

    if (!fullName.trim()) {
      Alert.alert("Missing field", "Please enter your full name.");
      return false;
    }

    if (!phone.trim()) {
      Alert.alert("Missing field", "Please enter your phone number.");
      return false;
    }

    if (!email.trim()) {
      Alert.alert("Missing field", "Please enter your email.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(normalizeEmail(email))) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (loading) return;
    if (!validateForm()) return;

    try {
      setLoading(true);

      const result = await createChurchAccount({
        churchName: churchName.trim(),
        fullName: fullName.trim(),
        phone: sanitizePhone(phone),
        email: normalizeEmail(email),
        password,
      });

      Alert.alert(
        "Church created",
        `Your church was created successfully.\n\nChurch Code: ${result?.churchCode || "-"}\n\nSave this code and share it with your members.`,
        [
          {
            text: "Continue",
            onPress: () => {
              if (navigation?.navigate) {
                navigation.navigate("Login");
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Could not create church", error?.message || "Please try again.");
    } finally {
      setLoading(false);
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
                <Ionicons name="business-outline" size={28} color={colors.cyan} />
              </View>

              <Text style={styles.title}>Create Your Church App</Text>
              <Text style={styles.sub}>
                Pastors create the church once, receive a unique church code, and invite members to
                join the correct church.
              </Text>

              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Ionicons name="gift-outline" size={14} color={colors.cyan} />
                  <Text style={styles.badgeText}>7-day free trial</Text>
                </View>

                <View style={styles.badge}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.cyan} />
                  <Text style={styles.badgeText}>Church code generated</Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard>
              <Text style={styles.sectionTitle}>Pastor Account</Text>

              <Text style={styles.label}>Church Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Victory Worship Center"
                placeholderTextColor={colors.textMuted}
                value={churchName}
                onChangeText={setChurchName}
                editable={!loading}
              />

              <Text style={styles.label}>Pastor / Admin Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Valdemir Junior"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="7543669922"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={(value) => setPhone(sanitizePhone(value))}
                editable={!loading}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="pastor@church.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
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
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Pressable
                style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#041217" />
                ) : (
                  <>
                    <Ionicons name="sparkles-outline" size={18} color="#041217" />
                    <Text style={styles.buttonText}>Create Church</Text>
                  </>
                )}
              </Pressable>
            </GlassCard>

            <GlassCard>
              <Text style={styles.sectionTitle}>What happens next</Text>

              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>A unique church code is created automatically.</Text>
              </View>

              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>You can customize logo, colors, live stream, and giving links in Admin Settings.</Text>
              </View>

              <View style={styles.tipRowLast}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>Members use your church code to join the correct church.</Text>
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
  badgeRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 14,
  },
  badge: {
    minHeight: 34,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
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