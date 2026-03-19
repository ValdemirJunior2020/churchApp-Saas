// File: src/services/purchases.native.js

import { Platform } from "react-native";
import Constants from "expo-constants";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

let configured = false;
let configuredUserId = null;

function getExpoConfig() {
  return Constants?.expoConfig || Constants?.manifest2?.extra?.expoClient || {};
}

function getRevenueCatConfig() {
  const extra = getExpoConfig()?.extra || {};
  return extra?.revenueCat || {};
}

function getPublicSdkKey() {
  const rc = getRevenueCatConfig();

  if (Platform.OS === "ios") {
    return String(rc?.iosPublicSdkKey || "").trim();
  }

  return String(rc?.androidPublicSdkKey || "").trim();
}

function isPlaceholderKey(value = "") {
  const key = String(value || "").trim();
  if (!key) return true;

  return (
    key.includes("REPLACE") ||
    key.includes("YOUR") ||
    key.includes("LATER") ||
    key === "appl_REPLACE_LATER" ||
    key === "goog_REPLACE_LATER"
  );
}

export async function initPurchases(appUserId = null) {
  const apiKey = getPublicSdkKey();

  if (!apiKey || isPlaceholderKey(apiKey)) {
    console.log("RevenueCat not configured yet. Add public SDK key later.");
    configured = false;
    configuredUserId = null;
    return false;
  }

  if (configured && configuredUserId === (appUserId || null)) {
    return true;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    await Purchases.configure({
      apiKey,
      appUserID: appUserId || undefined,
    });

    configured = true;
    configuredUserId = appUserId || null;
    return true;
  } catch (error) {
    console.log("RevenueCat configure error:", error);
    configured = false;
    configuredUserId = null;
    throw error;
  }
}

export async function getOfferings() {
  const apiKey = getPublicSdkKey();

  if (!apiKey || isPlaceholderKey(apiKey)) {
    return null;
  }

  await initPurchases();

  const offerings = await Purchases.getOfferings();
  return offerings?.current || null;
}

export async function getCustomerInfo() {
  const apiKey = getPublicSdkKey();

  if (!apiKey || isPlaceholderKey(apiKey)) {
    return {
      entitlements: {
        active: {},
      },
    };
  }

  await initPurchases();
  return Purchases.getCustomerInfo();
}

export async function purchasePackage(pkg) {
  const apiKey = getPublicSdkKey();

  if (!apiKey || isPlaceholderKey(apiKey)) {
    throw new Error(
      "RevenueCat public SDK key is not configured yet. Add your key later in app.json."
    );
  }

  if (!pkg) {
    throw new Error("No subscription package was provided.");
  }

  await initPurchases();

  const result = await Purchases.purchasePackage(pkg);
  return result?.customerInfo || null;
}

export async function restorePurchases() {
  const apiKey = getPublicSdkKey();

  if (!apiKey || isPlaceholderKey(apiKey)) {
    throw new Error(
      "RevenueCat public SDK key is not configured yet. Add your key later in app.json."
    );
  }

  await initPurchases();
  return Purchases.restorePurchases();
}