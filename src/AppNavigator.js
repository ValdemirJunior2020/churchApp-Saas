// File: src/AppNavigator.js (REPLACE)
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "./context/AuthContext";

import WelcomeScreen from "./screens/auth/WelcomeScreen";
import CreateChurchScreen from "./screens/auth/CreateChurchScreen";
import JoinChurchScreen from "./screens/auth/JoinChurchScreen";
import LoginScreen from "./screens/auth/LoginScreen";

import HomeScreen from "./screens/member/HomeScreen";
import GivingScreen from "./screens/member/GivingScreen";
import EventsScreen from "./screens/member/EventsScreen";

import AdminSettingsScreen from "./screens/admin/AdminSettingsScreen";
import MemberManagerScreen from "./screens/admin/MemberManagerScreen";
import AdminEventsScreen from "./screens/admin/AdminEventsScreen";

import SettingsScreen from "./screens/common/SettingsScreen";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function HeaderLogoutButton() {
  const { logout } = useAuth();
  return (
    <Pressable
      onPress={logout}
      style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
      hitSlop={8}
    >
      <Ionicons name="log-out-outline" size={20} color="#0f172a" />
    </Pressable>
  );
}

function MemberTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerRight: () => <HeaderLogoutButton />,
        tabBarLabelStyle: { fontWeight: "800", fontSize: 12 },
        tabBarStyle: {
          height: 74,
          paddingTop: 8,
          paddingBottom: 12,
          borderTopWidth: 1,
          borderTopColor: "rgba(15,23,42,0.10)",
          backgroundColor: "rgba(255,255,255,0.96)",
        },
        tabBarIcon: ({ focused, size }) => {
          const s = size ?? 24;
          const inactive = "#94a3b8";
          if (route.name === "Home") return <Ionicons name={focused ? "home" : "home-outline"} size={s} color={focused ? "#16a34a" : inactive} />;
          if (route.name === "Giving") return <Ionicons name={focused ? "heart" : "heart-outline"} size={s} color={focused ? "#ef4444" : inactive} />;
          if (route.name === "Events") return <Ionicons name={focused ? "calendar" : "calendar-outline"} size={s} color={focused ? "#f59e0b" : inactive} />;
          return <Ionicons name={focused ? "settings" : "settings-outline"} size={s} color={focused ? "#06b6d4" : inactive} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Giving" component={GivingScreen} />
      <Tabs.Screen name="Events" component={EventsScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerRight: () => <HeaderLogoutButton />,
        tabBarLabelStyle: { fontWeight: "900", fontSize: 12 },
        tabBarStyle: {
          height: 74,
          paddingTop: 8,
          paddingBottom: 12,
          borderTopWidth: 1,
          borderTopColor: "rgba(15,23,42,0.10)",
          backgroundColor: "rgba(255,255,255,0.96)",
        },
        tabBarIcon: ({ focused, size }) => {
          const s = size ?? 26;
          const inactive = "#94a3b8";
          if (route.name === "Admin") return <MaterialCommunityIcons name={focused ? "view-dashboard" : "view-dashboard-outline"} size={s} color={focused ? "#8b5cf6" : inactive} />;
          if (route.name === "Members") return <Ionicons name={focused ? "people" : "people-outline"} size={s} color={focused ? "#2563eb" : inactive} />;
          if (route.name === "Events") return <Ionicons name={focused ? "calendar" : "calendar-outline"} size={s} color={focused ? "#f59e0b" : inactive} />;
          return <Ionicons name={focused ? "settings" : "settings-outline"} size={s} color={focused ? "#06b6d4" : inactive} />;
        },
      })}
    >
      <Tabs.Screen
        name="Admin"
        component={AdminSettingsScreen}
        options={{ title: "Admin Dashboard", tabBarLabel: "Admin" }}
      />
      <Tabs.Screen name="Members" component={MemberManagerScreen} />
      <Tabs.Screen name="Events" component={AdminEventsScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateChurch" component={CreateChurchScreen} options={{ title: "Create Church" }} />
      <Stack.Screen name="JoinChurch" component={JoinChurchScreen} options={{ title: "Join Church" }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { tenant, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const role = String(tenant?.role || "").toUpperCase();

  return (
    <NavigationContainer>
      {tenant ? (role === "ADMIN" ? <AdminTabs /> : <MemberTabs />) : <AuthStack />}
    </NavigationContainer>
  );
}