// File: src/firebase/firebaseConfig.js

import { Platform } from "react-native";
import { initializeApp, getApps, getApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCsc468sOEPIqIMFIqxbaZzALnxFBNZEVg",
  authDomain: "congregate-church.firebaseapp.com",
  projectId: "congregate-church",
  storageBucket: "congregate-church.firebasestorage.app",
  messagingSenderId: "824328020253",
  appId: "1:824328020253:web:a4d57a55dafa2135f081f4",
  measurementId: "G-78FFDMBSP7",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

if (Platform.OS === "web") {
  auth = FirebaseAuth.getAuth(app);
} else {
  try {
    auth = FirebaseAuth.initializeAuth(app, {
      persistence: FirebaseAuth.getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    auth = FirebaseAuth.getAuth(app);
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export default app;