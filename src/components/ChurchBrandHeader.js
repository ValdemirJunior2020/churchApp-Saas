// File: src/components/ChurchBrandHeader.js

import React, { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "./GlassCard";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { colors, radius, typography } from "../theme";
import { safeImageSource } from "../utils/media";

export default function ChurchBrandHeader({
  title,
  subtitle,
  centered = true,
  showChurchCode = true,
  rightAction = null,
  onLogoPress,
}) {
  const { config } = useAppData();
  const { tenant } = useAuth();
  const [logoFailed, setLogoFailed] = useState(false);

  const churchName = title || config?.churchName || tenant?.churchName || "Your Church";
  const logoSource = useMemo(
    () => safeImageSource(config?.logoUrl || tenant?.logoUrl || ""),
    [config?.logoUrl, tenant?.logoUrl]
  );

  const churchCode = config?.churchCode || tenant?.churchCode || "";
  const subText =
    subtitle ||
    "A beautiful church home for members to connect, watch live, chat, and give.";

  return (
    <GlassCard style={[styles.card, centered && styles.centeredCard]}>
      <View style={[styles.topRow, centered && styles.topRowCentered]}>
        <Pressable
          onPress={onLogoPress}
          disabled={!onLogoPress}
          style={[styles.logoWrap, centered && styles.logoWrapCentered]}
        >
          {logoSource && !logoFailed ? (
            <Image
              source={logoSource}
              style={styles.logo}
              resizeMode="cover"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoFallbackText}>
                {String(churchName).trim().charAt(0).toUpperCase() || "C"}
              </Text>
            </View>
          )}
        </Pressable>

        {!centered && rightAction ? <View>{rightAction}</View> : null}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, centered && styles.titleCentered]} numberOfLines={2}>
          {churchName}
        </Text>
        <Text style={[styles.subtitle, centered && styles.subtitleCentered]}>{subText}</Text>

        {showChurchCode && churchCode ? (
          <View style={[styles.badge, centered && styles.badgeCentered]}>
            <Ionicons name="key-outline" size={14} color={colors.cyan} />
            <Text style={styles.badgeText}>Church Code: {churchCode}</Text>
          </View>
        ) : null}
      </View>

      {centered && rightAction ? <View style={styles.bottomAction}>{rightAction}</View> : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  centeredCard: {
    alignItems: "center",
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topRowCentered: {
    justifyContent: "center",
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapCentered: {
    marginTop: 2,
  },
  logo: {
    width: 86,
    height: 86,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  logoFallback: {
    width: 86,
    height: 86,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,211,238,0.16)",
    borderWidth: 2,
    borderColor: "rgba(34,211,238,0.30)",
  },
  logoFallbackText: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
  },
  content: {
    width: "100%",
    marginTop: 14,
  },
  title: {
    ...typography.h2,
    fontSize: 26,
  },
  titleCentered: {
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    marginTop: 8,
  },
  subtitleCentered: {
    textAlign: "center",
  },
  badge: {
    marginTop: 14,
    minHeight: 36,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.stroke,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeCentered: {
    alignSelf: "center",
  },
  badgeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  bottomAction: {
    width: "100%",
    marginTop: 14,
  },
});