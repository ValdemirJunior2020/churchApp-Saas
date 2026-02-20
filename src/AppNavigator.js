// src/AppNavigator.js  (REPLACE)
import React from "react";
import { Pressable, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "./context/AuthContext";

import WelcomeScreen from "./screens/auth/WelcomeScreen";
import CreateChurchScreen from "./screens/auth/CreateChurchScreen";
import JoinChurchScreen from "./screens/auth/JoinChurchScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import PaymentRequiredScreen from "./screens/auth/PaymentRequiredScreen";

import AdminSettingsScreen from "./screens/admin/AdminSettingsScreen";
import MemberManagerScreen from "./screens/admin/MemberManagerScreen";

import HomeScreen from "./screens/member/HomeScreen";
import GivingScreen from "./screens/member/GivingScreen";
import EventsScreen from "./screens/member/EventsScreen";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <Pressable onPress={logout} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
      <Text style={{ fontWeight: "900", color: "#0f172a" }}>Logout</Text>
    </Pressable>
  );
}

function AdminTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: "#0f172a",
      }}
    >
      <Tabs.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
        options={{
          title: "Admin Dashboard",
          tabBarLabel: "Admin",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="Members"
        component={MemberManagerScreen}
        options={{
          title: "Members",
          tabBarLabel: "Members",
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
        }}
      />
    </Tabs.Navigator>
  );
}

function MemberTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: "#0f172a",
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Sanctuary",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="Give"
        component={GivingScreen}
        options={{
          title: "Give",
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="Events"
        component={EventsScreen}
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />,
        }}
      />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const { hydrating, user, role, canUseApp } = useAuth();

  if (hydrating) return null;

  return (
    <NavigationContainer>
      {!user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="CreateChurch" component={CreateChurchScreen} />
          <Stack.Screen name="JoinChurch" component={JoinChurchScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      ) : !canUseApp ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Paywall" component={PaymentRequiredScreen} />
        </Stack.Navigator>
      ) : role === "ADMIN" ? (
        <AdminTabs />
      ) : (
        <MemberTabs />
      )}
    </NavigationContainer>
  );
}