// REPLACE: src/screens/admin/MemberManagerScreen.js
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppData } from "../../context/AppDataContext";

export default function MemberManagerScreen() {
  const { members, refreshMembers, updateMember, deleteMember } = useAppData();
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    refreshMembers().catch(() => {});
  }, [refreshMembers]);

  async function toggleRole(m) {
    try {
      setBusyId(m.id);
      const next = String(m.role || "MEMBER").toUpperCase() === "ADMIN" ? "MEMBER" : "ADMIN";
      await updateMember({ id: m.id, role: next });
    } catch (e) {
      Alert.alert("Update failed", String(e?.message || e));
    } finally {
      setBusyId("");
    }
  }

  async function remove(m) {
    Alert.alert("Delete member?", `Delete ${m.email || m.name || "member"}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setBusyId(m.id);
            await deleteMember({ id: m.id });
          } catch (e) {
            Alert.alert("Delete failed", String(e?.message || e));
          } finally {
            setBusyId("");
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Members</Text>

      {members?.length ? (
        members.map((m) => (
          <View key={m.id} style={styles.card}>
            <Text style={styles.name}>{m.name || m.email || "Member"}</Text>
            <Text style={styles.meta}>{m.email || ""}</Text>
            <Text style={styles.meta}>Role: {String(m.role || "MEMBER").toUpperCase()}</Text>

            <View style={styles.row}>
              <Pressable style={styles.btn} disabled={busyId === m.id} onPress={() => toggleRole(m)}>
                <Text style={styles.btnText}>{busyId === m.id ? "..." : "Toggle Admin"}</Text>
              </Pressable>

              <Pressable style={styles.del} disabled={busyId === m.id} onPress={() => remove(m)}>
                <Text style={styles.delText}>{busyId === m.id ? "..." : "Delete"}</Text>
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No members yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  card: { marginTop: 12, backgroundColor: "white", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(15,23,42,0.10)" },
  name: { fontWeight: "900", color: "#0f172a", fontSize: 16 },
  meta: { marginTop: 6, color: "#586174", fontWeight: "700" },
  row: { marginTop: 12, flexDirection: "row", gap: 10 },
  btn: { flex: 1, height: 44, borderRadius: 14, backgroundColor: "rgba(15,23,42,0.08)", borderWidth: 1, borderColor: "rgba(15,23,42,0.12)", alignItems: "center", justifyContent: "center" },
  btnText: { fontWeight: "900", color: "#0f172a" },
  del: { width: 90, height: 44, borderRadius: 14, backgroundColor: "rgba(180,35,24,0.08)", borderWidth: 1, borderColor: "rgba(180,35,24,0.25)", alignItems: "center", justifyContent: "center" },
  delText: { fontWeight: "900", color: "#b42318" },
  empty: { marginTop: 12, backgroundColor: "white", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(15,23,42,0.10)" },
  emptyText: { fontWeight: "900", color: "#0f172a" },
});