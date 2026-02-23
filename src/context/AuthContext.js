// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUQo4wZqra7KnMinDMqwABjvJXUVXstvup3xLu9ENPg0HCxEU98xhaYm6-naUL-T8B/exec";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load active session when the app starts
  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const stored = await AsyncStorage.getItem('@congregate_tenant');
      if (stored) {
        setTenant(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load session", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSession(data) {
    setTenant(data);
    await AsyncStorage.setItem('@congregate_tenant', JSON.stringify(data));
  }

  async function logout() {
    setTenant(null);
    await AsyncStorage.removeItem('@congregate_tenant');
  }

  // ==========================================
  // 1. PASTOR CREATES A NEW CHURCH
  // ==========================================
  async function createChurchAndLogin({ churchName, pastorName, phone, email, password }) {
    // Calls the Code.gs billingStart_ endpoint which automatically generates a unique churchCode
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resource: "billing",
        action: "start",
        churchName: churchName,
        adminName: pastorName,
        adminEmail: email,
        adminPhone: phone,
        adminPassword: password, // Handled securely by your Code.gs hash function
        plan: "PRO"
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || "Failed to create church. Please try again.");
    }

    // Save to device storage. The app will detect planStatus: "PENDING"
    // and route the Pastor to PaymentRequiredScreen
    await saveSession({
      inviteCode: data.churchCode, // The newly generated code!
      churchName: churchName,
      planStatus: "PENDING", 
      sessionId: data.sessionId,
      checkoutUrl: data.checkoutUrl,
      role: "ADMIN",
      email: email,
      name: pastorName
    });

    // Automatically open the checkout URL so they can set up their PayPal subscription
    if (data.checkoutUrl) {
      Linking.openURL(data.checkoutUrl).catch(err => console.error("Couldn't open payment page", err));
    }
  }

  // ==========================================
  // 2. MEMBER JOINS AN EXISTING CHURCH
  // ==========================================
  async function joinChurchAndLogin({ inviteCode, name, phone, email, password }) {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resource: "auth", // Adjust this if your actual Google Script auth endpoint differs
        action: "signup",
        churchCode: inviteCode,
        name: name,
        email: email,
        phone: phone,
        password: password
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || "Invalid Church Code or account already exists.");
    }

    await saveSession({
      inviteCode: data.churchCode || inviteCode,
      planStatus: data.planStatus || "ACTIVE", // Members inherit church's active status
      role: "MEMBER",
      email: email,
      name: name
    });
  }

  // ==========================================
  // 3. RETURNING USER LOGS IN
  // ==========================================
  async function login({ churchCode, emailOrPhone, password }) {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resource: "auth", // Adjust this if your actual Google Script auth endpoint differs
        action: "login",
        churchCode: churchCode,
        emailOrPhone: emailOrPhone,
        password: password
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || "Invalid login credentials. Check your Church Code and Password.");
    }

    await saveSession({
      inviteCode: data.churchCode || churchCode,
      planStatus: data.planStatus || "ACTIVE",
      role: data.role || "MEMBER",
      email: data.email || emailOrPhone,
      churchName: data.churchName
    });
  }

  return (
    <AuthContext.Provider value={{
      tenant,
      isLoading,
      login,
      logout,
      createChurchAndLogin,
      joinChurchAndLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}