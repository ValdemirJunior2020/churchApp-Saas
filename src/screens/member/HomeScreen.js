// src/screens/member/HomeScreen.js

import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import AIFab from "../../components/AIFab";
import { useAppData } from "../../context/AppDataContext";
import { colors, radius, typography } from "../../theme";

const DEFAULT_VERSE = {
  title: "Verse of the Day",
  text: "For where two or three gather in my name, there am I with them.",
  ref: "Matthew 18:20",
};

export default function HomeScreen({ navigation }) {
  const { config, events } = useAppData();
  const churchName = config?.churchName || "Sanctuary";
  const logoUrl = String(config?.logoUrl || "").trim();
  const youtubeId = String(config?.youtubeVideoId || "").trim();

  const glow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [glow]);

  const embedUrl = useMemo(() => {
    if (!youtubeId) return "";
    return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`;
  }, [youtubeId]);

  const nextEvents = Array.isArray(events) ? events.slice(0, 2) : [];

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.kicker}>WELCOME BACK</Text>
              <Text style={styles.title}>{churchName}</Text>
            </View>

            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logo} />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoFallbackText}>{churchName.slice(0, 1).toUpperCase()}</Text>
              </View>
            )}
          </View>

          <View style={styles.bento}>
            <GlassCard style={styles.heroCard}>
              <Animated.View style={[styles.aiGlow, { opacity: glow }]} />
              <Text style={styles.cardKicker}>LIVE AI EXPERIENCE</Text>
              <Text style={styles.heroTitle}>Beautiful worship, smarter church connection.</Text>
              <Text style={styles.heroText}>
                Members can watch, give, and stay in sync with everything happening in your church.
              </Text>

              <View style={styles.ctaRow}>
                <Pressable style={styles.ghostButton} onPress={() => navigation.navigate("Giving")}>
                  <Ionicons name="heart-outline" size={18} color={colors.text} />
                  <Text style={styles.ghostButtonText}>Give</Text>
                </Pressable>

                <Pressable style={styles.ghostButton} onPress={() => navigation.navigate("Events")}>
                  <Ionicons name="calendar-outline" size={18} color={colors.text} />
                  <Text style={styles.ghostButtonText}>Events</Text>
                </Pressable>
              </View>
            </GlassCard>

            <GlassCard style={styles.verseCard}>
              <Text style={styles.cardKicker}>{DEFAULT_VERSE.title}</Text>
              <Text style={styles.verseText}>{DEFAULT_VERSE.text}</Text>
              <Text style={styles.verseRef}>{DEFAULT_VERSE.ref}</Text>
            </GlassCard>

            <GlassCard style={styles.eventsCard}>
              <Text style={styles.cardKicker}>UP NEXT</Text>
              {nextEvents.length === 0 ? (
                <Text style={styles.emptyText}>No upcoming events yet.</Text>
              ) : (
                nextEvents.map((event, index) => (
                  <View
                    key={event.eventId || `${event.title}-${index}`}
                    style={[styles.eventRow, index !== nextEvents.length - 1 && styles.eventSpacing]}
                  >
                    <View style={styles.eventDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>{event.title || "Church Event"}</Text>
                      <Text style={styles.eventMeta}>
                        {event.dateTimeISO ? new Date(event.dateTimeISO).toLocaleString() : "Coming soon"}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </GlassCard>

            <GlassCard style={styles.videoCard}>
              <Text style={styles.cardKicker}>WATCH</Text>

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
                  <Ionicons name="play-circle-outline" size={42} color={colors.textMuted} />
                  <Text style={styles.emptyText}>Pastor can add a YouTube Video ID in Admin Settings.</Text>
                </View>
              )}
            </GlassCard>
          </View>
        </ScrollView>

        <AIFab onPress={() => navigation.navigate("Events")} />
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  kicker: {
    ...typography.kicker,
  },
  title: {
    ...typography.h2,
    marginTop: 8,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  logoFallback: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  bento: {
    gap: 14,
  },
  heroCard: {
    minHeight: 220,
  },
  aiGlow: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.20)",
  },
  cardKicker: {
    ...typography.kicker,
    color: colors.textSoft,
  },
  heroTitle: {
    ...typography.h2,
    marginTop: 10,
    maxWidth: 260,
  },
  heroText: {
    ...typography.body,
    marginTop: 12,
    maxWidth: 300,
  },
  ctaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  ghostButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ghostButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  verseCard: {},
  verseText: {
    ...typography.h3,
    marginTop: 10,
    lineHeight: 26,
  },
  verseRef: {
    ...typography.meta,
    marginTop: 10,
    color: colors.cyan,
  },
  eventsCard: {},
  emptyText: {
    ...typography.body,
    marginTop: 12,
  },
  eventRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginTop: 12,
  },
  eventSpacing: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.cyan,
    marginTop: 6,
  },
  eventTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  eventMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },
  videoCard: {},
  videoWrap: {
    height: 220,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  videoPlaceholder: {
    minHeight: 190,
    marginTop: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
});