// App.js

import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./src/context/AuthContext";
import { AppDataProvider } from "./src/context/AppDataContext";
import AppNavigator from "./src/AppNavigator";

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <AppDataProvider>
          <SafeAreaView style={styles.safe}>
            <StatusBar style="light" />
            <View style={styles.container}>
              <AppNavigator />
            </View>
          </SafeAreaView>
        </AppDataProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  safe: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
  },
});
