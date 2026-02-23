// src/AppNavigator.js (REPLACE ENTIRE FILE)
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";

import { useAuth } from "./context/AuthContext";
import { useAppData } from "./context/AppDataContext";

// --- Import all Auth Screens ---
import WelcomeScreen from "./screens/auth/WelcomeScreen";
import CreateChurchScreen from "./screens/auth/CreateChurchScreen";
import JoinChurchScreen from "./screens/auth/JoinChurchScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import PaymentRequiredScreen from "./screens/auth/PaymentRequiredScreen";

// --- Import Member & Admin Screens ---
import HomeScreen from "./screens/member/HomeScreen";
import GivingScreen from "./screens/member/GivingScreen";
import AdminSettingsScreen from "./screens/admin/AdminSettingsScreen";
import MemberManagerScreen from "./screens/admin/MemberManagerScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Loading() {
  return <Text style={{ padding: 16, marginTop: 50, textAlign: "center" }}>Loading…</Text>;
}

// ==========================================
// NEW: Auth Stack (Replaces the old AuthTabs)
// ==========================================
function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateChurch" component={CreateChurchScreen} />
      <Stack.Screen name="JoinChurch" component={JoinChurchScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PaymentRequired" component={PaymentRequiredScreen} />
    </Stack.Navigator>
  );
}

// ==========================================
// Authenticated Member Flow
// ==========================================
function MemberTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Giving" component={GivingScreen} />
    </Tab.Navigator>
  );
}

// ==========================================
// Authenticated Admin Flow
// ==========================================
function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Admin Dashboard" component={AdminSettingsScreen} />
      <Tab.Screen name="Members" component={MemberManagerScreen} />
    </Tab.Navigator>
  );
}

// ==========================================
// Main App Navigator
// ==========================================
export default function AppNavigator() {
  const { ready } = useAppData();
  const { tenant, isLoading } = useAuth(); // We use 'tenant' from your new AuthContext

  if (isLoading || !ready) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {!tenant ? (
        // 1. User is logged out. Show them the Welcome -> Create/Join flow.
        <AuthStack />
      ) : tenant.planStatus === "PENDING" ? (
        // 2. Pastor created a church but hasn't paid yet. Lock them here.
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="PaymentRequired" component={PaymentRequiredScreen} />
        </Stack.Navigator>
      ) : tenant.role === "ADMIN" ? (
        // 3. Paid Pastor logs in. Show them the Dashboard.
        <AdminTabs />
      ) : (
        // 4. Regular member logs in. Show them the Church content.
        <MemberTabs />
      )}
    </NavigationContainer>
  );
}