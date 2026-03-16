// src/screens/admin/MemberManagerScreen.js

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAppData } from "../../context/AppDataContext";
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
  return member?.email || member?.memberEmail || member?.login || "No email";
}

function getDisplayPhone(member) {
  return member?.phone || member?.mobile || member?.memberPhone || "";
}

function getDisplayRole(member) {
  return member?.role || member?.userRole || "MEMBER";
}

function getMemberId(member, index) {
  return (
    member?.id ||
    member?.memberId ||
    member?.userId ||
    member?._id ||
    `${getDisplayEmail(member)}-${index}`
  );
}

export default function MemberManagerScreen() {
  const appData = useAppData() || {};

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);

  const members = useMemo(() => {
    const fromContext =
      appData.members ||
      appData.memberList ||
      appData.users ||
      appData.churchMembers ||
      [];

    return getArray(fromContext);
  }, [appData]);

  const refreshFn = useMemo(() => {
    return (
      appData.refreshMembers ||
      appData.fetchMembers ||
      appData.loadMembers ||
      appData.getMembers ||
      null
    );
  }, [appData]);

  const updateFn = useMemo(() => {
    return (
      appData.updateMember ||
      appData.editMember ||
      appData.saveMember ||
      appData.updateUser ||
      null
    );
  }, [appData]);

  const deleteFn = useMemo(() => {
    return (
      appData.deleteMember ||
      appData.removeMember ||
      appData.deleteUser ||
      null
    );
  }, [appData]);

  const loadMembers = useCallback(async () => {
    if (typeof refreshFn !== "function") return;

    try {
      setLoading(true);
      await refreshFn();
    } catch (error) {
      Alert.alert("Error", error?.message || "Could not load members.");
    } finally {
      setLoading(false);
    }
  }, [refreshFn]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;

    return members.filter((member) => {
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
  }, [members, query]);

  async function handlePromote(member, index) {
    if (typeof updateFn !== "function") {
      Alert.alert("Unavailable", "updateMember is not available in AppDataContext yet.");
      return;
    }

    const nextRole = getDisplayRole(member).toUpperCase() === "ADMIN" ? "MEMBER" : "ADMIN";
    const memberId = getMemberId(member, index);

    try {
      setBusyId(memberId);
      await updateFn(memberId, { ...member, role: nextRole });
      await loadMembers();
    } catch (error) {
      Alert.alert("Error", error?.message || "Could not update member.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(member, index) {
    if (typeof deleteFn !== "function") {
      Alert.alert("Unavailable", "deleteMember is not available in AppDataContext yet.");
      return;
    }

    const memberId = getMemberId(member, index);

    Alert.alert(
      "Delete member",
      `Remove ${getDisplayName(member)} from the church?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setBusyId(memberId);
              await deleteFn(memberId);
              await loadMembers();
            } catch (error) {
              Alert.alert("Error", error?.message || "Could not delete member.");
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  }

  function renderMember({ item, index }) {
    const memberId = getMemberId(item, index);
    const isBusy = busyId === memberId;

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
            <Text style={styles.roleText}>{getDisplayRole(item)}</Text>
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
              {getDisplayRole(item).toUpperCase() === "ADMIN" ? "Make Member" : "Make Admin"}
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

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.kicker}>ADMIN</Text>
          <Text style={styles.title}>Members</Text>
          <Text style={styles.sub}>
            Search, review roles, and manage church access without crashing if a context function is missing.
          </Text>

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
              <Pressable onPress={loadMembers} style={styles.refreshBtn}>
                <Ionicons name="refresh-outline" size={18} color={colors.text} />
              </Pressable>
            </View>
          </GlassCard>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={colors.cyan} />
              <Text style={styles.loaderText}>Loading members...</Text>
            </View>
          ) : filteredMembers.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="people-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No members found</Text>
              <Text style={styles.emptyText}>
                {members.length === 0
                  ? "Your context did not return any member records yet."
                  : "Try another search term."}
              </Text>

              <View style={styles.debugBox}>
                <Text style={styles.debugText}>
                  refreshMembers: {typeof refreshFn === "function" ? "OK" : "missing"}
                </Text>
                <Text style={styles.debugText}>
                  updateMember: {typeof updateFn === "function" ? "OK" : "missing"}
                </Text>
                <Text style={styles.debugText}>
                  deleteMember: {typeof deleteFn === "function" ? "OK" : "missing"}
                </Text>
                <Text style={styles.debugText}>members found: {members.length}</Text>
              </View>
            </GlassCard>
          ) : (
            <FlatList
              data={filteredMembers}
              keyExtractor={(item, index) => String(getMemberId(item, index))}
              renderItem={renderMember}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
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
  kicker: {
    ...typography.kicker,
  },
  title: {
    ...typography.h2,
    marginTop: 8,
  },
  sub: {
    ...typography.body,
    marginTop: 8,
    marginBottom: 14,
  },
  searchCard: {
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
  listContent: {
    paddingBottom: 120,
    gap: 12,
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
  debugBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.04)",
    gap: 6,
  },
  debugText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
});