// File: src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ⚠️ IMPORTANT: Analytics does NOT work in React Native (Expo)
// so we REMOVE getAnalytics()

const firebaseConfig = {
  apiKey: "AIzaSyCsc468sOEPIqIMFIqxbaZzALnxFBNZEVg",
  authDomain: "congregate-church.firebaseapp.com",
  projectId: "congregate-church",
  storageBucket: "congregate-church.firebasestorage.app",
  messagingSenderId: "824328020253",
  appId: "1:824328020253:web:a4d57a55dafa2135f081f4",
  measurementId: "G-78FFDMBSP7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 CORE SERVICES (YOU WILL USE THESE EVERYWHERE)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;