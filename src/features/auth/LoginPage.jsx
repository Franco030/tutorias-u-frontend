import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import MicrosoftLoginButton from './MicrosoftLoginButton';
import { getApiBaseUrl } from '../../services/apiClient';
import { GraduationCap, BookOpen, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Vista de inicio de sesión de TutoriasU.
 * Diseño moderno, limpio y enfocado en la experiencia académica con paleta azul/blanco/gris y soporte completo para modo oscuro.
 */
export function LoginPage() {
  const { user, isAuthenticated, logout, error, clearError } = useAuth();
  const apiUrl = getApiBaseUrl();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Cabecera / Identidad */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/25 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tutorias<span className="text-blue-600 dark:text-blue-400">U</span>
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Plataforma Integral de Tutorías y Acompañamiento Académico Universitario
          </p>
        </div>

        {/* Tarjeta Principal de Login */}
        <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/70 p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all">
          {isAuthenticated && user ? (
            /* Vista cuando ya existe sesión activa */
            <div className="text-center space-y-5">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  ¡Sesión Activa!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Has iniciado sesión como:
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left space-y-2">
                <div className="flex items-center space-x-3">
                  {user.fotoUrl ? (
                    <img
                      src={user.fotoUrl}
                      alt={user.nombre}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                      {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {user.nombre}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Rol Asignado:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                    {user.rol || 'Estudiante'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 px-4 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            /* Formulario de Login */
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Iniciar Sesión
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Accede mediante tu cuenta universitaria institucional o personal autorizada.
                </p>
              </div>

              {/* Mensaje de Error Global */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700 text-sm font-bold shrink-0 leading-none"
                    aria-label="Cerrar alerta"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Botones de Autenticación */}
              <div className="space-y-3.5">
                {/* Botón de Google */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Acceso con cuenta Google:
                  </label>
                  <GoogleLoginButton />
                </div>

                {/* Separador Visual */}
                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-slate-200 dark:border-slate-700" />
                  <span className="shrink mx-3 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    o también
                  </span>
                  <div className="grow border-t border-slate-200 dark:border-slate-700" />
                </div>

                {/* Botón de Microsoft */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Acceso institucional Microsoft 365:
                  </label>
                  <MicrosoftLoginButton />
                </div>
              </div>

              {/* Badges de Beneficios / Seguridad */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">Acceso Seguro SSL</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">Tutorías en Tiempo Real</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con información de Backend & Conexión */}
        <div className="mt-6 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Backend:</span>
            <code className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
              {apiUrl || 'No configurada'}
            </code>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} TutoriasU • Universidad y Plataforma de Acompañamiento
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
