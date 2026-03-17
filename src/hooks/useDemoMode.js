// File: src/hooks/useDemoMode.js

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useDemoMode() {
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    loadDemo();
  }, []);

  const loadDemo = async () => {
    try {
      const value = await AsyncStorage.getItem("demo_mode");
      setDemo(value === "true");
    } catch (e) {
      console.log("Demo load error", e);
    }
  };

  const toggleDemo = async () => {
    try {
      const newValue = !demo;
      await AsyncStorage.setItem("demo_mode", newValue.toString());
      setDemo(newValue);
    } catch (e) {
      console.log("Demo toggle error", e);
    }
  };

  return { demo, toggleDemo };
}