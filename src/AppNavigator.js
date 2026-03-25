// src/AppNavigator.js

import React, { useMemo } from "react";
import { Image, Pressable, Text, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./screens/member/HomeScreen";
import LiveScreen from "./screens/member/LiveScreen";
import PeopleScreen from "./screens/member/PeopleScreen";
import PrayerScreen from "./screens/member/PrayerScreen";
import GivingScreen from "./screens/member/GivingScreen";
import MemberSettingsScreen from "./screens/member/MemberSettingsScreen";
import SwitchChurchScreen from "./screens/member/SwitchChurchScreen";
import NewHereScreen from "./screens/member/NewHereScreen";
import TestimoniesScreen from "./screens/member/TestimoniesScreen";

import AuthEntryScreen from "./screens/auth/AuthEntryScreen";
import PaymentRequiredScreen from "./screens/auth/PaymentRequiredScreen";
import PlatformAdminScreen from "./screens/admin/PlatformAdminScreen";

import { useAuth } from "./context/AuthContext";

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const COLORS = {
  bg: "#06070A",
  card: "rgba(18,18,24,0.96)",
  border: "rgba(255,255,255,0.14)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.72)",
  active: "#2ED8F3",
  inactive: "rgba(255,255,255,0.72)",
};

const tabIcons = {
  Home: require("./assets/tab-icons/home.png"),
  Live: require("./assets/tab-icons/live.png"),
  Prayer: require("./assets/tab-icons/events.png"),
  People: require("./assets/tab-icons/chat.png"),
  Giving: require("./assets/tab-icons/giving.png"),
  Me: require("./assets/tab-icons/settings.png"),
};

function HeaderRightButton({ onPress, icon = "diamond-outline", label }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(46,216,243,0.12)",
        borderWidth: 1,
        borderColor: "rgba(46,216,243,0.25)",
      }}
    >
      <Ionicons name={icon} size={16} color={COLORS.active} />
      {label ? (
        <Text style={{ color: COLORS.active, fontWeight: "800", fontSize: 12 }}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

function PngTabIcon({ routeName, focused }) {
  const source = tabIcons[routeName];

  return (
    <View
      style={{
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
      }}
    >
      <Image
        source={source}
        resizeMode="contain"
        fadeDuration={0}
        style={{
          width: focused ? 24 : 22,
          height: focused ? 24 : 22,
          opacity: focused ? 1 : 0.72,
        }}
      />
    </View>
  );
}

function MemberTabs({ navigation }) {
  const { profile } = useAuth();

  const isPastorOrAdmin = useMemo(() => {
    const role = String(profile?.role || "").toLowerCase();
    return (
      role === "owner" ||
      role === "pastor" ||
      role === "admin" ||
      role === "super_admin" ||
      role === "superadmin"
    );
  }, [profile?.role]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTransparent: true,
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          color: COLORS.text,
          fontWeight: "900",
          fontSize: 18,
        },
        headerShadowVisible: false,
        sceneStyle: {
          backgroundColor: COLORS.bg,
        },
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 10,
          height: 78,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          borderWidth: 1,
          borderColor: COLORS.border,
          borderRadius: 22,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          paddingBottom: 3,
          marginTop: 0,
        },
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarIcon: ({ focused }) => (
          <PngTabIcon routeName={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          headerRight: () => (
            <HeaderRightButton
              onPress={() => navigation.navigate("ChurchPro")}
              icon="diamond-outline"
              label="Pro"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Live"
        component={LiveScreen}
        options={{
          title: "Live",
        }}
      />

      <Tab.Screen
        name="Prayer"
        component={PrayerScreen}
        options={{
          title: "Prayer",
          headerRight: () => (
            <HeaderRightButton
              onPress={() => navigation.navigate("Testimonies")}
              icon="chatbubbles-outline"
              label="Testimonies"
            />
          ),
        }}
      />

      <Tab.Screen
        name="People"
        component={PeopleScreen}
        options={{
          title: "People",
          headerRight: () => (
            <HeaderRightButton
              onPress={() => navigation.navigate("NewHere")}
              icon="heart-outline"
              label="I’m New"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Giving"
        component={GivingScreen}
        options={{
          title: "Giving",
        }}
      />

      <Tab.Screen
        name="Me"
        component={MemberSettingsScreen}
        options={{
          title: "Me",
          headerRight: () =>
            isPastorOrAdmin ? (
              <HeaderRightButton
                onPress={() => navigation.navigate("PlatformAdmin")}
                icon="settings-outline"
                label="Admin"
              />
            ) : null,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.bg,
        },
        animation: "fade",
      }}
    >
      <RootStack.Screen name="AuthEntry" component={AuthEntryScreen} />
    </RootStack.Navigator>
  );
}

function AppStack() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: COLORS.text,
        headerStyle: {
          backgroundColor: COLORS.bg,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: COLORS.bg,
        },
        animation: "slide_from_right",
        headerTitleStyle: {
          color: COLORS.text,
          fontWeight: "900",
          fontSize: 18,
        },
      }}
    >
      <RootStack.Screen
        name="MemberTabs"
        component={MemberTabs}
        options={{ headerShown: false }}
      />

      <RootStack.Screen
        name="SwitchChurch"
        component={SwitchChurchScreen}
        options={{ title: "Switch Church" }}
      />

      <RootStack.Screen
        name="NewHere"
        component={NewHereScreen}
        options={{ title: "I’m New Here" }}
      />

      <RootStack.Screen
        name="Testimonies"
        component={TestimoniesScreen}
        options={{ title: "Testimonies" }}
      />

      <RootStack.Screen
        name="ChurchPro"
        component={PaymentRequiredScreen}
        options={{ title: "Church Pro" }}
      />

      <RootStack.Screen
        name="PlatformAdmin"
        component={PlatformAdminScreen}
        options={{ title: "Platform Admin" }}
      />
    </RootStack.Navigator>
  );
}

function FullScreenLoader() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.bg,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <ActivityIndicator color={COLORS.active} />
      <Text style={{ color: COLORS.text, fontWeight: "800" }}>Loading...</Text>
    </View>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  return (
    <NavigationContainer>
      {isLoading ? <FullScreenLoader /> : user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}