import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'tt_theme_mode'; // 'dark' | 'light'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      // prefer system
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {}
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const value = useMemo<ThemeContextValue>(() => ({
    isDark,
    toggleTheme: () => setIsDark((v) => !v),
    setDark: (v: boolean) => setIsDark(v),
  }), [isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
