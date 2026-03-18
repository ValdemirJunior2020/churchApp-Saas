// File: src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCsc468sOEPIqIMFIqxbaZzALnxFBNZEVg",
  authDomain: "congregate-church.firebaseapp.com",
  projectId: "congregate-church",
  storageBucket: "congregate-church.firebasestorage.app",
  messagingSenderId: "824328020253",
  appId: "1:824328020253:web:a4d57a55dafa2135f081f4",
  measurementId: "G-78FFDMBSP7",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;