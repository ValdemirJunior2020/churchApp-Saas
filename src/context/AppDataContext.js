// REPLACE: src/context/AppDataContext.js
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { extractYouTubeVideoId } from "../utils/youtube";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { tenant } = useAuth();
  const churchCode = tenant?.churchCode || "";

  const [churchSettings, setChurchSettings] = useState(null);
  const [donations, setDonations] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoadingAppData, setIsLoadingAppData] = useState(false);

  const refreshChurch = useCallback(async () => {
    if (!churchCode) return null;
    setIsLoadingAppData(true);
    try {
      const snap = await getDoc(doc(db, "churches", churchCode));
      if (!snap.exists()) {
        setChurchSettings(null);
        setDonations([]);
        return null;
      }
      const church = snap.data() || {};
      setChurchSettings(church);
      setDonations(Array.isArray(church.donations) ? church.donations : []);
      return church;
    } finally {
      setIsLoadingAppData(false);
    }
  }, [churchCode]);

  const refreshMembers = useCallback(async () => {
    if (!churchCode) return [];
    const q = query(collection(db, "churches", churchCode, "members"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setMembers(rows);
    return rows;
  }, [churchCode]);

  const refreshEvents = useCallback(async () => {
    if (!churchCode) return [];
    const q = query(collection(db, "churches", churchCode, "events"), orderBy("date", "asc"));
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setEvents(rows);
    return rows;
  }, [churchCode]);

  // ✅ Auto-load after login so Apple instantly sees content
  useEffect(() => {
    if (!churchCode) {
      setChurchSettings(null);
      setDonations([]);
      setEvents([]);
      setMembers([]);
      return;
    }
    refreshChurch().catch(() => {});
    refreshEvents().catch(() => {});
    if (String(tenant?.role || "").toUpperCase() === "ADMIN") {
      refreshMembers().catch(() => {});
    }
  }, [churchCode, tenant?.role, refreshChurch, refreshEvents, refreshMembers]);

  const saveChurchSettings = useCallback(
    async ({ churchName, logoUrl, youtubeUrl, planStatus }) => {
      if (!churchCode) throw new Error("Missing churchCode");
      const youtubeVideoId = extractYouTubeVideoId(youtubeUrl);
      await updateDoc(doc(db, "churches", churchCode), {
        churchName: String(churchName || "").trim(),
        logoUrl: String(logoUrl || "").trim(),
        youtubeUrl: String(youtubeUrl || "").trim(),
        youtubeVideoId,
        planStatus: String(planStatus || "ACTIVE").trim().toUpperCase(),
        updatedAt: serverTimestamp(),
      });
      return refreshChurch();
    },
    [churchCode, refreshChurch]
  );

  const saveDonations = useCallback(
    async (items) => {
      if (!churchCode) throw new Error("Missing churchCode");
      const clean = (Array.isArray(items) ? items : [])
        .map((x) => ({
          label: String(x?.label || "").trim(),
          url: String(x?.url || "").trim(),
        }))
        .filter((x) => x.label && x.url);

      await updateDoc(doc(db, "churches", churchCode), {
        donations: clean,
        updatedAt: serverTimestamp(),
      });

      setDonations(clean);
      return clean;
    },
    [churchCode]
  );

  const updateMember = useCallback(
    async ({ id, role, status, name, phone }) => {
      if (!churchCode) throw new Error("Missing churchCode");
      if (!id) throw new Error("Missing member id");
      await updateDoc(doc(db, "churches", churchCode, "members", id), {
        ...(role ? { role: String(role).toUpperCase() } : {}),
        ...(status ? { status: String(status).toUpperCase() } : {}),
        ...(name != null ? { name: String(name) } : {}),
        ...(phone != null ? { phone: String(phone) } : {}),
        updatedAt: serverTimestamp(),
      });
      return refreshMembers();
    },
    [churchCode, refreshMembers]
  );

  const deleteMember = useCallback(
    async ({ id }) => {
      if (!churchCode) throw new Error("Missing churchCode");
      if (!id) throw new Error("Missing member id");
      await deleteDoc(doc(db, "churches", churchCode, "members", id));
      return refreshMembers();
    },
    [churchCode, refreshMembers]
  );

  const upsertEvent = useCallback(
    async ({ id, title, date, location, description }) => {
      if (!churchCode) throw new Error("Missing churchCode");
      const ref = id
        ? doc(db, "churches", churchCode, "events", id)
        : doc(collection(db, "churches", churchCode, "events"));

      await setDoc(
        ref,
        {
          title: String(title || "").trim(),
          date: String(date || "").trim(), // store as YYYY-MM-DD string
          location: String(location || "").trim(),
          description: String(description || "").trim(),
          updatedAt: serverTimestamp(),
          ...(id ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true }
      );

      return refreshEvents();
    },
    [churchCode, refreshEvents]
  );

  const deleteEvent = useCallback(
    async ({ id }) => {
      if (!churchCode) throw new Error("Missing churchCode");
      if (!id) throw new Error("Missing event id");
      await deleteDoc(doc(db, "churches", churchCode, "events", id));
      return refreshEvents();
    },
    [churchCode, refreshEvents]
  );

  const value = useMemo(
    () => ({
      tenant,
      churchSettings,
      donations,
      events,
      members,
      isLoadingAppData,
      refreshChurch,
      refreshMembers,
      refreshEvents,
      saveChurchSettings,
      saveDonations,
      updateMember,
      deleteMember,
      upsertEvent,
      deleteEvent,
    }),
    [
      tenant,
      churchSettings,
      donations,
      events,
      members,
      isLoadingAppData,
      refreshChurch,
      refreshMembers,
      refreshEvents,
      saveChurchSettings,
      saveDonations,
      updateMember,
      deleteMember,
      upsertEvent,
      deleteEvent,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}