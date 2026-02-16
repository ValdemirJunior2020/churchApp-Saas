// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppData } from "./AppDataContext";

const AuthContext = createContext(null);

const SESSION_KEY = "@church_session_v1";

// Hardcoded Admin (mock)
const ADMIN_EMAIL = "admin@church.com";
const ADMIN_PASSWORD = "admin123";

export function AuthProvider({ children }) {
  const { isHydrating: dataHydrating, members, addMember } = useAppData();

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

        if (session.role === "ADMIN" && session.email === ADMIN_EMAIL) {
          setUser(session);
          return;
        }

        if (session.role === "MEMBER" && session.memberId) {
          const stillExists = members.find((m) => m.id === session.memberId);
          if (!stillExists) {
            setUser(null);
            await AsyncStorage.removeItem(SESSION_KEY);
            return;
          }
          setUser({ ...session, name: stillExists.name, phone: stillExists.phone });
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
  }, [dataHydrating, members]);

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

        // Member login (phone)
        const match = members.find((m) => String(m.phone || "").trim() === id);
        if (!match) throw new Error("Account not found.");
        if (String(match.password) !== pw) throw new Error("Wrong password.");

        const memberUser = {
          role: "MEMBER",
          memberId: match.id,
          name: match.name,
          phone: match.phone,
        };

        setUser(memberUser);
        await saveSession(memberUser);
        return memberUser;
      },

      async signup({ name, phone, password }) {
        const created = await addMember({ name, phone, password });
        const memberUser = {
          role: "MEMBER",
          memberId: created.id,
          name: created.name,
          phone: created.phone,
        };
        setUser(memberUser);
        await saveSession(memberUser);
        return memberUser;
      },

      async logout() {
        setUser(null);
        await saveSession(null);
      },
    };
  }, [authHydrating, dataHydrating, user, members, addMember]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const AUTH_ADMIN_HINT = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
