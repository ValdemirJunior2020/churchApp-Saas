// File: src/context/AuthContext.js

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const AuthContext = createContext(null);

const TRIAL_DAYS = 7;
const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

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

function toMillis(value) {
  if (!value) return null;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function ensureFreshAuthSession(user) {
  if (!user) {
    throw new Error("Authentication session not available.");
  }

  await user.getIdToken(true);

  if (auth.currentUser?.uid !== user.uid) {
    throw new Error("Authentication session not ready yet. Please try again.");
  }
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

    const normalizedProfile = {
      uid: user.uid,
      fullName: userData.fullName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      role: userData.role || "MEMBER",
      churchId: userData.churchId || "",
      churchCode: userData.churchCode || "",
      createdAt: userData.createdAt || null,
      updatedAt: userData.updatedAt || null,
      ...userData,
    };

    setProfile(normalizedProfile);

    if (!normalizedProfile.churchId) {
      setTenant(null);
      return;
    }

    const churchRef = doc(db, "churches", normalizedProfile.churchId);
    const churchSnap = await getDoc(churchRef);

    if (!churchSnap.exists()) {
      setTenant(null);
      return;
    }

    const churchData = churchSnap.data();
    const normalizedTrialEndsAt = toMillis(churchData.trialEndsAt);
    const normalizedTrialStartedAt = toMillis(churchData.trialStartedAt);

    const normalizedTenant = {
      churchId: churchSnap.id,
      churchName: churchData.churchName || "",
      churchCode: churchData.churchCode || "",
      ownerId: churchData.ownerId || churchData.pastorId || churchData.createdBy || "",
      plan: churchData.plan || "FREE",
      planStatus: churchData.planStatus || "ACTIVE",
      subscriptionStatus: churchData.subscriptionStatus || "INACTIVE",
      trialStartedAt: normalizedTrialStartedAt,
      trialEndsAt: normalizedTrialEndsAt,
      memberCount: churchData.memberCount || 0,
      backgroundImageUrl: churchData.backgroundImageUrl || "",
      logoUrl: churchData.logoUrl || "",
      youtubeUrl: churchData.youtubeUrl || "",
      youtubeVideoId: churchData.youtubeVideoId || "",
      themePrimaryHex: churchData.themePrimaryHex || "#0F172A",
      themeAccentHex: churchData.themeAccentHex || "#22D3EE",
      createdAt: churchData.createdAt || null,
      updatedAt: churchData.updatedAt || null,
      role: normalizedProfile.role || "MEMBER",
    };

    setTenant(normalizedTenant);
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

    if (!cleanChurchName) throw new Error("Church name is required.");
    if (!cleanFullName) throw new Error("Full name is required.");
    if (!cleanEmail) throw new Error("Email is required.");
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const uid = cred.user.uid;

    await ensureFreshAuthSession(cred.user);

    const churchRef = doc(collection(db, "churches"));
    const churchCode = makeChurchCode(cleanChurchName);
    const now = Date.now();
    const trialEndsAt = now + TRIAL_MS;

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
      plan: "FREE",
      planStatus: "TRIAL",
      subscriptionStatus: "TRIALING",
      trialStartedAt: now,
      trialEndsAt,
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
    return { uid, churchId: churchRef.id, churchCode, trialEndsAt };
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

    if (!code) throw new Error("Please enter the Church Code.");
    if (!cleanFullName) throw new Error("Please enter your full name.");
    if (!cleanEmail) throw new Error("Please enter your email.");
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const churchesRef = collection(db, "churches");
    const q = query(churchesRef, where("churchCode", "==", code));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error("Church Code not found.");
    }

    const churchDoc = snap.docs[0];
    const churchId = churchDoc.id;

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const uid = cred.user.uid;

      await ensureFreshAuthSession(cred.user);

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
    } catch (error) {
      if (error?.code === "auth/email-already-in-use") {
        throw new Error(
          "This email is already registered. Tap 'I Already Have Access' and log in instead."
        );
      }
      if (
        error?.code === "permission-denied" ||
        error?.message?.includes("Missing or insufficient permissions")
      ) {
        throw new Error("Permission denied while joining church. Publish the Firestore rules and try again.");
      }
      throw error;
    }
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

  async function deleteAccount() {
    const currentUser = auth.currentUser;
    const currentProfile = profile;
    const currentTenant = tenant;

    if (!currentUser || !currentProfile) {
      throw new Error("No authenticated user found.");
    }

    if (currentProfile.role === "ADMIN") {
      throw new Error("Admin account deletion is blocked for now. Please transfer ownership first.");
    }

    const batch = writeBatch(db);

    if (currentTenant?.churchId) {
      batch.delete(doc(db, "churches", currentTenant.churchId, "members", currentUser.uid));
      batch.update(doc(db, "churches", currentTenant.churchId), {
        memberCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
    }

    batch.delete(doc(db, "users", currentUser.uid));
    await batch.commit();

    await deleteUser(currentUser);

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
      deleteAccount,
    }),
    [firebaseUser, profile, tenant, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}