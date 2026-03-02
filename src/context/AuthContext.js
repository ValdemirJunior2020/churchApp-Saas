// File: src/context/AuthContext.js (REPLACE)
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
} from "firebase/auth";
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { firebaseAuth, db } from "../firebase";
import { makeChurchCode } from "../utils/churchCode";
import { extractYouTubeVideoId } from "../utils/youtube";
import { DEMO_CHURCH_CODE, DEMO_EMAIL, DEMO_PASSWORD } from "../config";

const AuthContext = createContext(null);

const STORAGE_KEY = "@congregate_tenant_v2";
const LAST_CHURCH_KEY = "@congregate_last_church";

function normEmail(v) {
  return String(v || "").trim().toLowerCase();
}
function up(v) {
  return String(v || "").trim().toUpperCase();
}
async function saveJson(key, val) {
  await AsyncStorage.setItem(key, JSON.stringify(val));
}
async function loadJson(key) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

async function clearLocalSession(setTenant) {
  setTenant(null);
  await AsyncStorage.removeItem(STORAGE_KEY);
}

async function authCreateOrSignIn(email, password) {
  try {
    return await createUserWithEmailAndPassword(firebaseAuth, email, password);
  } catch (e) {
    if (e?.code === "auth/email-already-in-use") {
      return await signInWithEmailAndPassword(firebaseAuth, email, password);
    }
    throw e;
  }
}

