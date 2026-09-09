import { useAuth } from '../context/AuthContext';
import { DarkModeToggle } from './DarkModeToggle';
import { GraduationCap, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '../services/apiClient';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const apiUrl = getApiBaseUrl();
  const isAzureProd = apiUrl.includes('azurewebsites.net');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-granite-950/70 border-b border-granite-200 dark:border-granite-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-deep-space-blue-50 dark:bg-deep-space-blue-900/40 border border-deep-space-blue-100 dark:border-deep-space-blue-800 flex items-center justify-center text-deep-space-blue-600 dark:text-deep-space-blue-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-deep-space-blue-600 dark:text-white leading-none" style={{ fontFamily: "'Comfortaa', sans-serif" }}>
              Tutorias<span className="text-emerald-500 font-bold ml-0.5">U</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-granite-500 dark:text-granite-400 uppercase tracking-widest">
              {isAzureProd ? 'Azure Cloud' : 'Dev Local'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <DarkModeToggle />

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-granite-200 dark:border-granite-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-granite-800 dark:text-granite-100 leading-tight">
                  {user.nombre}
                </span>
                <span className="text-xs text-granite-500 dark:text-granite-400 flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3 h-3 text-deep-space-blue-500" />
                  {user.rol || 'Usuario'}
                </span>
              </div>

              {user.fotoUrl ? (
                <img
                  src={user.fotoUrl}
                  alt={user.nombre}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-granite-200 dark:ring-granite-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-deep-space-blue-600 text-white font-medium text-sm flex items-center justify-center">
                  {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}

              <button
                type="button"
                onClick={logout}
                title="Cerrar sesión"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-granite-700 dark:text-granite-200 hover:text-burgundy-600 dark:hover:text-burgundy-400 hover:bg-burgundy-50 dark:hover:bg-burgundy-950/40 border border-granite-200 dark:border-granite-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center text-xs text-granite-500 dark:text-granite-400">
              <Sparkles className="w-3.5 h-3.5 text-deep-space-blue-500 mr-1" />
              <span>Plataforma Académica</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
