// File: src/screens/auth/PaymentRequiredScreen.js

import React, { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { PurchasesContext } from "../../context/PurchasesContext";
import { purchasePackage, restorePurchases } from "../../services/purchases";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(Number(value));
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function pickBestPackage(offerings) {
  const packages = offerings?.availablePackages || [];
  if (!packages.length) return null;

  const monthly =
    packages.find((item) => String(item?.packageType || "").toUpperCase() === "MONTHLY") ||
    packages.find((item) => String(item?.identifier || "").toLowerCase().includes("monthly"));

  return monthly || packages[0];
}

function getPackagePrice(pkg) {
  return (
    pkg?.product?.priceString ||
    pkg?.storeProduct?.priceString ||
    "$35.00/month"
  );
}

export default function PaymentRequiredScreen() {
  const { offerings, setIsPro, refreshPurchases, loading: purchasesLoading, trialEndsAt } =
    useContext(PurchasesContext);
  const { tenant } = useAuth();

  const [busy, setBusy] = useState(false);

  const selectedPackage = useMemo(() => pickBestPackage(offerings), [offerings]);
  const priceLabel = getPackagePrice(selectedPackage);

  async function markChurchPaid(status = "ACTIVE") {
    if (!tenant?.churchId) return;

    await updateDoc(doc(db, "churches", tenant.churchId), {
      plan: "PRO",
      planStatus: "ACTIVE",
      subscriptionStatus: status,
      updatedAt: serverTimestamp(),
    });
  }

  async function handleBuy() {
    if (!selectedPackage || busy) return;

    try {
      setBusy(true);

      const customerInfo = await purchasePackage(selectedPackage);
      const hasPro = Boolean(customerInfo?.entitlements?.active?.pro);

      if (!hasPro) {
        throw new Error("Subscription did not activate. Please try again.");
      }

      await markChurchPaid("ACTIVE");
      setIsPro(true);
      await refreshPurchases();

      Alert.alert("Subscription active", "Your church now has full pastor access.");
    } catch (error) {
      Alert.alert("Purchase failed", error?.message || "Could not complete the subscription.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    if (busy) return;

    try {
      setBusy(true);

      const customerInfo = await restorePurchases();
      const hasPro = Boolean(customerInfo?.entitlements?.active?.pro);

      if (!hasPro) {
        Alert.alert("No purchase found", "No active subscription was found to restore.");
        return;
      }

      await markChurchPaid("RESTORED");
      setIsPro(true);
      await refreshPurchases();

      Alert.alert("Restored", "Your church subscription was restored.");
    } catch (error) {
      Alert.alert("Restore failed", error?.message || "Could not restore purchases.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <GlassCard style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="diamond-outline" size={28} color={colors.cyan} />
            </View>

            <Text style={styles.title}>Church Pro Required</Text>
            <Text style={styles.sub}>
              Your pastor trial has ended. Subscribe to keep the full church admin experience active.
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="calendar-outline" size={14} color={colors.cyan} />
                <Text style={styles.badgeText}>Trial ended: {formatDate(trialEndsAt)}</Text>
              </View>

              <View style={styles.badge}>
                <Ionicons name="card-outline" size={14} color={colors.cyan} />
                <Text style={styles.badgeText}>{priceLabel}</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard>
            <Text style={styles.sectionTitle}>What Church Pro keeps unlocked</Text>

            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Pastor dashboard and church management</Text>
            </View>

            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Branding, giving links, colors, and background</Text>
            </View>

            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Members, events, chat, and in-app live setup</Text>
            </View>

            <View style={styles.tipRowLast}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>One subscription per church pastor account</Text>
            </View>
          </GlassCard>

          <GlassCard>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <Text style={styles.helper}>
              This app is free to download. Only the pastor account pays to manage the church after the trial.
            </Text>

            <Pressable
              style={[
                styles.primaryButton,
                (!selectedPackage || busy || purchasesLoading) && styles.buttonDisabled,
              ]}
              onPress={handleBuy}
              disabled={!selectedPackage || busy || purchasesLoading}
            >
              {busy ? (
                <ActivityIndicator color="#041217" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={18} color="#041217" />
                  <Text style={styles.primaryButtonText}>Subscribe {priceLabel}</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, busy && styles.buttonDisabled]}
              onPress={handleRestore}
              disabled={busy}
            >
              <Ionicons name="refresh-outline" size={18} color={colors.text} />
              <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
            </Pressable>

            {!selectedPackage && !purchasesLoading ? (
              <Text style={styles.warningText}>
                No RevenueCat package was found. Check your offering and public iOS API key.
              </Text>
            ) : null}
          </GlassCard>
        </View>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 14,
    justifyContent: "center",
  },
  heroCard: {
    alignItems: "center",
  },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,211,238,0.16)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.28)",
    marginBottom: 14,
  },
  title: {
    ...typography.h1,
    fontSize: 26,
    textAlign: "center",
  },
  sub: {
    ...typography.body,
    textAlign: "center",
    marginTop: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 14,
  },
  badge: {
    minHeight: 34,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 10,
  },
  helper: {
    ...typography.body,
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke,
  },
  tipRowLast: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingTop: 10,
  },
  tipDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.cyan,
    marginTop: 6,
  },
  tipText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    flex: 1,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#041217",
    fontWeight: "900",
    fontSize: 15,
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: radius.lg,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15,
  },
  warningText: {
    color: "#ffcc9f",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
    lineHeight: 18,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});