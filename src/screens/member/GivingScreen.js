// File: src/screens/member/GivingScreen.js

import React, { useMemo } from "react";
import {
  Alert,
  Linking,
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
import ChurchBrandHeader from "../../components/ChurchBrandHeader";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

function getProviderIcon(provider = "") {
  const value = String(provider || "").toUpperCase();

  if (value === "PAYPAL") return "logo-paypal";
  if (value === "ZELLE") return "wallet-outline";
  if (value === "CUSTOM") return "globe-outline";
  return "heart-outline";
}

function getProviderLabel(item = {}) {
  const provider = String(item?.provider || "").toUpperCase();
  if (item?.label) return item.label;
  if (provider === "PAYPAL") return "PayPal";
  if (provider === "ZELLE") return "Zelle";
  if (provider === "CUSTOM") return "Donate";
  return "Support This Church";
}

function getProviderDescription(provider = "") {
  const value = String(provider || "").toUpperCase();

  if (value === "PAYPAL") return "Secure giving through PayPal";
  if (value === "ZELLE") return "Quick giving through Zelle";
  if (value === "CUSTOM") return "Open the church donation page";
  return "Open donation link";
}

function normalizeLink(item = {}) {
  return {
    donationId: item?.donationId || item?.id || "",
    provider: String(item?.provider || item?.type || "LINK").toUpperCase(),
    label: getProviderLabel(item),
    url: String(item?.url || "").trim(),
  };
}

export default function GivingScreen() {
  const { config } = useAppData();
  const { tenant } = useAuth();

  const churchName = config?.churchName || tenant?.churchName || "Your Church";

  const links = useMemo(() => {
    return (Array.isArray(config?.donationLinks) ? config.donationLinks : []).map(normalizeLink);
  }, [config?.donationLinks]);

  async function openLink(url) {
    try {
      if (!url) {
        Alert.alert("Missing link", "This donation link is empty.");
        return;
      }

      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Unable to open", "This donation link is not valid.");
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open", "Please check the donation link.");
    }
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <ChurchBrandHeader
            title={churchName}
            subtitle="Give with peace, clarity, and a beautiful church-branded experience."
            centered
            showChurchCode
          />

          <GlassCard style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heartWrap}>
                <Ionicons name="heart" size={22} color="#fff" />
              </View>

              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Support {churchName}</Text>
                <Text style={styles.heroText}>
                  Members can give using the links the pastor added in Admin Settings. Each church
                  keeps its own donation options.
                </Text>
              </View>
            </View>
          </GlassCard>

          <View style={styles.list}>
            {links.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="heart-dislike-outline" size={32} color={colors.cyan} />
                <Text style={styles.emptyTitle}>No donation links yet</Text>
                <Text style={styles.emptyText}>
                  Your pastor can add PayPal, Zelle, and custom giving links in Admin Settings.
                </Text>
              </GlassCard>
            ) : (
              links.map((item, index) => (
                <GlassCard key={item.donationId || item.url || `${item.label}-${index}`}>
                  <Pressable style={styles.linkRow} onPress={() => openLink(item.url)}>
                    <View style={styles.linkLeft}>
                      <View style={styles.iconChip}>
                        <Ionicons
                          name={getProviderIcon(item.provider)}
                          size={18}
                          color={colors.cyan}
                        />
                      </View>

                      <View style={styles.linkTextWrap}>
                        <Text style={styles.linkTitle}>{item.label}</Text>
                        <Text style={styles.linkDescription}>
                          {getProviderDescription(item.provider)}
                        </Text>
                        <Text style={styles.linkMeta} numberOfLines={1}>
                          {item.url || "Missing URL"}
                        </Text>
                      </View>
                    </View>

                    <Ionicons
                      name="arrow-forward-circle-outline"
                      size={24}
                      color={colors.textMuted}
                    />
                  </Pressable>
                </GlassCard>
              ))
            )}
          </View>
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
    paddingBottom: 120,
  },
  heroCard: {
    marginTop: 14,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  heartWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(236,72,153,0.30)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    ...typography.h3,
  },
  heroText: {
    ...typography.body,
    marginTop: 8,
  },
  list: {
    marginTop: 14,
    gap: 12,
  },
  emptyCard: {
    alignItems: "center",
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: 12,
    textAlign: "center",
  },
  emptyText: {
    ...typography.body,
    marginTop: 8,
    textAlign: "center",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  linkLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  linkTextWrap: {
    flex: 1,
  },
  linkTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  linkDescription: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  linkMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },
});