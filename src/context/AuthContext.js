// File: src/context/AuthContext.js

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const AuthContext = createContext(null);

function makeChurchCode(churchName = "CHURCH") {
  const clean = String(churchName)
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .map((part) => part.slice(0, 3).toUpperCase())
    .join("")
    .slice(0, 8);

  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${clean || "CHURCH"}-${random}`;
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUserData(user) {
    if (!user) {
      setProfile(null);
      setTenant(null);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      setProfile(null);
      setTenant(null);
      return;
    }

    const userData = userSnap.data();
    setProfile({
      uid: user.uid,
      ...userData,
    });

    if (!userData?.churchId) {
      setTenant(null);
      return;
    }

    const churchRef = doc(db, "churches", userData.churchId);
    const churchSnap = await getDoc(churchRef);

    if (!churchSnap.exists()) {
      setTenant(null);
      return;
    }

    const churchData = churchSnap.data();

    setTenant({
      churchId: churchSnap.id,
      churchName: churchData.churchName || "",
      churchCode: churchData.churchCode || "",
      role: userData.role || "MEMBER",
      plan: churchData.plan || "FREE",
      planStatus: churchData.planStatus || "ACTIVE",
      subscriptionStatus: churchData.subscriptionStatus || "INACTIVE",
      trialEndsAt: churchData.trialEndsAt || null,
      ownerId: churchData.ownerId || churchData.pastorId || "",
      ...churchData,
    });
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setIsLoading(true);
        setFirebaseUser(user);
        await loadUserData(user);
      } catch (error) {
        console.error("Auth load error:", error);
        setProfile(null);
        setTenant(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsub;
  }, []);

  async function createChurchAccount({
    churchName,
    email,
    password,
    fullName,
    phone = "",
  }) {
    const cleanChurchName = String(churchName || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanFullName = String(fullName || "").trim();
    const cleanPhone = String(phone || "").trim();

    if (!cleanChurchName) {
      throw new Error("Church name is required.");
    }

    if (!cleanFullName) {
      throw new Error("Full name is required.");
    }

    if (!cleanEmail) {
      throw new Error("Email is required.");
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const uid = cred.user.uid;

    const churchRef = doc(collection(db, "churches"));
    const churchCode = makeChurchCode(cleanChurchName);

    await setDoc(doc(db, "users", uid), {
      uid,
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      role: "ADMIN",
      churchId: churchRef.id,
      churchCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(churchRef, {
      churchId: churchRef.id,
      churchName: cleanChurchName,
      churchCode,
      ownerId: uid,
      pastorId: uid,
      createdBy: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      donationLinks: [],
      announcementCount: 0,
      memberCount: 1,
      backgroundImageUrl: "",
      logoUrl: "",
      youtubeUrl: "",
      youtubeVideoId: "",
      themePrimaryHex: "#0F172A",
      themeAccentHex: "#22D3EE",
      role: "ADMIN",
      plan: "FREE",
      planStatus: "ACTIVE",
      subscriptionStatus: "INACTIVE",
      trialEndsAt: null,
    });

    await setDoc(doc(db, "churches", churchRef.id, "members", uid), {
      uid,
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      role: "ADMIN",
      joinedAt: serverTimestamp(),
      status: "ACTIVE",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await loadUserData(cred.user);
    return { uid, churchId: churchRef.id, churchCode };
  }

  async function joinChurchAccount({
    churchCode,
    email,
    password,
    fullName,
    phone = "",
  }) {
    const code = String(churchCode || "").trim().toUpperCase();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanFullName = String(fullName || "").trim();
    const cleanPhone = String(phone || "").trim();

    if (!code) {
      throw new Error("Church Code not found.");
    }

    const churchesRef = collection(db, "churches");
    const q = query(churchesRef, where("churchCode", "==", code));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error("Church Code not found.");
    }

    const churchDoc = snap.docs[0];
    const churchId = churchDoc.id;

    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const uid = cred.user.uid;

    await setDoc(doc(db, "users", uid), {
      uid,
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      role: "MEMBER",
      churchId,
      churchCode: code,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "churches", churchId, "members", uid), {
      uid,
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      role: "MEMBER",
      joinedAt: serverTimestamp(),
      status: "ACTIVE",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "churches", churchId), {
      memberCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    await loadUserData(cred.user);
    return { uid, churchId };
  }

  async function login(email, password) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    await loadUserData(cred.user);
    return cred.user;
  }

  async function logout() {
    await signOut(auth);
    setFirebaseUser(null);
    setProfile(null);
    setTenant(null);
  }

  const value = useMemo(
    () => ({
      user: firebaseUser,
      profile,
      tenant,
      isLoading,
      createChurchAccount,
      joinChurchAccount,
      login,
      logout,
    }),
    [firebaseUser, profile, tenant, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}