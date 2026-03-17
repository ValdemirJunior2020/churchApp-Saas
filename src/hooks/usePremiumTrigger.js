// File: src/hooks/usePremiumTrigger.js

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function usePremiumTrigger(isAdmin, isPro) {
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    checkTrigger();
  }, []);

  const checkTrigger = async () => {
    if (!isAdmin || isPro) return;

    const launches = await AsyncStorage.getItem("launch_count");
    const count = launches ? parseInt(launches) + 1 : 1;

    await AsyncStorage.setItem("launch_count", count.toString());

    if (count >= 3) {
      setShowPremium(true);
    }
  };

  return {
    showPremium,
    setShowPremium,
  };
}