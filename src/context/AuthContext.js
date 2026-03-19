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

function logStep(label, payload) {
  try {
    console.log(`[AUTH] ${label}`, payload ?? "");
  } catch {
    console.log(`[AUTH] ${label}`);
  }
}

async function ensureFreshAuthSession(user) {
  logStep("ensureFreshAuthSession:start", { uid: user?.uid || null });

  if (!user) {
    logStep("ensureFreshAuthSession:error", "No user");
    throw new Error("Authentication session not available.");
  }

  await user.getIdToken(true);

  logStep("ensureFreshAuthSession:tokenRefreshed", {
    currentAuthUid: auth.currentUser?.uid || null,
    expectedUid: user.uid,
  });

  if (auth.currentUser?.uid !== user.uid) {
    logStep("ensureFreshAuthSession:error", "Auth current user mismatch");
    throw new Error("Authentication session not ready yet. Please try again.");
  }

  logStep("ensureFreshAuthSession:done", { uid: user.uid });
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUserData(user) {
    logStep("loadUserData:start", { uid: user?.uid || null, email: user?.email || null });

    if (!user) {
      logStep("loadUserData:noUser");
      setProfile(null);
      setTenant(null);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    logStep("loadUserData:userDocRef", { path: `users/${user.uid}` });

    const userSnap = await getDoc(userRef);
    logStep("loadUserData:userDocExists", { exists: userSnap.exists() });

    if (!userSnap.exists()) {
      logStep("loadUserData:userDocMissing", { uid: user.uid });
      setProfile(null);
      setTenant(null);
      return;
    }

    const userData = userSnap.data();
    logStep("loadUserData:userDocData", userData);

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
    logStep("loadUserData:profileSet", normalizedProfile);

    if (!normalizedProfile.churchId) {
      logStep("loadUserData:noChurchIdOnProfile");
      setTenant(null);
      return;
    }

    const churchRef = doc(db, "churches", normalizedProfile.churchId);
    logStep("loadUserData:churchDocRef", { path: `churches/${normalizedProfile.churchId}` });

    const churchSnap = await getDoc(churchRef);
    logStep("loadUserData:churchDocExists", { exists: churchSnap.exists() });

    if (!churchSnap.exists()) {
      logStep("loadUserData:churchDocMissing", { churchId: normalizedProfile.churchId });
      setTenant(null);
      return;
    }

    const churchData = churchSnap.data();
    logStep("loadUserData:churchDocData", churchData);

    const normalizedTenant = {
      churchId: churchSnap.id,
      churchName: churchData.churchName || "",
      churchCode: churchData.churchCode || "",
      ownerId: churchData.ownerId || churchData.pastorId || churchData.createdBy || "",
      plan: churchData.plan || "FREE",
      planStatus: churchData.planStatus || "ACTIVE",
      subscriptionStatus: churchData.subscriptionStatus || "INACTIVE",
      trialStartedAt: toMillis(churchData.trialStartedAt),
      trialEndsAt: toMillis(churchData.trialEndsAt),
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
    logStep("loadUserData:tenantSet", normalizedTenant);
  }

  useEffect(() => {
    logStep("onAuthStateChanged:subscribe");

    const unsub = onAuthStateChanged(auth, async (user) => {
      logStep("onAuthStateChanged:fired", {
        uid: user?.uid || null,
        email: user?.email || null,
      });

      try {
        setIsLoading(true);
        setFirebaseUser(user);
        await loadUserData(user);
      } catch (error) {
        console.error("[AUTH] Auth load error:", error);
        setProfile(null);
        setTenant(null);
      } finally {
        setIsLoading(false);
        logStep("onAuthStateChanged:done");
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
    logStep("createChurchAccount:start", { churchName, email, fullName, phone });

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

    logStep("createChurchAccount:firebaseAuthCreated", { uid });

    await ensureFreshAuthSession(cred.user);

    const churchRef = doc(collection(db, "churches"));
    const churchCode = makeChurchCode(cleanChurchName);
    const now = Date.now();
    const trialEndsAt = now + TRIAL_MS;

    logStep("createChurchAccount:churchPrepared", {
      churchId: churchRef.id,
      churchCode,
      trialEndsAt,
    });

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
    logStep("createChurchAccount:userDocSaved", { uid });

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
    logStep("createChurchAccount:churchDocSaved", { churchId: churchRef.id });

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
    logStep("createChurchAccount:memberDocSaved", { churchId: churchRef.id, uid });

    await loadUserData(cred.user);
    logStep("createChurchAccount:done", { uid, churchId: churchRef.id, churchCode });

    return { uid, churchId: churchRef.id, churchCode, trialEndsAt };
  }

  async function joinChurchAccount({
    churchCode,
    email,
    password,
    fullName,
    phone = "",
  }) {
    logStep("joinChurchAccount:start", { churchCode, email, fullName, phone });

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

    logStep("joinChurchAccount:lookupChurchByCode", { code });

    const churchesRef = collection(db, "churches");
    const q = query(churchesRef, where("churchCode", "==", code));
    const snap = await getDocs(q);

    logStep("joinChurchAccount:lookupResult", {
      empty: snap.empty,
      count: snap.size,
    });

    if (snap.empty) {
      throw new Error("Church Code not found.");
    }

    const churchDoc = snap.docs[0];
    const churchId = churchDoc.id;
    const churchData = churchDoc.data();

    logStep("joinChurchAccount:churchFound", {
      churchId,
      churchName: churchData?.churchName || null,
      churchCode: churchData?.churchCode || null,
    });

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const uid = cred.user.uid;

      logStep("joinChurchAccount:firebaseAuthCreated", { uid, email: cleanEmail });

      await ensureFreshAuthSession(cred.user);

      logStep("joinChurchAccount:saveUserDoc:start", {
        path: `users/${uid}`,
        churchId,
        churchCode: code,
      });

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

      logStep("joinChurchAccount:saveUserDoc:done", { uid });

      logStep("joinChurchAccount:saveMemberDoc:start", {
        path: `churches/${churchId}/members/${uid}`,
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

      logStep("joinChurchAccount:saveMemberDoc:done", { uid, churchId });

      try {
        logStep("joinChurchAccount:updateMemberCount:start", { churchId });

        await updateDoc(doc(db, "churches", churchId), {
          memberCount: increment(1),
          updatedAt: serverTimestamp(),
        });

        logStep("joinChurchAccount:updateMemberCount:done", { churchId });
      } catch (countError) {
        console.log("[AUTH] joinChurchAccount:updateMemberCount:skipped", countError);
      }

      logStep("joinChurchAccount:loadUserData:start", { uid });

      await loadUserData(cred.user);

      logStep("joinChurchAccount:done", { uid, churchId });

      return { uid, churchId };
    } catch (error) {
      console.log("[AUTH] joinChurchAccount:error", error);

      if (error?.code === "auth/email-already-in-use") {
        throw new Error(
          "This email is already registered. Tap Login instead of joining again."
        );
      }

      if (
        error?.code === "permission-denied" ||
        error?.message?.includes("Missing or insufficient permissions")
      ) {
        throw new Error(
          "Firestore blocked the join flow. Publish the Firestore rules and try again."
        );
      }

      throw error;
    }
  }

  async function login(email, password) {
    logStep("login:start", { email });

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);

    logStep("login:firebaseSuccess", { uid: cred.user.uid });

    await loadUserData(cred.user);

    logStep("login:done", { uid: cred.user.uid });

    return cred.user;
  }

  async function logout() {
    logStep("logout:start", { uid: auth.currentUser?.uid || null });

    await signOut(auth);
    setFirebaseUser(null);
    setProfile(null);
    setTenant(null);

    logStep("logout:done");
  }

  async function deleteAccount() {
    logStep("deleteAccount:start", {
      currentUserUid: auth.currentUser?.uid || null,
      role: profile?.role || null,
      churchId: tenant?.churchId || null,
    });

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
      logStep("deleteAccount:memberDocQueuedForDelete", {
        path: `churches/${currentTenant.churchId}/members/${currentUser.uid}`,
      });

      try {
        batch.update(doc(db, "churches", currentTenant.churchId), {
          memberCount: increment(-1),
          updatedAt: serverTimestamp(),
        });
        logStep("deleteAccount:memberCountQueuedForUpdate", {
          path: `churches/${currentTenant.churchId}`,
        });
      } catch (error) {
        console.log("[AUTH] deleteAccount:memberCountUpdate:skipped", error);
      }
    }

    batch.delete(doc(db, "users", currentUser.uid));
    logStep("deleteAccount:userDocQueuedForDelete", {
      path: `users/${currentUser.uid}`,
    });

    await batch.commit();
    logStep("deleteAccount:batchCommitted");

    await deleteUser(currentUser);
    logStep("deleteAccount:firebaseUserDeleted");

    setFirebaseUser(null);
    setProfile(null);
    setTenant(null);

    logStep("deleteAccount:done");
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