import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";
import { gasPost, gasGet } from "../../api/gasClient";

function normalizeDonations(input) {
  if (!Array.isArray(input)) return [];
  return input.map((d, i) => ({
    id: d?.id || "",
    label: d?.label || "",
    url: d?.url || "",
    type: d?.type || d?.label || "PAYPAL",
    sortOrder: Number(d?.sortOrder ?? i + 1),
    status: d?.status || "ACTIVE",
  }));
}

export default function AdminSettingsScreen() {
  const { tenant } = useAuth();
  const { churchSettings, donationLinks, loadChurchData, saveSettings, saveDonationLinks } = useAppData();

  const churchCode = tenant?.churchCode || tenant?.inviteCode || "";

  const [saving, setSaving] = useState(false);
  const [debugText, setDebugText] = useState("");

  const [form, setForm] = useState({
    churchName: "",
    address: "",
    logoUrl: "",
    youtubeVideoId: "",
    themePrimary: "#0F172A",
    themeAccent: "#2563EB",
    plan: tenant?.planStatus || "TRIAL",
    status: tenant?.planStatus || "PENDING_PAYMENT",
  });

  const [donationDrafts, setDonationDrafts] = useState([
    { id: "", label: "PAYPAL", type: "PAYPAL", url: "", sortOrder: 1, status: "ACTIVE" },
  ]);

  const planLabel = useMemo(
    () => tenant?.planStatus || form.plan || "TRIAL",
    [tenant?.planStatus, form.plan]
  );

  function logDebug(...args) {
    const msg = args
      .map((x) => (typeof x === "string" ? x : JSON.stringify(x, null, 2)))
      .join(" ");
    console.log("[AdminSettingsScreen]", ...args);
    setDebugText(msg);
  }

  useEffect(() => {
    logDebug("Mounted", { churchCode, tenant });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!churchCode) return;

    (async () => {
      try {
        logDebug("Loading church data...", { churchCode });

        // Try context first
        if (typeof loadChurchData === "function") {
          await loadChurchData(churchCode);
          logDebug("loadChurchData() finished");
        } else {
          logDebug("loadChurchData() missing in AppDataContext");
        }

        // Fallback fetch (helps during debugging if context is stale)
        const res = await gasGet("church", { action: "get", churchCode });
        logDebug("GET church result", res);

        if (res?.ok && res?.church) {
          setForm((prev) => ({
            ...prev,
            churchName: res.church.churchName || prev.churchName || "",
            address: res.church.address || prev.address || "",
            logoUrl: res.church.logoUrl || prev.logoUrl || "",
            youtubeVideoId: res.church.youtubeVideoId || prev.youtubeVideoId || "",
            themePrimary: res.church.themePrimary || prev.themePrimary || "#0F172A",
            themeAccent: res.church.themeAccent || prev.themeAccent || "#2563EB",
            plan: res.church.plan || prev.plan || "TRIAL",
            status: res.church.status || prev.status || "PENDING_PAYMENT",
          }));
        }

        const dres = await gasGet("donations", { action: "list", churchCode });
        logDebug("GET donations result", dres);

        if (dres?.ok && Array.isArray(dres.items)) {
          const items = normalizeDonations(dres.items);
          setDonationDrafts(
            items.length
              ? items
              : [{ id: "", label: "PAYPAL", type: "PAYPAL", url: "", sortOrder: 1, status: "ACTIVE" }]
          );
        }
      } catch (err) {
        logDebug("Initial load error", String(err?.message || err));
      }
    })();
  }, [churchCode, loadChurchData]);

  useEffect(() => {
    if (!churchSettings) return;
    setForm((prev) => ({
      ...prev,
      churchName: churchSettings.churchName || prev.churchName || "",
      address: churchSettings.address || prev.address || "",
      logoUrl: churchSettings.logoUrl || prev.logoUrl || "",
      youtubeVideoId: churchSettings.youtubeVideoId || prev.youtubeVideoId || "",
      themePrimary: churchSettings.themePrimary || prev.themePrimary || "#0F172A",
      themeAccent: churchSettings.themeAccent || prev.themeAccent || "#2563EB",
      plan: churchSettings.plan || prev.plan || prev.plan,
      status: churchSettings.status || prev.status || prev.status,
    }));
  }, [churchSettings]);

  useEffect(() => {
    if (!donationLinks) return;
    const items = normalizeDonations(donationLinks);
    if (items.length) setDonationDrafts(items);
  }, [donationLinks]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setDonationField = (index, key, value) => {
    setDonationDrafts((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  };

  const addDonationRow = () => {
    setDonationDrafts((prev) => [
      ...prev,
      {
        id: "",
        label: "PAYPAL",
        type: "PAYPAL",
        url: "",
        sortOrder: prev.length + 1,
        status: "ACTIVE",
      },
    ]);
  };

  async function onSave() {
    console.log("✅ SAVE BUTTON PRESSED");
    logDebug("Save clicked", {
      churchCode,
      form,
      donationDraftsCount: donationDrafts.length,
      hasContextSaveSettings: typeof saveSettings === "function",
      hasContextSaveDonationLinks: typeof saveDonationLinks === "function",
    });

    if (!churchCode) {
      Alert.alert("Missing church code", "No church code found in session.");
      return;
    }

    setSaving(true);

    try {
      const churchPayload = {
        churchCode,
        churchName: form.churchName?.trim(),
        address: form.address?.trim(),
        logoUrl: form.logoUrl?.trim(),
        youtubeVideoId: form.youtubeVideoId?.trim(),
        themePrimary: form.themePrimary?.trim(),
        themeAccent: form.themeAccent?.trim(),
        plan: form.plan || "TRIAL",
        status: form.status || "PENDING_PAYMENT",
      };

      const cleanDonationItems = donationDrafts
        .map((d, i) => ({
          id: d.id || "",
          label: (d.label || d.type || "PAYPAL").trim(),
          url: (d.url || "").trim(),
          sortOrder: i + 1,
          status: d.status || "ACTIVE",
        }))
        .filter((d) => d.label || d.url);

      logDebug("Church payload", churchPayload);
      logDebug("Donation payload", { churchCode, items: cleanDonationItems });

      // 1) Save church settings (context first, fallback direct API)
      let churchRes = null;
      if (typeof saveSettings === "function") {
        try {
          churchRes = await saveSettings(churchPayload);
          logDebug("saveSettings() context response", churchRes);
        } catch (ctxErr) {
          logDebug("saveSettings() context error", String(ctxErr?.message || ctxErr));
        }
      }

      if (!churchRes || churchRes?.ok === false) {
        churchRes = await gasPost("church", churchPayload, { action: "save" });
        logDebug("gasPost church response", churchRes);
      }

      if (churchRes?.ok === false) {
        throw new Error(churchRes?.error || "Failed to save church settings");
      }

      // 2) Save donation links (optional; skip if all empty)
      let donationRes = { ok: true };
      if (cleanDonationItems.length) {
        if (typeof saveDonationLinks === "function") {
          try {
            donationRes = await saveDonationLinks(churchCode, cleanDonationItems);
            logDebug("saveDonationLinks() context response", donationRes);
          } catch (ctxErr) {
            logDebug("saveDonationLinks() context error", String(ctxErr?.message || ctxErr));
            donationRes = null;
          }
        }

        if (!donationRes || donationRes?.ok === false) {
          donationRes = await gasPost(
            "donations",
            { churchCode, items: cleanDonationItems },
            { action: "save" }
          );
          logDebug("gasPost donations response", donationRes);
        }

        if (donationRes?.ok === false) {
          throw new Error(donationRes?.error || "Failed to save donation links");
        }
      }

      Alert.alert("Saved ✅", "Church settings saved successfully.");
      logDebug("Save completed successfully");
    } catch (err) {
      const msg = String(err?.message || err);
      logDebug("Save failed", msg);
      Alert.alert("Save failed", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.kicker}>PASTOR SETTINGS</Text>
              <Text style={styles.title}>Branding & Giving</Text>
              <Text style={styles.sub}>These save directly into your Google Sheet.</Text>
            </View>

            <Pressable
              onPress={async () => {
                try {
                  logDebug("Refresh clicked", { churchCode });
                  if (churchCode && typeof loadChurchData === "function") {
                    await loadChurchData(churchCode);
                    logDebug("Refresh success");
                  } else {
                    logDebug("Refresh skipped", {
                      churchCode,
                      hasLoadChurchData: typeof loadChurchData === "function",
                    });
                  }
                } catch (e) {
                  logDebug("Refresh error", String(e?.message || e));
                }
              }}
              style={styles.refreshBtn}
            >
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          </View>

          <View style={styles.twoCol}>
            <View style={styles.box}>
              <Text style={styles.boxLabel}>Church Code</Text>
              <Text style={styles.boxValue}>{churchCode || "—"}</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxLabel}>Plan</Text>
              <Text style={styles.boxValue}>{planLabel || "—"}</Text>
            </View>
          </View>

          <Text style={styles.label}>Church Name</Text>
          <TextInput
            value={form.churchName}
            onChangeText={(v) => setField("churchName", v)}
            placeholder="Church Name"
            style={styles.input}
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            value={form.address}
            onChangeText={(v) => setField("address", v)}
            placeholder="Street, City, State"
            style={styles.input}
          />

          <Text style={styles.label}>Logo URL</Text>
          <TextInput
            value={form.logoUrl}
            onChangeText={(v) => setField("logoUrl", v)}
            placeholder="https://..."
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>YouTube Video ID</Text>
          <TextInput
            value={form.youtubeVideoId}
            onChangeText={(v) => setField("youtubeVideoId", v)}
            placeholder="dQw4w9WgXcQ"
            autoCapitalize="none"
            style={styles.input}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Theme Primary</Text>
              <TextInput
                value={form.themePrimary}
                onChangeText={(v) => setField("themePrimary", v)}
                placeholder="#0F172A"
                autoCapitalize="characters"
                style={styles.input}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Theme Accent</Text>
              <TextInput
                value={form.themeAccent}
                onChangeText={(v) => setField("themeAccent", v)}
                placeholder="#2563EB"
                autoCapitalize="characters"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.hr} />

          <Text style={styles.sectionTitle}>Donation Buttons</Text>

          {donationDrafts.map((row, idx) => (
            <View key={idx} style={{ marginBottom: 10 }}>
              <View style={styles.row}>
                <View style={{ flex: 2 }}>
                  <TextInput
                    value={row.label}
                    onChangeText={(v) => setDonationField(idx, "label", v)}
                    placeholder="Label (PayPal / Cash App)"
                    style={styles.input}
                  />
                </View>
                <View style={{ width: 10 }} />
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={row.type}
                    onChangeText={(v) => setDonationField(idx, "type", v)}
                    placeholder="PAYPAL"
                    autoCapitalize="characters"
                    style={styles.input}
                  />
                </View>
              </View>

              <TextInput
                value={row.url}
                onChangeText={(v) => setDonationField(idx, "url", v)}
                placeholder="https://..."
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          ))}

          <Pressable onPress={addDonationRow} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add Donation Button</Text>
          </Pressable>

          {donationDrafts.every((d) => !String(d.url || "").trim()) && (
            <Text style={styles.emptyText}>No donation links yet.</Text>
          )}

          <Pressable
            onPress={onSave}
            disabled={saving}
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          >
            <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Settings"}</Text>
          </Pressable>

          {/* Debug box (shows on web + mobile) */}
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>Debug</Text>
            <Text selectable style={styles.debugText}>
              {debugText || "No logs yet. Tap Save Settings."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7FB" },
  wrap: { padding: 12, paddingBottom: 24 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6EAF2",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    color: "#63708A",
    letterSpacing: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0B1220",
    marginTop: 2,
  },
  sub: {
    marginTop: 4,
    color: "#5B667A",
    fontWeight: "600",
    fontSize: 12,
  },
  refreshBtn: {
    borderWidth: 1,
    borderColor: "#D8DFEA",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshText: { fontWeight: "800", color: "#0B1220" },

  twoCol: { flexDirection: "row", gap: 10, marginBottom: 8 },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D8DFEA",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
  },
  boxLabel: { color: "#63708A", fontSize: 11, fontWeight: "800" },
  boxValue: { color: "#0B1220", fontWeight: "900", marginTop: 2 },

  label: {
    marginTop: 8,
    marginBottom: 4,
    color: "#0B1220",
    fontWeight: "800",
    fontSize: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D8DFEA",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    fontWeight: "700",
    color: "#0B1220",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  hr: {
    height: 1,
    backgroundColor: "#E9EDF4",
    marginVertical: 10,
  },
  sectionTitle: {
    color: "#0B1220",
    fontWeight: "900",
    marginBottom: 8,
  },
  addBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8DFEA",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  addBtnText: {
    color: "#0B1220",
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 10,
    color: "#63708A",
    fontWeight: "700",
  },
  saveBtn: {
    marginTop: 14,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#0B1736",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
  debugBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#D8DFEA",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
  },
  debugTitle: {
    fontWeight: "900",
    color: "#0B1220",
    marginBottom: 6,
  },
  debugText: {
    color: "#334155",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});