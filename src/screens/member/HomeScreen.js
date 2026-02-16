// src/screens/member/HomeScreen.js
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAppData } from "../../context/AppDataContext";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

function GlassCard({ children, style }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

function MenuItem({ icon, label, onPress }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={18} color="#0f172a" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#64748b" />
    </Pressable>
  );
}

export default function HomeScreen({ navigation }) {
  const { churchConfig } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);

  const verse = useMemo(() => {
    return {
      title: "Verse of the Day",
      text: "For where two or three gather in my name,\nthere am I with them.",
      ref: "— Matthew 18:20",
    };
  }, []);

  const ytId = String(churchConfig.youtubeId || "").trim();
  const ytUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : null;
  const ytEmbed = ytId ? `https://www.youtube.com/embed/${ytId}` : null;

  function watchLive() {
    if (!ytUrl) return Alert.alert("Missing", "Admin must set a YouTube Video ID first.");
    Linking.openURL(ytUrl).catch(() => {});
  }

  function goGive() {
    setMenuOpen(false);
    navigation.navigate("Give");
  }

  function goEvents() {
    setMenuOpen(false);
    navigation.navigate("Events");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <ScrollView style={styles.root} contentContainerStyle={styles.container}>
        <View style={styles.phoneFrameHint}>
          <View style={styles.topPills}>
            <Pressable style={styles.pillLeft} onPress={() => setMenuOpen(true)}>
              <Ionicons name="menu" size={18} color="#0f172a" />
            </Pressable>

            <View style={styles.dynamicIsland} />

            <View style={styles.pillRight}>
              <Ionicons name="person" size={18} color="#0f172a" />
            </View>
          </View>

          <View style={styles.brandWrap}>
            <View style={styles.logoWrap}>
              {!!churchConfig.logoUrl && (
                <Image source={{ uri: churchConfig.logoUrl }} style={styles.logo} resizeMode="cover" />
              )}
            </View>
            <Text style={styles.brandName}>
              {String(churchConfig.churchName || "SANCTUARY").toUpperCase()}
            </Text>
            {!!churchConfig.address && <Text style={styles.brandSub}>{churchConfig.address}</Text>}
          </View>

          <GlassCard style={{ marginTop: 14 }}>
            <Text style={styles.cardKicker}>{verse.title}</Text>
            <Text style={styles.verseText}>{verse.text}</Text>
            <Text style={styles.verseRef}>{verse.ref}</Text>
          </GlassCard>

          <GlassCard style={{ marginTop: 14 }}>
            <Text style={styles.cardKicker}>Watch Live</Text>
            <View style={styles.videoFrame}>
              {ytEmbed ? (
                <WebView
                  source={{ uri: ytEmbed }}
                  style={styles.webview}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsFullscreenVideo
                />
              ) : (
                <View style={styles.videoPlaceholder}>
                  <Ionicons name="logo-youtube" size={28} color="#0f172a" />
                  <Text style={styles.videoPlaceholderText}>Admin must set a YouTube ID</Text>
                </View>
              )}
            </View>
          </GlassCard>

          <View style={styles.bottomButtons}>
            <Pressable style={styles.iconBtn} onPress={watchLive}>
              <Ionicons name="play" size={18} color="#0f172a" />
            </Pressable>

            <Pressable style={styles.iconBtn} onPress={goGive}>
              <Ionicons name="heart" size={18} color="#0f172a" />
            </Pressable>

            <Pressable style={styles.iconBtn} onPress={goEvents}>
              <Ionicons name="calendar" size={18} color="#0f172a" />
            </Pressable>
          </View>

          <View style={styles.bottomLabels}>
            <Text style={styles.bottomLabel}>Watch Live</Text>
            <Text style={styles.bottomLabel}>Give</Text>
            <Text style={styles.bottomLabel}>Events</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.menuOverlay} onPress={closeMenu}>
          <Pressable style={styles.menuCard} onPress={() => {}}>
            <Text style={styles.menuTitle}>Menu</Text>
            <Text style={styles.menuSub}>Quick actions</Text>

            <MenuItem icon="heart-outline" label="Give" onPress={goGive} />
            <MenuItem icon="calendar-outline" label="Events" onPress={goEvents} />
            <MenuItem icon="logo-youtube" label="Open YouTube" onPress={() => { closeMenu(); watchLive(); }} />

            <Pressable style={styles.menuCloseBtn} onPress={closeMenu}>
              <Text style={styles.menuCloseText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  container: { padding: 16, paddingBottom: 28 },

  phoneFrameHint: {
    borderRadius: 30,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.50)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },

  topPills: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  pillLeft: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  pillRight: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  dynamicIsland: { width: 120, height: 26, borderRadius: 999, backgroundColor: "rgba(15, 23, 42, 0.92)" },

  brandWrap: { alignItems: "center", marginTop: 6 },
  logoWrap: {
    width: 62,
    height: 62,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: "100%", height: "100%" },
  brandName: { marginTop: 10, fontSize: 18, fontWeight: "900", letterSpacing: 1.2, color: "#0f172a" },
  brandSub: { marginTop: 6, fontSize: 12, color: "#586174", textAlign: "center" },

  glassCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.68)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
  },
  cardKicker: { fontSize: 12, color: "#64748b", fontWeight: "800", letterSpacing: 1.1 },
  verseText: { marginTop: 10, fontSize: 18, fontWeight: "400", color: "#0f172a", textAlign: "center", lineHeight: 26 },
  verseRef: { marginTop: 10, fontSize: 13, color: "#586174", textAlign: "center", fontWeight: "700" },

  videoFrame: {
    marginTop: 10,
    borderRadius: 18,
    overflow: "hidden",
    height: 200,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  webview: { flex: 1 },
  videoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  videoPlaceholderText: { color: "#586174", fontWeight: "800" },

  bottomButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 16 },
  iconBtn: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLabels: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  bottomLabel: { fontSize: 12, color: "#586174", fontWeight: "700" },

  // Menu modal
  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-start", paddingTop: 90, paddingHorizontal: 16 },
  menuCard: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
  },
  menuTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  menuSub: { marginTop: 4, fontSize: 13, color: "#586174", marginBottom: 12 },

  menuItem: {
    height: 52,
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.06)",
  },
  menuLabel: { flex: 1, fontWeight: "900", color: "#0f172a" },

  menuCloseBtn: {
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  menuCloseText: { fontWeight: "900", color: "#0f172a" },
});
