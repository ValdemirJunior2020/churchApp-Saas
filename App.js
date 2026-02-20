// App.js  (REPLACE your entire file)
import React from "react";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppNavigator from "./src/AppNavigator";
import { AppDataProvider } from "./src/context/AppDataContext";
import { AuthProvider } from "./src/context/AuthContext";

// ✅ Silence web-only noisy warnings (safe to ignore)
LogBox.ignoreLogs([
  "SES Removing unpermitted intrinsics",
  '"shadow*" style props are deprecated. Use "boxShadow".',
  "Cannot record touch end without a touch start.",
  "props.pointerEvents is deprecated. Use style.pointerEvents",
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}