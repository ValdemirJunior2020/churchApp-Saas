// src/context/AppDataContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppDataContext = createContext(null);

const STORAGE_KEYS = {
  CONFIG: "@church_config_v1",
  MEMBERS: "@church_members_v1",
};

const DEFAULT_CONFIG = {
  churchName: "SANCTUARY",
  address: "1915 N A St, Lake Worth Beach, FL 33460",
  logoUrl: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&fit=crop",
  youtubeId: "dQw4w9WgXcQ",
  donationLinks: [
    { label: "Give (PayPal)", url: "https://www.paypal.com" },
    { label: "Give (Cash App)", url: "https://cash.app" },
    { label: "Give (Website)", url: "https://example.com/give" },
  ],
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function AppDataProvider({ children }) {
  const [isHydrating, setIsHydrating] = useState(true);
  const [churchConfig, setChurchConfig] = useState(DEFAULT_CONFIG);
  const [members, setMembers] = useState([]);

  async function persistConfig(next) {
    setChurchConfig(next);
    await AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(next));
  }

  async function persistMembers(next) {
    setMembers(next);
    await AsyncStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(next));
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cfgRaw, memRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CONFIG),
          AsyncStorage.getItem(STORAGE_KEYS.MEMBERS),
        ]);

        const cfg = cfgRaw ? JSON.parse(cfgRaw) : DEFAULT_CONFIG;
        const mem = memRaw ? JSON.parse(memRaw) : [];

        if (!alive) return;
        setChurchConfig({ ...DEFAULT_CONFIG, ...(cfg || {}) });
        setMembers(Array.isArray(mem) ? mem : []);
      } catch {
        // keep defaults
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

      async updateChurchConfig(patch) {
        const next = { ...churchConfig, ...(patch || {}) };
        await persistConfig(next);
        return next;
      },

      async addMember({ name, phone, password }) {
        const cleanName = String(name || "").trim();
        const cleanPhone = String(phone || "").trim();
        const cleanPassword = String(password || "").trim();

        if (!cleanName || !cleanPhone || !cleanPassword) throw new Error("Missing fields.");

        const exists = members.some((m) => String(m.phone || "").trim() === cleanPhone);
        if (exists) throw new Error("Phone already registered.");

        const newMember = {
          id: uid(),
          role: "MEMBER",
          name: cleanName,
          phone: cleanPhone,
          password: cleanPassword,
          createdAt: new Date().toISOString(),
        };

        const next = [newMember, ...members];
        await persistMembers(next);
        return newMember;
      },

      async updateMember(memberId, patch) {
        const next = members.map((m) => {
          if (m.id !== memberId) return m;
          const merged = { ...m, ...(patch || {}) };
          return {
            ...merged,
            name: String(merged.name || "").trim(),
            phone: String(merged.phone || "").trim(),
            password: String(merged.password || ""),
          };
        });

        // prevent duplicate phones after edit
        const phones = next.map((m) => String(m.phone || "").trim()).filter(Boolean);
        if (new Set(phones).size !== phones.length) throw new Error("Duplicate phone detected.");

        await persistMembers(next);
        return next.find((m) => m.id === memberId) || null;
      },

      async deleteMember(memberId) {
        const next = members.filter((m) => m.id !== memberId);
        await persistMembers(next);
        return true;
      },

      async resetAllLocalData() {
        await Promise.all([
          AsyncStorage.removeItem(STORAGE_KEYS.CONFIG),
          AsyncStorage.removeItem(STORAGE_KEYS.MEMBERS),
        ]);
        setChurchConfig(DEFAULT_CONFIG);
        setMembers([]);
      },
    };
  }, [isHydrating, churchConfig, members]);

  return <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
