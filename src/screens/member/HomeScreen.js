// src/screens/member/HomeScreen.js

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import AIFab from "../../components/AIFab";
import { useAppData } from "../../context/AppDataContext";
import { colors, radius, typography } from "../../theme";
import { buildYouTubeEmbedUrl } from "../../utils/youtube";
import { safeImageSource } from "../../utils/media";

const DEFAULT_VERSE = {
  title: "Verse of the Day",
  text: "For where two or three gather in my name, there am I with them.",
  ref: "Matthew 18:20",
};

export default function HomeScreen({ navigation }) {
  const { config, events } = useAppData();
  const churchName = config?.churchName || "Sanctuary";
  const logoSource = safeImageSource(config?.logoUrl || "");
  const liveSource = config?.youtubeUrl || config?.youtubeVideoId || "";
  const [logoFailed, setLogoFailed] = useState(false);

  const glow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [glow]);

  const embedUrl = useMemo(() => buildYouTubeEmbedUrl(liveSource), [liveSource]);

  const nextEvents = Array.isArray(events)
    ? events.filter((event) => event?.isActive !== false).slice(0, 2)
    : [];

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.kicker}>WELCOME BACK</Text>
              <Text style={styles.title}>{churchName}</Text>
            </View>

            {logoSource && !logoFailed ? (
              <Image source={logoSource} style={styles.logo} onError={() => setLogoFailed(true)} />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoFallbackText}>{churchName.slice(0, 1).toUpperCase()}</Text>
              </View>
            )}
          </View>

          <View style={styles.bento}>
            <GlassCard style={styles.heroCard}>
              <Animated.View style={[styles.aiGlow, { opacity: glow }]} />
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>{embedUrl ? "LIVE READY" : "SETUP NEEDED"}</Text>
              </View>

              <Text style={styles.heroTitle}>Beautiful worship, smarter church connection.</Text>
              <Text style={styles.heroText}>
                Members can watch, give, chat together, and stay in sync with everything happening in your church.
              </Text>

              <View style={styles.ctaRow}>
                <Pressable style={styles.ghostButton} onPress={() => navigation.navigate("Live")}>
                  <Ionicons name="radio-outline" size={18} color={colors.text} />
                  <Text style={styles.ghostButtonText}>Live</Text>
                </Pressable>

                <Pressable style={styles.ghostButton} onPress={() => navigation.navigate("Chat")}>
                  <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
                  <Text style={styles.ghostButtonText}>Chat</Text>
                </Pressable>
              </View>
            </GlassCard>

            <View style={styles.bentoRow}>
              <GlassCard style={styles.halfCard}>
                <Text style={styles.cardKicker}>{DEFAULT_VERSE.title}</Text>
                <Text style={styles.verseText}>{DEFAULT_VERSE.text}</Text>
                <Text style={styles.verseRef}>{DEFAULT_VERSE.ref}</Text>
              </GlassCard>

              <GlassCard style={styles.halfCard}>
                <Text style={styles.cardKicker}>COMMUNITY</Text>
                <Text style={styles.counterValue}>{nextEvents.length}</Text>
                <Text style={styles.heroText}>Upcoming moments ready for your church family.</Text>
              </GlassCard>
            </View>

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

            <GlassCard style={styles.liveHintCard}>
              <Text style={styles.cardKicker}>LIVE TAB</Text>
              <Text style={styles.heroText}>
                {embedUrl
                  ? "Your church live stream is ready. Tap the Live tab below to watch inside the app."
                  : "Pastor can add a YouTube Live URL in Settings to unlock the Live tab experience."}
              </Text>
            </GlassCard>
          </View>
        </ScrollView>

        <AIFab onPress={() => navigation.navigate("Live")} />
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
  kicker: { ...typography.kicker },
  title: { ...typography.h2, marginTop: 8 },
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
  bento: { gap: 14 },
  bentoRow: {
    flexDirection: "row",
    gap: 14,
  },
  heroCard: { minHeight: 220 },
  halfCard: { flex: 1 },
  aiGlow: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.20)",
  },
  liveBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  liveBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  cardKicker: { ...typography.kicker, color: colors.textSoft },
  heroTitle: { ...typography.h2, marginTop: 14, maxWidth: 290 },
  heroText: { ...typography.body, marginTop: 12 },
  counterValue: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
    marginTop: 12,
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
  ghostButtonText: { color: colors.text, fontWeight: "700" },
  verseText: { ...typography.h3, marginTop: 10, lineHeight: 26 },
  verseRef: { ...typography.meta, marginTop: 10, color: colors.cyan },
  eventsCard: {},
  liveHintCard: {},
  emptyText: { ...typography.body, marginTop: 12 },
  eventRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 14 },
  eventSpacing: { paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.stroke },
  eventDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: colors.magenta, marginTop: 6 },
  eventTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  eventMeta: { color: colors.textMuted, fontSize: 12, fontWeight: "600", marginTop: 4 },
});
