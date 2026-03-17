// src/AppNavigator.js

import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuth } from "./context/AuthContext";
import { useAppData } from "./context/AppDataContext";

import WelcomeScreen from "./screens/auth/WelcomeScreen";
import CreateChurchScreen from "./screens/auth/CreateChurchScreen";
import JoinChurchScreen from "./screens/auth/JoinChurchScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import PaymentRequiredScreen from "./screens/auth/PaymentRequiredScreen";

import HomeScreen from "./screens/member/HomeScreen";
import LiveScreen from "./screens/member/LiveScreen";
import GivingScreen from "./screens/member/GivingScreen";
import EventsScreen from "./screens/member/EventsScreen";
import ChatScreen from "./screens/member/ChatScreen";

import AdminDashboardScreen from "./screens/admin/AdminDashboardScreen";
import AdminSettingsScreen from "./screens/admin/AdminSettingsScreen";
import AdminEventsScreen from "./screens/admin/AdminEventsScreen";
import MemberManagerScreen from "./screens/admin/MemberManagerScreen";

import { colors } from "./theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: "#050507",
    text: colors.text,
    border: "rgba(255,255,255,0.10)",
    primary: colors.cyan,
  },
};

function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.cyan} />
      <Text style={styles.loadingText}>Loading church experience...</Text>
    </View>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: "fade",
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateChurch" component={CreateChurchScreen} />
      <Stack.Screen name="JoinChurch" component={JoinChurchScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PaymentRequired" component={PaymentRequiredScreen} />
    </Stack.Navigator>
  );
}

function memberIcon(routeName, focused) {
  if (routeName === "Home") return focused ? "home" : "home-outline";
  if (routeName === "Live") return focused ? "radio" : "radio-outline";
  if (routeName === "Events") return focused ? "calendar" : "calendar-outline";
  if (routeName === "Chat") return focused ? "chatbubble" : "chatbubble-outline";
  return focused ? "heart" : "heart-outline";
}

function MemberTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons name={memberIcon(route.name, focused)} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Giving" component={GivingScreen} />
    </Tab.Navigator>
  );
}

function adminIcon(routeName, focused) {
  if (routeName === "Dashboard") return focused ? "grid" : "grid-outline";
  if (routeName === "Settings") return focused ? "settings" : "settings-outline";
  if (routeName === "Events") return focused ? "calendar" : "calendar-outline";
  if (routeName === "Chat") return focused ? "chatbubble" : "chatbubble-outline";
  return focused ? "people" : "people-outline";
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons name={adminIcon(route.name, focused)} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Settings" component={AdminSettingsScreen} />
      <Tab.Screen name="Events" component={AdminEventsScreen} />
      <Tab.Screen name="Members" component={MemberManagerScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { ready } = useAppData();
  const { tenant, isLoading } = useAuth();

  if (isLoading || !ready) return <Loading />;

  return (
    <NavigationContainer theme={navTheme}>
      {!tenant ? (
        <AuthStack />
      ) : tenant.planStatus === "PENDING" ? (
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "600",
  },
  tabBar: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    height: 72,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "rgba(10,10,12,0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    borderRadius: 28,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
});
