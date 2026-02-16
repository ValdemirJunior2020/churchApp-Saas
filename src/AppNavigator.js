// src/AppNavigator.js
import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from "./screens/auth/LoginScreen";
import AdminSettingsScreen from "./screens/admin/AdminSettingsScreen";
import MemberManagerScreen from "./screens/admin/MemberManagerScreen";
import HomeScreen from "./screens/member/HomeScreen";
import GivingScreen from "./screens/member/GivingScreen";
import EventsScreen from "./screens/member/EventsScreen";

import { useAuth } from "./context/AuthContext";

const Tab = createBottomTabNavigator();

const tabBarStyle = {
  backgroundColor: "rgba(255,255,255,0.85)",
  borderTopColor: "rgba(15, 23, 42, 0.08)",
  borderTopWidth: 1,
  height: 64,
  paddingBottom: 8,
  paddingTop: 8,
};

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
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <LogoutButton />,
        tabBarStyle,
        tabBarActiveTintColor: "#0f172a",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: { fontWeight: "800", fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Branding"
        component={AdminSettingsScreen}
        options={{
          title: "Admin Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Members"
        component={MemberManagerScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

function MemberTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <LogoutButton />,
        tabBarStyle,
        tabBarActiveTintColor: "#0f172a",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: { fontWeight: "800", fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Church Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Give"
        component={GivingScreen}
        options={{
          title: "Giving",
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isHydrating, user, isAdmin, isMember } = useAuth();

  if (isHydrating) {
    return (
      <NavigationContainer>
        <ActivityIndicator style={{ flex: 1 }} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {!user ? <LoginScreen /> : isAdmin ? <AdminTabs /> : isMember ? <MemberTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}
