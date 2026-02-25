// File: src/context/AuthContext.js (REPLACE)
// ✅ Member first-time signup creates a MEMBER row in Google Sheet
// ✅ After first login, we store churchCode so user does NOT type it again
// ✅ Uses text/plain POST via gasClient to avoid GAS preflight OPTIONS issues

import React, { createContext, useContext, useEffect, useState } from "react";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { gasPost } from "../api/gasClient";

const AuthContext = createContext({});

const STORAGE_KEY = "@congregate_tenant";
const LAST_LOGIN_KEY = "@congregate_last_login"; // { churchCode, emailOrPhone }

export function AuthProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setTenant(JSON.parse(stored));
    } catch (e) {
      console.log("[AuthContext] loadSession error:", e?.message || e);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSession(data) {
    setTenant(data);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async function logout() {
    setTenant(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  async function saveLastLogin({ churchCode, emailOrPhone }) {
    try {
      await AsyncStorage.setItem(
        LAST_LOGIN_KEY,
        JSON.stringify({ churchCode, emailOrPhone })
      );
    } catch {}
  }

  async function loadLastLogin() {
    try {
      const raw = await AsyncStorage.getItem(LAST_LOGIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // ==========================================
  // 1) PASTOR CREATES CHURCH (ADMIN)
  // ==========================================
  async function createChurchAndLogin({ churchName, pastorName, phone, email, password }) {
    const data = await gasPost("billing", {
      action: "start",
      churchName,
      adminName: pastorName,
      adminEmail: email,
      adminPhone: phone,
      adminPassword: password,
    });

    if (!data?.ok) {
      throw new Error(data?.error || "Failed to create church.");
    }

    const churchCode = data.churchCode;

    await saveSession({
      inviteCode: churchCode,
      churchCode,
      churchName,
      planStatus: "PENDING",
      sessionId: data.sessionId,
      checkoutUrl: data.checkoutUrl,
      role: "ADMIN",
      email,
      name: pastorName,
    });

    await saveLastLogin({ churchCode, emailOrPhone: email });

    if (data.checkoutUrl) {
      Linking.openURL(data.checkoutUrl).catch(() => {});
    }
  }

  // ==========================================
  // 2) MEMBER JOINS (FIRST TIME) => CREATES MEMBER ROW
  // ==========================================
  async function joinChurchAndLogin({ churchCode, name, phone, email, password }) {
    const cc = String(churchCode || "").trim().toUpperCase();
    if (!cc) throw new Error("Church Code is required.");

    const data = await gasPost("members", {
      action: "register",
      churchCode: cc,
      name,
      phone,
      email,
      password,
    });

    if (!data?.ok) {
      throw new Error(data?.error || "Could not create member account.");
    }

    const member = data.member || {};
    const church = data.church || {};

    await saveSession({
      inviteCode: member.churchCode || cc,
      churchCode: member.churchCode || cc,
      churchName: church.churchName || "",
      planStatus: String(church.status || "ACTIVE").toUpperCase(),
      role: "MEMBER",
      email: member.email || email,
      phone: member.phone || phone,
      name: member.name || name,
      memberId: member.id || null,
      lastLoginAt: member.lastLoginAt || null,
    });

    await saveLastLogin({ churchCode: cc, emailOrPhone: email || phone });
  }

  // ==========================================
  // 3) RETURNING LOGIN
  // - If churchCode is empty, we use last saved churchCode (so user doesn't type it again)
  // ==========================================
  async function login({ churchCode, emailOrPhone, password }) {
    const last = await loadLastLogin();

    const cc =
      String(churchCode || "").trim().toUpperCase() ||
      String(last?.churchCode || "").trim().toUpperCase();

    if (!cc) {
      throw new Error("Church Code required the first time. After login, it will be remembered.");
    }

    const data = await gasPost("auth", {
      action: "login",
      churchCode: cc,
      emailOrPhone,
      password,
    });

    if (!data?.ok) {
      throw new Error(data?.error || "Invalid login.");
    }

    const member = data.member || {};
    const church = data.church || {};

    await saveSession({
      inviteCode: member.churchCode || cc,
      churchCode: member.churchCode || cc,
      churchName: church.churchName || member.churchName || "",
      planStatus: String(church.status || "ACTIVE").toUpperCase(),
      role: String(member.role || "MEMBER").toUpperCase(),
      email: member.email || (String(emailOrPhone).includes("@") ? emailOrPhone : ""),
      phone: member.phone || (!String(emailOrPhone).includes("@") ? emailOrPhone : ""),
      name: member.name || "",
      memberId: member.id || null,
      lastLoginAt: member.lastLoginAt || null,
    });

    await saveLastLogin({ churchCode: cc, emailOrPhone });
  }

  return (
    <AuthContext.Provider
      value={{
        tenant,
        isLoading,
        login,
        logout,
        createChurchAndLogin,
        joinChurchAndLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}