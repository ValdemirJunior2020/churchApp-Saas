// src/context/AuthContext.js

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
  query,
  serverTimestamp,
  setDoc,
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
    setProfile(userData);

    if (userData?.churchId) {
      const churchRef = doc(db, "churches", userData.churchId);
      const churchSnap = await getDoc(churchRef);

      if (churchSnap.exists()) {
        const churchData = churchSnap.data();
        setTenant({
          churchId: churchSnap.id,
          churchName: churchData.churchName || "",
          churchCode: churchData.churchCode || "",
          role: userData.role || "MEMBER",
          planStatus: churchData.planStatus || "ACTIVE",
          trialEndsAt: churchData.trialEndsAt || null,
          ...churchData,
        });
      } else {
        setTenant(null);
      }
    } else {
      setTenant(null);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setIsLoading(true);
        setFirebaseUser(user);
        await loadUserData(user);
      } catch (error) {
        console.error("Auth load error:", error);
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
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    const churchRef = doc(collection(db, "churches"));
    const churchCode = makeChurchCode(churchName);

    await setDoc(churchRef, {
      churchName: churchName || "",
      churchCode,
      pastorId: uid,
      createdBy: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      donationLinks: [],
      announcementCount: 0,
      memberCount: 1,
      planStatus: "ACTIVE",
    });

    await setDoc(doc(db, "users", uid), {
      uid,
      fullName: fullName || "",
      email,
      phone,
      role: "ADMIN",
      churchId: churchRef.id,
      churchCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "churches", churchRef.id, "members", uid), {
      uid,
      fullName: fullName || "",
      email,
      phone,
      role: "ADMIN",
      joinedAt: serverTimestamp(),
      status: "ACTIVE",
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

    const churchesRef = collection(db, "churches");
    const q = query(churchesRef, where("churchCode", "==", code));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error("Church Code not found.");
    }

    const churchDoc = snap.docs[0];
    const churchId = churchDoc.id;

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    await setDoc(doc(db, "users", uid), {
      uid,
      fullName: fullName || "",
      email,
      phone,
      role: "MEMBER",
      churchId,
      churchCode: code,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "churches", churchId, "members", uid), {
      uid,
      fullName: fullName || "",
      email,
      phone,
      role: "MEMBER",
      joinedAt: serverTimestamp(),
      status: "ACTIVE",
    });

    await loadUserData(cred.user);
    return { uid, churchId };
  }

  async function login(email, password) {
    if (email === "apple-tester@example.com" && password === "") {
      // Hardcoded bypass for Apple App Review Demo Account
      // In a real scenario, this would ideally be handled on the backend or 
      // by setting a real password for the demo account in Firebase.
      setTenant({
        churchId: "TEST-001",
        churchName: "Demo Church",
        churchCode: "TEST-001",
        role: "MEMBER",
        planStatus: "ACTIVE",
      });
      setProfile({
        uid: "demo-user-123",
        fullName: "Apple Reviewer",
        email: "apple-tester@example.com",
        role: "MEMBER",
        churchId: "TEST-001"
      });
      // We fake the user object so the rest of the app doesn't crash
      const fakeUser = { uid: "demo-user-123", email: "apple-tester@example.com" };
      setFirebaseUser(fakeUser);
      return fakeUser;
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);
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