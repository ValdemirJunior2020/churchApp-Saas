// src/AppNavigator.js (REPLACE ENTIRE FILE)
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import { useAuth } from "./context/AuthContext";
import { useAppData } from "./context/AppDataContext";

import LoginScreen from "./screens/auth/LoginScreen";

import HomeScreen from "./screens/member/HomeScreen";
import GivingScreen from "./screens/member/GivingScreen";

import AdminSettingsScreen from "./screens/admin/AdminSettingsScreen";
import MemberManagerScreen from "./screens/admin/MemberManagerScreen";

const Tab = createBottomTabNavigator();

function Loading() {
  return <Text style={{ padding: 16 }}>Loading…</Text>;
}

function AuthTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
      <Tab.Screen name="Auth" component={LoginScreen} />
    </Tab.Navigator>
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
  const { ready } = useAppData();
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {!ready ? <Loading /> : !user ? <AuthTabs /> : user.role === "ADMIN" ? <AdminTabs /> : <MemberTabs />}
    </NavigationContainer>
  );
}