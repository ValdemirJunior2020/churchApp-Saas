// File: src/screens/admin/AdminEventsScreen.js (CREATE)
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppData } from "../../context/AppDataContext";

function isValidDateYYYYMMDD(v) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(v || "").trim());
}

export default function AdminEventsScreen() {
  const { events, refreshEvents, upsertEvent, deleteEvent } = useAppData();

  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    refreshEvents().catch(() => {});
  }, [refreshEvents]);

  const sorted = useMemo(() => {
    const arr = Array.isArray(events) ? [...events] : [];
    arr.sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
    return arr;
  }, [events]);

  function resetForm() {
    setEditingId("");
    setTitle("");
    setDate("");
    setLocation("");
    setDescription("");
  }

  function startEdit(e) {
    setEditingId(e.id);
    setTitle(e.title || "");
    setDate(e.date || "");
    setLocation(e.location || "");
    setDescription(e.description || "");
  }

  async function onSave() {
    const t = String(title || "").trim();
    const d = String(date || "").trim();

    if (!t) return Alert.alert("Missing title", "Please add an event title.");
    if (!isValidDateYYYYMMDD(d)) {
      return Alert.alert("Invalid date", "Use YYYY-MM-DD (example: 2026-03-15).");
    }

    try {
      setBusy(true);
      await upsertEvent({
        id: editingId || undefined,
        title: t,
        date: d,
        location,
        description,
      });
      resetForm();
      Alert.alert("Saved", "Event saved successfully.");
    } catch (e) {
      Alert.alert("Save failed", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  function onDelete(e) {
    Alert.alert("Delete event?", `${e.title || "Event"} (${e.date || ""})`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setBusy(true);
            await deleteEvent({ id: e.id });
          } catch (err) {
            Alert.alert("Delete failed", String(err?.message || err));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Events (Admin)</Text>
      <Text style={styles.sub}>Create, edit, and delete events for your church.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{editingId ? "Edit Event" : "Create Event"}</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title (ex: Sunday Service)"
          style={styles.input}
        />

        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="Date (YYYY-MM-DD)"
          style={styles.input}
        />

        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Location (optional)"
          style={styles.input}
        />

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          style={[styles.input, { height: 90, paddingTop: 12 }]}
          multiline
        />

        <View style={styles.row}>
          <Pressable
            onPress={onSave}
            disabled={busy}
            style={[styles.primary, busy && { opacity: 0.7 }]}
          >
            <Text style={styles.primaryText}>{busy ? "Saving..." : editingId ? "Update" : "Create"}</Text>
          </Pressable>

          <Pressable onPress={resetForm} disabled={busy} style={styles.secondary}>
            <Text style={styles.secondaryText}>Clear</Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.label, { marginTop: 14 }]}>Upcoming Events</Text>

      {sorted.length ? (
        sorted.map((e) => (
          <View key={e.id} style={styles.eventCard}>
            <Text style={styles.eventTitle}>{e.title || "Event"}</Text>
            <Text style={styles.eventMeta}>
              {e.date || ""}{e.location ? ` • ${e.location}` : ""}
            </Text>

            {!!e.description && <Text style={styles.eventDesc}>{e.description}</Text>}

            <View style={styles.row2}>
              <Pressable onPress={() => startEdit(e)} style={styles.smallBtn} disabled={busy}>
                <Text style={styles.smallBtnText}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => onDelete(e)} style={styles.deleteBtn} disabled={busy}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No events yet.</Text>
          <Text style={styles.emptySub}>Create your first event above.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 6, color: "#586174", fontWeight: "700" },

  card: {
    marginTop: 12,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  label: { fontWeight: "900", color: "#0f172a" },
  input: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "#F2F4F8",
    marginTop: 10,
    fontWeight: "800",
  },
  row: { marginTop: 12, flexDirection: "row", gap: 10 },
  primary: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  primaryText: { color: "white", fontWeight: "900" },
  secondary: {
    width: 90,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.08)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
  },
  secondaryText: { color: "#0f172a", fontWeight: "900" },

  eventCard: {
    marginTop: 12,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  eventTitle: { fontWeight: "900", color: "#0f172a", fontSize: 16 },
  eventMeta: { marginTop: 6, color: "#586174", fontWeight: "800" },
  eventDesc: { marginTop: 10, color: "#0f172a", fontWeight: "600", lineHeight: 18 },

  row2: { marginTop: 12, flexDirection: "row", gap: 10 },
  smallBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37,99,235,0.12)",
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.25)",
  },
  smallBtnText: { color: "#2563eb", fontWeight: "900" },
  deleteBtn: {
    width: 90,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(180,35,24,0.08)",
    borderWidth: 1,
    borderColor: "rgba(180,35,24,0.25)",
  },
  deleteText: { color: "#b42318", fontWeight: "900" },

  empty: {
    marginTop: 12,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  emptyText: { fontWeight: "900", color: "#0f172a" },
  emptySub: { marginTop: 6, color: "#586174", fontWeight: "700" },
});