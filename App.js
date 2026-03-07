// File: App.js (REPLACE)
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppNavigator from "./src/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { AppDataProvider } from "./src/context/AppDataContext";

export default function App() {
  return (
    <SafeAreaProvider>
      {/* ✅ AuthProvider MUST wrap AppDataProvider because AppDataProvider uses useAuth() */}
      <AuthProvider>
        <AppDataProvider>
          <AppNavigator />
        </AppDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}