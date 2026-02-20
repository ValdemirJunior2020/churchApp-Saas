// src/screens/admin/MemberManagerScreen.js
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppData } from "../../context/AppDataContext";

function GlassCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function Field({ label, value, onChangeText, placeholder, secureTextEntry }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(15,23,42,0.45)"
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

export default function MemberManagerScreen() {
  const { members, deleteMember, updateMember, refreshMembers } = useAppData();

  const [editing, setEditing] = useState(null);

  const list = useMemo(() => {
    return (Array.isArray(members) ? members : []).slice().sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [members]);

  async function onDelete(m) {
    Alert.alert("Delete member?", `${m.name} (${m.phone})`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMember(m.memberId);
            Alert.alert("Deleted", "Member removed.");
          } catch (err) {
            Alert.alert("Error", String(err?.message || err));
          }
        },
      },
    ]);
  }

  async function onSaveEdit() {
    try {
      const m = editing;
      if (!m) return;

      await updateMember(m.memberId, {
        name: String(m.name || "").trim(),
        phone: String(m.phone || "").trim(),
        email: String(m.email || "").trim(),
        password: String(m.password || ""),
        role: String(m.role || "MEMBER").toUpperCase(),
        isActive: true,
      });

      setEditing(null);
      Alert.alert("Saved", "Member updated.");
      await refreshMembers();
    } catch (err) {
      Alert.alert("Error", String(err?.message || err));
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <GlassCard>
        <Text style={styles.kicker}>ADMIN</Text>
        <Text style={styles.title}>Member Manager</Text>
        <Text style={styles.sub}>View, edit, or delete signed-up members.</Text>

        {list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={28} color="#0f172a" />
            <Text style={styles.emptyText}>No members yet.</Text>
          </View>
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            {list.map((m) => (
              <View key={m.memberId} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{m.name}</Text>
                  <Text style={styles.rowSub}>
                    {m.phone} {m.email ? `• ${m.email}` : ""} • {m.role}
                  </Text>
                </View>

                <Pressable style={styles.smallBtn} onPress={() => setEditing({ ...m })}>
                  <Ionicons name="create-outline" size={18} color="#0f172a" />
                </Pressable>

                <Pressable style={styles.smallBtnDanger} onPress={() => onDelete(m)}>
                  <Ionicons name="trash-outline" size={18} color="#0f172a" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </GlassCard>

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <Pressable style={styles.overlay} onPress={() => setEditing(null)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>Edit Member</Text>
            <Text style={styles.modalSub}>Update details and save.</Text>

            <Field label="Name" value={editing?.name || ""} onChangeText={(t) => setEditing((p) => ({ ...p, name: t }))} placeholder="Name" />
            <Field label="Phone" value={editing?.phone || ""} onChangeText={(t) => setEditing((p) => ({ ...p, phone: t }))} placeholder="Phone" />
            <Field label="Email" value={editing?.email || ""} onChangeText={(t) => setEditing((p) => ({ ...p, email: t }))} placeholder="Email" />
            <Field label="Role (MEMBER/LEADER)" value={editing?.role || ""} onChangeText={(t) => setEditing((p) => ({ ...p, role: t }))} placeholder="MEMBER" />
            <Field label="Password" value={editing?.password || ""} onChangeText={(t) => setEditing((p) => ({ ...p, password: t }))} placeholder="Password" secureTextEntry />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable style={styles.cancelBtn} onPress={() => setEditing(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={onSaveEdit}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  container: { padding: 16, paddingBottom: 28 },

  card: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    borderRadius: 24,
    padding: 16,
  },

  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b", textAlign: "center" },
  title: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  sub: { marginTop: 6, fontSize: 13, color: "#586174", textAlign: "center" },

  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 22, gap: 8 },
  emptyText: { color: "#586174", fontWeight: "800" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  rowTitle: { fontWeight: "900", color: "#0f172a" },
  rowSub: { marginTop: 2, color: "#586174", fontWeight: "700", fontSize: 12 },

  smallBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnDanger: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 99, 132, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 99, 132, 0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", padding: 16, justifyContent: "center" },
  modal: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  modalSub: { marginTop: 4, fontSize: 12, color: "#586174" },

  label: { fontSize: 12, fontWeight: "900", color: "#0f172a", marginBottom: 6 },
  input: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    color: "#0f172a",
    fontWeight: "700",
  },

  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  cancelText: { fontWeight: "900", color: "#0f172a" },

  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { fontWeight: "900", color: "white" },
});