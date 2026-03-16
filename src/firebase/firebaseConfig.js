// src/firebase/firebaseConfig.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCsc468sOEPIqIMFIqxbaZzALnxFBNZEVg",
  authDomain: "congregate-church.firebaseapp.com",
  projectId: "congregate-church",
  storageBucket: "congregate-church.firebasestorage.app",
  messagingSenderId: "824328020253",
  appId: "1:824328020253:web:c4f7bf4d381cb25cf081f4",
  measurementId: "G-KYK7B8ZGH2",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export default firebaseConfig;