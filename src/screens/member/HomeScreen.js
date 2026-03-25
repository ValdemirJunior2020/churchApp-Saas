// File: src/screens/member/HomeScreen.js

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
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
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const COLORS = {
  bg: "#05060A",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.78)",
  cyan: "#2ED8F3",
  gold: "#F4C542",
  border: "rgba(255,255,255,0.14)",
  card: "rgba(8,10,16,0.58)",
  cardStrong: "rgba(8,10,16,0.74)",
};

const FALLBACK_BG_URL =
  "https://as2.ftcdn.net/v2/jpg/01/22/69/67/1000_F_122696773_WdItx7MYMU0AGuVfgyIJWyfNpaDBCUmZ.jpg";

function InfoCard({ title, children, icon }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <Ionicons name={icon} size={18} color={COLORS.gold} />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function ActionButton({ title, onPress, secondary = false, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionButton, secondary && styles.actionButtonSecondary]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={secondary ? COLORS.text : "#041217"}
        style={{ marginRight: 8 }}
      />
      <Text style={[styles.actionButtonText, secondary && styles.actionButtonTextSecondary]}>
        {title}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }) {
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
        console.log("HomeScreen church snapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [churchId]);

  const churchName = churchData?.churchName || tenant?.churchName || profile?.churchName || "My Church";
  const churchCode = churchData?.churchCode || tenant?.churchCode || profile?.churchCode || "-";
  const logoUrl = churchData?.logoUrl || tenant?.logoUrl || "";
  const backgroundImageUrl = churchData?.backgroundImageUrl || tenant?.backgroundImageUrl || "";
  const heroBackgroundSource = { uri: backgroundImageUrl || FALLBACK_BG_URL };
  const youtubeUrl = churchData?.youtubeUrl || tenant?.youtubeUrl || "";

  const fullAddress = useMemo(() => {
    const parts = [
      churchData?.addressLine1,
      churchData?.addressLine2,
      churchData?.city,
      churchData?.state,
      churchData?.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
    return parts;
  }, [churchData]);

  const mapEmbedUrl = useMemo(() => {
    if (!fullAddress) return "";
    return `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;
  }, [fullAddress]);

  const weeklyMessage =
    churchData?.weeklyMessage ||
    "Welcome to this week at our church. Stay strong in faith and join us in worship.";

  const serviceSchedule =
    churchData?.serviceSchedule ||
    "Sunday Worship - 10:00 AM\nWednesday Prayer - 7:00 PM";

  const nextEvent = churchData?.nextEvent || "Sunday Worship Service";
  const latestAnnouncement = churchData?.latestAnnouncement || "Welcome to our church family.";
  const pastorsNote =
    churchData?.pastorsShortNote || "Keep seeking God this week and stay faithful.";
  const verseOfTheDay =
    churchData?.verseOfTheDay ||
    "His compassions never fail. They are new every morning; great is Your faithfulness.";

  async function openMap() {
    if (!fullAddress) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log("openMap error:", error);
    }
  }

  async function openYouTube() {
    if (!youtubeUrl) return;
    try {
      await Linking.openURL(youtubeUrl);
    } catch (error) {
      console.log("openYouTube error:", error);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={COLORS.cyan} />
          <Text style={styles.loaderText}>Loading church home...</Text>
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
        <ImageBackground
          source={heroBackgroundSource}
          resizeMode="cover"
          imageStyle={styles.heroImage}
          style={styles.hero}
        >
          <View style={styles.heroOverlay} />

          <View style={styles.heroInner}>
            <View style={styles.logoWrap}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} resizeMode="cover" style={styles.logo} />
              ) : (
                <View style={styles.logoFallback}>
                  <Text style={styles.logoFallbackText}>
                    {String(churchName || "C").slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.churchName}>{churchName}</Text>
            <Text style={styles.churchSub}>Revival Global Center</Text>

            <View style={styles.codeBadge}>
              <Ionicons name="key-outline" size={14} color={COLORS.cyan} />
              <Text style={styles.codeBadgeText}>Church Code: {churchCode}</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.actionsRow}>
          <ActionButton
            title="I'm New Here"
            icon="heart-outline"
            onPress={() => navigation.navigate("NewHere")}
          />
          <ActionButton
            title="Testimonies"
            icon="chatbubbles-outline"
            secondary
            onPress={() => navigation.navigate("Testimonies")}
          />
        </View>

        <ActionButton
          title="Open Church Pro / Subscription"
          icon="diamond-outline"
          secondary
          onPress={() => navigation.navigate("ChurchPro")}
        />

        {fullAddress ? (
          <View style={styles.mapCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="location-outline" size={18} color={COLORS.gold} />
              <Text style={styles.infoTitle}>Location</Text>
            </View>

            <Text style={styles.mapAddress}>{fullAddress}</Text>

            {Platform.OS === "web" && mapEmbedUrl ? (
              <View style={styles.mapFrameWrap}>
                <iframe
                  title="Church Location"
                  src={mapEmbedUrl}
                  style={styles.mapIframe}
                  loading="lazy"
                />
              </View>
            ) : null}

            <Pressable style={styles.openMapButton} onPress={openMap}>
              <Ionicons name="map-outline" size={18} color="#041217" />
              <Text style={styles.openMapButtonText}>Open in Maps</Text>
            </Pressable>
          </View>
        ) : null}

        <InfoCard title="Weekly Message" icon="calendar-outline">
          <Text style={styles.infoBody}>{weeklyMessage}</Text>
        </InfoCard>

        <InfoCard title="Service Schedule" icon="time-outline">
          <Text style={styles.infoBody}>{serviceSchedule}</Text>
        </InfoCard>

        <InfoCard title="Next Event" icon="megaphone-outline">
          <Text style={styles.infoBody}>{nextEvent}</Text>
        </InfoCard>

        <InfoCard title="Latest Announcement" icon="notifications-outline">
          <Text style={styles.infoBody}>{latestAnnouncement}</Text>
        </InfoCard>

        <InfoCard title="Pastor's Short Note" icon="book-outline">
          <Text style={styles.infoBody}>{pastorsNote}</Text>
        </InfoCard>

        <InfoCard title="Verse of the Day" icon="sparkles-outline">
          <Text style={styles.infoBody}>{verseOfTheDay}</Text>
        </InfoCard>

        {youtubeUrl ? (
          <View style={styles.videoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="videocam-outline" size={18} color={COLORS.gold} />
              <Text style={styles.infoTitle}>Live Stream</Text>
            </View>
            <Text style={styles.videoHelp}>
              Live stream available. Open the Live tab for the embedded player or open YouTube directly.
            </Text>
            <Pressable style={styles.openMapButton} onPress={openYouTube}>
              <Ionicons name="logo-youtube" size={18} color="#041217" />
              <Text style={styles.openMapButtonText}>Open YouTube Live</Text>
            </Pressable>
          </View>
        ) : null}
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
  hero: {
    minHeight: 250,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },
  heroImage: {
    borderRadius: 28,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  heroInner: {
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 250,
  },
  logoWrap: {
    marginBottom: 14,
  },
  logo: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.82)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  logoFallback: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: "rgba(46,216,243,0.50)",
    backgroundColor: "rgba(46,216,243,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: "900",
  },
  churchName: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  churchSub: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
  },
  codeBadge: {
    marginTop: 14,
    minHeight: 36,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: "rgba(8,10,16,0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  codeBadgeText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.cardStrong,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    color: "#041217",
    fontSize: 16,
    fontWeight: "900",
  },
  actionButtonTextSecondary: {
    color: COLORS.text,
  },
  mapCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  mapAddress: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  mapFrameWrap: {
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginBottom: 12,
  },
  mapIframe: {
    width: "100%",
    height: 220,
    border: "0",
    display: "block",
  },
  openMapButton: {
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  openMapButtonText: {
    color: "#041217",
    fontSize: 15,
    fontWeight: "900",
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  infoTitle: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: "900",
  },
  infoBody: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 26,
  },
  videoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  videoHelp: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
});