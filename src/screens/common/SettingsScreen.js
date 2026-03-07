// File: src/screens/common/SettingsScreen.js (CREATE)
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function SettingsScreen() {
  const { tenant, logout, leaveChurch, deleteAccountForever } = useAuth();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    try {
      setBusy(true);
      await logout();
    } catch (e) {
      Alert.alert("Logout failed", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  function onLeaveChurch() {
    Alert.alert(
      "Leave this church?",
      "This removes your membership from this church and returns you to the welcome screen. You can then join another church code.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave Church",
          style: "destructive",
          onPress: async () => {
            try {
              setBusy(true);
              await leaveChurch();
            } catch (e) {
              Alert.alert("Failed", String(e?.message || e));
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }

  function onDeleteAccount() {
    Alert.alert(
      "Delete account permanently?",
      "This will permanently delete your account and remove your membership data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            try {
              setBusy(true);
              await deleteAccountForever();
              Alert.alert("Deleted", "Your account was deleted.");
            } catch (e) {
              Alert.alert("Delete failed", String(e?.message || e));
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.section}>Account</Text>
        <Text style={styles.meta}>Email: {tenant?.email || "-"}</Text>
        <Text style={styles.meta}>Role: {String(tenant?.role || "-")}</Text>

        <Pressable onPress={onLogout} disabled={busy} style={styles.primary}>
          <Ionicons name="log-out-outline" size={18} color="white" />
          <Text style={styles.primaryText}>{busy ? "Please wait..." : "Logout"}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Church</Text>
        <Text style={styles.meta}>Church Code: {tenant?.churchCode || "-"}</Text>
        <Text style={styles.meta}>Church Name: {tenant?.churchName || "-"}</Text>

        <Pressable onPress={onLeaveChurch} disabled={busy} style={styles.warn}>
          <Ionicons name="exit-outline" size={18} color="#f59e0b" />
          <Text style={styles.warnText}>Leave this Church (join another)</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Danger Zone</Text>
        <Pressable onPress={onDeleteAccount} disabled={busy} style={styles.danger}>
          <Ionicons name="trash-outline" size={18} color="#b42318" />
          <Text style={styles.dangerText}>Delete Account</Text>
        </Pressable>
        <Text style={styles.small}>
          If you see “requires recent login”, log out, log back in, then try again.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb", padding: 16 },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  card: {
    marginTop: 12,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  section: { fontWeight: "900", color: "#0f172a" },
  meta: { marginTop: 6, color: "#586174", fontWeight: "700" },

  primary: {
    marginTop: 12,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  primaryText: { color: "white", fontWeight: "900" },

  warn: {
    marginTop: 12,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.25)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  warnText: { color: "#b45309", fontWeight: "900" },

  danger: {
    marginTop: 12,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(180,35,24,0.10)",
    borderWidth: 1,
    borderColor: "rgba(180,35,24,0.25)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  dangerText: { color: "#b42318", fontWeight: "900" },
  small: { marginTop: 10, color: "#64748b", fontWeight: "700", fontSize: 12 },
});