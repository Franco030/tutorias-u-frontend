import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

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

export default useTheme;
