// File: src/screens/admin/ChurchAdminSettingsScreen.js

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { extractYouTubeVideoId } from "../../utils/youtube";

const COLORS = {
  bg: "#05060A",
  card: "rgba(22,22,28,0.88)",
  border: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.72)",
  active: "#2ED8F3",
  success: "#34D399",
  successBg: "rgba(52,211,153,0.14)",
  successBorder: "rgba(52,211,153,0.28)",
  error: "#FF6B6B",
  errorBg: "rgba(255,107,107,0.14)",
  errorBorder: "rgba(255,107,107,0.28)",
  warning: "#F4C27A",
};

function normalizeLinks(text) {
  return String(text || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function linksToText(value) {
  if (Array.isArray(value)) return value.join("\n");
  return "";
}


function StatusBanner({ type, text, onClose }) {
  if (!text) return null;

  const isSuccess = type === "success";

  return (
    <View
      style={[
        styles.banner,
        isSuccess ? styles.successBanner : styles.errorBanner,
      ]}
    >
      <Ionicons
        name={isSuccess ? "checkmark-circle-outline" : "alert-circle-outline"}
        size={18}
        color={isSuccess ? COLORS.success : COLORS.error}
      />
      <Text style={styles.bannerText}>{text}</Text>
      <Pressable onPress={onClose} hitSlop={10}>
        <Ionicons name="close" size={18} color={COLORS.text} />
      </Pressable>
    </View>
  );
}

export default function ChurchAdminSettingsScreen() {
  const { tenant, profile, setTenant } = useAuth();
  const scrollRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusType, setStatusType] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [churchName, setChurchName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [paypalLink, setPaypalLink] = useState("");
  const [zelleInfo, setZelleInfo] = useState("");
  const [cashAppLink, setCashAppLink] = useState("");
  const [customDonationLinksText, setCustomDonationLinksText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  const churchId = tenant?.churchId || profile?.churchId || null;

  const isAdmin = useMemo(() => {
    const role = String(profile?.role || "").toLowerCase();
    return (
      role === "admin" ||
      role === "owner" ||
      role === "pastor" ||
      role === "superadmin" ||
      role === "super_admin" ||
      role === "platformadmin"
    );
  }, [profile?.role]);

  useEffect(() => {
    let mounted = true;

    async function loadChurchSettings() {
      if (!churchId) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setStatusType("");
        setStatusMessage("");

        const snap = await getDoc(doc(db, "churches", churchId));

        if (!snap.exists()) {
          if (mounted) {
            setStatusType("error");
            setStatusMessage("Church settings document was not found.");
            setLoading(false);
          }
          return;
        }

        const data = snap.data();

        if (!mounted) return;

        setChurchName(data.churchName || "");
        setLogoUrl(data.logoUrl || "");
        setBackgroundImageUrl(data.backgroundImageUrl || "");
        setYoutubeUrl(data.youtubeUrl || data.youtubeVideoId || data.vimeoUrl || "");
        setPaypalLink(data.paypalLink || "");
        setZelleInfo(data.zelleInfo || "");
        setCashAppLink(data.cashAppLink || "");
        setCustomDonationLinksText(linksToText(data.customDonationLinks));
        setContactEmail(data.contactEmail || "");
        setContactPhone(data.contactPhone || "");
        setAddressLine1(data.addressLine1 || "");
        setAddressLine2(data.addressLine2 || "");
        setCity(data.city || "");
        setStateName(data.state || "");
        setPostalCode(data.postalCode || "");
        setWebsiteUrl(data.websiteUrl || "");
        setFacebookUrl(data.facebookUrl || "");
        setInstagramUrl(data.instagramUrl || "");
      } catch (error) {
        console.log("churchAdminSettings:load:error", error);
        if (mounted) {
          setStatusType("error");
          setStatusMessage(error?.message || "Could not load church settings.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadChurchSettings();

    return () => {
      mounted = false;
    };
  }, [churchId]);

  function showSuccess(message) {
    setStatusType("success");
    setStatusMessage(message);
    scrollRef.current?.scrollTo?.({ y: 0, animated: true });
    Alert.alert("Saved", message);
  }

  function showError(message) {
    setStatusType("error");
    setStatusMessage(message);
    scrollRef.current?.scrollTo?.({ y: 0, animated: true });
    Alert.alert("Save failed", message);
  }

  async function handleSave() {
    if (!churchId) {
      showError("No active church was found for this account.");
      return;
    }

    if (!isAdmin) {
      showError("Only pastors or admins can edit church settings.");
      return;
    }

    if (!churchName.trim()) {
      showError("Please enter the church name.");
      return;
    }


    try {
      setSaving(true);
      setStatusType("");
      setStatusMessage("");

      const customDonationLinks = normalizeLinks(customDonationLinksText);
      const donationLinks = [
        paypalLink.trim(),
        cashAppLink.trim(),
        ...customDonationLinks,
      ].filter(Boolean);

      const payload = {
        churchName: churchName.trim(),
        logoUrl: logoUrl.trim(),
        backgroundImageUrl: backgroundImageUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
        youtubeVideoId: extractYouTubeVideoId(youtubeUrl),
        vimeoUrl: "",
        vimeoVideoId: "",
        paypalLink: paypalLink.trim(),
        zelleInfo: zelleInfo.trim(),
        cashAppLink: cashAppLink.trim(),
        customDonationLinks,
        donationLinks,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: stateName.trim(),
        postalCode: postalCode.trim(),
        websiteUrl: websiteUrl.trim(),
        facebookUrl: facebookUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "churches", churchId), payload);

      if (typeof setTenant === "function") {
        setTenant((prev) => ({
          ...(prev || {}),
          churchId,
          churchName: churchName.trim(),
          logoUrl: logoUrl.trim(),
          backgroundImageUrl: backgroundImageUrl.trim(),
          youtubeUrl: youtubeUrl.trim(),
        }));
      }

      showSuccess("Your church settings have been saved successfully.");
    } catch (error) {
      console.log("churchAdminSettings:save:error", error);
      showError(error?.message || "Could not save church settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.active} />
          <Text style={styles.loadingText}>Loading church settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBanner
            type={statusType}
            text={statusMessage}
            onClose={() => {
              setStatusType("");
              setStatusMessage("");
            }}
          />

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="settings-outline" size={28} color={COLORS.active} />
            </View>
            <Text style={styles.title}>Church Admin Settings</Text>
            <Text style={styles.sub}>
              Update your church branding, giving options, YouTube live stream, and contact information.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Branding</Text>

            <Text style={styles.label}>Church Name</Text>
            <TextInput
              style={styles.input}
              value={churchName}
              onChangeText={setChurchName}
              placeholder="Victory Worship Center"
              placeholderTextColor="rgba(255,255,255,0.45)"
            />

            <Text style={styles.label}>Logo URL</Text>
            <TextInput
              style={styles.input}
              value={logoUrl}
              onChangeText={setLogoUrl}
              placeholder="https://..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Background Image URL</Text>
            <TextInput
              style={styles.input}
              value={backgroundImageUrl}
              onChangeText={setBackgroundImageUrl}
              placeholder="https://..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Live Stream</Text>

            <Text style={styles.label}>YouTube Live URL or Video ID</Text>
            <TextInput
              style={styles.input}
              value={youtubeUrl}
              onChangeText={setYoutubeUrl}
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID or VIDEO_ID"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
            />

            <Text style={styles.helper}>
              Paste a direct YouTube watch URL or the 11-character video ID used by the live stream.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Giving</Text>

            <Text style={styles.label}>PayPal Link</Text>
            <TextInput
              style={styles.input}
              value={paypalLink}
              onChangeText={setPaypalLink}
              placeholder="https://paypal.me/yourchurch"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Zelle Info</Text>
            <TextInput
              style={styles.input}
              value={zelleInfo}
              onChangeText={setZelleInfo}
              placeholder="church@email.com or 555-555-5555"
              placeholderTextColor="rgba(255,255,255,0.45)"
            />

            <Text style={styles.label}>Cash App Link</Text>
            <TextInput
              style={styles.input}
              value={cashAppLink}
              onChangeText={setCashAppLink}
              placeholder="https://cash.app/$yourchurch"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Custom Donation Links</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={customDonationLinksText}
              onChangeText={setCustomDonationLinksText}
              placeholder={"One link per line\nhttps://zelle...\nhttps://givebutter...\nhttps://tithe.ly/..."}
              placeholderTextColor="rgba(255,255,255,0.45)"
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact</Text>

            <Text style={styles.label}>Contact Email</Text>
            <TextInput
              style={styles.input}
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder="info@church.com"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Contact Phone</Text>
            <TextInput
              style={styles.input}
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="754-000-0000"
              placeholderTextColor="rgba(255,255,255,0.45)"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Address Line 1</Text>
            <TextInput
              style={styles.input}
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder="123 Main St"
              placeholderTextColor="rgba(255,255,255,0.45)"
            />

            <Text style={styles.label}>Address Line 2</Text>
            <TextInput
              style={styles.input}
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder="Suite, building, floor"
              placeholderTextColor="rgba(255,255,255,0.45)"
            />

            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Lake Worth"
              placeholderTextColor="rgba(255,255,255,0.45)"
            />

            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={stateName}
              onChangeText={setStateName}
              placeholder="Florida"
              placeholderTextColor="rgba(255,255,255,0.45)"
            />

            <Text style={styles.label}>Postal Code</Text>
            <TextInput
              style={styles.input}
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="33460"
              placeholderTextColor="rgba(255,255,255,0.45)"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Social Links</Text>

            <Text style={styles.label}>Website URL</Text>
            <TextInput
              style={styles.input}
              value={websiteUrl}
              onChangeText={setWebsiteUrl}
              placeholder="https://yourchurch.com"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Facebook URL</Text>
            <TextInput
              style={styles.input}
              value={facebookUrl}
              onChangeText={setFacebookUrl}
              placeholder="https://facebook.com/yourchurch"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Instagram URL</Text>
            <TextInput
              style={styles.input}
              value={instagramUrl}
              onChangeText={setInstagramUrl}
              placeholder="https://instagram.com/yourchurch"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, saving && styles.disabled]}
          >
            {saving ? (
              <ActivityIndicator color="#041217" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#041217" />
                <Text style={styles.saveText}>Save Church Settings</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: COLORS.text, fontSize: 15, fontWeight: "800" },
  container: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 140, gap: 14 },
  banner: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  successBanner: { backgroundColor: COLORS.successBg, borderColor: COLORS.successBorder },
  errorBanner: { backgroundColor: COLORS.errorBg, borderColor: COLORS.errorBorder },
  bannerText: { color: COLORS.text, fontSize: 14, fontWeight: "800", flex: 1, lineHeight: 20 },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    alignItems: "center",
  },
  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(46,216,243,0.12)",
    borderWidth: 1,
    borderColor: "rgba(46,216,243,0.25)",
    marginBottom: 14,
  },
  title: { color: COLORS.text, fontSize: 26, fontWeight: "900", textAlign: "center" },
  sub: { color: COLORS.muted, fontSize: 15, textAlign: "center", marginTop: 8, lineHeight: 22 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
  sectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: "900", marginBottom: 10 },
  label: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 8,
    letterSpacing: 0.7,
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    color: COLORS.text,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textarea: { minHeight: 110, paddingTop: 14 },
  helper: { color: COLORS.warning, fontSize: 12, lineHeight: 18, fontWeight: "700", marginTop: 10 },
  saveButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: COLORS.active,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveText: { color: "#041217", fontWeight: "900", fontSize: 16 },
  disabled: { opacity: 0.6 },
});