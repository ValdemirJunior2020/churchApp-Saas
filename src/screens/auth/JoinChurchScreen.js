// File: src/screens/auth/JoinChurchScreen.js

import React, { useState } from "react";
import {
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
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

export default function JoinChurchScreen({ navigation }) {
  const { joinChurchAccount } = useAuth();

  const [churchCode, setChurchCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  async function handleSubmit() {
    if (loading) return;

    try {
      setLoading(true);

      const result = await joinChurchAccount({
        churchCode: String(churchCode || "").trim().toUpperCase(),
        fullName: String(fullName || "").trim(),
        phone: String(phone || "").trim(),
        email: normalizeEmail(email),
        password,
      });

      Alert.alert("Joined Church", "Your member account was created successfully.", [
        {
          text: "OK",
          onPress: () => {
            if (navigation?.navigate) {
              navigation.navigate("Login");
            }
          },
        },
      ]);

      return result;
    } catch (error) {
      console.log("JoinChurchScreen error:", error);
      Alert.alert("Error", error?.message || "Could not join church.");
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
            <GlassCard>
              <Text style={styles.title}>Join Church</Text>
              <Text style={styles.sub}>Enter the Church Code from your pastor.</Text>

              <TextInput
                style={styles.input}
                placeholder="Church Code"
                placeholderTextColor={colors.textMuted}
                value={churchCode}
                onChangeText={setChurchCode}
                editable={!loading}
                autoCapitalize="characters"
              />

              <TextInput
                style={styles.input}
                placeholder="Your Full Name"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Joining..." : "Join Church"}
                </Text>
              </Pressable>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  title: {
    ...typography.h2,
    marginBottom: 8,
  },
  sub: {
    ...typography.body,
    marginBottom: 16,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.06)",
    color: colors.text,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 15,
  },
});