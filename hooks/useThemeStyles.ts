// hooks/useThemeStyles.ts
'use client';

import { useState, useEffect } from 'react';

export function useThemeStyles() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Cek awal
    const check = () => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDark(dark);
    };
    
    // Jalankan sekali di awal
    check();

    // Pantau perubahan class di <html>
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    // Dengarkan perubahan sistem (misal: HP ganti tema)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('kid-arcade-theme') || localStorage.getItem('kid-arcade-theme') === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  return {
    // Status
    isDark,

    // Background
    bg: isDark ? '#0f172a' : '#f8fafc',
    bgCard: isDark ? '#1e293b' : '#ffffff',
    bgHover: isDark ? '#334155' : '#f1f5f9',

    // Text
    text: isDark ? '#e2e8f0' : '#1e293b',
    textSecondary: isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    heading: isDark ? '#f1f5f9' : '#0f172a',

    // Border
    border: isDark ? '#334155' : '#e2e8f0',

    // Input
    input: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#475569' : '#d1d5db',
    inputText: isDark ? '#e2e8f0' : '#1e293b',
    placeholder: isDark ? '#64748b' : '#9ca3af',

    // Success
    success: isDark ? '#34d399' : '#10b981',
    successBg: isDark ? '#064e3b' : '#d1fae5',
    successBorder: isDark ? '#065f46' : '#a7f3d0',

    // Danger
    danger: isDark ? '#f87171' : '#ef4444',
    dangerBg: isDark ? '#3b0a0a' : '#fee2e2',
    dangerBorder: isDark ? '#7f1d1d' : '#fecaca',

    // Warning
    warning: isDark ? '#fbbf24' : '#f59e0b',
    warningBg: isDark ? '#451a03' : '#fef3c7',
    warningBorder: isDark ? '#78350f' : '#fde68a',

    // Accent / Purple
    accent: isDark ? '#a78bfa' : '#7c3aed',
    accentBg: isDark ? '#2e1065' : '#ede9fe',
    accentText: isDark ? '#c4b5fd' : '#5b21b6',

    // Pill / Chip / Filter
    pillBg: isDark ? '#334155' : '#ffffff',
    pillText: isDark ? '#e2e8f0' : '#1e293b',
    pillBorder: isDark ? '#475569' : '#e2e8f0',
    pillActiveBg: isDark ? '#7c3aed' : '#7c3aed',
    pillActiveText: '#ffffff',

    // Dark mode toggle button
    darkBtn: isDark ? '#fbbf24' : '#334155',
    darkBtnText: isDark ? '#000' : '#fff',

    // Shadow
    shadow: isDark 
      ? '0 4px 20px rgba(0,0,0,0.5)' 
      : '0 4px 20px rgba(0,0,0,0.08)',
    shadowSm: isDark 
      ? '0 1px 3px rgba(0,0,0,0.4)' 
      : '0 1px 3px rgba(0,0,0,0.06)',

    // Gradient (untuk background halaman)
    gradientBg: isDark 
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',

    // Glass effect
    glass: isDark 
      ? 'rgba(30, 41, 59, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)',
    glassBorder: isDark 
      ? '1px solid rgba(255,255,255,0.1)' 
      : '1px solid rgba(255,255,255,0.3)',
  };
}