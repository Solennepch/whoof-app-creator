import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

const DEV_PREMIUM_OVERRIDE_KEY = 'dev_premium_override';
const DEV_EMAIL = 'dev@pawtes.app';

export function useDevTools() {
  const { user } = useAuth();
  const [premiumOverride, setPremiumOverride] = useState<boolean | null>(null);

  const isDevAccount = user?.email === DEV_EMAIL;

  useEffect(() => {
    if (isDevAccount) {
      const stored = localStorage.getItem(DEV_PREMIUM_OVERRIDE_KEY);
      if (stored !== null) {
        setPremiumOverride(stored === 'true');
      }
    } else {
      setPremiumOverride(null);
    }
  }, [isDevAccount]);

  const togglePremiumOverride = () => {
    if (!isDevAccount) return;

    const newValue = !premiumOverride;
    setPremiumOverride(newValue);
    localStorage.setItem(DEV_PREMIUM_OVERRIDE_KEY, String(newValue));
  };

  const clearPremiumOverride = () => {
    setPremiumOverride(null);
    localStorage.removeItem(DEV_PREMIUM_OVERRIDE_KEY);
  };

  return {
    isDevAccount,
    premiumOverride,
    togglePremiumOverride,
    clearPremiumOverride,
  };
}
