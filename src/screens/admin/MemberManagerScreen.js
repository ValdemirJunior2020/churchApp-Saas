// src/screens/admin/MemberManagerScreen.js
import React, { useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View, FlatList } from "react-native";
import { useAppData } from "../../context/AppDataContext";

function MemberCard({ member, onDelete, onEdit }) {
  return (
    <View style={styles.memberCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberMeta}>Phone: {member.phone}</Text>
        <Text style={styles.memberMeta}>Role: {member.role}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.editBtn} onPress={() => onEdit(member)}>
          <Text style={styles.editBtnText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.deleteBtn} onPress={() => onDelete(member)}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function MemberManagerScreen() {
  const { members, deleteMember, updateMember } = useAppData();

  const [editing, setEditing] = useState(null); // member
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const data = useMemo(() => members, [members]);

  function confirmDelete(member) {
    Alert.alert("Delete Member?", `${member.name} (${member.phone})`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMember(member.id);
          } catch (e) {
            Alert.alert("Error", e?.message || "Could not delete.");
          }
        },
      },
    ]);
  }

  function openEdit(member) {
    setEditing(member);
    setEditName(member.name || "");
    setEditPhone(member.phone || "");
    setEditPassword(member.password || "");
  }

  async function saveEdit() {
    try {
      if (!editing) return;
      await updateMember(editing.id, {
        name: editName,
        phone: editPhone,
        password: editPassword,
      });
      setEditing(null);
    } catch (e) {
      Alert.alert("Error", e?.message || "Could not update.");
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.glassHeader}>
        <Text style={styles.kicker}>ADMIN</Text>
        <Text style={styles.title}>Manage Members</Text>
        <Text style={styles.sub}>Edit or delete locally registered members.</Text>
      </View>

      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        data={data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No members yet</Text>
            <Text style={styles.emptySub}>Create a Member account from the Login screen.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <MemberCard member={item} onDelete={confirmDelete} onEdit={openEdit} />
        )}
      />

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Member</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput value={editName} onChangeText={setEditName} style={styles.input} placeholder="Name" placeholderTextColor="#8b95a7" />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <TextInput value={editPhone} onChangeText={setEditPhone} style={styles.input} placeholder="Phone" placeholderTextColor="#8b95a7" keyboardType="phone-pad" />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput value={editPassword} onChangeText={setEditPassword} style={styles.input} placeholder="Password" placeholderTextColor="#8b95a7" secureTextEntry />
            </View>

            <View style={styles.modalRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setEditing(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  glassHeader: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
  },
  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b", textAlign: "center" },
  title: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  sub: { marginTop: 6, fontSize: 13, color: "#586174", textAlign: "center" },

  memberCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    marginBottom: 12,
  },
  memberName: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
  memberMeta: { marginTop: 3, fontSize: 12, color: "#586174" },
  actions: { gap: 8 },
  editBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(37, 99, 235, 0.10)",
  },
  editBtnText: { color: "#1d4ed8", fontWeight: "900", fontSize: 12 },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(239, 68, 68, 0.10)",
  },
  deleteBtnText: { color: "#b91c1c", fontWeight: "900", fontSize: 12 },

  empty: { paddingTop: 36, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
  emptySub: { marginTop: 6, fontSize: 13, color: "#586174", textAlign: "center", paddingHorizontal: 24 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center", padding: 18 },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  field: { marginTop: 12 },
  label: { fontSize: 12, fontWeight: "900", color: "#0f172a", marginBottom: 6 },
  input: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    color: "#0f172a",
  },
  modalRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, height: 46, borderRadius: 16, backgroundColor: "rgba(15, 23, 42, 0.06)", alignItems: "center", justifyContent: "center" },
  cancelBtnText: { fontWeight: "900", color: "#0f172a" },
  saveBtn: { flex: 1, height: 46, borderRadius: 16, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontWeight: "900", color: "#fff" },
});
