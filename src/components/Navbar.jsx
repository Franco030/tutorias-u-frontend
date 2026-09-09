import { useAuth } from '../context/AuthContext';
import { DarkModeToggle } from './DarkModeToggle';
import { GraduationCap, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '../services/apiClient';

/**
 * Barra de navegación principal con identidad visual de TutoriasU,
 * selector de tema e información del usuario autenticado.
 */
export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const apiUrl = getApiBaseUrl();
  const isAzureProd = apiUrl.includes('azurewebsites.net');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tutorias<span className="text-blue-600 dark:text-blue-400">U</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {isAzureProd ? 'Azure Cloud' : 'Dev Local'}
            </span>
          </div>
        </div>

        {/* Acciones y Estado de Sesión */}
        <div className="flex items-center space-x-3">
          {/* Toggle Modo Oscuro */}
          <DarkModeToggle />

          {/* Información del usuario autenticado */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  {user.nombre}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-500" />
                  {user.rol || 'Usuario'}
                </span>
              </div>

              {/* Avatar */}
              {user.fotoUrl ? (
                <img
                  src={user.fotoUrl}
                  alt={user.nombre}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold text-sm flex items-center justify-center shadow-sm">
                  {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}

              {/* Botón Salir */}
              <button
                type="button"
                onClick={logout}
                title="Cerrar sesión"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 mr-1" />
              <span>Plataforma Académica</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
