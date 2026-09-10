import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import MicrosoftLoginButton from './MicrosoftLoginButton';
import LocalAuthForm from './LocalAuthForm';
import { getApiBaseUrl } from '../../services/apiClient';
import { GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Vista de inicio de sesión de TutoriasU.
 * Diseño moderno, limpio y enfocado en la experiencia académica con paleta azul/blanco/gris y soporte completo para modo oscuro.
 */
export function LoginPage() {
  const { user, isAuthenticated, logout, error, clearError } = useAuth();
  const apiUrl = getApiBaseUrl();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 bg-granite-50 dark:bg-granite-950 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Cabecera / Identidad */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-deep-space-blue-50 dark:bg-deep-space-blue-900/40 text-deep-space-blue-600 dark:text-deep-space-blue-400 mb-4 border border-deep-space-blue-100 dark:border-deep-space-blue-800">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-granite-900 dark:text-white">
            Tutorias<span className="text-deep-space-blue-600 dark:text-deep-space-blue-400">U</span>
          </h1>
          <p className="mt-2 text-sm text-granite-500 dark:text-granite-400">
            Plataforma Integral de Tutorías y Acompañamiento Académico Universitario
          </p>
        </div>

        {/* Tarjeta Principal de Login */}
        <div className="bg-white dark:bg-granite-900 rounded-2xl border border-granite-200 dark:border-granite-800 p-6 sm:p-8 shadow-sm transition-all">
          {isAuthenticated && user ? (
            /* Vista cuando ya existe sesión activa */
            <div className="text-center space-y-5">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-granite-900 dark:text-white">
                  ¡Sesión Activa!
                </h3>
                <p className="text-xs text-granite-500 dark:text-granite-400 mt-1">
                  Has iniciado sesión como:
                </p>
              </div>

              <div className="p-4 rounded-xl bg-granite-50 dark:bg-granite-950 border border-granite-200 dark:border-granite-800 text-left space-y-2">
                <div className="flex items-center space-x-3">
                  {user.fotoUrl ? (
                    <img
                      src={user.fotoUrl}
                      alt={user.nombre}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-granite-200 dark:ring-granite-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-deep-space-blue-600 text-white font-medium flex items-center justify-center">
                      {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-granite-800 dark:text-granite-100 truncate">
                      {user.nombre}
                    </p>
                    <p className="text-xs text-granite-500 dark:text-granite-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-granite-200 dark:border-granite-800 flex items-center justify-between text-xs">
                  <span className="text-granite-500 dark:text-granite-400">Rol Asignado:</span>
                  <span className="font-semibold text-deep-space-blue-600 dark:text-deep-space-blue-400 bg-deep-space-blue-50 dark:bg-deep-space-blue-900/40 px-2 py-0.5 rounded-md">
                    {user.rol || 'Estudiante'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 px-4 text-sm font-medium rounded-xl text-granite-700 dark:text-granite-200 bg-granite-100 dark:bg-granite-800 hover:bg-granite-200 dark:hover:bg-granite-700 transition-colors border border-granite-200 dark:border-granite-700"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            /* Formulario de Login */
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-granite-900 dark:text-white">
                  Acceso a la plataforma
                </h2>
                <p className="text-xs text-granite-500 dark:text-granite-400 mt-0.5">
                  Ingresa con tu cuenta local o utiliza un proveedor institucional autorizado.
                </p>
              </div>

              {/* Mensaje de Error Global */}
              {error && (
                <div className="p-3 rounded-xl bg-burgundy-50 dark:bg-burgundy-950/40 border border-burgundy-200 dark:border-burgundy-900/50 text-burgundy-700 dark:text-burgundy-300 text-xs flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-burgundy-500" />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearError}
                    className="text-burgundy-500 hover:text-burgundy-700 text-sm font-bold shrink-0 leading-none cursor-pointer"
                    aria-label="Cerrar alerta"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Formulario Local */}
              <LocalAuthForm />

              {/* Separador Visual */}
              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-granite-200 dark:border-granite-800" />
                <span className="shrink mx-3 text-xs font-medium text-granite-400 dark:text-granite-500 uppercase tracking-wider">
                  o continúa con
                </span>
                <div className="grow border-t border-granite-200 dark:border-granite-800" />
              </div>

              {/* Botones de Autenticación */}
              <div className="space-y-3.5">
                <GoogleLoginButton />
                <MicrosoftLoginButton />
              </div>
            </div>
          )}
        </div>

        {/* Footer con información de Backend & Conexión */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-granite-500 dark:text-granite-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>API Backend:</span>
            <code className="text-[10px] font-mono text-granite-500 dark:text-granite-400">
              {apiUrl || 'No configurada'}
            </code>
          </div>
          <p className="text-xs text-granite-400 dark:text-granite-500">
            © {new Date().getFullYear()} TutoriasU • Universidad y Plataforma de Acompañamiento
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
