import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { AUTH_STORAGE_KEYS } from '../types/auth.types';

export const ThemeContext = createContext(null);

/**
 * Proveedor de tema para alternar entre modo Claro y Oscuro mediante la clase 'dark' en el documento raíz.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(AUTH_STORAGE_KEYS.THEME);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Si no hay preferencia guardada, verificar preferencia del sistema operativo
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(AUTH_STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Escuchar cambios de preferencia del sistema si el usuario no tiene una configuración forzada
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const stored = localStorage.getItem(AUTH_STORAGE_KEYS.THEME);
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  };

  const value = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme,
      setTheme,
    }),
    [theme, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook personalizado para consumir el contexto de tema (Dark/Light mode).
 * @returns {{ theme: 'light' | 'dark', isDark: boolean, toggleTheme: () => void, setTheme: (theme: 'light' | 'dark') => void }}
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return context;
}

export default ThemeContext;
