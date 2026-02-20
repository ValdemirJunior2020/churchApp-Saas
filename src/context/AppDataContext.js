// src/context/AppDataContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { gasGet, gasPost } from "../api/gasClient";

const AppDataContext = createContext(null);

const CACHE_KEYS = {
  CONFIG: "@cache_config_v3",
  DONATIONS: "@cache_donations_v3",
  MEMBERS: "@cache_members_v3",
  EVENTS: "@cache_events_v3",
};

const DEFAULT_CONFIG = {
  configId: "main",
  churchName: "SANCTUARY",
  address: "",
  logoUrl: "",
  youtubeVideoId: "",
  themePrimaryHex: "#0f172a",
  themeAccentHex: "#94a3b8",
  donationLinks: [],
};

function normalizeBool(v) {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").toLowerCase().trim();
  return s === "true" || s === "1" || s === "yes" || s === "y";
}

function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeDonationRows(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list
    .map((d) => ({
      donationId: String(d.donationId || "").trim(),
      label: String(d.label || "").trim(),
      url: String(d.url || "").trim(),
      provider: String(d.provider || "").trim(),
      sortOrder: toInt(d.sortOrder, 0),
      isActive: normalizeBool(d.isActive),
      createdAt: d.createdAt || "",
      updatedAt: d.updatedAt || "",
    }))
    .filter((d) => d.label && d.url && d.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function normalizeMembers(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list
    .map((m) => ({
      memberId: String(m.memberId || "").trim(),
      role: String(m.role || "MEMBER").trim().toUpperCase(),
      name: String(m.name || "").trim(),
      phone: String(m.phone || "").trim(),
      email: String(m.email || "").trim(),
      password: String(m.password || ""),
      isActive: normalizeBool(m.isActive),
      createdAt: m.createdAt || "",
      updatedAt: m.updatedAt || "",
      lastLoginAt: m.lastLoginAt || "",
    }))
    .filter((m) => m.memberId && m.isActive !== false);
}

function normalizeEvents(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list
    .map((e) => ({
      eventId: String(e.eventId || "").trim(),
      title: String(e.title || "").trim(),
      dateTimeISO: String(e.dateTimeISO || "").trim(),
      location: String(e.location || "").trim(),
      description: String(e.description || "").trim(),
      isActive: normalizeBool(e.isActive),
      createdAt: e.createdAt || "",
      updatedAt: e.updatedAt || "",
    }))
    .filter((e) => e.eventId && e.isActive !== false)
    .sort((a, b) => (a.dateTimeISO || "").localeCompare(b.dateTimeISO || ""));
}

async function cacheSet(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value ?? null));
  } catch {}
}
async function cacheGet(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppDataProvider({ children }) {
  const [isHydrating, setIsHydrating] = useState(true);

  const [churchConfig, setChurchConfig] = useState(DEFAULT_CONFIG);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);

  async function refreshConfig() {
    const [cfg, don] = await Promise.all([gasGet("CONFIG"), gasGet("DONATIONS")]);
    const donationLinks = normalizeDonationRows(don);

    const nextCfg = {
      ...DEFAULT_CONFIG,
      ...(cfg || {}),
      configId: String((cfg && cfg.configId) || "main"),
      churchName: String((cfg && cfg.churchName) || DEFAULT_CONFIG.churchName),
      address: String((cfg && cfg.address) || ""),
      logoUrl: String((cfg && cfg.logoUrl) || ""),
      youtubeVideoId: String((cfg && cfg.youtubeVideoId) || ""),
      themePrimaryHex: String((cfg && cfg.themePrimaryHex) || DEFAULT_CONFIG.themePrimaryHex),
      themeAccentHex: String((cfg && cfg.themeAccentHex) || DEFAULT_CONFIG.themeAccentHex),
      donationLinks,
    };

    setChurchConfig(nextCfg);
    await Promise.all([
      cacheSet(CACHE_KEYS.CONFIG, nextCfg),
      cacheSet(CACHE_KEYS.DONATIONS, donationLinks),
    ]);
    return nextCfg;
  }

  async function refreshMembers() {
    const list = normalizeMembers(await gasGet("MEMBERS"));
    setMembers(list);
    await cacheSet(CACHE_KEYS.MEMBERS, list);
    return list;
  }

  async function refreshEvents() {
    const list = normalizeEvents(await gasGet("EVENTS"));
    setEvents(list);
    await cacheSet(CACHE_KEYS.EVENTS, list);
    return list;
  }

  async function refreshAll() {
    await Promise.all([refreshConfig(), refreshMembers(), refreshEvents()]);
  }

  async function seedFromCacheFast() {
    const [cfg, dons, mems, evs] = await Promise.all([
      cacheGet(CACHE_KEYS.CONFIG),
      cacheGet(CACHE_KEYS.DONATIONS),
      cacheGet(CACHE_KEYS.MEMBERS),
      cacheGet(CACHE_KEYS.EVENTS),
    ]);

    if (cfg) {
      setChurchConfig({
        ...DEFAULT_CONFIG,
        ...(cfg || {}),
        donationLinks: Array.isArray(dons) ? dons : cfg.donationLinks || [],
      });
    }
    if (Array.isArray(mems)) setMembers(mems);
    if (Array.isArray(evs)) setEvents(evs);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      await seedFromCacheFast();
      try {
        await refreshAll();
      } catch {
        // keep cached state
      } finally {
        if (alive) setIsHydrating(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const api = useMemo(() => {
    return {
      isHydrating,
      churchConfig,
      members,
      events,

      refreshAll,
      refreshConfig,
      refreshMembers,
      refreshEvents,

      async updateChurchConfig(patch) {
        const safePatch = { configId: "main", ...(patch || {}) };
        await gasPost("CONFIG", safePatch);
        return refreshConfig();
      },

      async saveDonationLinks(links) {
        const clean = (Array.isArray(links) ? links : [])
          .map((d, idx) => ({
            donationId: String(d.donationId || "").trim(),
            label: String(d.label || "").trim(),
            url: String(d.url || "").trim(),
            provider: String(d.provider || "").trim(),
            sortOrder: Number.isFinite(Number(d.sortOrder)) ? Number(d.sortOrder) : idx + 1,
            isActive: d.isActive === undefined ? true : normalizeBool(d.isActive),
          }))
          .filter((d) => d.label && d.url);

        const current = normalizeDonationRows(await gasGet("DONATIONS"));
        const keepIds = new Set(clean.filter((x) => x.donationId).map((x) => x.donationId));

        await Promise.all(
          current
            .filter((c) => c.donationId && !keepIds.has(c.donationId))
            .map((c) => gasPost("DONATIONS", {}, { action: "delete", id: c.donationId }))
        );

        for (const d of clean) {
          await gasPost("DONATIONS", {
            donationId: d.donationId || undefined,
            label: d.label,
            url: d.url,
            provider: d.provider,
            sortOrder: d.sortOrder,
            isActive: d.isActive,
          });
        }

        return refreshConfig();
      },

      async addMember({ name, phone, password, email }) {
        const cleanName = String(name || "").trim();
        const cleanPhone = String(phone || "").trim();
        const cleanPassword = String(password || "").trim();
        const cleanEmail = String(email || "").trim();

        if (!cleanName || !cleanPhone || !cleanPassword) throw new Error("Missing fields.");

        const latest = await refreshMembers();
        if (latest.some((m) => m.phone === cleanPhone)) throw new Error("Phone already registered.");

        const created = await gasPost("MEMBERS", {
          role: "MEMBER",
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          password: cleanPassword,
          isActive: true,
        });

        await refreshMembers();
        return created;
      },

      async updateMember(memberId, patch) {
        const id = String(memberId || "").trim();
        if (!id) throw new Error("Missing memberId");
        await gasPost("MEMBERS", { memberId: id, ...(patch || {}) });
        await refreshMembers();
        return true;
      },

      async deleteMember(memberId) {
        const id = String(memberId || "").trim();
        if (!id) throw new Error("Missing memberId");
        await gasPost("MEMBERS", {}, { action: "delete", id });
        await refreshMembers();
        return true;
      },

      // ✅ EVENTS CRUD
      async upsertEvent(eventPatch) {
        const patch = {
          eventId: eventPatch?.eventId ? String(eventPatch.eventId).trim() : undefined,
          title: String(eventPatch?.title || "").trim(),
          dateTimeISO: String(eventPatch?.dateTimeISO || "").trim(),
          location: String(eventPatch?.location || "").trim(),
          description: String(eventPatch?.description || "").trim(),
          isActive: eventPatch?.isActive === undefined ? true : normalizeBool(eventPatch.isActive),
        };

        if (!patch.title) throw new Error("Event title is required.");

        const saved = await gasPost("EVENTS", patch);
        await refreshEvents();
        return saved;
      },

      async deleteEvent(eventId) {
        const id = String(eventId || "").trim();
        if (!id) throw new Error("Missing eventId");
        await gasPost("EVENTS", {}, { action: "delete", id });
        await refreshEvents();
        return true;
      },
    };
  }, [isHydrating, churchConfig, members, events]);

  return <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}