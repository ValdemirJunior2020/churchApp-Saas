// File: src/AppNavigator.js
// Adds a visible Logout button in the header for Admin + Member tabs

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Alert, Pressable, Text } from "react-native";

import { useAuth } from "./context/AuthContext";

// Auth Screens
import WelcomeScreen from "./screens/auth/WelcomeScreen";
import CreateChurchScreen from "./screens/auth/CreateChurchScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import PaymentRequiredScreen from "./screens/auth/PaymentRequiredScreen";

// Member/Admin Screens
import HomeScreen from "./screens/member/HomeScreen";
import GivingScreen from "./screens/member/GivingScreen";
import AdminSettingsScreen from "./screens/admin/AdminSettingsScreen";
import MemberManagerScreen from "./screens/admin/MemberManagerScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Loading() {
  return <Text style={{ padding: 16, marginTop: 50, textAlign: "center" }}>Loading...</Text>;
}

function LogoutButton() {
  const { logout } = useAuth();

  async function onLogout() {
    try {
      const ok = typeof window !== "undefined" && window.confirm
        ? window.confirm("Log out now?")
        : true;

      if (!ok) return;

      console.log("[AppNavigator] Logout clicked");
      await logout();
      console.log("[AppNavigator] Logout success");
    } catch (e) {
      console.log("[AppNavigator] Logout error:", e?.message || e);
      Alert.alert("Logout failed", e?.message || "Something went wrong");
    }
  }

  return (
    <Pressable
      onPress={onLogout}
      style={{
        marginRight: 12,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 12,
        backgroundColor: "#0B1220",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "800" }}>Logout</Text>
    </Pressable>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateChurch" component={CreateChurchScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PaymentRequired" component={PaymentRequiredScreen} />
    </Stack.Navigator>
  );
}

function MemberTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <LogoutButton />,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Giving" component={GivingScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <LogoutButton />,
      }}
    >
      <Tab.Screen name="Admin Dashboard" component={AdminSettingsScreen} />
      <Tab.Screen name="Members" component={MemberManagerScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { tenant, isLoading } = useAuth();

  if (isLoading) return <Loading />;

  return (
    <NavigationContainer>
      {!tenant ? (
        <AuthStack />
      ) : tenant.planStatus === "PENDING" && tenant.role !== "ADMIN" ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="PaymentRequired" component={PaymentRequiredScreen} />
        </Stack.Navigator>
      ) : tenant.role === "ADMIN" ? (
        <AdminTabs />
      ) : (
        <MemberTabs />
      )}
    </NavigationContainer>
  );
}