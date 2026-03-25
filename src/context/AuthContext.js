import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  fetchSignInMethodsForEmail,
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
const SUPER_ADMIN_EMAILS = ["infojr.83@gmail.com", "super@admin.com", "adminjunior@admin.com"];

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
    logStep("loadUserData:start", { uid: user?.uid || null, email: user?.email || null });

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
      email: userData.email || user.email || "",
      phone: userData.phone || "",
      role: SUPER_ADMIN_EMAILS.includes((userData.email || user.email || "").toLowerCase())
        ? "SUPER_ADMIN"
        : userData.role || "MEMBER",
      churchId: userData.churchId || "",
      churchCode: userData.churchCode || "",
      churchName: userData.churchName || "",
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

    setTenant({
      churchId: churchSnap.id,
      churchName: churchData.churchName || normalizedProfile.churchName || "",
      churchCode: churchData.churchCode || normalizedProfile.churchCode || "",
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
    });

    logStep("loadUserData:done", { uid: user.uid, churchId: normalizedProfile.churchId });
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setIsLoading(true);
        setFirebaseUser(user);

        if (!user) {
          setProfile(null);
          setTenant(null);
          setIsLoading(false);
          return;
        }

        await loadUserData(user);
      } catch (error) {
        console.error("[AUTH] Auth load error:", error);
        setProfile(null);
        setTenant(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsub;
  }, []);

  async function createChurchAccount({ churchName, email, password, fullName, phone = "" }) {
    const cleanChurchName = String(churchName || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanFullName = String(fullName || "").trim();
    const cleanPhone = String(phone || "").trim();

    if (!cleanChurchName) throw new Error("Church name is required.");
    if (!cleanFullName) throw new Error("Full name is required.");
    if (!cleanEmail) throw new Error("Email is required.");
    if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");

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
      churchName: cleanChurchName,
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

    await setDoc(doc(db, "users", uid, "memberships", churchRef.id), {
      churchId: churchRef.id,
      churchName: cleanChurchName,
      churchCode,
      role: "ADMIN",
      joinedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await loadUserData(cred.user);
    return { uid, churchId: churchRef.id, churchCode, trialEndsAt };
  }

  async function joinChurchAccount({ churchCode, email, password, fullName, phone = "" }) {
    const code = String(churchCode || "").trim().toUpperCase();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanFullName = String(fullName || "").trim();
    const cleanPhone = String(phone || "").trim();

    if (!code) throw new Error("Please enter the Church Code.");
    if (!cleanFullName) throw new Error("Please enter your full name.");
    if (!cleanEmail) throw new Error("Please enter your email.");
    if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");

    const churchesRef = collection(db, "churches");
    const q = query(churchesRef, where("churchCode", "==", code));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error("Church Code not found.");
    }

    const churchDoc = snap.docs[0];
    const churchId = churchDoc.id;
    const churchData = churchDoc.data();

    try {
      const methods = await fetchSignInMethodsForEmail(auth, cleanEmail).catch(() => []);
      const cred = methods?.length
        ? await signInWithEmailAndPassword(auth, cleanEmail, password)
        : await createUserWithEmailAndPassword(auth, cleanEmail, password);

      const uid = cred.user.uid;

      await ensureFreshAuthSession(cred.user);

      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          fullName: cleanFullName,
          email: cleanEmail,
          phone: cleanPhone,
          role: "MEMBER",
          churchId,
          churchCode: code,
          churchName: churchData?.churchName || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "churches", churchId, "members", uid),
        {
          uid,
          fullName: cleanFullName,
          email: cleanEmail,
          phone: cleanPhone,
          role: "MEMBER",
          joinedAt: serverTimestamp(),
          status: "ACTIVE",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "users", uid, "memberships", churchId),
        {
          churchId,
          churchName: churchData?.churchName || "",
          churchCode: code,
          role: "MEMBER",
          joinedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      try {
        await updateDoc(doc(db, "churches", churchId), {
          memberCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (countError) {
        console.log("[AUTH] joinChurchAccount:updateMemberCount:skipped", countError);
      }

      await loadUserData(cred.user);
      return { uid, churchId };
    } catch (error) {
      console.log("[AUTH] joinChurchAccount:error", error);

      if (error?.code === "auth/email-already-in-use") {
        throw new Error("This email is already registered. Tap Login instead of joining again.");
      }

      if (
        error?.code === "permission-denied" ||
        error?.message?.includes("Missing or insufficient permissions")
      ) {
        throw new Error("Firestore blocked the join flow. Publish the Firestore rules and try again.");
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
    try {
      setProfile(null);
      setTenant(null);
      setFirebaseUser(null);
      await signOut(auth);
      return true;
    } catch (error) {
      console.log("[AUTH] logout:error", error);
      throw new Error(error?.message || "Could not log out right now. Please try again.");
    }
  }

  async function deleteAccount() {
    const currentUser = auth.currentUser;
    const currentProfile = profile;
    const currentTenant = tenant;

    if (!currentUser || !currentProfile) {
      throw new Error("No authenticated user found.");
    }

    const currentRole = String(currentProfile.role || "").toUpperCase();
    if (["ADMIN", "SUPER_ADMIN", "OWNER", "PASTOR"].includes(currentRole)) {
      throw new Error(
        "This account cannot be deleted from the member screen. Please transfer ownership or use the admin panel first."
      );
    }

    try {
      const batch = writeBatch(db);

      if (currentTenant?.churchId) {
        batch.delete(doc(db, "churches", currentTenant.churchId, "members", currentUser.uid));
        batch.update(doc(db, "churches", currentTenant.churchId), {
          memberCount: increment(-1),
          updatedAt: serverTimestamp(),
        });
      }

      batch.delete(doc(db, "users", currentUser.uid));

      try {
        const membershipsRef = collection(db, "users", currentUser.uid, "memberships");
        const membershipsSnap = await getDocs(membershipsRef);
        membershipsSnap.forEach((membershipDoc) => {
          batch.delete(membershipDoc.ref);
        });
      } catch (membershipError) {
        console.log("[AUTH] deleteAccount:membershipsCleanup:skipped", membershipError);
      }

      await batch.commit();
      await deleteUser(currentUser);

      setFirebaseUser(null);
      setProfile(null);
      setTenant(null);

      return true;
    } catch (error) {
      console.log("[AUTH] deleteAccount:error", error);

      if (error?.code === "auth/requires-recent-login") {
        throw new Error("For security, please log out, log back in, and then try Delete Account again.");
      }

      if (
        error?.code === "permission-denied" ||
        error?.message?.includes("Missing or insufficient permissions")
      ) {
        throw new Error("Firestore blocked the delete request. Deploy the latest Firestore rules and try again.");
      }

      throw new Error(error?.message || "Could not delete account right now. Please try again.");
    }
  }

  const value = useMemo(
    () => ({
      user: firebaseUser,
      profile,
      tenant,
      isLoading,
      setProfile,
      setTenant,
      createChurchAccount,
      joinChurchAccount,
      login,
      logout,
      deleteAccount,
      isSuperAdmin: profile?.role === "SUPER_ADMIN",
    }),
    [firebaseUser, profile, tenant, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}