// src/screens/auth/CreateChurchScreen.js

import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

export default function CreateChurchScreen() {
  const { createChurchAccount } = useAuth();

  const [churchName, setChurchName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    try {
      setLoading(true);

      const result = await createChurchAccount({
        churchName,
        fullName,
        phone,
        email,
        password,
      });

      Alert.alert(
        "Church created",
        `Your Church Code is ${result.churchCode}. Save this code and share it with members.`
      );
    } catch (error) {
      Alert.alert("Error", error?.message || "Could not create church.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <GlassCard>
            <Text style={styles.title}>Create Church</Text>
            <Text style={styles.sub}>Set up your church with Firebase.</Text>

            <TextInput
              style={styles.input}
              placeholder="Church Name"
              placeholderTextColor={colors.textMuted}
              value={churchName}
              onChangeText={setChurchName}
            />
            <TextInput
              style={styles.input}
              placeholder="Your Full Name"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Creating..." : "Create Church"}</Text>
            </Pressable>
          </GlassCard>
        </View>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
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
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});