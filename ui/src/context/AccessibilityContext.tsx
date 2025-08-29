import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AccessibilityPrefs = {
  fontScale: number; // 0.875 - 1.5
  reduceMotion: boolean;
  highContrast: boolean;
};

type AccessibilityContextType = AccessibilityPrefs & {
  setFontScale: (v: number) => void;
  setReduceMotion: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
};

const defaultPrefs: AccessibilityPrefs = {
  fontScale: 1,
  reduceMotion: false,
  highContrast: false,
};

const KEY = "tt_accessibility_prefs";

const AccessibilityContext = createContext<AccessibilityContextType>({
  ...defaultPrefs,
  setFontScale: () => {},
  setReduceMotion: () => {},
  setHighContrast: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...defaultPrefs, ...JSON.parse(raw) } as AccessibilityPrefs;
    } catch {}
    return defaultPrefs;
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  // Apply CSS variables/classes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--tt-font-scale", String(prefs.fontScale));
    document.body.classList.toggle("reduce-motion", !!prefs.reduceMotion);
    document.body.classList.toggle("high-contrast", !!prefs.highContrast);
  }, [prefs.fontScale, prefs.reduceMotion, prefs.highContrast]);

  const value = useMemo<AccessibilityContextType>(() => ({
    ...prefs,
    setFontScale: (v) => setPrefs((p) => ({ ...p, fontScale: Math.min(1.5, Math.max(0.875, v)) })),
    setReduceMotion: (v) => setPrefs((p) => ({ ...p, reduceMotion: v })),
    setHighContrast: (v) => setPrefs((p) => ({ ...p, highContrast: v })),
  }), [prefs]);

  return (
    <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
  );
};
