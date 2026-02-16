// App.js
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/AppNavigator";
import { AppDataProvider } from "./src/context/AppDataContext";
import { AuthProvider } from "./src/context/AuthContext";

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
