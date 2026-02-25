// File: src/screens/admin/MemberManagerScreen.js

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppData } from "../../context/AppDataContext";

export default function MemberManagerScreen() {
  const appData = typeof useAppData === "function" ? useAppData() : {};

  const members = Array.isArray(appData?.members) ? appData.members : [];
  const tenant = appData?.tenant || null;

  // ✅ Safe wrappers (prevents crash if AppDataContext is not finished yet)
  const refreshMembers =
    typeof appData?.refreshMembers === "function"
      ? appData.refreshMembers
      : async () => {
          console.log("[MemberManagerScreen] refreshMembers missing (safe fallback)");
          return [];
        };

  const updateMember =
    typeof appData?.updateMember === "function"
      ? appData.updateMember
      : async () => {
          throw new Error("updateMember is not available in AppDataContext yet.");
        };

  const deleteMember =
    typeof appData?.deleteMember === "function"
      ? appData.deleteMember
      : async () => {
          throw new Error("deleteMember is not available in AppDataContext yet.");
        };

  const [loading, setLoading] = useState(false);
  const [bootLoaded, setBootLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null); // { id, name, email, phone, role, status }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        console.log("[MemberManagerScreen] opening...");
        await refreshMembers();
      } catch (err) {
        console.log("[MemberManagerScreen] refresh error:", err?.message || err);
      } finally {
        if (active) {
          setLoading(false);
          setBootLoaded(true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [refreshMembers]);

  const filteredMembers = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return members;

    return members.filter((m) => {
      const name = String(m?.name || "").toLowerCase();
      const email = String(m?.email || "").toLowerCase();
      const phone = String(m?.phone || "").toLowerCase();
      const role = String(m?.role || "").toLowerCase();
      const status = String(m?.status || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        role.includes(q) ||
        status.includes(q)
      );
    });
  }, [members, search]);

  function startEdit(member) {
    setSelectedId(member?.id || null);
    setEditing({
      id: member?.id || "",
      name: String(member?.name || ""),
      email: String(member?.email || ""),
      phone: String(member?.phone || ""),
      role: String(member?.role || "MEMBER").toUpperCase(),
      status: String(member?.status || "ACTIVE").toUpperCase(),
    });
  }

  function cancelEdit() {
    setEditing(null);
    setSelectedId(null);
  }

  async function saveEdit() {
    if (!editing) return;

    try {
      setLoading(true);
      console.log("[MemberManagerScreen] save clicked:", editing);

      await updateMember({
        id: editing.id,
        churchCode: tenant?.churchCode || undefined,
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
        role: editing.role,
        status: editing.status,
      });

      console.log("[MemberManagerScreen] save success");
      Alert.alert("Success", "Member updated.");
      setEditing(null);
      setSelectedId(null);
      await refreshMembers();
    } catch (err) {
      console.log("[MemberManagerScreen] save error:", err?.message || err);
      Alert.alert("Update failed", err?.message || "Could not update member.");
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete(member) {
    Alert.alert(
      "Delete member",
      `Delete ${member?.name || "this member"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              console.log("[MemberManagerScreen] delete clicked:", member?.id);

              await deleteMember({
                id: member?.id,
                churchCode: tenant?.churchCode || undefined,
              });

              Alert.alert("Deleted", "Member removed.");
              if (selectedId === member?.id) cancelEdit();
              await refreshMembers();
            } catch (err) {
              console.log("[MemberManagerScreen] delete error:", err?.message || err);
              Alert.alert("Delete failed", err?.message || "Could not delete member.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  async function handleRefresh() {
    try {
      setLoading(true);
      console.log("[MemberManagerScreen] manual refresh clicked");
      await refreshMembers();
    } catch (err) {
      console.log("[MemberManagerScreen] manual refresh error:", err?.message || err);
      Alert.alert("Refresh failed", err?.message || "Could not refresh members.");
    } finally {
      setLoading(false);
      setBootLoaded(true);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerCard}>
        <Text style={styles.kicker}>PASTOR SETTINGS</Text>
        <Text style={styles.title}>Members</Text>
        <Text style={styles.sub}>
          Manage your church members, roles, and status.
        </Text>

        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Church Code</Text>
            <Text style={styles.badgeValue}>
              {tenant?.churchCode || "—"}
            </Text>
          </View>

          <Pressable
            onPress={handleRefresh}
            style={({ pressed }) => [styles.refreshBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email, phone, role..."
          autoCapitalize="none"
          style={styles.searchInput}
        />

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {!loading && bootLoaded && filteredMembers.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No members found</Text>
            <Text style={styles.emptySub}>
              {members.length === 0
                ? "Your member list is empty or AppDataContext has not loaded members yet."
                : "Try a different search."}
            </Text>
          </View>
        )}

        <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingBottom: 8 }}>
          {filteredMembers.map((member) => {
            const isSelected = selectedId === member?.id;
            return (
              <View key={String(member?.id || Math.random())} style={[styles.memberRow, isSelected && styles.memberRowSelected]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{member?.name || "(No name)"}</Text>
                  <Text style={styles.memberMeta}>
                    {member?.email || "No email"} {member?.phone ? `• ${member.phone}` : ""}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.pill}>{String(member?.role || "MEMBER").toUpperCase()}</Text>
                    <Text
                      style={[
                        styles.pill,
                        String(member?.status || "ACTIVE").toUpperCase() === "ACTIVE"
                          ? styles.pillActive
                          : styles.pillInactive,
                      ]}
                    >
                      {String(member?.status || "ACTIVE").toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsCol}>
                  <Pressable
                    onPress={() => startEdit(member)}
                    style={({ pressed }) => [styles.smallBtn, pressed && styles.btnPressed]}
                  >
                    <Text style={styles.smallBtnText}>Edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => confirmDelete(member)}
                    style={({ pressed }) => [styles.smallBtnDanger, pressed && styles.btnPressed]}
                  >
                    <Text style={styles.smallBtnDangerText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {editing && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Edit Member</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            value={editing.name}
            onChangeText={(v) => setEditing((prev) => ({ ...prev, name: v }))}
            style={styles.input}
            placeholder="Member name"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={editing.email}
            onChangeText={(v) => setEditing((prev) => ({ ...prev, email: v }))}
            style={styles.input}
            placeholder="email@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            value={editing.phone}
            onChangeText={(v) => setEditing((prev) => ({ ...prev, phone: v }))}
            style={styles.input}
            placeholder="Phone number"
            keyboardType="phone-pad"
          />

          <View style={styles.doubleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Role</Text>
              <TextInput
                value={editing.role}
                onChangeText={(v) =>
                  setEditing((prev) => ({ ...prev, role: String(v || "").toUpperCase() }))
                }
                style={styles.input}
                placeholder="ADMIN or MEMBER"
                autoCapitalize="characters"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Status</Text>
              <TextInput
                value={editing.status}
                onChangeText={(v) =>
                  setEditing((prev) => ({ ...prev, status: String(v || "").toUpperCase() }))
                }
                style={styles.input}
                placeholder="ACTIVE / INACTIVE"
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.footerActions}>
            <Pressable
              onPress={cancelEdit}
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={saveEdit}
              disabled={loading}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed, loading && { opacity: 0.7 }]}
            >
              <Text style={styles.primaryBtnText}>{loading ? "Saving..." : "Save Member"}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    padding: 14,
    gap: 12,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#64748B",
  },
  title: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: "900",
    color: "#0B1220",
  },
  sub: {
    marginTop: 4,
    color: "#5B667A",
    fontWeight: "600",
  },
  topRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    padding: 10,
  },
  badgeLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeValue: {
    marginTop: 3,
    color: "#0B1220",
    fontWeight: "900",
  },
  refreshBtn: {
    height: 44,
    minWidth: 100,
    borderRadius: 14,
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  refreshBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
  },
  searchInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    fontWeight: "700",
  },
  loadingRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#475569",
    fontWeight: "700",
  },
  emptyBox: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    padding: 12,
  },
  emptyTitle: {
    fontWeight: "800",
    color: "#0B1220",
  },
  emptySub: {
    marginTop: 4,
    color: "#64748B",
    fontWeight: "600",
  },
  memberRow: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    padding: 12,
    flexDirection: "row",
    gap: 10,
  },
  memberRowSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#F8FBFF",
  },
  memberName: {
    fontWeight: "900",
    color: "#0B1220",
    fontSize: 15,
  },
  memberMeta: {
    marginTop: 3,
    color: "#5B667A",
    fontWeight: "600",
    fontSize: 12,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  pillActive: {
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    color: "#166534",
  },
  pillInactive: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    color: "#991B1B",
  },
  actionsCol: {
    justifyContent: "center",
    gap: 8,
  },
  smallBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  smallBtnText: {
    fontWeight: "800",
    color: "#0B1220",
  },
  smallBtnDanger: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  smallBtnDangerText: {
    fontWeight: "800",
    color: "#991B1B",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0B1220",
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    fontWeight: "800",
    color: "#0B1220",
  },
  input: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    fontWeight: "700",
  },
  doubleRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  footerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  secondaryBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryBtnText: {
    color: "#0B1220",
    fontWeight: "800",
  },
  primaryBtn: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  btnPressed: {
    opacity: 0.85,
  },
});