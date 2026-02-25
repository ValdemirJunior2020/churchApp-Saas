// File: src/context/AuthContext.js
// REPLACE ENTIRE FILE (keeps your flow, fixes GAS 405 + login response shape + auto-admin access)

import React, { createContext, useContext, useState, useEffect } from "react";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { gasPost } from "../api/gasClient";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const stored = await AsyncStorage.getItem("@congregate_tenant");
      if (stored) setTenant(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load session", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSession(data) {
    setTenant(data);
    await AsyncStorage.setItem("@congregate_tenant", JSON.stringify(data));
  }

  async function logout() {
    setTenant(null);
    await AsyncStorage.removeItem("@congregate_tenant");
  }

  // Pastor creates church -> immediately enters admin area (ACTIVE for now)
  async function createChurchAndLogin({ churchName, pastorName, phone, email, password }) {
    const data = await gasPost("billing", {
      action: "start",
      churchName,
      adminName: pastorName,
      adminEmail: email,
      adminPhone: phone,
      adminPassword: password,
      plan: "PRO",
    });

    const session = {
      inviteCode: data.churchCode,
      churchCode: data.churchCode,
      churchName,
      planStatus: "ACTIVE", // <- onboarding access unlocked for now
      sessionId: data.sessionId || null,
      checkoutUrl: data.checkoutUrl || null,
      role: "ADMIN",
      email,
      phone,
      name: pastorName,
    };

    await saveSession(session);

    if (data.checkoutUrl) {
      Linking.openURL(data.checkoutUrl).catch((err) =>
        console.error("Couldn't open payment page", err)
      );
    }

    return data;
  }

  // NOTE: backend auth/signup endpoint not implemented in your Code.gs yet
  async function joinChurchAndLogin({ inviteCode, name, phone, email, password }) {
    const data = await gasPost("auth", {
      action: "signup",
      churchCode: inviteCode,
      name,
      email,
      phone,
      password,
    });

    const member = data.member || {};
    await saveSession({
      inviteCode: member.churchCode || data.churchCode || inviteCode,
      churchCode: member.churchCode || data.churchCode || inviteCode,
      planStatus: data.planStatus || "ACTIVE",
      role: member.role || data.role || "MEMBER",
      email: member.email || email || "",
      phone: member.phone || phone || "",
      name: member.name || name || "",
      churchName: data.churchName || member.churchName || null,
      memberId: member.id || null,
    });

    return data;
  }

  async function login({ churchCode, emailOrPhone, password }) {
    const data = await gasPost("auth", {
      action: "login",
      churchCode,
      emailOrPhone,
      password,
    });

    const member = data.member || {};

    await saveSession({
      inviteCode: member.churchCode || churchCode,
      churchCode: member.churchCode || churchCode,
      planStatus: "ACTIVE",
      role: member.role || "MEMBER",
      email: member.email || (String(emailOrPhone).includes("@") ? emailOrPhone : ""),
      phone: member.phone || (!String(emailOrPhone).includes("@") ? emailOrPhone : ""),
      name: member.name || "",
      churchName: member.churchName || null,
      memberId: member.id || null,
      status: member.status || "ACTIVE",
      lastLoginAt: member.lastLoginAt || null,
    });

    return member;
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