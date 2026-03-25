// File: src/screens/member/PrayerScreen.js

import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import ChurchBrandHeader from "../../components/ChurchBrandHeader";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

export default function PrayerScreen() {
  const { addPrayerRequest, prayerRequests, config } = useAppData();
  const { profile, tenant } = useAuth();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    try {
      setBusy(true);
      await addPrayerRequest({ text, fullName: profile?.fullName, email: profile?.email });
      setText("");
      Alert.alert("Prayer submitted", "Your prayer request was shared with the church.");
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
          <ChurchBrandHeader title="Prayer" subtitle="Submit prayer requests and encourage the church family." centered showChurchCode />
          <GlassCard>
            <Text style={styles.title}>Need prayer?</Text>
            <Text style={styles.helper}>Share a request and it will be saved for your church team.</Text>
            <TextInput
              style={styles.input}
              placeholder="Write your prayer request here"
              placeholderTextColor={colors.textMuted}
              multiline
              value={text}
              onChangeText={setText}
            />
            <Pressable style={[styles.button, busy && styles.disabled]} onPress={handleSubmit} disabled={busy}>
              <Text style={styles.buttonText}>{busy ? "Sending..." : "Submit Prayer Request"}</Text>
            </Pressable>
          </GlassCard>

          <GlassCard>
            <Text style={styles.title}>Recent requests</Text>
            {(prayerRequests || []).length === 0 ? <Text style={styles.helper}>No prayer requests yet.</Text> : (
              (prayerRequests || []).slice(0, 10).map((item) => (
                <View key={item.prayerId} style={styles.row}>
                  <Text style={styles.rowName}>{item.fullName || "Member"}</Text>
                  <Text style={styles.rowText}>{item.text || ""}</Text>
                </View>
              ))
            )}
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 140, gap: 14 },
  title: { ...typography.h3, marginBottom: 8 },
  helper: { ...typography.body, marginBottom: 12 },
  input: { minHeight: 120, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.stroke, padding: 14, color: colors.text, backgroundColor: "rgba(255,255,255,0.05)", textAlignVertical: "top" },
  button: { marginTop: 12, minHeight: 52, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: colors.cyan },
  buttonText: { color: "#041217", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.6 },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.stroke },
  rowName: { color: colors.text, fontWeight: "800", marginBottom: 6 },
  rowText: { color: colors.textSoft, lineHeight: 20 },
});
