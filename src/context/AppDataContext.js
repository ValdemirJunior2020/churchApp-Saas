// File: src/context/AppDataContext.js

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { gasGet, gasPost } from "../api/gasClient";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext(null);

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

    console.log("[AppDataContext] refreshMembers start:", churchCode);

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
      console.log(
        "[AppDataContext] refreshMembers failed (endpoint missing is ok for now):",
        err?.message || err
      );
      setMembers([]);
      return [];
    }
  }, [churchCode]);

  const refreshChurchSettings = useCallback(async () => {
    if (!churchCode) {
      console.log("[AppDataContext] refreshChurchSettings skipped: no churchCode");
      return null;
    }

    try {
      setIsLoadingAppData(true);
      console.log("[AppDataContext] refreshChurchSettings start:", churchCode);

      const data = await gasGet("church", { action: "get", churchCode });

      if (data?.church) setChurchSettings(data.church);
      if (Array.isArray(data?.donations)) setDonations(data.donations);

      console.log("[AppDataContext] refreshChurchSettings success");
      return data;
    } catch (err) {
      console.log("[AppDataContext] refreshChurchSettings error:", err?.message || err);
      throw err;
    } finally {
      setIsLoadingAppData(false);
    }
  }, [churchCode]);

  const saveChurchSettings = useCallback(
    async (payload) => {
      if (!churchCode) throw new Error("Missing churchCode");

      console.log("[AppDataContext] saveChurchSettings clicked");
      console.log("[AppDataContext] saveChurchSettings payload:", {
        churchCode,
        ...payload,
      });

      const data = await gasPost("church", {
        action: "save",
        churchCode,
        ...payload,
      });

      console.log("[AppDataContext] saveChurchSettings response:", data);

      if (data?.church) setChurchSettings(data.church);
      return data;
    },
    [churchCode]
  );

  const saveDonations = useCallback(
    async (items) => {
      if (!churchCode) throw new Error("Missing churchCode");

      console.log("[AppDataContext] saveDonations clicked");
      console.log(
        "[AppDataContext] saveDonations count:",
        Array.isArray(items) ? items.length : 0
      );

      const data = await gasPost("donations", {
        action: "save",
        churchCode,
        items: Array.isArray(items) ? items : [],
      });

      console.log("[AppDataContext] saveDonations response:", data);

      if (Array.isArray(data?.items)) setDonations(data.items);
      return data;
    },
    [churchCode]
  );

  const updateMember = useCallback(
    async (payload) => {
      if (!churchCode) throw new Error("Missing churchCode");

      console.log("[AppDataContext] updateMember payload:", payload);

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

      console.log("[AppDataContext] deleteMember payload:", payload);

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