async function seedDemoIfMissing({ churchCode, uid, email }) {
  const cc = up(churchCode);
  const churchRef = doc(db, "churches", cc);
  const churchSnap = await getDoc(churchRef);

  if (!churchSnap.exists()) {
    await setDoc(churchRef, {
      churchCode: cc,
      churchName: "Holy Apple Demo Church",
      logoUrl: "",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtubeVideoId: extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      planStatus: "ACTIVE",
      ownerUid: uid,
      donations: [
        { label: "Tithes & Offerings", url: "https://paypal.com" },
        { label: "Missions", url: "https://paypal.com" },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const memberRef = doc(db, "churches", cc, "members", uid);
  const memberSnap = await getDoc(memberRef);

  if (!memberSnap.exists()) {
    await setDoc(memberRef, {
      uid,
      email,
      name: "Apple Reviewer",
      phone: "",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Force admin for demo (Apple needs full access)
    await setDoc(
      memberRef,
      {
        role: "ADMIN",
        status: "ACTIVE",
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export function AuthProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await loadJson(STORAGE_KEY);
      if (saved) setTenant(saved);
      setIsLoading(false);
    })();
  }, []);

  async function persistTenant(nextTenant) {
    setTenant(nextTenant);
    await saveJson(STORAGE_KEY, nextTenant);
    if (nextTenant?.churchCode) await saveJson(LAST_CHURCH_KEY, { churchCode: nextTenant.churchCode });
  }

  async function logout() {
    try {
      await signOut(firebaseAuth);
    } catch {}
    await clearLocalSession(setTenant);
  }

  // ✅ Leave church (keeps Firebase account, removes membership in this church, clears local session)
  async function leaveChurch() {
    const cc = tenant?.churchCode;
    const uid = tenant?.uid;
    if (!cc || !uid) {
      await clearLocalSession(setTenant);
      return;
    }

    // remove membership doc for this church only
    try {
      await deleteDoc(doc(db, "churches", cc, "members", uid));
    } catch {}

    // clear local session; keep Firebase signed-in optional (we sign out to avoid confusion)
    try {
      await signOut(firebaseAuth);
    } catch {}

    await clearLocalSession(setTenant);
    await saveJson(LAST_CHURCH_KEY, { churchCode: "" });
  }

  // ✅ Delete account (Apple requirement): deletes member docs + deletes Firebase auth user
  async function deleteAccountForever() {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error("No signed-in user found.");

    const uid = user.uid;

    // 1) Delete ALL membership docs across churches (collectionGroup)
    try {
      const q = query(collectionGroup(db, "members"), where("uid", "==", uid));
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    } catch (e) {
      // If Firestore rules/index blocks this, at least delete current church membership:
      if (tenant?.churchCode) {
        try {
          await deleteDoc(doc(db, "churches", tenant.churchCode, "members", uid));
        } catch {}
      }
    }

    // 2) Clear local first so UI returns to auth screens even if deleteUser fails
    await clearLocalSession(setTenant);

    // 3) Delete Firebase auth user (may require recent login)
    try {
      await deleteUser(user);
    } catch (e) {
      // If requires re-auth, tell user to logout/login then try again
      const msg = e?.code === "auth/requires-recent-login"
        ? "For security, please log out, log back in, then try Delete Account again."
        : (e?.message || "Delete account failed.");
      throw new Error(msg);
    }

    // ensure signed out
    try {
      await signOut(firebaseAuth);
    } catch {}
  }

  async function demoLogin() {
    const churchCode = up(DEMO_CHURCH_CODE);
    const email = normEmail(DEMO_EMAIL);
    const password = String(DEMO_PASSWORD || "");

    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const uid = cred.user.uid;

    await seedDemoIfMissing({ churchCode, uid, email });

    const churchRef = doc(db, "churches", churchCode);
    const memberRef = doc(db, "churches", churchCode, "members", uid);

    const [churchSnap, memberSnap] = await Promise.all([getDoc(churchRef), getDoc(memberRef)]);

    const church = churchSnap.data() || {};
    const member = memberSnap.data() || {};

    await persistTenant({
      churchCode,
      churchName: church.churchName || "",
      planStatus: church.planStatus || "ACTIVE",
      role: String(member.role || "ADMIN").toUpperCase(),
      uid,
      email,
      name: member.name || "",
    });
  }

  async function createChurchAndLogin({ churchName, pastorName, phone, email, password }) {
    const em = normEmail(email);
    if (!em) throw new Error("Email is required.");
    if (!password || String(password).length < 6) throw new Error("Password must be at least 6 characters.");

    const cred = await authCreateOrSignIn(em, String(password));
    const uid = cred.user.uid;

    // Generate a unique church code
    let churchCode = "";
    for (let i = 0; i < 12; i++) {
      const candidate = makeChurchCode(8);
      const snap = await getDoc(doc(db, "churches", candidate));
      if (!snap.exists()) {
        churchCode = candidate;
        break;
      }
    }
    if (!churchCode) throw new Error("Could not generate a unique church code. Try again.");

    await setDoc(doc(db, "churches", churchCode), {
      churchCode,
      churchName: String(churchName || "").trim() || "My Church",
      logoUrl: "",
      youtubeUrl: "",
      youtubeVideoId: "",
      planStatus: "ACTIVE",
      ownerUid: uid,
      donations: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "churches", churchCode, "members", uid), {
      uid,
      email: em,
      name: String(pastorName || "").trim() || "Pastor",
      phone: String(phone || "").trim(),
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await persistTenant({
      churchCode,
      churchName: String(churchName || "").trim(),
      planStatus: "ACTIVE",
      role: "ADMIN",
      uid,
      email: em,
      name: String(pastorName || "").trim(),
    });
  }

  async function joinChurchAndLogin({ churchCode, name, phone, email, password }) {
    const cc = up(churchCode);
    const em = normEmail(email);

    if (!cc) throw new Error("Church code is required.");
    if (!em) throw new Error("Email is required.");
    if (!password || String(password).length < 6) throw new Error("Password must be at least 6 characters.");

    const churchSnap = await getDoc(doc(db, "churches", cc));
    if (!churchSnap.exists()) throw new Error("Church code not found.");

    // Create account if new, or sign in if already exists
    const cred = await authCreateOrSignIn(em, String(password));
    const uid = cred.user.uid;

    await setDoc(
      doc(db, "churches", cc, "members", uid),
      {
        uid,
        email: em,
        name: String(name || "").trim() || "Member",
        phone: String(phone || "").trim(),
        role: "MEMBER",
        status: "ACTIVE",
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const church = churchSnap.data() || {};
    await persistTenant({
      churchCode: cc,
      churchName: church.churchName || "",
      planStatus: church.planStatus || "ACTIVE",
      role: "MEMBER",
      uid,
      email: em,
      name: String(name || "").trim(),
    });
  }

  async function login({ churchCode, email, password }) {
    const last = await loadJson(LAST_CHURCH_KEY);

    const cc = up(churchCode) || up(last?.churchCode);
    const em = normEmail(email);

    if (!cc) throw new Error("Church code required the first time.");
    if (!em) throw new Error("Email is required.");

    const cred = await signInWithEmailAndPassword(firebaseAuth, em, String(password || ""));
    const uid = cred.user.uid;

    const churchRef = doc(db, "churches", cc);
    const memberRef = doc(db, "churches", cc, "members", uid);

    const [churchSnap, memberSnap] = await Promise.all([getDoc(churchRef), getDoc(memberRef)]);

    if (!churchSnap.exists()) throw new Error("Church code not found.");
    if (!memberSnap.exists()) throw new Error("Account not found in this church.");

    await updateDoc(memberRef, {
      lastLoginAt: serverTimestamp(),
      status: "ACTIVE",
      updatedAt: serverTimestamp(),
    });

    const church = churchSnap.data() || {};
    const member = memberSnap.data() || {};

    await persistTenant({
      churchCode: cc,
      churchName: church.churchName || "",
      planStatus: church.planStatus || "ACTIVE",
      role: String(member.role || "MEMBER").toUpperCase(),
      uid,
      email: em,
      name: member.name || "",
    });

    await saveJson(LAST_CHURCH_KEY, { churchCode: cc });
  }

  const value = useMemo(
    () => ({
      tenant,
      isLoading,
      login,
      logout,
      demoLogin,
      createChurchAndLogin,
      joinChurchAndLogin,
      leaveChurch,
      deleteAccountForever,
    }),
    [tenant, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}