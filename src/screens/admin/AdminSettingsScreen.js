// File: src/screens/admin/AdminSettingsScreen.js

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";
import { colors, radius, typography } from "../../theme";
import { safeImageSource } from "../../utils/media";

function getDonationUrlByProvider(list = [], provider = "") {
  const match = (Array.isArray(list) ? list : []).find(
    (item) => String(item?.provider || "").toUpperCase() === String(provider).toUpperCase()
  );
  return String(match?.url || "").trim();
}

function normalizeHex(value = "", fallback = "#22D3EE") {
  const raw = String(value || "").trim().replace(/[^a-fA-F0-9]/g, "");
  if (raw.length === 3 || raw.length === 6) {
    return `#${raw.toUpperCase()}`;
  }
  return fallback;
}

export default function AdminSettingsScreen() {
  const { profile, tenant, logout } = useAuth();
  const { config, updateConfig } = useAppData();

  const [busy, setBusy] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const [churchName, setChurchName] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [themePrimaryHex, setThemePrimaryHex] = useState("#0F172A");
  const [themeAccentHex, setThemeAccentHex] = useState("#22D3EE");
  const [paypalUrl, setPaypalUrl] = useState("");
  const [zelleUrl, setZelleUrl] = useState("");
  const [customDonationUrl, setCustomDonationUrl] = useState("");

  useEffect(() => {
    setChurchName(config?.churchName || tenant?.churchName || "");
    setAddress(config?.address || "");
    setLogoUrl(config?.logoUrl || "");
    setBackgroundImageUrl(config?.backgroundImageUrl || "");
    setYoutubeUrl(config?.youtubeUrl || config?.youtubeVideoId || "");
    setThemePrimaryHex(config?.themePrimaryHex || "#0F172A");
    setThemeAccentHex(config?.themeAccentHex || "#22D3EE");
    setPaypalUrl(getDonationUrlByProvider(config?.donationLinks, "PAYPAL"));
    setZelleUrl(getDonationUrlByProvider(config?.donationLinks, "ZELLE"));
    setCustomDonationUrl(getDonationUrlByProvider(config?.donationLinks, "CUSTOM"));
  }, [config, tenant?.churchName]);

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  const logoSource = useMemo(() => safeImageSource(logoUrl), [logoUrl]);
  const cleanPrimary = normalizeHex(themePrimaryHex, "#0F172A");
  const cleanAccent = normalizeHex(themeAccentHex, "#22D3EE");
  const displayName = churchName.trim() || tenant?.churchName || "Your Church";

  async function handleSave() {
    if (busy) return;

    if (!churchName.trim()) {
      Alert.alert("Missing church name", "Please enter the church name before saving.");
      return;
    }

    const existingUnknownLinks = (Array.isArray(config?.donationLinks) ? config.donationLinks : []).filter(
      (item) => !["PAYPAL", "ZELLE", "CUSTOM"].includes(String(item?.provider || "").toUpperCase())
    );

    const donationLinks = [
      ...existingUnknownLinks,
      ...(paypalUrl.trim()
        ? [
            {
              donationId: "don_paypal",
              provider: "PAYPAL",
              label: "PayPal",
              url: paypalUrl.trim(),
            },
          ]
        : []),
      ...(zelleUrl.trim()
        ? [
            {
              donationId: "don_zelle",
              provider: "ZELLE",
              label: "Zelle",
              url: zelleUrl.trim(),
            },
          ]
        : []),
      ...(customDonationUrl.trim()
        ? [
            {
              donationId: "don_custom",
              provider: "CUSTOM",
              label: "Donate",
              url: customDonationUrl.trim(),
            },
          ]
        : []),
    ];

    try {
      setBusy(true);

      await updateConfig({
        churchName: churchName.trim(),
        address: address.trim(),
        logoUrl: logoUrl.trim(),
        backgroundImageUrl: backgroundImageUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
        donationLinks,
        themePrimaryHex: cleanPrimary,
        themeAccentHex: cleanAccent,
      });

      Alert.alert("Saved", "Church branding, giving links, and live settings were updated.");
    } catch (error) {
      Alert.alert("Save failed", error?.message || "Could not save church settings.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    if (busy) return;

    try {
      setBusy(true);
      await logout();
    } catch (error) {
      Alert.alert("Error", error?.message || "Could not log out.");
    } finally {
      setBusy(false);
    }
  }

  function handleChurchDeleteInfo() {
    Alert.alert(
      "Church deletion not available yet",
      "The current codebase still blocks admin church deletion. Keep member delete inside the member settings screen, and we will implement real church deletion safely next."
    );
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.heroCard}>
            <View style={styles.logoWrap}>
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
                    {String(displayName).trim().charAt(0).toUpperCase() || "C"}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{displayName}</Text>
            <Text style={styles.sub}>
              Restore church branding, donation links, and live video settings from one admin page.
            </Text>

            <View style={styles.metaPill}>
              <Ionicons name="key-outline" size={14} color={colors.cyan} />
              <Text style={styles.metaPillText}>Church Code: {tenant?.churchCode || "-"}</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Church Identity</Text>

            <Text style={styles.label}>Church Name</Text>
            <TextInput
              value={churchName}
              onChangeText={setChurchName}
              placeholder="Holy Church"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Church Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="1915 N A St, Lake Worth Beach, FL"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Church Logo URL</Text>
            <TextInput
              value={logoUrl}
              onChangeText={setLogoUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.label}>Background Image URL</Text>
            <TextInput
              value={backgroundImageUrl}
              onChangeText={setBackgroundImageUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="url"
            />
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Live Stream</Text>
            <Text style={styles.helper}>
              Paste the YouTube live URL, channel URL, watch URL, or video link. The app already extracts the video ID in AppDataContext.
            </Text>

            <Text style={styles.label}>YouTube URL</Text>
            <TextInput
              value={youtubeUrl}
              onChangeText={setYoutubeUrl}
              placeholder="https://www.youtube.com/watch?v=..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="url"
            />
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Giving Links</Text>
            <Text style={styles.helper}>
              These values feed the current donationLinks array that your Giving screen already reads.
            </Text>

            <Text style={styles.label}>PayPal Donation Link</Text>
            <TextInput
              value={paypalUrl}
              onChangeText={setPaypalUrl}
              placeholder="https://www.paypal.com/..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.label}>Zelle Link or Instructions URL</Text>
            <TextInput
              value={zelleUrl}
              onChangeText={setZelleUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.label}>Custom Donation Link</Text>
            <TextInput
              value={customDonationUrl}
              onChangeText={setCustomDonationUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="url"
            />
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Church Colors</Text>
            <Text style={styles.helper}>
              Your current codebase persists primary and accent colors. Secondary color is not wired in the existing AppDataContext yet.
            </Text>

            <View style={styles.colorRow}>
              <View style={styles.colorCol}>
                <Text style={styles.label}>Primary Hex</Text>
                <TextInput
                  value={themePrimaryHex}
                  onChangeText={setThemePrimaryHex}
                  placeholder="#0F172A"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.colorCol}>
                <Text style={styles.label}>Accent Hex</Text>
                <TextInput
                  value={themeAccentHex}
                  onChangeText={setThemeAccentHex}
                  placeholder="#22D3EE"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.previewRow}>
              <View style={styles.previewChip}>
                <View style={[styles.swatch, { backgroundColor: cleanPrimary }]} />
                <Text style={styles.previewText}>Primary</Text>
              </View>

              <View style={styles.previewChip}>
                <View style={[styles.swatch, { backgroundColor: cleanAccent }]} />
                <Text style={styles.previewText}>Accent</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Admin</Text>

            <View style={styles.infoRow}>
              <Ionicons name="person-circle-outline" size={18} color={colors.cyan} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Admin</Text>
                <Text style={styles.infoValue}>{profile?.fullName || "Admin"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={colors.cyan} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile?.email || "-"}</Text>
              </View>
            </View>

            <View style={styles.actionsWrap}>
              <Pressable
                style={[styles.saveButton, busy && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color="#041217" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color="#041217" />
                    <Text style={styles.saveButtonText}>Save Church Settings</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={[styles.secondaryAction, busy && styles.buttonDisabled]}
                onPress={handleLogout}
                disabled={busy}
              >
                <Ionicons name="log-out-outline" size={18} color={colors.text} />
                <Text style={styles.secondaryActionText}>Log Out</Text>
              </Pressable>

              <Pressable style={styles.infoAction} onPress={handleChurchDeleteInfo}>
                <Ionicons name="information-circle-outline" size={18} color="#ffcc9f" />
                <Text style={styles.infoActionText}>Church deletion is not wired yet</Text>
              </Pressable>
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
    alignItems: "center",
  },
  logoWrap: {
    marginTop: 2,
    marginBottom: 14,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: "rgba(34,211,238,0.35)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  logoFallback: {
    width: 92,
    height: 92,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,211,238,0.14)",
    borderWidth: 2,
    borderColor: "rgba(34,211,238,0.35)",
  },
  logoFallbackText: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  title: {
    ...typography.h1,
    fontSize: 24,
    textAlign: "center",
  },
  sub: {
    ...typography.body,
    textAlign: "center",
    marginTop: 8,
  },
  metaPill: {
    marginTop: 14,
    minHeight: 36,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  metaPillText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  section: {},
  sectionTitle: {
    ...typography.h3,
    marginBottom: 8,
  },
  helper: {
    ...typography.body,
    marginBottom: 12,
  },
  label: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "600",
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
  },
  colorCol: {
    flex: 1,
  },
  previewRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  previewChip: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.04)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  previewText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  actionsWrap: {
    marginTop: 16,
    gap: 12,
  },
  saveButton: {
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  saveButtonText: {
    color: "#041217",
    fontWeight: "900",
    fontSize: 15,
  },
  secondaryAction: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  secondaryActionText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15,
  },
  infoAction: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,179,173,0.28)",
    backgroundColor: "rgba(255, 159, 10, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
  },
  infoActionText: {
    color: "#ffcc9f",
    fontWeight: "800",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
});