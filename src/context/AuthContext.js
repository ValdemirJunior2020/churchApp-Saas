// src/context/AuthContext.js
import React, { createContext, useContext, useMemo, useState } from "react";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, DEMO_ADMIN_PHONE, DEMO_INVITE_CODE } from "../config";
import { useAppData } from "./AppDataContext";

const AuthContext = createContext(null);

function normPhone(v) {
  return String(v || "").replace(/\D/g, "");
}

export function AuthProvider({ children }) {
  const { tenantCode, setTenantCode, members, addMember } = useAppData();
  const [user, setUser] = useState(null);

  async function login({ churchCode, emailOrPhone, password }) {
    const code = String(churchCode || "").trim().toUpperCase();
    const eop = String(emailOrPhone || "").trim().toLowerCase();
    const pass = String(password || "");

    if (!code) throw new Error("Enter your Church Code.");
    if (!eop) throw new Error("Enter Email or Phone.");
    if (!pass) throw new Error("Enter Password.");

    // set tenant selection (local)
    if (code !== tenantCode) await setTenantCode(code);

    // ✅ Demo Admin (matches your template hint)
    const isDemoTenant = code === DEMO_INVITE_CODE;
    const isAdminIdentity = eop === DEMO_ADMIN_EMAIL.toLowerCase() || normPhone(eop) === normPhone(DEMO_ADMIN_PHONE);
    if (isDemoTenant && isAdminIdentity && pass === DEMO_ADMIN_PASSWORD) {
      const admin = {
        id: "admin-demo-1",
        tenantCode: code,
        name: "Pastor Admin",
        email: DEMO_ADMIN_EMAIL,
        phone: DEMO_ADMIN_PHONE,
        role: "ADMIN",
      };
      setUser(admin);
      return admin;
    }

    // members are tenant scoped
    const found = members.find((m) => {
      if ((m.tenantCode || "").toUpperCase() !== code) return false;
      const emailMatch = (m.email || "").toLowerCase() === eop;
      const phoneMatch = normPhone(m.phone) === normPhone(eop);
      return (emailMatch || phoneMatch) && m.password === pass;
    });

    if (!found) throw new Error("Invalid credentials.");
    setUser(found);
    return found;
  }

  async function signup({ churchCode, name, email, phone, password }) {
    const code = String(churchCode || "").trim().toUpperCase();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();
    const pass = String(password || "");

    if (!code) throw new Error("Church Code required.");
    if (!name) throw new Error("Name required.");
    if (!pass) throw new Error("Password required.");
    if (!cleanEmail && !cleanPhone) throw new Error("Email or Phone required.");

    if (code !== tenantCode) await setTenantCode(code);

    const exists = members.some((m) => {
      if ((m.tenantCode || "").toUpperCase() !== code) return false;
      return (cleanEmail && (m.email || "").toLowerCase() === cleanEmail) || (cleanPhone && normPhone(m.phone) === normPhone(cleanPhone));
    });
    if (exists) throw new Error("User already exists.");

    const newUser = {
      id: Math.random().toString(16).slice(2) + Date.now().toString(16),
      tenantCode: code,
      name,
      email: cleanEmail,
      phone: cleanPhone,
      password: pass,
      role: "MEMBER",
      createdAt: new Date().toISOString(),
    };

    await addMember(newUser);
    setUser(newUser);
    return newUser;
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, signup, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}