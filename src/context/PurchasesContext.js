// File: src/context/PurchasesContext.js

import React, { createContext, useEffect, useMemo, useState } from "react";
import Constants from "expo-constants";
import useDemoMode from "../hooks/useDemoMode";
import { useAuth } from "./AuthContext";
import {
  initPurchases,
  getOfferings,
  getCustomerInfo,
} from "../services/purchases";

export const PurchasesContext = createContext({
  offerings: null,
  isPro: false,
  loading: true,
  trialActive: false,
  trialEndsAt: null,
  setIsPro: () => {},
  refreshPurchases: async () => {},
});

function isRunningInExpoGo() {
  return Constants.appOwnership === "expo";
}

function toMillis(value) {
  if (!value) return null;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function PurchasesProvider({ children }) {
  const { tenant, user } = useAuth();
  const [offerings, setOfferings] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const { demo } = useDemoMode();

  const trialEndsAt = toMillis(tenant?.trialEndsAt);
  const trialActive = Boolean(trialEndsAt && trialEndsAt > Date.now());

  async function refreshPurchases() {
    if (demo || isRunningInExpoGo()) {
      setOfferings(null);
      setIsPro(true);
      return;
    }

    await initPurchases(user?.uid || null);

    const currentOffering = await getOfferings();
    const customerInfo = await getCustomerInfo();
    const entitlementActive = Boolean(customerInfo?.entitlements?.active?.pro);

    setOfferings(currentOffering);
    setIsPro(entitlementActive || trialActive);
  }

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        if (demo) {
          if (mounted) {
            setOfferings(null);
            setIsPro(true);
            setLoading(false);
          }
          return;
        }

        if (isRunningInExpoGo()) {
          console.log("Expo Go detected. Skipping RevenueCat native purchase flow.");
          if (mounted) {
            setOfferings(null);
            setIsPro(true);
            setLoading(false);
          }
          return;
        }

        await initPurchases(user?.uid || null);

        const currentOffering = await getOfferings();
        const customerInfo = await getCustomerInfo();
        const entitlementActive = Boolean(customerInfo?.entitlements?.active?.pro);

        if (mounted) {
          setOfferings(currentOffering);
          setIsPro(entitlementActive || trialActive);
        }
      } catch (error) {
        console.log("PurchasesContext init error:", error);
        if (mounted) {
          setOfferings(null);
          setIsPro(trialActive);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    run();

    return () => {
      mounted = false;
    };
  }, [demo, user?.uid, tenant?.churchId, trialActive]);

  const value = useMemo(
    () => ({
      offerings,
      isPro,
      loading,
      trialActive,
      trialEndsAt,
      setIsPro,
      refreshPurchases,
    }),
    [offerings, isPro, loading, trialActive, trialEndsAt]
  );

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
}

export default PurchasesContext;