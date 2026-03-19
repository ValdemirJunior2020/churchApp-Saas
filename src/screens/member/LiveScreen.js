// File: src/screens/member/LiveScreen.js

import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import ChurchBrandHeader from "../../components/ChurchBrandHeader";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";
import { buildYouTubeEmbedUrl } from "../../utils/youtube";

export default function LiveScreen() {
  const { config } = useAppData();
  const { tenant } = useAuth();
  const [webLoading, setWebLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const liveSource =
    config?.youtubeUrl ||
    config?.youtubeVideoId ||
    tenant?.youtubeUrl ||
    tenant?.youtubeVideoId ||
    "";

  const embedUrl = useMemo(() => buildYouTubeEmbedUrl(liveSource), [liveSource]);

  const hasLive = Boolean(embedUrl);

  function handleReload() {
    setWebLoading(true);
    setReloadKey((prev) => prev + 1);
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <ChurchBrandHeader
            title={config?.churchName || tenant?.churchName || "Live Worship"}
            subtitle={
              hasLive
                ? "Watch your church stream right here inside the app."
                : "Pastor can add a YouTube live URL in Admin Settings to activate this screen."
            }
            centered
            showChurchCode
          />

          <GlassCard style={styles.heroCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: hasLive ? colors.success : colors.magenta },
                  ]}
                />
                <Text style={styles.statusText}>
                  {hasLive ? "LIVE PLAYER READY" : "LIVE NOT CONFIGURED"}
                </Text>
              </View>

              {hasLive ? (
                <Pressable style={styles.reloadButton} onPress={handleReload}>
                  <Ionicons name="refresh-outline" size={16} color={colors.text} />
                  <Text style={styles.reloadText}>Reload</Text>
                </Pressable>
              ) : null}
            </View>

            {hasLive ? (
              <>
                <View style={styles.playerWrap}>
                  {webLoading ? (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color={colors.cyan} />
                      <Text style={styles.loadingText}>Loading live stream...</Text>
                    </View>
                  ) : null}

                  <WebView
                    key={reloadKey}
                    source={{ uri: embedUrl }}
                    style={styles.webview}
                    allowsFullscreenVideo
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState
                    onLoadStart={() => setWebLoading(true)}
                    onLoadEnd={() => setWebLoading(false)}
                    onError={() => setWebLoading(false)}
                    setSupportMultipleWindows={false}
                    originWhitelist={["*"]}
                  />
                </View>

                <Text style={styles.helper}>
                  This stream stays inside the app for members. If the pastor changes the YouTube
                  URL in Admin Settings, this page will use the new link automatically.
                </Text>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="radio-outline" size={34} color={colors.cyan} />
                <Text style={styles.emptyTitle}>Live stream is not set yet</Text>
                <Text style={styles.emptyBody}>
                  Go to Admin Settings and paste the church YouTube live link, watch URL, channel
                  URL, or video URL. The app will convert it to an embedded player automatically.
                </Text>
              </View>
            )}
          </GlassCard>

          <GlassCard>
            <Text style={styles.sectionTitle}>What pastors should add</Text>

            <View style={styles.tipRow}>
              <Ionicons name="logo-youtube" size={18} color={colors.cyan} />
              <Text style={styles.tipText}>A YouTube live URL or a normal YouTube video URL</Text>
            </View>

            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.cyan} />
              <Text style={styles.tipText}>A church logo and background in Admin Settings</Text>
            </View>

            <View style={styles.tipRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.cyan} />
              <Text style={styles.tipText}>
                Members do not need to leave the app to watch the stream
              </Text>
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 140,
    gap: 14,
  },
  heroCard: {
    overflow: "hidden",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  statusBadge: {
    minHeight: 34,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.stroke,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  statusText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  reloadButton: {
    minHeight: 34,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reloadText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  playerWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    position: "relative",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
    gap: 10,
  },
  loadingText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  helper: {
    ...typography.body,
    marginTop: 14,
  },
  emptyState: {
    minHeight: 220,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 14,
  },
  emptyBody: {
    ...typography.body,
    textAlign: "center",
    marginTop: 10,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke,
  },
  tipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
    lineHeight: 20,
  },
});