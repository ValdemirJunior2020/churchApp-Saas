// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_ADMIN_PHONE,
  DEMO_INVITE_CODE,
  GAS_URL,
} from "../config";

const AuthContext = createContext({});
const SESSION_KEY = "@congregate_tenant";

function normalize(value) {
  return String(value || "").trim();
}

function upper(value) {
  return normalize(value).toUpperCase();
}

function lower(value) {
  return normalize(value).toLowerCase();
}

function isValidGasUrl(url) {
  const s = String(url || "");
  return s.includes("/macros/s/") && s.endsWith("/exec");
}

function isWeb() {
  return Platform.OS === "web";
}

async function safeJsonFromResponse(res) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Server returned an invalid response.");
  }
}

async function postToGas(payload) {
  if (!isValidGasUrl(GAS_URL)) {
    throw new Error("Backend is not configured.");
  }

  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload || {}),
  });

  const data = await safeJsonFromResponse(response);

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }

  return data;
}

function buildDemoSession() {
  return {
    inviteCode: DEMO_INVITE_CODE,
    churchName: "Apple Review Demo Church",
    planStatus: "ACTIVE",
    role: "ADMIN",
    email: DEMO_ADMIN_EMAIL,
    phone: DEMO_ADMIN_PHONE,
    name: "Apple Review Admin",
    isDemo: true,
  };
}

export function AuthProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const stored = await AsyncStorage.getItem(SESSION_KEY);
      if (stored) {
        setTenant(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load session", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSession(data) {
    setTenant(data);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));
  }

  async function logout() {
    setTenant(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }

  function matchesDemoLogin({ churchCode, emailOrPhone, password }) {
    const code = upper(churchCode);
    const loginValue = lower(emailOrPhone);
    const rawPhone = normalize(emailOrPhone);
    const pass = normalize(password);

    return (
      code === upper(DEMO_INVITE_CODE) &&
      pass === DEMO_ADMIN_PASSWORD &&
      (loginValue === lower(DEMO_ADMIN_EMAIL) || rawPhone === DEMO_ADMIN_PHONE)
    );
  }

  async function createChurchAndLogin({
    churchName,
    pastorName,
    phone,
    email,
    password,
  }) {
    const payload = {
      resource: "billing",
      action: "start",
      churchName: normalize(churchName),
      adminName: normalize(pastorName),
      adminEmail: normalize(email),
      adminPhone: normalize(phone),
      adminPassword: normalize(password),
      plan: "PRO",
    };

    try {
      const data = await postToGas(payload);

      await saveSession({
        inviteCode: data.churchCode,
        churchName: normalize(churchName),
        planStatus: data.planStatus || "PENDING",
        sessionId: data.sessionId || "",
        checkoutUrl: data.checkoutUrl || "",
        role: "ADMIN",
        email: normalize(email),
        phone: normalize(phone),
        name: normalize(pastorName),
        isDemo: false,
      });

      if (data.checkoutUrl && !isWeb()) {
        Linking.openURL(data.checkoutUrl).catch((error) => {
          console.error("Could not open payment page", error);
        });
      }
    } catch (error) {
      throw new Error(
        error?.message || "Failed to create church. Please try again."
      );
    }
  }

  async function joinChurchAndLogin({
    inviteCode,
    name,
    phone,
    email,
    password,
  }) {
    const payload = {
      resource: "auth",
      action: "signup",
      churchCode: upper(inviteCode),
      name: normalize(name),
      email: normalize(email),
      phone: normalize(phone),
      password: normalize(password),
    };

    try {
      const data = await postToGas(payload);

      await saveSession({
        inviteCode: data.churchCode || upper(inviteCode),
        churchName: data.churchName || "Church",
        planStatus: data.planStatus || "ACTIVE",
        role: data.role || "MEMBER",
        email: data.email || normalize(email),
        phone: data.phone || normalize(phone),
        name: data.name || normalize(name),
        isDemo: false,
      });
    } catch (error) {
      throw new Error(
        error?.message || "Invalid Church Code or account already exists."
      );
    }
  }

  async function login({ churchCode, emailOrPhone, password }) {
    if (matchesDemoLogin({ churchCode, emailOrPhone, password })) {
      await saveSession(buildDemoSession());
      return;
    }

    const payload = {
      resource: "auth",
      action: "login",
      churchCode: upper(churchCode),
      emailOrPhone: normalize(emailOrPhone),
      password: normalize(password),
    };

    try {
      const data = await postToGas(payload);

      await saveSession({
        inviteCode: data.churchCode || upper(churchCode),
        churchName: data.churchName || "Church",
        planStatus: data.planStatus || "ACTIVE",
        role: data.role || "MEMBER",
        email: data.email || normalize(emailOrPhone),
        phone: data.phone || "",
        name: data.name || "",
        isDemo: false,
      });
    } catch (error) {
      throw new Error(
        error?.message ||
          "Invalid login credentials. Check your Church Code and Password."
      );
    }
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