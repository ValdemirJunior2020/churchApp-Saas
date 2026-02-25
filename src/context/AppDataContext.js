// File: src/context/AppDataContext.js
// ✅ Add/merge these functions if your context doesn't have them yet (prevents "refreshMembers is not a function")

// Make sure these imports exist in your file:
// import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
// import { gasGet, gasPost } from "../api/gasClient";
// import { useAuth } from "./AuthContext";

const AppDataContext = React.createContext(null);

export function AppDataProvider({ children }) {
  const { tenant } = useAuth();

  const [members, setMembers] = useState([]);
  const [churchSettings, setChurchSettings] = useState(null);
  const [donations, setDonations] = useState([]);
  const [isLoadingAppData, setIsLoadingAppData] = useState(false);

  const churchCode = tenant?.churchCode || tenant?.inviteCode || "";

  const refreshMembers = useCallback(async () => {
    if (!churchCode) {
      console.log("[AppDataContext] refreshMembers skipped: no churchCode");
      setMembers([]);
      return [];
    }

    console.log("[AppDataContext] refreshMembers start", churchCode);

    // ✅ Your GAS may not have members/list yet.
    // This tries endpoint first; if missing, it fails gracefully without crashing the app.
    try {
      const data = await gasGet("members", { action: "list", churchCode });
      const rows = Array.isArray(data?.members)
        ? data.members
        : Array.isArray(data?.items)
        ? data.items
        : [];
      setMembers(rows);
      console.log("[AppDataContext] refreshMembers loaded:", rows.length);
      return rows;
    } catch (err) {
      console.log("[AppDataContext] refreshMembers endpoint missing/fail:", err?.message || err);
      setMembers([]); // keep UI stable
      return [];
    }
  }, [churchCode]);

  const refreshChurchSettings = useCallback(async () => {
    if (!churchCode) return null;
    try {
      setIsLoadingAppData(true);
      console.log("[AppDataContext] refreshChurchSettings", churchCode);
      const data = await gasGet("church", { action: "get", churchCode });
      if (data?.church) setChurchSettings(data.church);
      if (Array.isArray(data?.donations)) setDonations(data.donations);
      return data;
    } finally {
      setIsLoadingAppData(false);
    }
  }, [churchCode]);

  const saveChurchSettings = useCallback(
    async (payload) => {
      if (!churchCode) throw new Error("Missing churchCode");
      console.log("[AppDataContext] saveChurchSettings payload:", payload);

      const data = await gasPost("church", {
        action: "save",
        churchCode,
        ...payload,
      });

      if (data?.church) setChurchSettings(data.church);
      return data;
    },
    [churchCode]
  );

  const saveDonations = useCallback(
    async (items) => {
      if (!churchCode) throw new Error("Missing churchCode");
      console.log("[AppDataContext] saveDonations count:", Array.isArray(items) ? items.length : 0);

      const data = await gasPost("donations", {
        action: "save",
        churchCode,
        items: Array.isArray(items) ? items : [],
      });

      if (Array.isArray(data?.items)) setDonations(data.items);
      return data;
    },
    [churchCode]
  );

  const updateMember = useCallback(
    async (payload) => {
      if (!churchCode) throw new Error("Missing churchCode");
      // ✅ Requires GAS endpoint members/update (if not present, you'll get a clear error instead of crash)
      const data = await gasPost("members", {
        action: "update",
        churchCode,
        ...payload,
      });
      await refreshMembers();
      return data;
    },
    [churchCode, refreshMembers]
  );

  const deleteMember = useCallback(
    async (payload) => {
      if (!churchCode) throw new Error("Missing churchCode");
      // ✅ Requires GAS endpoint members/delete (or soft delete)
      const data = await gasPost("members", {
        action: "delete",
        churchCode,
        ...payload,
      });
      await refreshMembers();
      return data;
    },
    [churchCode, refreshMembers]
  );

  const value = useMemo(
    () => ({
      tenant,
      churchSettings,
      donations,
      members,
      isLoadingAppData,
      refreshChurchSettings,
      saveChurchSettings,
      saveDonations,
      refreshMembers,
      updateMember,
      deleteMember,
    }),
    [
      tenant,
      churchSettings,
      donations,
      members,
      isLoadingAppData,
      refreshChurchSettings,
      saveChurchSettings,
      saveDonations,
      refreshMembers,
      updateMember,
      deleteMember,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }
  return ctx;
}