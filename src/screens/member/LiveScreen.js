import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";
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
  error: "#FF6B6B",
};

function getYoutubeVideoId(url = "") {
  const value = String(url || "").trim();
  if (!value) return "";

  const patterns = [
    /[?&]v=([^?&/]+)/i,
    /youtu\.be\/([^?&/]+)/i,
    /youtube\.com\/embed\/([^?&/]+)/i,
    /youtube\.com\/live\/([^?&/]+)/i,
    /youtube\.com\/shorts\/([^?&/]+)/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match && match[1]) return match[1];
  }

  return "";
}

export default function LiveScreen() {
  const { tenant, profile } = useAuth();

  const [churchData, setChurchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState("");

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

  const churchName =
    churchData?.churchName ||
    tenant?.churchName ||
    profile?.churchName ||
    "My Church";

  const youtubeUrl = churchData?.youtubeUrl || "";
  const youtubeVideoId = useMemo(() => {
    return churchData?.youtubeVideoId || getYoutubeVideoId(youtubeUrl);
  }, [churchData?.youtubeVideoId, youtubeUrl]);

  const hasYoutubeVideo = Boolean(youtubeVideoId);

  async function openYoutubeExternally() {
    if (!youtubeUrl) return;

    try {
      await Linking.openURL(youtubeUrl);
    } catch (error) {
      console.log("openYoutubeExternally error:", error);
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
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="videocam-outline" size={30} color={COLORS.cyan} />
          </View>
          <Text style={styles.title}>Live Service</Text>
          <Text style={styles.sub}>
            Watch the current YouTube live stream for {churchName}.
          </Text>
        </View>

        {hasYoutubeVideo ? (
          <>
            <View style={styles.playerCard}>
              <YoutubePlayer
                height={230}
                play={false}
                videoId={youtubeVideoId}
                initialPlayerParams={{
                  controls: true,
                  modestbranding: true,
                  rel: false,
                  playsinline: true,
                }}
                onError={(error) => {
                  console.log("YouTube player error:", error);
                  setPlayerError(
                    "The YouTube player could not load this stream inside the app."
                  );
                }}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>YouTube Live</Text>
              <Text style={styles.body}>
                Your iPhone app can play the stream directly inside the screen.
              </Text>

              {playerError ? (
                <Text style={styles.errorText}>{playerError}</Text>
              ) : null}

              <Pressable style={styles.primaryButton} onPress={openYoutubeExternally}>
                <Ionicons name="logo-youtube" size={18} color="#041217" />
                <Text style={styles.primaryButtonText}>Open on YouTube</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>No valid YouTube video found</Text>
            <Text style={styles.body}>
              Save a direct YouTube live video URL like:
              {"\n\n"}
              https://www.youtube.com/watch?v=VIDEO_ID
              {"\n"}
              or
              {"\n"}
              https://youtu.be/VIDEO_ID
            </Text>

            {!!youtubeUrl && (
              <Pressable style={styles.primaryButton} onPress={openYoutubeExternally}>
                <Ionicons name="open-outline" size={18} color="#041217" />
                <Text style={styles.primaryButtonText}>Open Saved Link</Text>
              </Pressable>
            )}
          </View>
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
    backgroundColor: "#000",
    marginBottom: 16,
    minHeight: 230,
    justifyContent: "center",
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
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
  },
  primaryButton: {
    marginTop: 14,
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#041217",
    fontSize: 16,
    fontWeight: "900",
  },
});