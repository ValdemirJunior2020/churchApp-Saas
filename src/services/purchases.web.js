// File: src/services/purchases.web.js

export async function initPurchases() {
  return false;
}

export async function getOfferings() {
  return null;
}

export async function getCustomerInfo() {
  return {
    entitlements: {
      active: {},
    },
  };
}

export async function purchasePackage() {
  throw new Error("RevenueCat purchases are only available in native iOS/Android builds.");
}

export async function restorePurchases() {
  throw new Error("RevenueCat restore is only available in native iOS/Android builds.");
}