// File: src/services/purchases.native.js

import Purchases from "react-native-purchases";

const API_KEY = "appl_YOUR_PUBLIC_KEY";

export async function initPurchases(appUserID = null) {
  await Purchases.configure({
    apiKey: API_KEY,
    appUserID,
  });
}

export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings?.current ?? null;
}

export async function getCustomerInfo() {
  return await Purchases.getCustomerInfo();
}

export async function purchasePackage(pkg) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases() {
  return await Purchases.restorePurchases();
}