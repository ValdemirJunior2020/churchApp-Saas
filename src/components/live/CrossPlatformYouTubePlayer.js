// File: src/components/live/CrossPlatformYouTubePlayer.js

import React, { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { buildYouTubeEmbedUrl, extractYouTubeVideoId } from "../../utils/youtube";

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPlayerHtml({ videoId, autoplay, muted, title }) {
  const safeTitle = escapeHtml(title || "Live Stream");
  const embedUrl = buildYouTubeEmbedUrl(videoId, {
    autoplay,
    muted,
    controls: true,
    playsinline: true,
    enablejsapi: true,
    fs: true,
    rel: false,
  });

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
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
      .frame-wrap {
        position: fixed;
        inset: 0;
        background: #000;
      }
      iframe {
        border: 0;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div class="frame-wrap">
      <iframe
        id="yt-player"
        title="${safeTitle}"
        src="${embedUrl}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
  </body>
</html>`;
}

export default function CrossPlatformYouTubePlayer({
  source,
  title = "Live Stream",
  autoplay = true,
  muted = false,
  onLoadEnd,
  onError,
}) {
  const videoId = useMemo(() => extractYouTubeVideoId(source), [source]);
  const embedUrl = useMemo(
    () =>
      buildYouTubeEmbedUrl(videoId, {
        autoplay,
        muted: Platform.OS === "web" ? true : muted,
        controls: true,
        playsinline: true,
        enablejsapi: true,
        fs: true,
        rel: false,
      }),
    [autoplay, muted, videoId]
  );

  if (!videoId || !embedUrl) {
    return null;
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.webShell}>
        <iframe
          title={title}
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={styles.iframe}
          onLoad={onLoadEnd}
        />
      </View>
    );
  }

  return (
    <WebView
      style={styles.nativeWebview}
      source={{
        html: buildPlayerHtml({
          videoId,
          autoplay,
          muted,
          title,
        }),
      }}
      originWhitelist={["*"]}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      allowsFullscreenVideo
      setSupportMultipleWindows={false}
      mixedContentMode="compatibility"
      onLoadEnd={onLoadEnd}
      onError={onError}
      onHttpError={onError}
    />
  );
}

const styles = StyleSheet.create({
  webShell: {
    flex: 1,
    minHeight: 260,
    backgroundColor: "#000",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
    backgroundColor: "#000",
  },
  nativeWebview: {
    flex: 1,
    backgroundColor: "#000",
  },
});
