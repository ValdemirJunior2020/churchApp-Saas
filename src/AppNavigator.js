import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";

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

// ✅ Optional screen (only keep if file exists)
// import JoinChurchScreen from "./screens/auth/JoinChurchScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Loading() {
  return <Text style={{ padding: 16, marginTop: 50, textAlign: "center" }}>Loading...</Text>;
}

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateChurch" component={CreateChurchScreen} />
      {/* <Stack.Screen name="JoinChurch" component={JoinChurchScreen} /> */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PaymentRequired" component={PaymentRequiredScreen} />
    </Stack.Navigator>
  );
}

function MemberTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Giving" component={GivingScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
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
        // ✅ Lock only non-admin members.
        // Pastors/Admins can still enter settings right after creating the church.
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