// File: src/screens/member/HomeScreen.js

import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import {
  Alert,
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
import PremiumScreen from "../premium/PremiumScreen";
import usePremiumTrigger from "../../hooks/usePremiumTrigger";
import useDemoMode from "../../hooks/useDemoMode";

import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { PurchasesContext } from "../../context/PurchasesContext";

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
  const { tenant, profile, logout, deleteAccount } = useAuth();
  const { isPro } = useContext(PurchasesContext);

  const { toggleDemo } = useDemoMode();

  const isAdmin = (tenant?.role || profile?.role) === "ADMIN";

  const { showPremium, setShowPremium } = usePremiumTrigger(
    isAdmin,
    isPro
  );

  const churchName = config?.churchName || tenant?.churchName || "Sanctuary";
  const logoSource = safeImageSource(config?.logoUrl || tenant?.logoUrl || "");
  const liveSource = config?.youtubeUrl || config?.youtubeVideoId || tenant?.youtubeUrl || tenant?.youtubeVideoId || "";
  const [logoFailed, setLogoFailed] = useState(false);

  const glow = useRef(new Animated.Value(0.6)).current;
  const [tapCount, setTapCount] = useState(0);
  const [busy, setBusy] = useState(false);

  const handleSecretTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= 10) {
      toggleDemo();
      Alert.alert("Demo Mode Activated ✅");
      setTapCount(0);
    }
  };

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

  async function handleLogout() {
    if (busy) return;

    try {
      setBusy(true);
      await logout();
    } catch (error) {
      Alert.alert("Error", error?.message || "Could not log out.");
    } finally {
      setBusy(false);
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete account",
      "This will permanently delete your member account. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setBusy(true);
              await deleteAccount();
            } catch (error) {
              Alert.alert("Error", error?.message || "Could not delete account.");
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }

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
              <Pressable onPress={handleSecretTap}>
                <Image source={logoSource} style={styles.logo} onError={() => setLogoFailed(true)} />
              </Pressable>
            ) : (
              <Pressable onPress={handleSecretTap}>
                <View style={styles.logoFallback}>
                  <Text style={styles.logoFallbackText}>
                    {churchName.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>

          {isAdmin && !isPro && (
            <GlassCard style={styles.upgradeCard}>
              <Text style={styles.upgradeTitle}>Unlock Church Pro 🚀</Text>
              <Text style={styles.upgradeText}>
                Start your 7-day free trial to enable live streaming, member management, and more.
              </Text>

              <Pressable style={styles.upgradeButton} onPress={() => setShowPremium(true)}>
                <Text style={styles.upgradeButtonText}>Start Free Trial</Text>
              </Pressable>
            </GlassCard>
          )}

          <View style={styles.bento}>
            <GlassCard style={styles.heroCard}>
              <Animated.View style={[styles.aiGlow, { opacity: glow }]} />
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>
                  {embedUrl ? "LIVE READY" : "SETUP NEEDED"}
                </Text>
              </View>

              <Text style={styles.heroTitle}>
                Beautiful worship, smarter church connection.
              </Text>
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
                <Text style={styles.heroText}>
                  Upcoming moments ready for your church family.
                </Text>
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
                        {event.dateTimeISO
                          ? new Date(event.dateTimeISO).toLocaleString()
                          : "Coming soon"}
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

            <GlassCard style={styles.accountCard}>
              <Text style={styles.cardKicker}>ACCOUNT</Text>
              <Text style={styles.accountName}>{profile?.fullName || "Member"}</Text>
              <Text style={styles.accountMeta}>{profile?.email || ""}</Text>

              <View style={styles.accountButtons}>
                <Pressable
                  style={[styles.secondaryAction, busy && styles.actionDisabled]}
                  onPress={handleLogout}
                  disabled={busy}
                >
                  <Text style={styles.secondaryActionText}>
                    {busy ? "Please wait..." : "Log Out"}
                  </Text>
                </Pressable>

                {!isAdmin && (
                  <Pressable
                    style={[styles.dangerAction, busy && styles.actionDisabled]}
                    onPress={handleDeleteAccount}
                    disabled={busy}
                  >
                    <Text style={styles.dangerActionText}>Delete Account</Text>
                  </Pressable>
                )}
              </View>
            </GlassCard>
          </View>
        </ScrollView>

        <AIFab onPress={() => navigation.navigate("Live")} />

        <PremiumScreen
          visible={showPremium}
          onClose={() => setShowPremium(false)}
        />
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
  upgradeCard: {
    marginBottom: 14,
    borderColor: "rgba(0,229,255,0.3)",
  },
  upgradeTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  upgradeText: {
    color: colors.textSoft,
    marginTop: 6,
  },
  upgradeButton: {
    marginTop: 12,
    backgroundColor: colors.cyan,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: "#000",
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
  accountCard: {},
  accountName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
  },
  accountMeta: {
    color: colors.textMuted,
    marginTop: 6,
  },
  accountButtons: {
    marginTop: 16,
    gap: 10,
  },
  secondaryAction: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: colors.text,
    fontWeight: "800",
  },
  dangerAction: {
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255, 59, 48, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerActionText: {
    color: "#ffb3ad",
    fontWeight: "800",
  },
  actionDisabled: {
    opacity: 0.65,
  },
});