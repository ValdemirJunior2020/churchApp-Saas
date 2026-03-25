// File: src/screens/member/LiveScreen.js

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const COLORS = {
  bg: "#05060A",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.76)",
  cyan: "#2ED8F3",
  gold: "#F4C542",
  border: "rgba(255,255,255,0.14)",
  card: "rgba(8,10,16,0.68)",
};

function getYoutubeVideoId(url = "") {
  const value = String(url || "").trim();
  if (!value) return "";
  const shortMatch = value.match(/youtu\.be\/([^?&/]+)/i);
  if (shortMatch?.[1]) return shortMatch[1];
  const longMatch = value.match(/[?&]v=([^?&/]+)/i);
  if (longMatch?.[1]) return longMatch[1];
  const embedMatch = value.match(/embed\/([^?&/]+)/i);
  if (embedMatch?.[1]) return embedMatch[1];
  return "";
}

export default function LiveScreen() {
  const { tenant, profile } = useAuth();

  const [churchData, setChurchData] = useState(null);
  const [loading, setLoading] = useState(true);

  const churchId = tenant?.churchId || profile?.churchId || null;

  useEffect(() => {
    if (!churchId) {
      setChurchData(null);
      setLoading(false);
      return;
    }

    const churchRef = doc(db, "churches", churchId);

    const unsubscribe = onSnapshot(
      churchRef,
      (snap) => {
        setChurchData(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      (error) => {
        console.log("LiveScreen snapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [churchId]);

  const churchName = churchData?.churchName || tenant?.churchName || profile?.churchName || "My Church";
  const youtubeUrl = churchData?.youtubeUrl || tenant?.youtubeUrl || "";
  const videoId = churchData?.youtubeVideoId || getYoutubeVideoId(youtubeUrl);
  const embedUrl = useMemo(() => {
    if (!videoId) return "";
    return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1`;
  }, [videoId]);

  async function openOnYoutube() {
    if (!youtubeUrl) return;
    try {
      await Linking.openURL(youtubeUrl);
    } catch (error) {
      console.log("openOnYoutube error:", error);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={COLORS.cyan} />
          <Text style={styles.loaderText}>Loading live stream...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="videocam-outline" size={30} color={COLORS.cyan} />
          </View>
          <Text style={styles.title}>Live Service</Text>
          <Text style={styles.sub}>
            Watch the current live stream for {churchName}.
          </Text>
        </View>

        {!youtubeUrl || !videoId ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>No live stream yet</Text>
            <Text style={styles.body}>
              Add your YouTube live URL inside Admin Settings and it will appear here automatically.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.playerCard}>
              {Platform.OS === "web" ? (
                <iframe
                  title="Church Live Stream"
                  src={embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={styles.iframe}
                />
              ) : (
                <WebView
                  source={{ uri: embedUrl }}
                  style={styles.webview}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                />
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Watching in browser?</Text>
              <Text style={styles.body}>
                On web, the live video should render here using an embedded YouTube player. If the stream is blocked or behaves differently in the browser, use the button below to open YouTube directly.
              </Text>

              <Pressable style={styles.youtubeButton} onPress={openOnYoutube}>
                <Ionicons name="logo-youtube" size={18} color="#041217" />
                <Text style={styles.youtubeButtonText}>Open on YouTube Live</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    padding: 16,
    paddingBottom: 120,
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loaderText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(46,216,243,0.12)",
    borderWidth: 1,
    borderColor: "rgba(46,216,243,0.26)",
    marginBottom: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  sub: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  playerCard: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#000000",
    marginBottom: 16,
  },
  iframe: {
    width: "100%",
    height: 260,
    border: "0",
    display: "block",
  },
  webview: {
    width: "100%",
    height: 260,
    backgroundColor: "#000000",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  body: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 23,
  },
  youtubeButton: {
    marginTop: 14,
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  youtubeButtonText: {
    color: "#041217",
    fontSize: 16,
    fontWeight: "900",
  },
});