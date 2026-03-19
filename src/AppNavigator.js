// File: src/AppNavigator.js

import React, { useContext, useMemo } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const TAB_ICONS = {
  Home: require("./assets/tab-icons/home.png"),
  Live: require("./assets/tab-icons/live.png"),
  Events: require("./assets/tab-icons/events.png"),
  Chat: require("./assets/tab-icons/chat.png"),
  Giving: require("./assets/tab-icons/giving.png"),
  Settings: require("./assets/tab-icons/settings.png"),
  Dashboard: require("./assets/tab-icons/home.png"),
  Members: require("./assets/tab-icons/chat.png"),
};

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

function useTabBarStyle() {
  const insets = useSafeAreaInsets();
  const churchTheme = useChurchTheme();

  return useMemo(
    () => ({
      position: "absolute",
      left: 10,
      right: 10,
      bottom: Math.max(10, insets.bottom + 6),
      height: 76 + Math.max(0, insets.bottom - 4),
      paddingTop: 8,
      paddingBottom: Math.max(10, insets.bottom),
      backgroundColor: "rgba(20, 12, 24, 0.92)",
      borderTopWidth: 1,
      borderTopColor: churchTheme.tabBorder,
      borderRadius: 28,
      shadowColor: "#000",
      shadowOpacity: 0.24,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    }),
    [insets.bottom, churchTheme.tabBorder]
  );
}

function CustomTabIcon({ routeName, focused, churchTheme }) {
  const source = TAB_ICONS[routeName];

  return (
    <View
      style={[
        styles.customIconWrap,
        focused && {
          backgroundColor: "rgba(22, 163, 74, 0.14)",
          borderColor: churchTheme.navPrimary,
          shadowColor: churchTheme.navPrimary,
        },
      ]}
    >
      <Image source={source} style={styles.customIconImage} resizeMode="contain" />
    </View>
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
        tabBarActiveTintColor: "#56d4ff",
        tabBarInactiveTintColor: "#f5f1ea",
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused }) => (
          <CustomTabIcon
            routeName={route.name}
            focused={focused}
            churchTheme={churchTheme}
          />
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
        tabBarActiveTintColor: "#56d4ff",
        tabBarInactiveTintColor: "#f5f1ea",
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused }) => (
          <CustomTabIcon
            routeName={route.name}
            focused={focused}
            churchTheme={churchTheme}
          />
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
    fontWeight: "800",
    marginBottom: 3,
  },
  tabItem: {
    paddingTop: 2,
  },
  customIconWrap: {
    minWidth: 62,
    height: 42,
    paddingHorizontal: 10,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  customIconImage: {
    width: 34,
    height: 34,
  },
});