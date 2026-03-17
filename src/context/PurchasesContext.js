// File: src/context/PurchasesContext.js

import React, { createContext, useEffect, useState } from "react";
import useDemoMode from "../hooks/useDemoMode";
import {
  initPurchases,
  getOfferings,
  getCustomerInfo,
} from "../services/purchases";

export const PurchasesContext = createContext({
  offerings: null,
  isPro: false,
  loading: true,
  setIsPro: () => {},
});

export function PurchasesProvider({ children }) {
  const [offerings, setOfferings] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const { demo } = useDemoMode();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        if (demo) {
          if (mounted) {
            setIsPro(true);
            setLoading(false);
          }
          return;
        }

        await initPurchases();

        const currentOffering = await getOfferings();
        const customerInfo = await getCustomerInfo();

        if (mounted) {
          setOfferings(currentOffering);
          setIsPro(Boolean(customerInfo?.entitlements?.active?.pro));
        }
      } catch (error) {
        console.log("PurchasesContext init error:", error);

        if (mounted) {
          setOfferings(null);
          setIsPro(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [demo]);

  return (
    <PurchasesContext.Provider
      value={{
        offerings,
        isPro,
        loading,
        setIsPro,
      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
}

export default PurchasesContext;