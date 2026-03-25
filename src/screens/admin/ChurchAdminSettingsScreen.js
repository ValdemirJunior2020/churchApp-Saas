// src/screens/admin/ChurchAdminSettingsScreen.js

import React, { useEffect, useMemo, useState } from "react";
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

const COLORS = {
  bg: "#05060A",
  card: "rgba(22,22,28,0.88)",
  border: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.72)",
  active: "#2ED8F3",
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

function extractYoutubeVideoId(url = "") {
  const value = String(url || "").trim();
  if (!value) return "";
  const shortMatch = value.match(/youtu\.be\/([^?&/]+)/i);
  if (shortMatch?.[1]) return shortMatch[1];
  const longMatch = value.match(/[?&]v=([^?&/]+)/i);
  if (longMatch?.[1]) return longMatch[1];
  const embedMatch = value.match(/embed\/([^?&/]+)/i);
  if (embedMatch?.[1]) return embedMatch[1];
  return "";
}

export default function ChurchAdminSettingsScreen() {
  const { tenant, profile, setTenant } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      role === "super_admin"
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

        const snap = await getDoc(doc(db, "churches", churchId));
        if (!snap.exists()) {
          if (mounted) {
            setLoading(false);
            Alert.alert("Missing church", "Church settings document was not found.");
          }
          return;
        }

        const data = snap.data();

        if (!mounted) return;

        setChurchName(data.churchName || "");
        setLogoUrl(data.logoUrl || "");
        setBackgroundImageUrl(data.backgroundImageUrl || "");
        setYoutubeUrl(data.youtubeUrl || "");
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
        Alert.alert("Load failed", error?.message || "Could not load church settings.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadChurchSettings();

    return () => {
      mounted = false;
    };
  }, [churchId]);

  async function handleSave() {
    if (!churchId) {
      Alert.alert("Missing church", "No active church was found for this account.");
      return;
    }

    if (!isAdmin) {
      Alert.alert("Access denied", "Only pastors or admins can edit church settings.");
      return;
    }

    if (!churchName.trim()) {
      Alert.alert("Missing church name", "Please enter the church name.");
      return;
    }

    try {
      setSaving(true);

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
        youtubeVideoId: extractYoutubeVideoId(youtubeUrl),
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

      Alert.alert("Saved", "Church settings were updated successfully.");
    } catch (error) {
      console.log("churchAdminSettings:save:error", error);
      Alert.alert("Save failed", error?.message || "Could not save church settings.");
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
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="settings-outline" size={28} color={COLORS.active} />
            </View>
            <Text style={styles.title}>Church Admin Settings</Text>
            <Text style={styles.sub}>
              Update your church branding, giving options, live stream, and contact information.
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

            <Text style={styles.label}>YouTube Live URL</Text>
            <TextInput
              style={styles.input}
              value={youtubeUrl}
              onChangeText={setYoutubeUrl}
              placeholder="https://youtube.com/watch?v=..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
            />

            <Text style={styles.helper}>
              Paste the full YouTube live link. The app will automatically try to extract the video ID.
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

          <Text style={styles.bottomHelp}>
            After saving, your church home, giving, contact, and live screens can read these values directly from the church document.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 140,
    gap: 14,
  },
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
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
  },
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
  textarea: {
    minHeight: 110,
    paddingTop: 14,
  },
  helper: {
    color: COLORS.warning,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  saveButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: COLORS.active,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveText: {
    color: "#041217",
    fontWeight: "900",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  bottomHelp: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});