// src/screens/member/GivingScreen.js

import React from "react";
import { Alert, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAppData } from "../../context/AppDataContext";
import { colors, radius, typography } from "../../theme";

export default function GivingScreen() {
  const { config } = useAppData();
  const churchName = config?.churchName || "the Church";
  const links = Array.isArray(config?.donationLinks) ? config.donationLinks : [];

  async function openLink(url) {
    try {
      if (!url) {
        Alert.alert("Missing link", "This donation link is empty.");
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open", "Please check the donation link.");
    }
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>GIVING</Text>
          <Text style={styles.title}>Support {churchName}</Text>
          <Text style={styles.sub}>Secure, calm, premium giving flow.</Text>

          <GlassCard style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heartWrap}>
                <Ionicons name="heart" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Stewardship with clarity</Text>
                <Text style={styles.heroText}>
                  Make generosity feel intentional with clean links, dark glass cards, and native iPhone polish.
                </Text>
              </View>
            </View>
          </GlassCard>

          <View style={styles.list}>
            {links.length === 0 ? (
              <GlassCard>
                <Text style={styles.emptyTitle}>No donation links yet</Text>
                <Text style={styles.emptyText}>Your pastor can add them in Admin Settings.</Text>
              </GlassCard>
            ) : (
              links.map((item, index) => (
                <GlassCard key={item.donationId || item.url || `${item.label}-${index}`}>
                  <Pressable style={styles.linkRow} onPress={() => openLink(item.url)}>
                    <View style={styles.linkLeft}>
                      <View style={styles.iconChip}>
                        <Ionicons name="sparkles" size={16} color={colors.cyan} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.linkTitle}>{item.label || "Donate"}</Text>
                        <Text style={styles.linkMeta}>{item.url || "Missing URL"}</Text>
                      </View>
                    </View>
                    <Ionicons name="arrow-forward-circle-outline" size={24} color={colors.textMuted} />
                  </Pressable>
                </GlassCard>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 120,
  },
  kicker: {
    ...typography.kicker,
  },
  title: {
    ...typography.h2,
    marginTop: 8,
  },
  sub: {
    ...typography.body,
    marginTop: 8,
  },
  heroCard: {
    marginTop: 16,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  heartWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(236,72,153,0.30)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  heroTitle: {
    ...typography.h3,
  },
  heroText: {
    ...typography.body,
    marginTop: 8,
  },
  list: {
    marginTop: 14,
    gap: 12,
  },
  emptyTitle: {
    ...typography.h3,
  },
  emptyText: {
    ...typography.body,
    marginTop: 8,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  linkLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  linkTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  linkMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },
});