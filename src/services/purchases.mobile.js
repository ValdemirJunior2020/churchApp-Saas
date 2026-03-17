// File: src/services/purchases.mobile.js

import Purchases from "@revenuecat/purchases-react-native";

const API_KEY = "appl_YOUR_PUBLIC_KEY"; // replace

export const initPurchases = async () => {
  await Purchases.configure({ apiKey: API_KEY });
};

export const getOfferings = async () => {
  const offerings = await Purchases.getOfferings();
  return offerings.current;
};

export const getCustomerInfo = async () => {
  return await Purchases.getCustomerInfo();
};

export const purchasePackage = async (pkg) => {
  return await Purchases.purchasePackage(pkg);
};

export const restorePurchases = async () => {
  return await Purchases.restorePurchases();
};