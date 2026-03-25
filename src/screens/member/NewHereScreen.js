// File: src/screens/member/NewHereScreen.js

import React, { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAppData } from "../../context/AppDataContext";
import { colors, radius, typography } from "../../theme";

const INTERESTS = ["Kids", "Youth", "Small Groups", "Prayer", "Serving", "Music"];

export default function NewHereScreen() {
  const { addNewGuest } = useAppData();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", foundUsBy: "", notes: "" });
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const canSubmit = useMemo(() => form.fullName.trim() && (form.email.trim() || form.phone.trim()), [form]);

  function toggle(item) {
    setSelected((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      setBusy(true);
      await addNewGuest({ ...form, interests: selected });
      Alert.alert("Welcome!", "Thanks for reaching out. A church leader can follow up with you soon.");
      setForm({ fullName: "", email: "", phone: "", foundUsBy: "", notes: "" });
      setSelected([]);
    } catch (error) {
      Alert.alert("Could not submit", error?.message || "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <GlassCard>
            <Text style={styles.title}>I'm New Here</Text>
            <Text style={styles.helper}>Tell us a little about yourself and how we can welcome you.</Text>
            {[
              ["Full Name", "fullName", "Your name"],
              ["Email", "email", "you@example.com"],
              ["Phone", "phone", "(555) 555-5555"],
              ["How did you find us?", "foundUsBy", "Friend, social media, Google..."],
            ].map(([label, key, placeholder]) => (
              <View key={key}>
                <Text style={styles.label}>{label}</Text>
                <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor={colors.textMuted} value={form[key]} onChangeText={(value) => setForm((prev) => ({ ...prev, [key]: value }))} />
              </View>
            ))}
            <Text style={styles.label}>Interest Areas</Text>
            <View style={styles.chips}>{INTERESTS.map((item) => (
              <Pressable key={item} style={[styles.chip, selected.includes(item) && styles.chipActive]} onPress={() => toggle(item)}>
                <Text style={[styles.chipText, selected.includes(item) && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            ))}</View>
            <Text style={styles.label}>Anything else?</Text>
            <TextInput style={[styles.input, styles.notes]} multiline textAlignVertical="top" placeholder="Prayer needs, questions, next steps..." placeholderTextColor={colors.textMuted} value={form.notes} onChangeText={(value) => setForm((prev) => ({ ...prev, notes: value }))} />
            <Pressable style={[styles.button, (!canSubmit || busy) && styles.disabled]} onPress={handleSubmit} disabled={!canSubmit || busy}>
              <Text style={styles.buttonText}>{busy ? "Submitting..." : "Send Welcome Card"}</Text>
            </Pressable>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 140 },
  title: { ...typography.h2, marginBottom: 8 },
  helper: { ...typography.body, marginBottom: 12 },
  label: { color: colors.text, fontWeight: "800", marginTop: 10, marginBottom: 6 },
  input: { minHeight: 48, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.stroke, paddingHorizontal: 14, color: colors.text, backgroundColor: "rgba(255,255,255,0.05)" },
  notes: { minHeight: 110, paddingTop: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.stroke },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.text, fontWeight: "700" },
  chipTextActive: { color: "#041217" },
  button: { marginTop: 16, minHeight: 54, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: colors.cyan },
  buttonText: { color: "#041217", fontSize: 16, fontWeight: "900" },
  disabled: { opacity: 0.6 },
});
