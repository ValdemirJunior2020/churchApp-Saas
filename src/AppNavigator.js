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
import PeopleScreen from "./screens/member/PeopleScreen";
import PrayerScreen from "./screens/member/PrayerScreen";
import MemberSettingsScreen from "./screens/member/MemberSettingsScreen";
import NewHereScreen from "./screens/member/NewHereScreen";
import TestimoniesScreen from "./screens/member/TestimoniesScreen";

import AdminSettingsScreen from "./screens/admin/AdminSettingsScreen";
import AdminEventsScreen from "./screens/admin/AdminEventsScreen";
import MemberManagerScreen from "./screens/admin/MemberManagerScreen";
import PlatformAdminScreen from "./screens/admin/PlatformAdminScreen";

import { colors } from "./theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICON_NAMES = {
  Home: { focused: "home", outline: "home-outline" },
  Live: { focused: "play-circle", outline: "play-circle-outline" },
  Prayer: { focused: "chatbubble-ellipses", outline: "chatbubble-ellipses-outline" },
  People: { focused: "people", outline: "people-outline" },
  Me: { focused: "person-circle", outline: "person-circle-outline" },
  Giving: { focused: "heart", outline: "heart-outline" },
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
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: "fade" }}
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

  return useMemo(() => ({
    position: "absolute",
    left: 10,
    right: 10,
    bottom: Math.max(10, insets.bottom + 6),
    height: 76 + Math.max(0, insets.bottom - 4),
    paddingTop: 8,
    paddingBottom: Math.max(10, insets.bottom),
    backgroundColor: "rgba(20, 12, 24, 0.94)",
    borderTopWidth: 1,
    borderTopColor: churchTheme.tabBorder,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  }), [insets.bottom, churchTheme.tabBorder]);
}

function CustomTabIcon({ routeName, focused, color }) {
  const icon = TAB_ICON_NAMES[routeName] || TAB_ICON_NAMES.Home;
  return (
    <View style={[styles.customIconWrap, focused && styles.customIconWrapFocused]}>
      <Ionicons
        name={focused ? icon.focused : icon.outline}
        size={22}
        color={color}
      />
    </View>
  );
}

function MainTabs() {
  const tabBarStyle = useTabBarStyle();
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
        tabBarIcon: ({ focused, color }) => (
          <CustomTabIcon routeName={route.name} focused={focused} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Prayer" component={PrayerScreen} />
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="Me" component={MemberSettingsScreen} />
      <Tab.Screen name="Giving" component={GivingScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { ready } = useAppData();
  const { tenant, isLoading } = useAuth();
  const { loading: purchasesLoading } = useContext(PurchasesContext);
  const churchTheme = useChurchTheme();

  if (isLoading || !ready || purchasesLoading) return <Loading />;

  const navKey = tenant?.churchId ? `${tenant.churchId}` : "guest";

  return (
    <NavigationContainer theme={buildNavTheme(churchTheme)}>
      <Stack.Navigator
        key={navKey}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {!tenant?.churchId ? (
          <Stack.Screen name="AuthFlow" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="PaymentRequired"
              component={PaymentRequiredScreen}
              options={{ headerShown: true, title: "Church Pro", headerTransparent: true, headerTintColor: colors.text }}
            />
            <Stack.Screen
              name="NewHere"
              component={NewHereScreen}
              options={{ headerShown: true, title: "I'm New Here", headerTransparent: true, headerTintColor: colors.text }}
            />
            <Stack.Screen
              name="Testimonies"
              component={TestimoniesScreen}
              options={{ headerShown: true, title: "Testimonies", headerTransparent: true, headerTintColor: colors.text }}
            />
            <Stack.Screen
              name="AdminSettings"
              component={AdminSettingsScreen}
              options={{ headerShown: true, title: "Church Settings", headerTransparent: true, headerTintColor: colors.text }}
            />
            <Stack.Screen
              name="AdminEvents"
              component={AdminEventsScreen}
              options={{ headerShown: true, title: "Manage Events", headerTransparent: true, headerTintColor: colors.text }}
            />
            <Stack.Screen
              name="AdminMembers"
              component={MemberManagerScreen}
              options={{ headerShown: true, title: "Manage Members", headerTransparent: true, headerTintColor: colors.text }}
            />
            <Stack.Screen
              name="PlatformAdmin"
              component={PlatformAdminScreen}
              options={{ headerShown: true, title: "Platform Admin", headerTransparent: true, headerTintColor: colors.text }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: colors.text, fontWeight: "700" },
  customIconWrap: { width: 38, height: 32, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent" },
  customIconWrapFocused: { backgroundColor: "rgba(34, 211, 238, 0.10)", borderColor: "rgba(86, 212, 255, 0.25)" },
  tabLabel: { fontSize: 11, fontWeight: "700" },
  tabItem: { paddingVertical: 4 },
});
