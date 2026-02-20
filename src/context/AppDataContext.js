// src/context/AppDataContext.js  (REPLACE)
import React, { createContext, useContext, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GAS_URL } from "../config";

const AppDataContext = createContext(null);

const STORAGE_SESSION = "@church_saas_session_v2";

function nowISO() {
  return new Date().toISOString();
}

function isIsoInFuture(iso) {
  const s = String(iso || "").trim();
  if (!s) return false;
  const t = new Date(s).getTime();
  if (Number.isNaN(t)) return false;
  return t > Date.now();
}

async function callApi({ resource, action, method = "GET", params = {}, body }) {
  const url = new URL(GAS_URL);
  url.searchParams.set("resource", resource);
  url.searchParams.set("action", action);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid response");
  }
  if (!json.ok) throw new Error(json.error || "Request failed");
  return json.data;
}

export function AppDataProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [user, setUser] = useState(null);

  const [config, setConfig] = useState(null);
  const [donations, setDonations] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);

  const churchId = tenant?.churchId || null;

  const canUseApp = useMemo(() => {
    if (!tenant) return false;
    const status = String(tenant.planStatus || "").toUpperCase();
    if (status === "ACTIVE") return true;
    if (status === "TRIAL") return isIsoInFuture(tenant.trialEndsAt);
    return false;
  }, [tenant]);

  // ---- SESSION ----
  async function restoreSession() {
    const raw = await AsyncStorage.getItem(STORAGE_SESSION);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s?.tenant && s?.user) {
      setTenant(s.tenant);
      setUser(s.user);
      return s;
    }
    return null;
  }

  async function saveSession(nextTenant, nextUser) {
    setTenant(nextTenant);
    setUser(nextUser);
    await AsyncStorage.setItem(
      STORAGE_SESSION,
      JSON.stringify({ tenant: nextTenant, user: nextUser, savedAt: nowISO() })
    );
  }

  async function clearSession() {
    setTenant(null);
    setUser(null);
    setConfig(null);
    setDonations([]);
    setEvents([]);
    setMembers([]);
    await AsyncStorage.removeItem(STORAGE_SESSION);
  }

  // ---- AUTH / TENANT ----
  async function getTenantByInviteCode(inviteCode) {
    return callApi({
      resource: "tenants",
      action: "getByInviteCode",
      method: "GET",
      params: { inviteCode },
    });
  }

  async function createTenant({ churchName, ownerEmail }) {
    // 14-day trial by default
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    return callApi({
      resource: "tenants",
      action: "create",
      method: "POST",
      body: {
        churchName,
        ownerEmail,
        planName: "Standard",
        planPriceUSD: 45,
        planStatus: "TRIAL",
        trialEndsAt,
        billingProvider: "PAYPAL",
      },
    });
  }

  async function signupUser({ inviteCode, churchId, role, name, phone, email, password }) {
    return callApi({
      resource: "users",
      action: "signup",
      method: "POST",
      body: { inviteCode, churchId, role, name, phone, email, password },
    });
  }

  async function login({ inviteCode, identifier, password }) {
    const data = await callApi({
      resource: "users",
      action: "login",
      method: "POST",
      body: { inviteCode, identifier, password },
    });

    await saveSession(data.tenant, data.user);

    // Load church data right away
    await refreshChurchData(data.tenant.churchId);

    return data;
  }

  // ---- CHURCH DATA ----
  async function refreshChurchData(chId = churchId) {
    if (!chId) return;

    const [cfg, dons, evts] = await Promise.all([
      callApi({ resource: "config", action: "get", method: "GET", params: { churchId: chId } }),
      callApi({ resource: "donations", action: "list", method: "GET", params: { churchId: chId } }),
      callApi({ resource: "events", action: "list", method: "GET", params: { churchId: chId } }),
    ]);

    setConfig(cfg);
    setDonations(Array.isArray(dons) ? dons : []);
    setEvents(Array.isArray(evts) ? evts : []);
  }

  // ---- ADMIN: USERS ----
  async function refreshMembers(chId = churchId) {
    if (!chId) return;
    const list = await callApi({
      resource: "users",
      action: "list",
      method: "GET",
      params: { churchId: chId },
    });
    setMembers(Array.isArray(list) ? list : []);
  }

  async function updateMember(patch) {
    if (!churchId) throw new Error("Missing churchId");
    const updated = await callApi({
      resource: "users",
      action: "update",
      method: "POST",
      body: { churchId, ...patch },
    });
    await refreshMembers(churchId);
    return updated;
  }

  async function deleteMember(userId) {
    if (!churchId) throw new Error("Missing churchId");
    const updated = await callApi({
      resource: "users",
      action: "delete",
      method: "POST",
      body: { churchId, userId },
    });
    await refreshMembers(churchId);
    return updated;
  }

  // ---- ADMIN: CONFIG ----
  async function saveConfig(patch) {
    if (!churchId) throw new Error("Missing churchId");
    const updated = await callApi({
      resource: "config",
      action: "upsert",
      method: "POST",
      body: { churchId, ...patch },
    });
    setConfig(updated);
    return updated;
  }

  // ---- ADMIN: DONATIONS ----
  async function addDonation({ label, url, provider }) {
    if (!churchId) throw new Error("Missing churchId");
    const sortOrder = (donations?.length || 0) + 1;
    await callApi({
      resource: "donations",
      action: "add",
      method: "POST",
      body: { churchId, label, url, provider, sortOrder },
    });
    await refreshChurchData(churchId);
  }

  async function removeDonation(donationId) {
    if (!churchId) throw new Error("Missing churchId");
    await callApi({
      resource: "donations",
      action: "delete",
      method: "POST",
      body: { churchId, donationId },
    });
    await refreshChurchData(churchId);
  }

  // ---- ADMIN: EVENTS (optional) ----
  async function addEvent({ title, dateTimeISO, location, description }) {
    if (!churchId) throw new Error("Missing churchId");
    await callApi({
      resource: "events",
      action: "add",
      method: "POST",
      body: { churchId, title, dateTimeISO, location, description },
    });
    await refreshChurchData(churchId);
  }

  const value = useMemo(
    () => ({
      tenant,
      user,
      churchId,

      canUseApp,

      config,
      donations,
      events,
      members,

      restoreSession,
      saveSession,
      clearSession,

      getTenantByInviteCode,
      createTenant,
      signupUser,
      login,

      refreshChurchData,
      refreshMembers,

      updateMember,
      deleteMember,

      saveConfig,
      addDonation,
      removeDonation,

      addEvent,
    }),
    [tenant, user, churchId, canUseApp, config, donations, events, members]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}