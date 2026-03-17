// src/screens/member/LiveScreen.js

import React, { useMemo } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAppData } from "../../context/AppDataContext";
import { buildYouTubeEmbedUrl } from "../../utils/youtube";
import { colors, radius, typography } from "../../theme";

export default function LiveScreen() {
  const { config } = useAppData();
  const churchName = config?.churchName || "Your Church";
  const liveSource = config?.youtubeUrl || config?.youtubeVideoId || "";
  const embedUrl = useMemo(() => buildYouTubeEmbedUrl(liveSource), [liveSource]);

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>LIVE</Text>
          <Text style={styles.title}>Watch {churchName}</Text>
          <Text style={styles.sub}>A dedicated live area so members can watch directly inside the app.</Text>

          <GlassCard style={styles.heroCard}>
            <Text style={styles.cardKicker}>STREAM</Text>
            {embedUrl ? (
              <View style={styles.videoWrap}>
                <WebView
                  source={{ uri: embedUrl }}
                  style={{ flex: 1, backgroundColor: "transparent" }}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsFullscreenVideo
                />
              </View>
            ) : (
              <View style={styles.videoPlaceholder}>
                <Ionicons name="radio-outline" size={44} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No live stream linked yet</Text>
                <Text style={styles.emptyText}>
                  Ask your pastor to paste the church YouTube URL in Admin Settings.
                </Text>
              </View>
            )}
          </GlassCard>

          <GlassCard>
            <Text style={styles.cardKicker}>HOW TO ENABLE</Text>
            <Text style={styles.tip}>1. Open the admin Settings tab.</Text>
            <Text style={styles.tip}>2. Paste the church YouTube live URL or video ID.</Text>
            <Text style={styles.tip}>3. Save settings and reopen this Live tab.</Text>
          </GlassCard>
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
    gap: 14,
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
  heroCard: {},
  cardKicker: {
    ...typography.kicker,
    color: colors.textSoft,
  },
  videoWrap: {
    height: 260,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  videoPlaceholder: {
    minHeight: 240,
    marginTop: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: 12,
    textAlign: "center",
  },
  emptyText: {
    ...typography.body,
    marginTop: 10,
    textAlign: "center",
  },
  tip: {
    ...typography.body,
    marginTop: 8,
  },
});
