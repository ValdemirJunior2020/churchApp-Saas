// src/screens/member/HomeScreen.js  (REPLACE)
import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useAppData } from "../../context/AppDataContext";

const DEFAULT_VERSE = {
  title: "Verse of the Day",
  text: "For where two or three gather in my name, there am I with them.",
  ref: "— Matthew 18:20",
};

export default function HomeScreen({ navigation }) {
  const { config } = useAppData();

  const churchName = config?.churchName || "Church";
  const logoUrl = String(config?.logoUrl || "").trim();
  const youtubeId = String(config?.youtubeVideoId || "").trim();

  const embedUrl = useMemo(() => {
    if (!youtubeId) return "";
    return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`;
  }, [youtubeId]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.topRow}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoFallbackText}>{churchName.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>SANCTUARY</Text>
            <Text style={styles.title}>{churchName}</Text>
          </View>
        </View>

        <View style={styles.verseCard}>
          <Text style={styles.verseTitle}>{DEFAULT_VERSE.title}</Text>
          <Text style={styles.verseText}>{DEFAULT_VERSE.text}</Text>
          <Text style={styles.verseRef}>{DEFAULT_VERSE.ref}</Text>
        </View>

        <View style={styles.quickRow}>
          <Pressable style={styles.quickBtn} onPress={() => navigation.navigate("Give")}>
            <Text style={styles.quickText}>Give</Text>
          </Pressable>
          <Pressable style={styles.quickBtn} onPress={() => navigation.navigate("Events")}>
            <Text style={styles.quickText}>Events</Text>
          </Pressable>
        </View>
      </View>

      {embedUrl ? (
        <View style={styles.videoCard}>
          <Text style={styles.videoTitle}>Watch</Text>
          <View style={styles.videoWrap}>
            <WebView
              source={{ uri: embedUrl }}
              style={{ flex: 1 }}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
            />
          </View>
        </View>
      ) : (
        <View style={styles.videoCard}>
          <Text style={styles.videoTitle}>Watch</Text>
          <Text style={styles.videoSub}>Pastor can add a YouTube Video ID in Admin Settings.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  container: { padding: 16, paddingBottom: 28 },

  heroCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
    borderRadius: 26,
    padding: 16,
  },
  topRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  logo: { width: 56, height: 56, borderRadius: 18, backgroundColor: "rgba(15,23,42,0.06)" },
  logoFallback: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(15,23,42,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: { color: "#0f172a", fontWeight: "900", fontSize: 22 },

  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b", fontWeight: "900" },
  title: { marginTop: 4, fontSize: 22, fontWeight: "900", color: "#0f172a" },

  verseCard: {
    marginTop: 14,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  verseTitle: { color: "#64748b", fontWeight: "900", letterSpacing: 1 },
  verseText: { marginTop: 10, fontSize: 16, fontWeight: "800", color: "#0f172a", lineHeight: 22 },
  verseRef: { marginTop: 10, color: "#64748b", fontWeight: "900" },

  quickRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  quickBtn: {
    flex: 1,
    height: 48,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  quickText: { color: "white", fontWeight: "900" },

  videoCard: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
    borderRadius: 26,
    padding: 16,
  },
  videoTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  videoSub: { marginTop: 8, color: "#64748b", fontWeight: "800" },
  videoWrap: {
    marginTop: 12,
    height: 220,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
    backgroundColor: "rgba(15,23,42,0.06)",
  },
});