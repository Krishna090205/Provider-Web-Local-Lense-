import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemePreference, ResolvedTheme, themePreferenceSchema } from './themeSchema';

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

const THEME_STORAGE_KEY = 'locallens_theme_v1';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const parsed = themePreferenceSchema.safeParse(stored);
      if (parsed.success) {
        return parsed.data;
      }
    } catch {}
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const applyTheme = (targetTheme: ThemePreference) => {
    let resolved: ResolvedTheme = 'dark';
    if (targetTheme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = targetTheme;
    }

    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Storage access error';
      console.error('Failed to save theme in localStorage:', msg);
    }
    applyTheme(newTheme);
  };

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
