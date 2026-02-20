// src/screens/admin/MemberManagerScreen.js  (REPLACE)
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppData } from "../../context/AppDataContext";

export default function MemberManagerScreen() {
  const { members, refreshMembers, updateMember, deleteMember } = useAppData();

  const [selected, setSelected] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("MEMBER");

  useEffect(() => {
    refreshMembers().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    const arr = Array.isArray(members) ? members : [];
    return arr
      .filter((u) => String(u.isActive).toUpperCase() !== "FALSE")
      .sort((a, b) => String(a.role || "").localeCompare(String(b.role || "")));
  }, [members]);

  function pick(u) {
    setSelected(u);
    setEditName(String(u.name || ""));
    setEditPhone(String(u.phone || ""));
    setEditRole(String(u.role || "MEMBER").toUpperCase());
  }

  async function onSave() {
    try {
      if (!selected) return;
      await updateMember({
        userId: selected.userId,
        name: editName,
        phone: editPhone,
        role: editRole,
      });
      Alert.alert("Saved", "Member updated.");
      setSelected(null);
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    }
  }

  async function onDelete(u) {
    try {
      await deleteMember(u.userId);
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>ADMIN</Text>
        <Text style={styles.title}>Members</Text>
        <Text style={styles.sub}>Manage members inside this church only.</Text>

        {selected ? (
          <View style={styles.editBox}>
            <Text style={styles.editTitle}>Edit Member</Text>
            <TextInput value={editName} onChangeText={setEditName} style={styles.input} placeholder="Name" />
            <TextInput value={editPhone} onChangeText={setEditPhone} style={styles.input} placeholder="Phone" />
            <TextInput value={editRole} onChangeText={setEditRole} style={styles.input} placeholder="Role (ADMIN/MEMBER)" autoCapitalize="characters" />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Pressable style={[styles.softBtn, { flex: 1 }]} onPress={() => setSelected(null)}>
                <Text style={styles.softText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.primary, { flex: 1 }]} onPress={onSave}>
                <Text style={styles.primaryText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={{ marginTop: 12, gap: 10 }}>
          {list.length === 0 ? (
            <Text style={styles.empty}>No members yet.</Text>
          ) : (
            list.map((u) => (
              <View key={u.userId} style={styles.row}>
                <Pressable style={{ flex: 1 }} onPress={() => pick(u)}>
                  <Text style={styles.name}>{u.name}</Text>
                  <Text style={styles.meta}>
                    {u.role} • {u.phone} {u.email ? `• ${u.email}` : ""}
                  </Text>
                </Pressable>
                <Pressable style={styles.delBtn} onPress={() => onDelete(u)}>
                  <Text style={styles.delText}>Delete</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Pressable style={styles.softBtn} onPress={() => refreshMembers()}>
          <Text style={styles.softText}>Refresh</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  container: { padding: 16, paddingBottom: 28 },
  card: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
    borderRadius: 26,
    padding: 16,
  },
  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b", fontWeight: "900" },
  title: { marginTop: 6, fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 6, fontSize: 13, color: "#586174", fontWeight: "700" },

  editBox: {
    marginTop: 12,
    borderRadius: 20,
    padding: 12,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  editTitle: { fontWeight: "900", color: "#0f172a" },
  input: {
    marginTop: 8,
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    color: "#0f172a",
    fontWeight: "800",
  },

  row: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    alignItems: "center",
  },
  name: { fontWeight: "900", color: "#0f172a" },
  meta: { marginTop: 2, color: "#64748b", fontWeight: "800", fontSize: 12 },

  delBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.10)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  delText: { color: "#b91c1c", fontWeight: "900" },

  empty: { marginTop: 10, color: "#64748b", fontWeight: "800" },

  softBtn: {
    marginTop: 14,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.08)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
  },
  softText: { color: "#0f172a", fontWeight: "900" },
  primary: {
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  primaryText: { color: "white", fontWeight: "900" },
});