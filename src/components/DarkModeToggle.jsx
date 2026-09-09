import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

/**
 * Botón para alternar entre modo claro y oscuro con transiciones suaves y soporte de accesibilidad.
 */
export function DarkModeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-45 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-12 text-slate-700" />
      )}
    </button>
  );
}

export default DarkModeToggle;
