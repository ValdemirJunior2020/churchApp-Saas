// File: src/screens/member/HomeScreen.js (REPLACE)
// ✅ Always shows the YouTube video (from Admin Settings youtubeVideoId) when user logs in
// ✅ Uses WebView embed + "Open in YouTube" fallback
// ✅ Looks closer to your reference image (hero card + quick give + events preview)

import React, { useMemo } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useAppData } from "../../context/AppDataContext";

const DEFAULT_VERSE = {
  title: "Verse of the Day",
  text: "“Let all that you do be done in love.”",
  ref: "— 1 Corinthians 16:14",
};

function buildEmbedUrl(youtubeId) {
  if (!youtubeId) return "";
  const id = String(youtubeId).trim();
  if (!id) return "";
  // playsinline helps iOS feel native; modestbranding reduces clutter
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&fs=1`;
}

export default function HomeScreen({ navigation }) {
  const appData = useAppData();

  // ✅ Support both shapes while your context evolves
  const config = appData?.config || appData?.churchConfig || {};
  const churchName = config?.churchName || "Your Church";
  const logoUrl = String(config?.logoUrl || "").trim();
  const youtubeId = String(config?.youtubeVideoId || "").trim();

  const embedUrl = useMemo(() => buildEmbedUrl(youtubeId), [youtubeId]);

  const donationsRaw =
    appData?.donations ||
    config?.donations ||
    config?.donationLinks ||
    [];
  const eventsRaw =
    appData?.events ||
    config?.events ||
    [];

  const hasGive = Array.isArray(donationsRaw) && donationsRaw.length > 0;
  const hasEvents = Array.isArray(eventsRaw) && eventsRaw.length > 0;

  async function openYouTube() {
    if (!youtubeId) {
      Alert.alert("No Video", "Pastor can add a YouTube Video ID in Admin Dashboard.");
      return;
    }
    const url = `https://www.youtube.com/watch?v=${youtubeId}`;
    try {
      const ok = await Linking.canOpenURL(url);
      if (!ok) throw new Error("Cannot open");
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Could not open YouTube.");
    }
  }

  const goGiving = () => {
    try {
      navigation.navigate("Giving");
    } catch {
      Alert.alert("Navigation", "Giving screen not found.");
    }
  };

  const goEvents = () => {
    try {
      navigation.navigate("Events");
    } catch {
      Alert.alert("Coming Soon", "Events screen tab is not wired yet.");
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      {/* Top Row */}
      <View style={styles.topBar}>
        <View style={styles.brandLeft}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoFallbackText}>
                {churchName.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.churchSmall}>{churchName}</Text>
            <Text style={styles.greeting}>Welcome back 👋</Text>
          </View>
        </View>

        <Pressable onPress={() => Alert.alert("Notifications", "Coming soon.")} style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color="#0f172a" />
        </Pressable>
      </View>

      {/* HERO: Live / YouTube */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>
            {youtubeId ? "Sunday Service is Live" : "Welcome to Church"}
          </Text>
          <Text style={styles.heroSub}>
            {youtubeId
              ? "Tap Watch Live to open the stream."
              : "Pastor can add a YouTube Video ID in Admin Dashboard."}
          </Text>
        </View>

        <View style={styles.videoWrap}>
          {embedUrl ? (
            <WebView
              source={{ uri: embedUrl }}
              style={{ flex: 1 }}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              // iOS feel: keep it stable
              setSupportMultipleWindows={false}
            />
          ) : (
            <View style={styles.videoEmpty}>
              <Ionicons name="videocam-outline" size={26} color="#0f172a" />
              <Text style={styles.videoEmptyTitle}>No YouTube Video Yet</Text>
              <Text style={styles.videoEmptySub}>
                Admin Dashboard → YouTube Video ID → Save Settings
              </Text>
            </View>
          )}
        </View>

        <View style={styles.heroActions}>
          <Pressable style={styles.primaryBtn} onPress={openYouTube}>
            <Ionicons name="logo-youtube" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Watch Live</Text>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={goGiving}>
            <Ionicons name="heart" size={18} color="#0f172a" />
            <Text style={styles.secondaryBtnText}>Give</Text>
          </Pressable>
        </View>
      </View>

      {/* Verse */}
      <View style={styles.verseCard}>
        <Text style={styles.verseTitle}>{DEFAULT_VERSE.title}</Text>
        <Text style={styles.verseText}>{DEFAULT_VERSE.text}</Text>
        <Text style={styles.verseRef}>{DEFAULT_VERSE.ref}</Text>
      </View>

      {/* Quick Give */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Quick Give</Text>
        <Pressable onPress={goGiving}>
          <Text style={styles.sectionLink}>Open</Text>
        </Pressable>
      </View>

      <View style={styles.quickGiveRow}>
        {[10, 25, 50, 100].map((amt) => (
          <Pressable key={amt} style={styles.quickPill} onPress={goGiving}>
            <Text style={styles.quickPillText}>${amt}</Text>
          </Pressable>
        ))}

        <Pressable style={styles.quickMore} onPress={goGiving}>
          <Text style={styles.quickMoreText}>Give More</Text>
        </Pressable>
      </View>

      {!hasGive && (
        <Text style={styles.hint}>
          No donation links yet — add them in Admin Dashboard and Save Settings.
        </Text>
      )}

      {/* Events Preview */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>This Week’s Events</Text>
        <Pressable onPress={goEvents}>
          <Text style={styles.sectionLink}>View</Text>
        </Pressable>
      </View>

      {hasEvents ? (
        <View style={styles.eventsGrid}>
          {eventsRaw.slice(0, 2).map((e, idx) => (
            <View key={e?.id || e?.eventId || idx} style={styles.eventCard}>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {e?.title || "Event"}
              </Text>
              <Text style={styles.eventMeta} numberOfLines={2}>
                {e?.dateTimeISO ? new Date(e.dateTimeISO).toLocaleString() : "Date TBD"}
                {e?.location ? ` • ${e.location}` : ""}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.eventsEmpty}>
          <Ionicons name="calendar-outline" size={22} color="#0f172a" />
          <Text style={styles.eventsEmptyText}>No events yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  container: { padding: 16, paddingBottom: 28 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  brandLeft: { flexDirection: "row", alignItems: "center", gap: 12 },

  logo: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(15,23,42,0.06)" },
  logoFallback: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: { color: "#0f172a", fontWeight: "900", fontSize: 18 },

  churchSmall: { color: "#0f172a", fontWeight: "900", fontSize: 14 },
  greeting: { marginTop: 2, color: "#64748b", fontWeight: "700" },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    borderRadius: 26,
    padding: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  heroHeader: { marginBottom: 10 },
  heroTitle: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  heroSub: { marginTop: 6, color: "#586174", fontWeight: "700" },

  videoWrap: {
    height: 220,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    backgroundColor: "rgba(15,23,42,0.04)",
  },
  videoEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 6,
  },
  videoEmptyTitle: { fontWeight: "900", color: "#0f172a" },
  videoEmptySub: { color: "#64748b", fontWeight: "700", textAlign: "center", lineHeight: 18 },

  heroActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#1e40af",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },

  secondaryBtn: {
    width: 120,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryBtnText: { color: "#0f172a", fontWeight: "900" },

  verseCard: {
    marginTop: 14,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  verseTitle: { color: "#64748b", fontWeight: "900", letterSpacing: 1 },
  verseText: { marginTop: 10, fontSize: 16, fontWeight: "900", color: "#0f172a", lineHeight: 22 },
  verseRef: { marginTop: 10, color: "#64748b", fontWeight: "900" },

  sectionRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
  sectionLink: { color: "#2563eb", fontWeight: "900" },

  quickGiveRow: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickPill: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickPillText: { fontWeight: "900", color: "#0f172a" },
  quickMore: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  quickMoreText: { fontWeight: "900", color: "#fff" },

  hint: { marginTop: 8, color: "#64748b", fontWeight: "800" },

  eventsGrid: { marginTop: 10, flexDirection: "row", gap: 10 },
  eventCard: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  eventTitle: { fontWeight: "900", color: "#0f172a" },
  eventMeta: { marginTop: 6, color: "#586174", fontWeight: "700", fontSize: 12, lineHeight: 16 },

  eventsEmpty: {
    marginTop: 10,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eventsEmptyText: { fontWeight: "900", color: "#0f172a" },
});