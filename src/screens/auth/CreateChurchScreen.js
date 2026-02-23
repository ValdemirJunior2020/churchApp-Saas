// src/screens/auth/CreateChurchScreen.js
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ImageBackground, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'; // Add this
import { BlurView } from 'expo-blur'; // Add this
import { useAuth } from "../../context/AuthContext";

export default function CreateChurchScreen() {
  const { createChurchAndLogin } = useAuth();
  const [form, setForm] = useState({ churchName: "", pastorName: "", phone: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    try {
      setBusy(true);
      await createChurchAndLogin(form);
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=2070' }} // A deep blue/cloudy nature shot matches your image
      style={styles.root}
    >
      <LinearGradient colors={['rgba(11, 18, 32, 0.4)', 'rgba(15, 23, 42, 0.8)']} style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container}>
            
            <View style={styles.header}>
              <Text style={styles.title}>Create Church (Pastor)</Text>
              <Text style={styles.sub}>This creates a church + your Admin account (trial).</Text>
            </View>

            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <TextInput
                placeholder="Church Name"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                onChangeText={(v) => setForm({...form, churchName: v})}
              />
              <TextInput
                placeholder="Pastor Name"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                onChangeText={(v) => setForm({...form, pastorName: v})}
              />
              <TextInput
                placeholder="Phone"
                keyboardType="phone-pad"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                onChangeText={(v) => setForm({...form, phone: v})}
              />
              <TextInput
                placeholder="Email (recommended)"
                autoCapitalize="none"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                onChangeText={(v) => setForm({...form, email: v})}
              />
              <TextInput
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                onChangeText={(v) => setForm({...form, password: v})}
              />

              <Pressable onPress={onSubmit} disabled={busy}>
                <LinearGradient
                  colors={['#1e40af', '#1e3a8a', '#0f172a']}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryText}>{busy ? "Creating..." : "Create & Login"}</Text>
                </LinearGradient>
              </Pressable>
            </BlurView>

            <Text style={styles.footerNote}>
              Your members will join using your Church Code (invite code) shown in Admin Settings.
            </Text>
            
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { flex: 1 },
  container: { padding: 24, justifyContent: "center", flexGrow: 1 },
  
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  sub: { marginTop: 8, fontSize: 16, color: "rgba(255,255,255,0.8)", fontWeight: "600", lineHeight: 22 },

  glassCard: {
    borderRadius: 32,
    padding: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  input: {
    height: 60,
    borderRadius: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
    color: '#fff',
    fontSize: 17,
    fontWeight: "700",
  },

  primaryBtn: {
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryText: { color: "white", fontWeight: "900", fontSize: 18 },

  footerNote: { 
    marginTop: 24, 
    color: "rgba(255,255,255,0.7)", 
    fontWeight: "700", 
    textAlign: "center", 
    fontSize: 14,
    lineHeight: 20 
  },
});