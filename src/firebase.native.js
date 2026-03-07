// CREATE: src/firebase.native.js
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBv2KBON3W-pS00_FSyPSxo-NRBrv56LeI",
  authDomain: "blogjuly2022.firebaseapp.com",
  databaseURL: "https://blogjuly2022-default-rtdb.firebaseio.com",
  projectId: "blogjuly2022",
  storageBucket: "blogjuly2022.firebasestorage.app",
  messagingSenderId: "374950004069",
  appId: "1:374950004069:web:16d25bb24397620585cd8c",
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const firebaseAuth = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
})();

export const db = getFirestore(firebaseApp);