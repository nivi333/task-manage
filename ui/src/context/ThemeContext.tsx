import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Available theme color schemes
export type ThemeColorScheme = 'purple' | 'blue' | 'green' | 'orange' | 'pink';

type SchemeDef = {
  primary: string;
  secondary: string;
  accent: string;
  gradient: { start: string; end: string; angle?: string };
};

const SCHEMES: Record<ThemeColorScheme, SchemeDef> = {
  // Elegant royal purple gradient
  purple: {
    primary: '#6D28D9', // purple-700
    secondary: '#8B5CF6', // violet-500
    accent: '#F59E0B', // amber-500
    gradient: { start: '#6D28D9', end: '#9333EA', angle: '135deg' },
  },
  // Azure blues
  blue: {
    primary: '#2563EB', // blue-600
    secondary: '#60A5FA', // blue-400
    accent: '#22D3EE', // cyan-400
    gradient: { start: '#1D4ED8', end: '#3B82F6', angle: '135deg' },
  },
  // Fresh greens
  green: {
    primary: '#16A34A', // green-600
    secondary: '#34D399', // emerald-400
    accent: '#F59E0B', // amber-500
    gradient: { start: '#16A34A', end: '#10B981', angle: '135deg' },
  },
  // Sunset orange
  orange: {
    primary: '#F97316', // orange-500
    secondary: '#FDBA74', // orange-300
    accent: '#22C55E', // green-500
    gradient: { start: '#EA580C', end: '#F97316', angle: '135deg' },
  },
  // Vibrant pinks
  pink: {
    primary: '#DB2777', // pink-600
    secondary: '#F472B6', // pink-400
    accent: '#22D3EE', // cyan-400
    gradient: { start: '#BE185D', end: '#EC4899', angle: '135deg' },
  },
};

function toRgb(hex: string): string {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (v: boolean) => void;
  setThemeOption: (mode: 'light' | 'dark') => void;
  colorScheme: ThemeColorScheme;
  setColorScheme: (scheme: ThemeColorScheme) => void;
  primaryColor: string;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_MODE = 'tt_theme_mode'; // 'dark' | 'light'
const STORAGE_SCHEME = 'tt_theme_color_scheme'; // ThemeColorScheme

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme mode: only track dark or light, no system
  const [prefMode, setPrefMode] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MODE) as 'dark' | 'light' | null;
      return saved ?? 'light';
    } catch {
      return 'light';
    }
  });

  const [isDark, setIsDark] = useState<boolean>(prefMode === 'dark');

  // Color scheme
  const [colorScheme, setColorSchemeState] = useState<ThemeColorScheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SCHEME) as ThemeColorScheme | null;
      return (saved && (Object.keys(SCHEMES) as ThemeColorScheme[]).includes(saved as ThemeColorScheme))
        ? (saved as ThemeColorScheme)
        : 'purple';
    } catch {
      return 'purple';
    }
  });

  const { primary: primaryColor, secondary: secondaryColor, accent, gradient } = SCHEMES[colorScheme];

  // Persist and apply theme mode
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MODE, prefMode);
    } catch {}
    setIsDark(prefMode === 'dark');
  }, [prefMode]);

  // Apply the html[data-theme] attribute whenever effective dark state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Apply color variables globally whenever scheme changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SCHEME, colorScheme);
    } catch {}
    const root = document.documentElement;
    root.style.setProperty('--color-primary', primaryColor);
    root.style.setProperty('--color-secondary', secondaryColor);
    root.style.setProperty('--color-primary-rgb', toRgb(primaryColor));
    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--gradient-start', gradient.start);
    root.style.setProperty('--gradient-end', gradient.end);
    if (gradient.angle) root.style.setProperty('--gradient-angle', gradient.angle);
  }, [colorScheme, primaryColor, secondaryColor, accent, gradient]);

  const value = useMemo<ThemeContextValue>(() => ({
    isDark,
    toggleTheme: () => setPrefMode((m) => (m === 'dark' ? 'light' : 'dark')),
    setDark: (v: boolean) => setPrefMode(v ? 'dark' : 'light'),
    setThemeOption: (mode: 'light' | 'dark') => setPrefMode(mode),
    colorScheme,
    setColorScheme: (scheme: ThemeColorScheme) => setColorSchemeState(scheme),
    primaryColor,
  }), [isDark, colorScheme, primaryColor]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
