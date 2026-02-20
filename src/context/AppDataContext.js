// src/context/AppDataContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GAS_URL } from "../config";

const AppDataContext = createContext(null);

const STORAGE_KEYS = {
  TENANT: "@church_saas_tenant_v1",
  CONFIG: "@church_saas_config_v1",
  MEMBERS: "@church_saas_members_v1",
};

const DEFAULT_CONFIG = {
  churchName: "Congregate",
  address: "",
  logoUrl: "",
  youtubeId: "",
  donationLinks: [],
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

async function callApi({ resource, action, method = "GET", params = {}, body }) {
  if (!GAS_URL || !String(GAS_URL).includes("/macros/s/") || !String(GAS_URL).includes("/exec")) {
    throw new Error("GAS_URL not set (local mode).");
  }

  const url = new URL(GAS_URL);
  url.searchParams.set("resource", resource);
  url.searchParams.set("action", action);

  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) url.searchParams.set(k, String(v));
  });

  const init = method === "POST" ? { method: "POST", body: JSON.stringify(body || {}) } : { method: "GET" };

  const res = await fetch(url.toString(), init);
  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid JSON from GAS");
  }

  if (!json.ok) throw new Error(json.error || "GAS request failed");
  return json.data;
}

export function AppDataProvider({ children }) {
  const [tenantCode, setTenantCodeState] = useState("");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [members, setMembers] = useState([]);
  const [ready, setReady] = useState(false);

  const apiEnabled = useMemo(() => !!GAS_URL && String(GAS_URL).includes("/exec"), []);

  async function loadLocal() {
    const [t, c, m] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TENANT),
      AsyncStorage.getItem(STORAGE_KEYS.CONFIG),
      AsyncStorage.getItem(STORAGE_KEYS.MEMBERS),
    ]);

    if (t) setTenantCodeState(t);
    if (c) setConfig(JSON.parse(c));
    if (m) setMembers(JSON.parse(m));
  }

  async function saveLocal(nextTenant, nextConfig, nextMembers) {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.TENANT, nextTenant || ""),
      AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(nextConfig)),
      AsyncStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(nextMembers)),
    ]);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadLocal();
        // (optional) later: fetch tenant bootstrap from GAS here
      } finally {
        setReady(true);
      }
    })();
  }, []);

  async function setTenantCode(code) {
    const next = String(code || "").trim().toUpperCase();
    setTenantCodeState(next);
    await saveLocal(next, config, members);

    if (apiEnabled) {
      try {
        await callApi({ resource: "tenant", action: "select", method: "POST", body: { tenantCode: next } });
      } catch {}
    }
  }

  async function updateConfig(patch) {
    const next = { ...config, ...patch };
    setConfig(next);
    await saveLocal(tenantCode, next, members);

    if (apiEnabled) {
      try {
        await callApi({ resource: "config", action: "set", method: "POST", body: { tenantCode, config: next } });
      } catch {}
    }
  }

  async function addDonationLink({ type, label, url }) {
    const nextLinks = [...(config.donationLinks || []), { id: uid(), type, label: label || type, url }];
    await updateConfig({ donationLinks: nextLinks });
  }

  async function removeDonationLink(id) {
    const nextLinks = (config.donationLinks || []).filter((x) => x.id !== id);
    await updateConfig({ donationLinks: nextLinks });
  }

  async function addMember(member) {
    const nextMembers = [...members, member];
    setMembers(nextMembers);
    await saveLocal(tenantCode, config, nextMembers);

    if (apiEnabled) {
      try {
        await callApi({ resource: "users", action: "create", method: "POST", body: { tenantCode, user: member } });
      } catch {}
    }
  }

  async function updateMember(id, patch) {
    const nextMembers = members.map((m) => (m.id === id ? { ...m, ...patch } : m));
    setMembers(nextMembers);
    await saveLocal(tenantCode, config, nextMembers);

    if (apiEnabled) {
      try {
        await callApi({ resource: "users", action: "update", method: "POST", body: { tenantCode, id, patch } });
      } catch {}
    }
  }

  async function deleteMember(id) {
    const nextMembers = members.filter((m) => m.id !== id);
    setMembers(nextMembers);
    await saveLocal(tenantCode, config, nextMembers);

    if (apiEnabled) {
      try {
        await callApi({ resource: "users", action: "delete", method: "POST", body: { tenantCode, id } });
      } catch {}
    }
  }

  const value = useMemo(
    () => ({
      ready,
      apiEnabled,
      tenantCode,
      setTenantCode,
      config,
      members,
      updateConfig,
      addDonationLink,
      removeDonationLink,
      addMember,
      updateMember,
      deleteMember,
    }),
    [ready, apiEnabled, tenantCode, config, members]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}