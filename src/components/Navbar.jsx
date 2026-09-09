import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DarkModeToggle } from './DarkModeToggle';
import { GraduationCap, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '../services/apiClient';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const apiUrl = getApiBaseUrl();
  const isAzureProd = apiUrl.includes('azurewebsites.net');

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-deep-space-blue-950/70 border-b border-granite-200 dark:border-deep-space-blue-800 transition-colors duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 bg-deep-space-blue-600 dark:bg-emerald-400 transition-colors duration-300"
            style={{
              WebkitMaskImage: 'url(/logo.png)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskImage: 'url(/logo.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
            }}
            aria-label="TutoriasU Logo"
          />
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
            <div className="flex items-center space-x-3 pl-2 border-l border-granite-200 dark:border-granite-800 relative" ref={dropdownRef}>
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-granite-800 dark:text-granite-100 leading-tight">
                  {user.nombre}
                </span>
                <span className="text-xs text-granite-500 dark:text-granite-400 flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3 h-3 text-deep-space-blue-500" />
                  {user.rol || 'Usuario'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative rounded-full focus:outline-none flex items-center justify-center p-0 m-0 border-none bg-transparent cursor-pointer"
                title="Menú de usuario"
              >
                {user.fotoUrl ? (
                  <img
                    src={user.fotoUrl}
                    alt={user.nombre}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-granite-200 dark:ring-granite-700 hover:ring-deep-space-blue-400 transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-deep-space-blue-600 text-white font-medium text-sm flex items-center justify-center hover:bg-deep-space-blue-500 transition-colors">
                    {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-deep-space-blue-900 border border-granite-200 dark:border-deep-space-blue-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-3 border-b border-granite-100 dark:border-deep-space-blue-800/50 md:hidden">
                    <p className="text-sm font-medium text-granite-900 dark:text-white truncate">
                      {user.nombre}
                    </p>
                    <p className="text-xs text-granite-500 dark:text-deep-space-blue-300 truncate">
                      {user.correo}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-burgundy-600 dark:text-burgundy-400 hover:bg-burgundy-50 dark:hover:bg-burgundy-950/40 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
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
