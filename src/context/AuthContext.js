// src/context/AuthContext.js  (REPLACE)
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAppData } from "./AppDataContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const {
    tenant,
    user,
    canUseApp,
    restoreSession,
    clearSession,
    createTenant,
    signupUser,
    login,
    refreshChurchData,
    refreshMembers,
  } = useAppData();

  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await restoreSession();
        if (s?.tenant?.churchId) {
          await refreshChurchData(s.tenant.churchId);
          if (String(s.user?.role || "").toUpperCase() === "ADMIN") {
            await refreshMembers(s.tenant.churchId);
          }
        }
      } finally {
        setHydrating(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await clearSession();
  }

  // Create church + create admin user + login
  async function createChurchAndLogin({ churchName, pastorName, phone, email, password }) {
    const t = await createTenant({ churchName, ownerEmail: email });
    await signupUser({
      churchId: t.churchId,
      role: "ADMIN",
      name: pastorName,
      phone,
      email,
      password,
    });
    const data = await login({ inviteCode: t.inviteCode, identifier: phone || email, password });
    await refreshMembers(data.tenant.churchId);
    return data;
  }

  // Join church as member + login
  async function joinChurchAndLogin({ inviteCode, name, phone, email, password }) {
    await signupUser({
      inviteCode,
      role: "MEMBER",
      name,
      phone,
      email,
      password,
    });
    return login({ inviteCode, identifier: phone || email, password });
  }

  const role = String(user?.role || "").toUpperCase();

  const value = useMemo(
    () => ({
      hydrating,
      tenant,
      user,
      role,
      canUseApp,
      login,
      logout,
      createChurchAndLogin,
      joinChurchAndLogin,
    }),
    [hydrating, tenant, user, role, canUseApp, login]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}