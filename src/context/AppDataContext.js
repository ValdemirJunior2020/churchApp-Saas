// File: src/context/AppDataContext.js

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { GAS_URL } from "../config";
import { extractYouTubeVideoId } from "../utils/youtube";
import { normalizeRemoteUrl } from "../utils/media";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext(null);

const STORAGE_PREFIX = "@church_saas_v4";

const DEFAULT_CONFIG = {
  churchName: "Congregate",
  address: "",
  logoUrl: "",
  backgroundImageUrl: "",
  youtubeVideoId: "",
  youtubeUrl: "",
  donationLinks: [],
  themePrimaryHex: "#0F172A",
  themeAccentHex: "#22D3EE",
};

function getStorageKeys(churchId = "guest") {
  const id = String(churchId || "guest");
  return {
    CONFIG: `${STORAGE_PREFIX}:${id}:config`,
    MEMBERS: `${STORAGE_PREFIX}:${id}:members`,
    EVENTS: `${STORAGE_PREFIX}:${id}:events`,
  };
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

function normalizeDonation(item = {}) {
  return {
    donationId: item.donationId || item.id || uid("don"),
    provider: item.provider || item.type || "LINK",
    label: item.label || item.type || "Donate",
    url: normalizeRemoteUrl(item.url || ""),
  };
}

function normalizeConfig(raw = {}) {
  const youtubeUrl = String(raw.youtubeUrl || raw.youtubeLink || "").trim();
  const fallbackSource = raw.youtubeVideoId || raw.youtubeId || youtubeUrl;
  const youtubeVideoId = extractYouTubeVideoId(fallbackSource);

  const donationLinks = Array.isArray(raw.donationLinks)
    ? raw.donationLinks.map(normalizeDonation)
    : [];

  return {
    ...DEFAULT_CONFIG,
    ...raw,
    logoUrl: normalizeRemoteUrl(raw.logoUrl || ""),
    backgroundImageUrl: normalizeRemoteUrl(raw.backgroundImageUrl || ""),
    youtubeUrl,
    youtubeVideoId,
    donationLinks,
  };
}

function normalizeMember(item = {}) {
  return {
    id: item.id || item.uid || item.memberId || uid("mem"),
    uid: item.uid || item.id || item.memberId || "",
    fullName: item.fullName || item.name || "",
    email: item.email || "",
    phone: item.phone || "",
    role: item.role || "MEMBER",
    status: item.status || "ACTIVE",
    ...item,
  };
}

function normalizeEvent(item = {}) {
  return {
    eventId: item.eventId || item.id || uid("evt"),
    title: String(item.title || "Church Event").trim(),
    dateTimeISO: String(item.dateTimeISO || item.date || "").trim(),
    location: String(item.location || "").trim(),
    description: String(item.description || "").trim(),
    isActive: item.isActive !== false,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
}

function sortEvents(items = []) {
  return [...items].sort((a, b) => {
    const aTime = a?.dateTimeISO ? new Date(a.dateTimeISO).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b?.dateTimeISO ? new Date(b.dateTimeISO).getTime() : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}

async function callApi({ resource, action, method = "GET", params = {}, body }) {
  if (!GAS_URL || !String(GAS_URL).includes("/macros/s/") || !String(GAS_URL).includes("/exec")) {
    throw new Error("GAS_URL not set (local mode).");
  }

  const url = new URL(GAS_URL);
  url.searchParams.set("resource", resource);
  url.searchParams.set("action", action);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length) {
      url.searchParams.set(key, String(value));
    }
  });

  const init =
    method === "POST"
      ? { method: "POST", body: JSON.stringify(body || {}) }
      : { method: "GET" };

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
  const { tenant, profile } = useAuth();

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [ready, setReady] = useState(false);

  const apiEnabled = Boolean(
    GAS_URL && String(GAS_URL).includes("/macros/s/") && String(GAS_URL).includes("/exec")
  );

  const currentChurchId = tenant?.churchId || "guest";

  function resetTenantState() {
    setConfig(DEFAULT_CONFIG);
    setMembers([]);
    setEvents([]);
  }

  async function loadLocal(churchId = currentChurchId) {
    const keys = getStorageKeys(churchId);

    const [configRaw, membersRaw, eventsRaw] = await Promise.all([
      AsyncStorage.getItem(keys.CONFIG),
      AsyncStorage.getItem(keys.MEMBERS),
      AsyncStorage.getItem(keys.EVENTS),
    ]);

    setConfig(configRaw ? normalizeConfig(JSON.parse(configRaw)) : DEFAULT_CONFIG);
    setMembers(membersRaw ? JSON.parse(membersRaw).map(normalizeMember) : []);
    setEvents(eventsRaw ? sortEvents(JSON.parse(eventsRaw).map(normalizeEvent)) : []);
  }

  async function persist(partial = {}, churchId = currentChurchId) {
    const keys = getStorageKeys(churchId);
    const tasks = [];

    if (partial.config) {
      tasks.push(
        AsyncStorage.setItem(keys.CONFIG, JSON.stringify(normalizeConfig(partial.config)))
      );
    }

    if (partial.members) {
      tasks.push(
        AsyncStorage.setItem(
          keys.MEMBERS,
          JSON.stringify((partial.members || []).map(normalizeMember))
        )
      );
    }

    if (partial.events) {
      tasks.push(
        AsyncStorage.setItem(
          keys.EVENTS,
          JSON.stringify(sortEvents((partial.events || []).map(normalizeEvent)))
        )
      );
    }

    await Promise.all(tasks);
  }

  useEffect(() => {
    let active = true;

    async function bootstrapTenant() {
      try {
        setReady(false);
        resetTenantState();
        await loadLocal(currentChurchId);
      } catch {
        resetTenantState();
      } finally {
        if (active) setReady(true);
      }
    }

    bootstrapTenant();

    return () => {
      active = false;
    };
  }, [currentChurchId]);

  useEffect(() => {
    if (!tenant?.churchId) return undefined;

    const churchId = tenant.churchId;
    const churchRef = doc(db, "churches", churchId);
    const membersRef = collection(db, "churches", churchId, "members");
    const eventsRef = collection(db, "churches", churchId, "events");

    const unsubChurch = onSnapshot(churchRef, async (snap) => {
      if (!snap.exists()) return;
      const next = normalizeConfig({ ...snap.data(), churchId: snap.id });
      setConfig(next);
      await persist({ config: next }, churchId);
    });

    const unsubMembers = onSnapshot(membersRef, async (snap) => {
      const nextMembers = snap.docs.map((item) =>
        normalizeMember({ id: item.id, ...item.data() })
      );
      setMembers(nextMembers);
      await persist({ members: nextMembers }, churchId);
    });

    const unsubEvents = onSnapshot(
      query(eventsRef, orderBy("dateTimeISO", "asc")),
      async (snap) => {
        const nextEvents = sortEvents(
          snap.docs.map((item) => normalizeEvent({ eventId: item.id, ...item.data() }))
        );
        setEvents(nextEvents);
        await persist({ events: nextEvents }, churchId);
      },
      async () => {
        const fallback = await getDocs(eventsRef);
        const nextEvents = sortEvents(
          fallback.docs.map((item) =>
            normalizeEvent({ eventId: item.id, ...item.data() })
          )
        );
        setEvents(nextEvents);
        await persist({ events: nextEvents }, churchId);
      }
    );

    return () => {
      unsubChurch();
      unsubMembers();
      unsubEvents();
    };
  }, [tenant?.churchId]);

  async function refreshChurchData() {
    if (!tenant?.churchId) {
      await loadLocal("guest");
      return;
    }

    const churchId = tenant.churchId;
    const churchRef = doc(db, "churches", churchId);
    const membersRef = collection(db, "churches", churchId, "members");
    const eventsRef = collection(db, "churches", churchId, "events");

    const [churchDoc, membersSnap, eventsSnap] = await Promise.all([
      getDoc(churchRef),
      getDocs(membersRef),
      getDocs(eventsRef),
    ]);

    if (churchDoc.exists()) {
      const nextConfig = normalizeConfig({ ...churchDoc.data(), churchId: churchDoc.id });
      setConfig(nextConfig);
      await persist({ config: nextConfig }, churchId);
    }

    const nextMembers = membersSnap.docs.map((item) =>
      normalizeMember({ id: item.id, ...item.data() })
    );
    setMembers(nextMembers);

    const nextEvents = sortEvents(
      eventsSnap.docs.map((item) => normalizeEvent({ eventId: item.id, ...item.data() }))
    );
    setEvents(nextEvents);

    await persist({ members: nextMembers, events: nextEvents }, churchId);
  }

  async function setTenantCode(value) {
    return value;
  }

  async function updateConfig(nextPatch) {
    const nextConfig = normalizeConfig({
      ...config,
      ...nextPatch,
      churchName:
        nextPatch?.churchName || config.churchName || tenant?.churchName || "Congregate",
    });

    setConfig(nextConfig);
    await persist({ config: nextConfig }, currentChurchId);

    if (tenant?.churchId) {
      await setDoc(
        doc(db, "churches", tenant.churchId),
        {
          churchName: nextConfig.churchName,
          address: nextConfig.address,
          logoUrl: nextConfig.logoUrl,
          backgroundImageUrl: nextConfig.backgroundImageUrl,
          youtubeUrl: nextConfig.youtubeUrl,
          youtubeVideoId: nextConfig.youtubeVideoId,
          donationLinks: nextConfig.donationLinks,
          themePrimaryHex: nextConfig.themePrimaryHex,
          themeAccentHex: nextConfig.themeAccentHex,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else if (apiEnabled) {
      try {
        await callApi({
          resource: "church",
          action: "save-config",
          method: "POST",
          body: nextConfig,
        });
      } catch {}
    }

    return nextConfig;
  }

  async function addDonationLink(input) {
    const donation = normalizeDonation(input || {});
    const nextDonationLinks = [...(config.donationLinks || []), donation];
    return updateConfig({ donationLinks: nextDonationLinks });
  }

  async function removeDonationLink(donationId) {
    const nextDonationLinks = (config.donationLinks || []).filter(
      (item) => item.donationId !== donationId
    );
    return updateConfig({ donationLinks: nextDonationLinks });
  }

  async function addMember(member) {
    const normalized = normalizeMember(member || {});
    const nextMembers = [...members, normalized];
    setMembers(nextMembers);
    await persist({ members: nextMembers }, currentChurchId);

    if (tenant?.churchId) {
      const id = normalized.uid || normalized.id;
      await setDoc(
        doc(db, "churches", tenant.churchId, "members", id),
        {
          ...normalized,
          updatedAt: serverTimestamp(),
          addedBy: profile?.uid || null,
        },
        { merge: true }
      );
    }
  }

  async function updateMember(id, patch) {
    const match = members.find((item) => String(item.id || item.uid) === String(id));
    const nextMember = normalizeMember({
      ...(match || {}),
      ...patch,
      id: match?.id || id,
    });

    const nextMembers = members.map((item) =>
      String(item.id || item.uid) === String(id) ? nextMember : item
    );

    setMembers(nextMembers);
    await persist({ members: nextMembers }, currentChurchId);

    if (tenant?.churchId) {
      await setDoc(
        doc(db, "churches", tenant.churchId, "members", nextMember.uid || nextMember.id),
        {
          ...nextMember,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (nextMember.uid) {
        await updateDoc(doc(db, "users", nextMember.uid), {
          role: nextMember.role || "MEMBER",
          phone: nextMember.phone || "",
          fullName: nextMember.fullName || "",
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }
    }
  }

  async function deleteMember(id) {
    const target = members.find((item) => String(item.id || item.uid) === String(id));
    const nextMembers = members.filter(
      (item) => String(item.id || item.uid) !== String(id)
    );

    setMembers(nextMembers);
    await persist({ members: nextMembers }, currentChurchId);

    if (tenant?.churchId && target) {
      await deleteDoc(
        doc(db, "churches", tenant.churchId, "members", target.uid || target.id)
      );
    }
  }

  async function refreshMembers() {
    await refreshChurchData();
  }

  async function upsertEvent(eventInput) {
    const normalized = normalizeEvent(eventInput);
    const exists = events.some((evt) => evt.eventId === normalized.eventId);

    const nextEvents = exists
      ? events.map((evt) => (evt.eventId === normalized.eventId ? normalized : evt))
      : [...events, normalized];

    const sorted = sortEvents(nextEvents);
    setEvents(sorted);
    await persist({ events: sorted }, currentChurchId);

    if (tenant?.churchId) {
      await setDoc(
        doc(db, "churches", tenant.churchId, "events", normalized.eventId),
        {
          ...normalized,
          createdAt: normalized.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else if (apiEnabled) {
      try {
        await callApi({
          resource: "events",
          action: exists ? "update" : "create",
          method: "POST",
          body: { event: normalized },
        });
      } catch {}
    }

    return normalized;
  }

  async function deleteEvent(eventId) {
    const nextEvents = events.filter((evt) => evt.eventId !== eventId);
    setEvents(nextEvents);
    await persist({ events: nextEvents }, currentChurchId);

    if (tenant?.churchId) {
      await deleteDoc(doc(db, "churches", tenant.churchId, "events", eventId));
    }
  }

  async function refreshEvents() {
    await refreshChurchData();
  }

  const value = useMemo(
    () => ({
      ready,
      apiEnabled,
      tenantCode: tenant?.churchCode || "",
      setTenantCode,
      config,
      saveConfig: updateConfig,
      updateConfig,
      refreshChurchData,
      members,
      refreshMembers,
      addMember,
      updateMember,
      deleteMember,
      events,
      refreshEvents,
      upsertEvent,
      deleteEvent,
      donations: config.donationLinks || [],
      addDonation: addDonationLink,
      removeDonation: removeDonationLink,
      addDonationLink,
      removeDonationLink,
    }),
    [ready, apiEnabled, tenant?.churchCode, config, members, events]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}