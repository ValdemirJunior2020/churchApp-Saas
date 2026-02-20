// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppData } from "./AppDataContext";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config";

const AuthContext = createContext(null);
const SESSION_KEY = "@church_session_v2";

export function AuthProvider({ children }) {
  const { isHydrating: dataHydrating, members, refreshMembers, updateMember } = useAppData();

  const [authHydrating, setAuthHydrating] = useState(true);
  const [user, setUser] = useState(null);

  async function saveSession(nextUser) {
    if (!nextUser) {
      await AsyncStorage.removeItem(SESSION_KEY);
      return;
    }
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      if (dataHydrating) return;

      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        const session = raw ? JSON.parse(raw) : null;

        if (!alive) return;

        if (!session) {
          setUser(null);
          return;
        }

        if (session.role === "ADMIN" && String(session.email).toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setUser(session);
          return;
        }

        // Member session validation
        if (session.role === "MEMBER" && session.memberId) {
          const latest = await refreshMembers();
          const still = latest.find((m) => m.memberId === session.memberId);
          if (!still) {
            setUser(null);
            await AsyncStorage.removeItem(SESSION_KEY);
            return;
          }
          const next = { ...session, name: still.name, phone: still.phone, email: still.email };
          setUser(next);
          await saveSession(next);
          return;
        }

        setUser(null);
        await AsyncStorage.removeItem(SESSION_KEY);
      } catch {
        setUser(null);
      } finally {
        if (alive) setAuthHydrating(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [dataHydrating]);

  const api = useMemo(() => {
    return {
      isHydrating: authHydrating || dataHydrating,
      user,
      isAdmin: user?.role === "ADMIN",
      isMember: user?.role === "MEMBER",

      async login({ identifier, password }) {
        const id = String(identifier || "").trim();
        const pw = String(password || "").trim();
        if (!id || !pw) throw new Error("Enter credentials.");

        // Admin login
        if (id.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          if (pw !== ADMIN_PASSWORD) throw new Error("Invalid admin password.");
          const adminUser = { role: "ADMIN", name: "Pastor Admin", email: ADMIN_EMAIL };
          setUser(adminUser);
          await saveSession(adminUser);
          return adminUser;
        }

        // Member login by phone
        const latest = await refreshMembers();
        const match = latest.find((m) => String(m.phone || "").trim() === id);
        if (!match) throw new Error("Account not found.");
        if (String(match.password) !== pw) throw new Error("Wrong password.");

        const memberUser = {
          role: "MEMBER",
          memberId: match.memberId,
          name: match.name,
          phone: match.phone,
          email: match.email,
        };

        setUser(memberUser);
        await saveSession(memberUser);

        // update lastLoginAt on sheet (best effort)
        try {
          await updateMember(match.memberId, { lastLoginAt: new Date().toISOString() });
        } catch {}

        return memberUser;
      },

      async signup({ name, phone, password, email }) {
        // signup is handled in LoginScreen through AppDataContext.addMember
        // but kept here for compatibility if you want it later
        throw new Error("Use the Sign Up form.");
      },

      async logout() {
        setUser(null);
        await saveSession(null);
      },
    };
  }, [authHydrating, dataHydrating, user, refreshMembers, updateMember]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}