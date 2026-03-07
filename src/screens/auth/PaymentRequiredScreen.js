import React from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

// ✅ This screen should open the exact checkout URL returned by billing/start
// (with sessionId already included), not a hardcoded PAYMENT_URL only.
export default function PaymentRequiredScreen() {
  const { tenant, logout } = useAuth();

  async function openPay() {
    try {
      const url =
        tenant?.checkoutUrl || // best option: returned by billing/start and saved in session
        tenant?.paymentUrl ||  // fallback if you use another key name
        "";

      if (!url) {
        Alert.alert(
          "Payment link not ready",
          "No checkout link was found in your session. Please create the church again so the app can receive the checkout URL."
        );
        return;
      }

      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Error", e?.message || "Could not open payment page.");
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Subscription Needed</Text>
        <Text style={styles.sub}>Your church access is locked right now.</Text>

        <View style={styles.box}>
          <Text style={styles.meta}>Church: {tenant?.churchName || "-"}</Text>
          <Text style={styles.meta}>Code: {tenant?.churchCode || "-"}</Text>
          <Text style={styles.meta}>Status: {tenant?.planStatus || "-"}</Text>
          <Text style={styles.meta}>Trial Ends: {tenant?.trialEndsAt || "-"}</Text>
        </View>

        <Pressable style={styles.primary} onPress={openPay}>
          <Text style={styles.primaryText}>Open Payment Page</Text>
        </Pressable>

        <Pressable style={styles.secondary} onPress={logout}>
          <Text style={styles.secondaryText}>Logout</Text>
        </Pressable>

        <Text style={styles.note}>
          After payment, open the app and login again.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb", padding: 16, justifyContent: "center" },
  card: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
    borderRadius: 26,
    padding: 18,
  },
  title: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 6, color: "#586174", fontWeight: "700" },
  box: {
    marginTop: 12,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    gap: 6,
  },
  meta: { color: "#0f172a", fontWeight: "800" },
  primary: {
    marginTop: 14,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  primaryText: { color: "white", fontWeight: "900" },
  secondary: {
    marginTop: 10,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.08)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
  },
  secondaryText: { color: "#0f172a", fontWeight: "900" },
  note: { marginTop: 12, color: "#64748b", fontWeight: "700", lineHeight: 18 },
});