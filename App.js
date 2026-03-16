// src/App.js

import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
  },
});