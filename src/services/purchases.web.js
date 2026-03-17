// File: src/services/purchases.web.js

export async function initPurchases(appUserID = null) {
  return null;
}

export async function getOfferings() {
  return {
    availablePackages: [],
  };
}

export async function getCustomerInfo() {
  return {
    entitlements: {
      active: {},
    },
  };
}

export async function purchasePackage() {
  throw new Error("Purchases are not supported on web.");
}

export async function restorePurchases() {
  return {
    entitlements: {
      active: {},
    },
  };
}