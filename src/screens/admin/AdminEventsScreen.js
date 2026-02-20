// src/screens/admin/AdminEventsScreen.js
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

function Field({ label, value, onChangeText, placeholder, multiline }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(15,23,42,0.45)"
        autoCapitalize="none"
        multiline={!!multiline}
        style={[styles.input, multiline && { height: 110, paddingTop: 12 }]}
      />
    </View>
  );
}

function formatDate(dateTimeISO) {
  const s = String(dateTimeISO || "").trim();
  if (!s) return "";
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleString();
  } catch {
    return s;
  }
}

export default function AdminEventsScreen() {
  const { events, upsertEvent, deleteEvent, refreshEvents } = useAppData();

  const list = useMemo(() => {
    const arr = Array.isArray(events) ? events : [];
    return arr.slice().sort((a, b) => (a.dateTimeISO || "").localeCompare(b.dateTimeISO || ""));
  }, [events]);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    eventId: "",
    title: "",
    dateTimeISO: "",
    location: "",
    description: "",
    isActive: true,
  });

  function newEvent() {
    setDraft({
      eventId: "",
      title: "",
      dateTimeISO: "",
      location: "",
      description: "",
      isActive: true,
    });
    setOpen(true);
  }

  function editEvent(e) {
    setDraft({
      eventId: e.eventId || "",
      title: e.title || "",
      dateTimeISO: e.dateTimeISO || "",
      location: e.location || "",
      description: e.description || "",
      isActive: e.isActive !== false,
    });
    setOpen(true);
  }

  async function onSave() {
    try {
      await upsertEvent(draft);
      setOpen(false);
      Alert.alert("Saved ✅", "Event saved to Google Sheets.");
    } catch (err) {
      Alert.alert("Error", String(err?.message || err));
    }
  }

  async function onDelete(e) {
    Alert.alert("Delete event?", e.title || "This event", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(e.eventId);
            Alert.alert("Deleted", "Event removed.");
          } catch (err) {
            Alert.alert("Error", String(err?.message || err));
          }
        },
      },
    ]);
  }

  async function onRefresh() {
    try {
      await refreshEvents();
      Alert.alert("Updated", "Latest events loaded.");
    } catch {
      Alert.alert("Offline", "Could not reach Google Sheet right now.");
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <GlassCard>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>ADMIN</Text>
            <Text style={styles.title}>Events Manager</Text>
            <Text style={styles.sub}>Create, edit, delete events (saved in Google Sheets).</Text>
          </View>

          <Pressable style={styles.iconBtn} onPress={onRefresh}>
            <Ionicons name="refresh" size={18} color="#0f172a" />
          </Pressable>

          <Pressable style={styles.iconBtn} onPress={newEvent}>
            <Ionicons name="add" size={20} color="#0f172a" />
          </Pressable>
        </View>

        {list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={28} color="#0f172a" />
            <Text style={styles.emptyText}>No events yet. Tap + to create one.</Text>
          </View>
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            {list.map((e) => (
              <View key={e.eventId} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{e.title}</Text>
                  {!!e.dateTimeISO && <Text style={styles.rowSub}>{formatDate(e.dateTimeISO)}</Text>}
                  {!!e.location && <Text style={styles.rowSub}>{e.location}</Text>}
                </View>

                <Pressable style={styles.smallBtn} onPress={() => editEvent(e)}>
                  <Ionicons name="create-outline" size={18} color="#0f172a" />
                </Pressable>

                <Pressable style={styles.smallBtnDanger} onPress={() => onDelete(e)}>
                  <Ionicons name="trash-outline" size={18} color="#0f172a" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </GlassCard>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>{draft.eventId ? "Edit Event" : "New Event"}</Text>
            <Text style={styles.modalSub}>
              Date format example: 2026-02-25T19:00:00
            </Text>

            <Field label="Title" value={draft.title} onChangeText={(t) => setDraft((p) => ({ ...p, title: t }))} placeholder="Sunday Service" />
            <Field label="Date / Time (ISO)" value={draft.dateTimeISO} onChangeText={(t) => setDraft((p) => ({ ...p, dateTimeISO: t }))} placeholder="2026-02-25T19:00:00" />
            <Field label="Location" value={draft.location} onChangeText={(t) => setDraft((p) => ({ ...p, location: t }))} placeholder="1915 N A St, Lake Worth Beach, FL" />
            <Field label="Description" value={draft.description} onChangeText={(t) => setDraft((p) => ({ ...p, description: t }))} placeholder="Details..." multiline />

            <Pressable
              style={[styles.toggle, draft.isActive ? styles.toggleOn : styles.toggleOff]}
              onPress={() => setDraft((p) => ({ ...p, isActive: !p.isActive }))}
            >
              <Ionicons name={draft.isActive ? "checkmark-circle" : "close-circle"} size={18} color="#0f172a" />
              <Text style={styles.toggleText}>{draft.isActive ? "Active" : "Inactive"}</Text>
            </Pressable>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable style={styles.cancelBtn} onPress={() => setOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={onSave}>
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

  headerRow: { flexDirection: "row", gap: 10, alignItems: "center" },

  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b" },
  title: { marginTop: 6, fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 6, fontSize: 13, color: "#586174" },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 24, gap: 8 },
  emptyText: { color: "#586174", fontWeight: "800", textAlign: "center" },

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
  rowTitle: { fontWeight: "900", color: "#0f172a", fontSize: 14 },
  rowSub: { marginTop: 4, color: "#586174", fontWeight: "700", fontSize: 12 },

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

  toggle: {
    marginTop: 12,
    height: 46,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  toggleOn: { backgroundColor: "rgba(34,197,94,0.10)", borderColor: "rgba(34,197,94,0.25)" },
  toggleOff: { backgroundColor: "rgba(255,99,132,0.10)", borderColor: "rgba(255,99,132,0.25)" },
  toggleText: { fontWeight: "900", color: "#0f172a" },

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