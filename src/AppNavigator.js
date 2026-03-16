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
import JoinChurchScreen from "./screens/auth/JoinChurchScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import PaymentRequiredScreen from "./screens/auth/PaymentRequiredScreen";

import HomeScreen from "./screens/member/HomeScreen";
import GivingScreen from "./screens/member/GivingScreen";
import EventsScreen from "./screens/member/EventsScreen";

import AdminSettingsScreen from "./screens/admin/AdminSettingsScreen";
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
      <Stack.Screen name="JoinChurch" component={JoinChurchScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PaymentRequired" component={PaymentRequiredScreen} />
    </Stack.Navigator>
  );
}

function memberIcon(routeName, focused) {
  if (routeName === "Home") return focused ? "home" : "home-outline";
  if (routeName === "Events") return focused ? "calendar" : "calendar-outline";
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
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Giving" component={GivingScreen} />
    </Tab.Navigator>
  );
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
          <Ionicons
            name={
              route.name === "Admin Dashboard"
                ? focused
                  ? "grid"
                  : "grid-outline"
                : focused
                ? "people"
                : "people-outline"
            }
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Admin Dashboard" component={AdminSettingsScreen} />
      <Tab.Screen name="Members" component={MemberManagerScreen} />
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
    left: 14,
    right: 14,
    bottom: 12,
    height: 70,
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