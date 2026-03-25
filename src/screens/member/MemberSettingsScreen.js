import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

const COLORS = {
  bg: "#05060A",
  card: "rgba(22,22,28,0.88)",
  border: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.72)",
  active: "#2ED8F3",
  danger: "#FF6B6B",
};

function ActionRow({ title, subtitle, onPress, danger = false, disabled = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.rowButton, disabled && styles.disabled]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, danger && { color: COLORS.danger }]}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function MemberSettingsScreen({ navigation }) {
  const { user, profile, tenant, logout, deleteAccount } = useAuth();
  const [busyAction, setBusyAction] = useState(null);

  async function handleLogout() {
    if (busyAction) return;

    try {
      setBusyAction("logout");
      await logout();
      Alert.alert("Logged out", "You have been signed out.");
    } catch (error) {
      Alert.alert("Log out failed", error?.message || "Could not log out.");
    } finally {
      setBusyAction(null);
    }
  }

  function handleDeleteAccount() {
    if (busyAction) return;

    Alert.alert(
      "Delete account",
      "This will permanently remove your member account and church access. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: async () => {
            try {
              setBusyAction("delete");
              await deleteAccount();
              Alert.alert("Account deleted", "Your account has been permanently deleted.");
            } catch (error) {
              Alert.alert("Delete failed", error?.message || "Could not delete account.");
            } finally {
              setBusyAction(null);
            }
          },
        },
      ]
    );
  }

  const role = String(profile?.role || "MEMBER").toUpperCase();
  const isBusy = Boolean(busyAction);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Me</Text>
          <Text style={styles.subtitle}>Manage your account, church access, and app settings.</Text>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>
              {profile?.fullName || user?.displayName || "Member"}
            </Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profile?.email || user?.email || "-"}</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{role}</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Current Church</Text>
            <Text style={styles.value}>{tenant?.churchName || profile?.churchName || "No church selected"}</Text>
            <Text style={styles.helper}>Church Code: {tenant?.churchCode || profile?.churchCode || "-"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Church Access</Text>

          <ActionRow
            title="Switch Church"
            subtitle="Choose another church you belong to"
            onPress={() => navigation.navigate("SwitchChurch")}
            disabled={isBusy}
          />

          <ActionRow
            title="Join Another Church"
            subtitle="Use a church code to connect to another church"
            onPress={() => navigation.navigate("JoinChurch")}
            disabled={isBusy}
          />

          <ActionRow
            title="I’m New Here"
            subtitle="Submit your visitor information"
            onPress={() => navigation.navigate("NewHere")}
            disabled={isBusy}
          />

          <ActionRow
            title="Testimonies"
            subtitle="Read and post testimonies"
            onPress={() => navigation.navigate("Testimonies")}
            disabled={isBusy}
          />

          <ActionRow
            title="Church Pro"
            subtitle="Open subscription and access screen"
            onPress={() => navigation.navigate("ChurchPro")}
            disabled={isBusy}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Actions</Text>

          <Pressable
            onPress={handleLogout}
            disabled={isBusy}
            style={[styles.primaryButton, isBusy && styles.disabled]}
          >
            {busyAction === "logout" ? (
              <ActivityIndicator color="#041217" />
            ) : (
              <Text style={styles.primaryText}>Log Out</Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleDeleteAccount}
            disabled={isBusy}
            style={[styles.dangerButton, isBusy && styles.disabled]}
          >
            {busyAction === "delete" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.dangerText}>Delete Account</Text>
            )}
          </Pressable>

          <Text style={styles.warning}>
            Delete Account is only for normal member accounts. Admin, owner, pastor, and super admin accounts are blocked from deleting here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  infoBlock: {
    marginTop: 10,
  },
  label: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  value: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  helper: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  rowButton: {
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    marginTop: 10,
  },
  rowTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },
  rowSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  chevron: {
    color: COLORS.active,
    fontSize: 28,
    fontWeight: "700",
    marginTop: -2,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: COLORS.active,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryText: {
    color: "#041217",
    fontSize: 17,
    fontWeight: "900",
  },
  dangerButton: {
    minHeight: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.35)",
    backgroundColor: "rgba(255,107,107,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  dangerText: {
    color: COLORS.danger,
    fontSize: 17,
    fontWeight: "900",
  },
  warning: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
});