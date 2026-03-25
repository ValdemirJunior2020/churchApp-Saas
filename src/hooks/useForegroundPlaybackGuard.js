// File: src/hooks/useForegroundPlaybackGuard.js

import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

export default function useForegroundPlaybackGuard({
  onBackground,
  onForeground
} = {}) {
  const [appState, setAppState] = useState(AppState.currentState);
  const previousStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const prevState = previousStateRef.current;

      previousStateRef.current = nextState;
      setAppState(nextState);

      const movedToBackground =
        prevState === "active" && /inactive|background/.test(nextState);

      const movedToForeground =
        /inactive|background/.test(prevState) && nextState === "active";

      if (movedToBackground && typeof onBackground === "function") {
        onBackground();
      }

      if (movedToForeground && typeof onForeground === "function") {
        onForeground();
      }
    });

    return () => subscription.remove();
  }, [onBackground, onForeground]);

  return {
    appState,
    isActive: appState === "active"
  };
}