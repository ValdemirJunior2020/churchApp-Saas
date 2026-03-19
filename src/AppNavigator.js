// File: src/AppNavigator.js

import React, { useContext, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "./context/AuthContext";
import { useAppData } from "./context/AppDataContext";
import { PurchasesContext } from "./context/PurchasesContext";
import useChurchTheme from "./hooks/useChurchTheme";

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
import MemberSettingsScreen from "./screens/member/MemberSettingsScreen";

import AdminDashboardScreen from "./screens/admin/AdminDashboardScreen";
import AdminSettingsScreen from "./screens/admin/AdminSettingsScreen";
import AdminEventsScreen from "./screens/admin/AdminEventsScreen";
import MemberManagerScreen from "./screens/admin/MemberManagerScreen";

import { colors } from "./theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function buildNavTheme(churchTheme) {
  return {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.bg,
      card: churchTheme.navCard,
      text: colors.text,
      border: churchTheme.cardBorder,
      primary: churchTheme.navPrimary,
      notification: churchTheme.navPrimary,
    },
  };
}

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
    </Stack.Navigator>
  );
}

function memberIcon(routeName, focused) {
  if (routeName === "Home") return focused ? "home" : "home-outline";
  if (routeName === "Live") return focused ? "radio" : "radio-outline";
  if (routeName === "Events") return focused ? "calendar" : "calendar-outline";
  if (routeName === "Chat") return focused ? "chatbubble" : "chatbubble-outline";
  if (routeName === "Giving") return focused ? "heart" : "heart-outline";
  if (routeName === "Settings") return focused ? "settings" : "settings-outline";
  return focused ? "ellipse" : "ellipse-outline";
}

function adminIcon(routeName, focused) {
  if (routeName === "Dashboard") return focused ? "grid" : "grid-outline";
  if (routeName === "Settings") return focused ? "settings" : "settings-outline";
  if (routeName === "Events") return focused ? "calendar" : "calendar-outline";
  if (routeName === "Chat") return focused ? "chatbubble" : "chatbubble-outline";
  if (routeName === "Members") return focused ? "people" : "people-outline";
  return focused ? "ellipse" : "ellipse-outline";
}

function useTabBarStyle() {
  const insets = useSafeAreaInsets();
  const churchTheme = useChurchTheme();

  return useMemo(
    () => ({
      position: "absolute",
      left: 10,
      right: 10,
      bottom: Math.max(10, insets.bottom + 6),
      height: 72 + Math.max(0, insets.bottom - 4),
      paddingTop: 8,
      paddingBottom: Math.max(10, insets.bottom),
      backgroundColor: churchTheme.tabBackground,
      borderTopWidth: 1,
      borderTopColor: churchTheme.tabBorder,
      borderRadius: 28,
      shadowColor: "#000",
      shadowOpacity: 0.24,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    }),
    [insets.bottom, churchTheme.tabBackground, churchTheme.tabBorder]
  );
}

function MemberTabs() {
  const tabBarStyle = useTabBarStyle();
  const churchTheme = useChurchTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: churchTheme.tabActive,
        tabBarInactiveTintColor: churchTheme.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.tabIconWrap,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, focused, size }) => (
          <View
            style={[
              styles.iconBubble,
              focused && {
                backgroundColor: churchTheme.chipBg,
                borderColor: churchTheme.chipBorder,
                shadowColor: churchTheme.navPrimary,
              },
            ]}
          >
            <Ionicons name={memberIcon(route.name, focused)} size={size} color={color} />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Giving" component={GivingScreen} />
      <Tab.Screen name="Settings" component={MemberSettingsScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  const tabBarStyle = useTabBarStyle();
  const churchTheme = useChurchTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: churchTheme.tabActive,
        tabBarInactiveTintColor: churchTheme.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.tabIconWrap,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, focused, size }) => (
          <View
            style={[
              styles.iconBubble,
              focused && {
                backgroundColor: churchTheme.chipBg,
                borderColor: churchTheme.chipBorder,
                shadowColor: churchTheme.navPrimary,
              },
            ]}
          >
            <Ionicons name={adminIcon(route.name, focused)} size={size} color={color} />
          </View>
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
  const { tenant, isLoading, profile } = useAuth();
  const { isPro, loading: purchasesLoading } = useContext(PurchasesContext);
  const churchTheme = useChurchTheme();

  if (isLoading || !ready || purchasesLoading) {
    return <Loading />;
  }

  const effectiveRole = profile?.role || tenant?.role || "MEMBER";
  const isAdmin = effectiveRole === "ADMIN";
  const shouldShowPaywall = Boolean(tenant?.churchId) && isAdmin && !isPro;
  const navKey = tenant?.churchId
    ? `${tenant.churchId}:${effectiveRole}:${isPro ? "pro" : "free"}`
    : "guest";

  return (
    <NavigationContainer theme={buildNavTheme(churchTheme)}>
      <Stack.Navigator key={navKey} screenOptions={{ headerShown: false }}>
        {!tenant?.churchId ? (
          <Stack.Screen name="AuthFlow" component={AuthStack} />
        ) : shouldShowPaywall ? (
          <Stack.Screen name="PaymentRequired" component={PaymentRequiredScreen} />
        ) : isAdmin ? (
          <Stack.Screen name="AdminApp" component={AdminTabs} />
        ) : (
          <Stack.Screen name="MemberApp" component={MemberTabs} />
        )}
      </Stack.Navigator>
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
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  tabItem: {
    paddingTop: 2,
  },
  tabIconWrap: {
    marginTop: 2,
  },
  iconBubble: {
    minWidth: 38,
    height: 34,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});