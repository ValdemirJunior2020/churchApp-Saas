// File: src/screens/admin/MemberManagerScreen.js

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import ChurchBrandHeader from "../../components/ChurchBrandHeader";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

function getArray(value) {
  return Array.isArray(value) ? value : [];
}

function getDisplayName(member) {
  return (
    member?.name ||
    member?.fullName ||
    member?.displayName ||
    member?.memberName ||
    "Unnamed Member"
  );
}

function getDisplayEmail(member) {
  return member?.email || "No email";
}

function getDisplayPhone(member) {
  return member?.phone || "";
}

function getDisplayRole(member) {
  return String(member?.role || "MEMBER").toUpperCase();
}

function getMemberId(member, index) {
  return member?.id || member?.uid || member?.memberId || `member-${index}`;
}

export default function MemberManagerScreen() {
  const { tenant } = useAuth();
  const { members, refreshMembers, updateMember, deleteMember, ready } = useAppData();

  const [query, setQuery] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const safeMembers = getArray(members);

  const loadMembers = useCallback(async (mode = "refresh") => {
    if (typeof refreshMembers !== "function") return;

    try {
      if (mode === "initial") setInitialLoading(true);
      if (mode === "refresh") setRefreshing(true);
      await refreshMembers();
    } catch (error) {
      Alert.alert("Error", error?.message || "Could not load members.");
    } finally {
      if (mode === "initial") setInitialLoading(false);
      if (mode === "refresh") setRefreshing(false);
    }
  }, [refreshMembers]);

  useEffect(() => {
    if (!ready) return;
    loadMembers("initial");
  }, [ready, tenant?.churchId, loadMembers]);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return safeMembers;

    return safeMembers.filter((member) => {
      const haystack = [
        getDisplayName(member),
        getDisplayEmail(member),
        getDisplayPhone(member),
        getDisplayRole(member),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [safeMembers, query]);

  async function handlePromote(member, index) {
    if (typeof updateMember !== "function") {
      Alert.alert("Unavailable", "updateMember is not available in AppDataContext yet.");
      return;
    }

    const nextRole = getDisplayRole(member) === "ADMIN" ? "MEMBER" : "ADMIN";
    const memberId = getMemberId(member, index);

    try {
      setBusyId(memberId);
      await updateMember(memberId, { ...member, role: nextRole });
    } catch (error) {
      Alert.alert("Error", error?.message || "Could not update member.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(member, index) {
    if (typeof deleteMember !== "function") {
      Alert.alert("Unavailable", "deleteMember is not available in AppDataContext yet.");
      return;
    }

    const memberId = getMemberId(member, index);

    Alert.alert("Delete member", `Remove ${getDisplayName(member)} from the church?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setBusyId(memberId);
            await deleteMember(memberId);
          } catch (error) {
            Alert.alert("Error", error?.message || "Could not delete member.");
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  }

  function renderMember({ item, index }) {
    const memberId = getMemberId(item, index);
    const isBusy = busyId === memberId;
    const role = getDisplayRole(item);

    return (
      <GlassCard style={styles.card}>
        <View style={styles.rowTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getDisplayName(item).slice(0, 1).toUpperCase()}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>{getDisplayName(item)}</Text>
            <Text style={styles.meta}>{getDisplayEmail(item)}</Text>
            {!!getDisplayPhone(item) && <Text style={styles.meta}>{getDisplayPhone(item)}</Text>}
          </View>

          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => handlePromote(item, index)}
            disabled={isBusy}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.text} />
            <Text style={styles.actionText}>
              {role === "ADMIN" ? "Make Member" : "Make Admin"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item, index)}
            disabled={isBusy}
          >
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={[styles.actionText, { color: "#fff" }]}>Delete</Text>
          </Pressable>
        </View>

        {isBusy && <ActivityIndicator style={styles.inlineLoader} color={colors.cyan} />}
      </GlassCard>
    );
  }

  const isEmpty = !initialLoading && filteredMembers.length === 0;

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <ChurchBrandHeader
            title={tenant?.churchName || "Members"}
            subtitle="Review your church members, promote leaders, and keep access clean."
            centered
            showChurchCode
          />

          <GlassCard style={styles.searchCard}>
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name, email, phone, or role"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <Pressable onPress={() => loadMembers("refresh")} style={styles.refreshBtn}>
                <Ionicons name="refresh-outline" size={18} color={colors.text} />
              </Pressable>
            </View>
          </GlassCard>

          {initialLoading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={colors.cyan} />
              <Text style={styles.loaderText}>Loading members...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMembers}
              keyExtractor={(item, index) => String(getMemberId(item, index))}
              renderItem={renderMember}
              contentContainerStyle={[
                styles.listContent,
                isEmpty && styles.listContentEmpty,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => loadMembers("refresh")}
                  tintColor={colors.cyan}
                />
              }
              ListHeaderComponent={
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryText}>
                    {safeMembers.length} total {safeMembers.length === 1 ? "member" : "members"}
                  </Text>
                  <Text style={styles.summaryText}>
                    {filteredMembers.length} shown
                  </Text>
                </View>
              }
              ListEmptyComponent={
                <GlassCard style={styles.emptyCard}>
                  <Ionicons name="people-outline" size={36} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>No members found</Text>
                  <Text style={styles.emptyText}>
                    {safeMembers.length === 0
                      ? "No member records were returned for this church yet."
                      : "Try another search term."}
                  </Text>
                </GlassCard>
              }
            />
          )}
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  searchCard: {
    marginTop: 12,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loaderText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },
  summaryText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: 120,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    marginBottom: 12,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124,58,237,0.22)",
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  avatarText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  roleText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  deleteBtn: {
    backgroundColor: "rgba(244,63,94,0.88)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  actionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  inlineLoader: {
    marginTop: 12,
  },
  emptyCard: {
    marginTop: 8,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: 12,
  },
  emptyText: {
    ...typography.body,
    marginTop: 8,
  },
});