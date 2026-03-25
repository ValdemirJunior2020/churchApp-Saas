// File: src/screens/member/HomeScreen.js

import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import ChurchBrandHeader from "../../components/ChurchBrandHeader";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

export default function HomeScreen({ navigation }) {
  const { config } = useAppData();
  const { profile } = useAuth();
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(String(profile?.role || "").toUpperCase());

  const cards = [
    ["Weekly Message", config?.weeklyMessage],
    ["Service Schedule", config?.serviceSchedule],
    ["Next Event", config?.nextEventText],
    ["Latest Announcement", config?.latestAnnouncement],
    ["Pastor's Short Note", config?.pastorShortNote],
    ["Verse of the Day", config?.verseOfTheDay],
  ];

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <ChurchBrandHeader
            title={config?.churchName || "Your Church"}
            subtitle={config?.address || "Revival Global Center"}
            centered
            showChurchCode
          />

          <View style={styles.quickRow}>
            <Pressable style={styles.cta} onPress={() => navigation.navigate("NewHere")}>
              <Text style={styles.ctaText}>I'm New Here</Text>
            </Pressable>
            <Pressable style={[styles.cta, styles.ctaAlt]} onPress={() => navigation.navigate("Testimonies")}>
              <Text style={styles.ctaAltText}>Testimonies</Text>
            </Pressable>
          </View>

          {isAdmin ? (
            <Pressable style={styles.proBtn} onPress={() => navigation.navigate("PaymentRequired")}>
              <Text style={styles.proBtnText}>Open Church Pro / Subscription</Text>
            </Pressable>
          ) : null}

          {cards.map(([title, text]) => (
            <GlassCard key={title} style={styles.card}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardText}>{text || "Coming soon."}</Text>
            </GlassCard>
          ))}

          {isAdmin ? (
            <GlassCard>
              <Text style={styles.cardTitle}>Admin Shortcuts</Text>
              <View style={styles.quickRow}>
                <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate("AdminSettings")}><Text style={styles.secondaryText}>Church Settings</Text></Pressable>
                <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate("AdminMembers")}><Text style={styles.secondaryText}>Members</Text></Pressable>
              </View>
              <View style={styles.quickRow}>
                <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate("AdminEvents")}><Text style={styles.secondaryText}>Events</Text></Pressable>
                <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate("PlatformAdmin")}><Text style={styles.secondaryText}>Platform Admin</Text></Pressable>
              </View>
            </GlassCard>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 140, gap: 14 },
  card: { backgroundColor: "rgba(0,0,0,0.55)", borderColor: "rgba(212,175,55,0.28)" },
  cardTitle: { ...typography.h3, color: "#D4AF37", marginBottom: 10 },
  cardText: { color: colors.text, lineHeight: 28, fontSize: 16 },
  quickRow: { flexDirection: "row", gap: 10 },
  cta: { flex: 1, minHeight: 52, borderRadius: radius.pill, backgroundColor: colors.cyan, alignItems: "center", justifyContent: "center" },
  ctaAlt: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.stroke },
  ctaText: { color: "#041217", fontSize: 16, fontWeight: "900" },
  ctaAltText: { color: colors.text, fontSize: 16, fontWeight: "900" },
  secondaryBtn: { flex: 1, minHeight: 46, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.stroke, alignItems: "center", justifyContent: "center", marginTop: 10 },
  secondaryText: { color: colors.text, fontWeight: "800" },
  proBtn: { minHeight: 48, borderRadius: radius.xl, borderWidth: 1, borderColor: "rgba(86,212,255,0.28)", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(34,211,238,0.08)" },
  proBtnText: { color: colors.text, fontWeight: "900" },
});
