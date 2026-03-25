// File: src/components/live/LiveYoutubePlayer.js

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { extractYouTubeVideoId } from "../../utils/youtube";

export default function LiveYoutubePlayer({
  source,
  title = "Live Service",
  autoPlay = true,
  allowExternalFallback = true,
}) {
  const appState = useRef(AppState.currentState);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const videoId = useMemo(() => extractYouTubeVideoId(source || ""), [source]);
  const watchUrl = useMemo(
    () => (videoId ? `https://www.youtube.com/watch?v=${videoId}` : ""),
    [videoId]
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    setLoading(true);
    setErrorText("");
  }, [videoId, reloadKey]);

  const iframeUrl = useMemo(() => {
    if (!videoId) return "";
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&playsinline=1&rel=0&modestbranding=1&controls=1&fs=1`;
  }, [videoId, autoPlay]);

  const iframeHtml = useMemo(() => {
    if (!videoId) return "";

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #000;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .wrap {
        position: fixed;
        inset: 0;
        background: #000;
      }
      iframe {
        border: 0;
        width: 100%;
        height: 100%;
      }
      .fallback {
        position: absolute;
        bottom: 10px;
        left: 10px;
        right: 10px;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 12px;
        opacity: 0.75;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <iframe
        src="${iframeUrl}"
        title="YouTube Live Stream"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
      ></iframe>
    </div>
  </body>
</html>
`;
  }, [videoId, iframeUrl]);

  const openYouTube = async () => {
    if (!watchUrl) return;
    try {
      await Linking.openURL(watchUrl);
    } catch (error) {
      console.log("Could not open YouTube URL:", error);
    }
  };

  const handleReload = () => {
    setErrorText("");
    setLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  if (!videoId) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.badge, styles.badgeError]}>
            <Text style={styles.badgeText}>NO VIDEO</Text>
          </View>
        </View>

        <Text style={styles.message}>
          No valid YouTube URL or video ID was found for this church.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.badge, errorText ? styles.badgeError : styles.badgeLive]}>
          <Text style={styles.badgeText}>{errorText ? "ERROR" : "LIVE"}</Text>
        </View>
      </View>

      <View style={styles.playerBox}>
        {Platform.OS === "web" ? (
          <iframe
            key={`web-${videoId}-${reloadKey}`}
            title="YouTube Live Stream"
            width="100%"
            height="260"
            src={iframeUrl}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            style={styles.iframe}
            onLoad={() => setLoading(false)}
          />
        ) : (
          <WebView
            key={`native-${videoId}-${reloadKey}`}
            originWhitelist={["*"]}
            source={{ html: iframeHtml }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo
            startInLoadingState={false}
            onLoadEnd={() => setLoading(false)}
            onError={(event) => {
              console.log("Live WebView error:", event?.nativeEvent);
              setLoading(false);
              setErrorText("Unable to load the live stream inside the app.");
            }}
          />
        )}

        {loading ? (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>Loading live stream...</Text>
          </View>
        ) : null}
      </View>

      {!!errorText && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Playback issue</Text>
          <Text style={styles.errorMessage}>{errorText}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={handleReload}>
          <Text style={styles.buttonText}>Reload</Text>
        </Pressable>

        {allowExternalFallback ? (
          <Pressable style={styles.button} onPress={openYouTube}>
            <Text style={styles.buttonText}>Open YouTube</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0B1020",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeLive: {
    backgroundColor: "#14532D",
  },
  badgeError: {
    backgroundColor: "#7F1D1D",
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  playerBox: {
    minHeight: 260,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#000000",
    position: "relative",
  },
  iframe: {
    borderWidth: 0,
    width: "100%",
    height: 260,
    backgroundColor: "#000",
  },
  webview: {
    width: "100%",
    height: 260,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  overlayText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "#1F1111",
    borderWidth: 1,
    borderColor: "#4A1D1D",
    borderRadius: 14,
    padding: 14,
  },
  errorTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 6,
  },
  errorMessage: {
    color: "#F8CACA",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  button: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  message: {
    color: "rgba(255,255,255,0.76)",
    lineHeight: 22,
  },
});