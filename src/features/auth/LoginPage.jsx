import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import MicrosoftLoginButton from './MicrosoftLoginButton';
import { getApiBaseUrl } from '../../services/apiClient';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { UsersThree, Clock } from '@phosphor-icons/react';
import { useState } from 'react';
import { AnimatedThemeToggler } from '../../components/ui/animated-theme-toggler';

export function LoginPage() {
  const { user, isAuthenticated, logout, error, clearError } = useAuth();
  const apiUrl = getApiBaseUrl();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-deep-space-blue-950 transition-colors duration-300">
      <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative">
        <div className="absolute bottom-6 left-6">
          <AnimatedThemeToggler className="p-2 rounded-full bg-granite-100 dark:bg-deep-space-blue-900 hover:bg-granite-200 dark:hover:bg-deep-space-blue-800 transition-colors" />
        </div>
        {isAuthenticated && user ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-granite-900 dark:text-white">¡Sesión Activa!</h3>
              <p className="text-sm text-granite-500 mt-2">Has iniciado sesión como:</p>
            </div>
            <div className="p-4 rounded-xl bg-granite-50 border border-granite-200 text-left flex items-center space-x-4">
              {user.fotoUrl ? (
                <img src={user.fotoUrl} alt={user.nombre} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-deep-space-blue-600 text-white font-medium flex items-center justify-center text-lg">
                  {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-base font-semibold text-granite-800 truncate">{user.nombre}</p>
                <p className="text-sm text-granite-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-white bg-granite-900 hover:bg-granite-800 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm mx-auto flex flex-col justify-center h-full">
            <div className="mb-8 text-center md:text-left">
              <div className="mb-8 flex items-center justify-center md:justify-start">
                <h1 style={{ fontFamily: "'Comfortaa', sans-serif" }} className="text-4xl font-bold tracking-tighter text-deep-space-blue-600 dark:text-white flex items-center leading-none">
                  Tutorias<span className="text-emerald-500 font-bold ml-1">U</span>
                </h1>
              </div>
              <h2 className="text-3xl font-bold text-granite-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                ¡Te damos la bienvenida!
              </h2>
              <p className="text-sm text-granite-500 dark:text-deep-space-blue-200 mt-3 leading-relaxed">
                Potencia tu aprendizaje y organiza tus sesiones de estudio.<br />
                Inicia sesión para comenzar a gestionar tus tutorías.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-burgundy-50 border border-burgundy-200 text-burgundy-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-burgundy-500" />
                <span className="flex-1">{error}</span>
                <button onClick={clearError} className="text-burgundy-500 hover:text-burgundy-700 font-bold">×</button>
              </div>
            )}

            <div className="flex flex-col gap-3 mb-8">
               <GoogleLoginButton />
               <MicrosoftLoginButton />
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-deep-space-blue-50 dark:bg-deep-space-blue-900/50 text-deep-space-blue-600 dark:text-deep-space-blue-400 shrink-0">
                  <UsersThree weight="duotone" className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-granite-900 dark:text-white">Conecta con Expertos</h4>
                  <p className="text-xs text-granite-500 dark:text-deep-space-blue-200 mt-1 leading-relaxed">
                    Encuentra tutores especializados en las materias que necesitas para dominar tu semestre.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Clock weight="duotone" className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-granite-900 dark:text-white">Aprende a tu Ritmo</h4>
                  <p className="text-xs text-granite-500 dark:text-deep-space-blue-200 mt-1 leading-relaxed">
                    Organiza tus sesiones, revisa el material y avanza sin presiones apoyándote en la comunidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block md:w-1/2 p-4 lg:p-6">
         <div 
           className="w-full h-full rounded-[2rem] bg-cover bg-center shadow-lg"
           style={{ backgroundImage: `url('/tutoring-bg.jpg')` }}
         >
         </div>
      </div>
    </div>
  );
}

export default LoginPage;
