// File: src/screens/member/EventsScreen.js (REPLACE)

import React, { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppData } from "../../context/AppDataContext";

export default function EventsScreen() {
  const appData = useAppData();

  // ✅ Support multiple shapes while wiring AppDataContext
  const config = appData?.config || appData?.churchConfig || {};
  const rawEvents =
    appData?.events ||
    config?.events ||
    [];

  const churchName = config?.churchName || "Church";

  const list = useMemo(() => {
    if (!Array.isArray(rawEvents)) return [];

    return rawEvents
      .map((e, idx) => ({
        id: e?.id || e?.eventId || `evt_${idx}`,
        title: String(e?.title || "Event").trim(),
        dateTimeISO: String(e?.dateTimeISO || e?.date || "").trim(),
        location: String(e?.location || "").trim(),
        description: String(e?.description || "").trim(),
        status: String(e?.status || "ACTIVE").toUpperCase(),
      }))
      .filter((e) => e.status !== "DELETED")
      .sort((a, b) => {
        const ta = Date.parse(a.dateTimeISO) || 0;
        const tb = Date.parse(b.dateTimeISO) || 0;
        return ta - tb;
      });
  }, [rawEvents]);

  const refreshEvents =
    typeof appData?.refreshEvents === "function"
      ? appData.refreshEvents
      : async () => {
          console.log("[EventsScreen] refreshEvents missing (safe fallback)");
        };

  async function handleRefresh() {
    try {
      console.log("[EventsScreen] Refresh clicked");
      await refreshEvents();
      console.log("[EventsScreen] Refresh done");
    } catch (e) {
      console.log("[EventsScreen] Refresh error:", e?.message || e);
      Alert.alert("Refresh failed", e?.message || "Could not refresh events.");
    }
  }

  function formatDate(iso) {
    if (!iso) return "";
    const t = Date.parse(iso);
    if (!t) return iso;
    try {
      return new Date(t).toLocaleString();
    } catch {
      return iso;
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.glass}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>EVENTS</Text>
            <Text style={styles.title}>{churchName} Events</Text>
            <Text style={styles.sub}>Loaded from Google Sheets.</Text>
          </View>

          <Pressable style={styles.refreshBtn} onPress={handleRefresh}>
            <Ionicons name="refresh" size={18} color="#0f172a" />
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>

        {/* Debug box (remove later) */}
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>Debug</Text>
          <Text style={styles.debugText}>
            rawEvents: {Array.isArray(rawEvents) ? rawEvents.length : 0} • normalized: {list.length}
          </Text>
        </View>

        {list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={28} color="#0f172a" />
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptySub}>
              Next we’ll add an Admin Events Manager to create events.
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            {list.map((e) => (
              <View key={e.id} style={styles.eventRow}>
                <Text style={styles.eventTitle}>{e.title}</Text>

                <Text style={styles.eventMeta}>
                  {e.dateTimeISO ? formatDate(e.dateTimeISO) : ""}{" "}
                  {e.location ? `• ${e.location}` : ""}
                </Text>

                {!!e.description && (
                  <Text style={styles.eventDesc}>{e.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb" },
  container: { padding: 16, paddingBottom: 28 },

  glass: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.10)",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  headerRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  kicker: { fontSize: 11, letterSpacing: 2.5, color: "#64748b" },
  title: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 6, fontSize: 13, color: "#586174" },

  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.04)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  refreshText: { fontWeight: "900", color: "#0f172a", fontSize: 12 },

  debugBox: {
    marginTop: 12,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    backgroundColor: "rgba(15,23,42,0.03)",
  },
  debugTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#475569",
    marginBottom: 4,
    letterSpacing: 1,
  },
  debugText: { fontSize: 12, color: "#64748b", fontWeight: "700" },

  empty: { marginTop: 18, alignItems: "center", gap: 8, paddingVertical: 20 },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
  emptySub: { fontSize: 13, color: "#586174", textAlign: "center", maxWidth: 320 },

  eventRow: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },
  eventTitle: { fontWeight: "900", color: "#0f172a", fontSize: 14 },
  eventMeta: { marginTop: 4, color: "#586174", fontWeight: "700", fontSize: 12 },
  eventDesc: { marginTop: 8, color: "#0f172a", fontWeight: "600", fontSize: 13 },
});