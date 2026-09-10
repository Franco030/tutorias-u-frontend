import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

import { AnimatedThemeToggler } from './ui/animated-theme-toggler';
import { NumberSevenIcon } from '@phosphor-icons/react';

export function DarkModeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme();

  return (
    <AnimatedThemeToggler
      theme={theme}
      onThemeChange={setTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-granite-600 dark:text-granite-300 hover:text-deep-space-blue-600 dark:hover:text-deep-space-blue-400 hover:bg-granite-100 dark:hover:bg-granite-800/80 transition-all duration-200 outline-none ${className}`}
    />
  );
}

export default DarkModeToggle;