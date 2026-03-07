// CREATE: src/firebase.web.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
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

export const firebaseAuth = getAuth(firebaseApp);

// Keep users logged in on web builds too
setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {});

export const db = getFirestore(firebaseApp);