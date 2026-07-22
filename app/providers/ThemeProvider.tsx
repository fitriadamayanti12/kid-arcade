// app/providers/ThemeProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const applyTheme = useCallback((newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setResolvedTheme(newTheme);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('kid-arcade-theme', newTheme);
    
    if (newTheme === 'system') {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(newTheme);
    }
  }, [applyTheme, getSystemTheme]);

  // Inisialisasi
  useEffect(() => {
    setMounted(true);
    
    const saved = localStorage.getItem('kid-arcade-theme') as Theme;
    const initialTheme = saved || 'system';
    setThemeState(initialTheme);
    
    if (initialTheme === 'system') {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(initialTheme as 'light' | 'dark');
    }

    // Dengerin perubahan tema sistem
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Cek tema terbaru dari localStorage
      const currentSaved = localStorage.getItem('kid-arcade-theme') as Theme;
      if (!currentSaved || currentSaved === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, getSystemTheme]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);