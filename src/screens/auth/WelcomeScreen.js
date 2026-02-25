// File: src/screens/auth/WelcomeScreen.js (REPLACE)

import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.kicker}>CHURCH SaaS</Text>
        <Text style={styles.title}>One app. Many churches.</Text>
        <Text style={styles.sub}>
          Pastors customize branding & giving. Members see the content.
        </Text>

        <Pressable style={styles.primary} onPress={() => navigation.navigate("CreateChurch")}>
          <Text style={styles.primaryText}>Create Church (Pastor)</Text>
        </Pressable>

        {/* ✅ FIX: JoinChurch screen is not in your navigator, so do NOT navigate to it */}
        <Pressable
          style={styles.secondary}
          onPress={() => {
            Alert.alert(
              "Join Church",
              "Join Church screen is coming next. For now, please use Login if you already have a Church Code."
            );
            navigation.navigate("Login");
          }}
        >
          <Text style={styles.secondaryText}>Join Church (Member)</Text>
        </Pressable>

        <Pressable style={styles.link} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>I already have an account → Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb", padding: 16, justifyContent: "center" },
  card: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
    borderRadius: 26,
    padding: 18,
  },
  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b", fontWeight: "900" },
  title: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 8, color: "#586174", fontWeight: "700", lineHeight: 18 },
  primary: {
    marginTop: 16,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  primaryText: { color: "white", fontWeight: "900" },
  secondary: {
    marginTop: 10,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.08)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
  },
  secondaryText: { color: "#0f172a", fontWeight: "900" },
  link: { marginTop: 14, alignItems: "center" },
  linkText: { color: "#2563eb", fontWeight: "900" },
});