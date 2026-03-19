// File: src/firebase/firebaseConfig.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsc468sOEPIqIMFIqxbaZzALnxFBNZEVg",
  authDomain: "congregate-church.firebaseapp.com",
  projectId: "congregate-church",
  storageBucket: "congregate-church.firebasestorage.app",
  messagingSenderId: "824328020253",
  appId: "1:824328020253:web:c4f7bf4d381cb25cf081f4",
  measurementId: "G-KYK7B8ZGH2",
};

console.log("[FIREBASE] initializing app with projectId:", firebaseConfig.projectId);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((error) => {
  console.log("[FIREBASE] persistence warning:", error?.code || error?.message || error);
});

console.log("[FIREBASE] initialized", {
  appName: app?.name,
  authReady: !!auth,
  dbReady: !!db,
});

export { app, auth, db };