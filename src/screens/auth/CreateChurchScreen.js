// File: src/screens/auth/CreateChurchScreen.js

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

export default function CreateChurchScreen({ navigation }) {
  const { createChurchAccount } = useAuth();

  const [churchName, setChurchName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sanitizePhone = (value) => value.replace(/[^\d+]/g, "");
  const normalizeEmail = (value) => value.trim().toLowerCase();

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

    if (!password || password.length < 6) {
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

      const payload = {
        churchName: churchName.trim(),
        fullName: fullName.trim(),
        phone: sanitizePhone(phone),
        email: normalizeEmail(email),
        password,
      };

      const result = await createChurchAccount(payload);

      Alert.alert(
        "Church created",
        `Your Church Code is ${result?.churchCode || "N/A"}. Save this code and share it with members.`,
        [
          {
            text: "OK",
            onPress: () => {
              if (navigation?.navigate) {
                navigation.navigate("Login");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.log("CreateChurchScreen error:", error);
      Alert.alert(
        "Error",
        error?.message || "Could not create church."
      );
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
              <Text style={styles.title}>Create Church</Text>
              <Text style={styles.sub}>Set up your church with Firebase.</Text>

              <TextInput
                style={styles.input}
                placeholder="Church Name"
                placeholderTextColor={colors.textMuted}
                value={churchName}
                onChangeText={setChurchName}
                editable={!loading}
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder="Your Full Name"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
                keyboardType="phone-pad"
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Creating..." : "Create Church"}
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
    backgroundColor: colors.violet,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});