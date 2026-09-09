import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { AnimatedThemeToggler } from '../../components/ui/animated-theme-toggler';

// Login dependencies
import GoogleLoginButton from './GoogleLoginButton';
import MicrosoftLoginButton from './MicrosoftLoginButton';
import { UsersThree, Clock } from '@phosphor-icons/react';
import { AlertCircle } from 'lucide-react';

// Role dependencies
import { GraduationCap, Student } from '@phosphor-icons/react';

export function AuthView({ onComplete }) {
  const { isAuthenticated, error, clearError } = useAuth();

  return (
    <div className="grow relative flex flex-col md:flex-row overflow-hidden bg-white dark:bg-deep-space-blue-950 transition-colors duration-300">
      
      {/* Theme Toggler */}
      <div className={`absolute z-30 transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${!isAuthenticated ? 'bottom-6 left-6' : 'top-6 right-6 md:bottom-6 md:top-auto md:right-6 md:left-auto'}`}>
        <AnimatedThemeToggler className="p-2 rounded-full bg-granite-100 dark:bg-deep-space-blue-900 hover:bg-granite-200 dark:hover:bg-deep-space-blue-800 transition-colors shadow-sm" />
      </div>

      {/* BACKGROUND IMAGE - ABSOLUTE POSITIONING TO PREVENT TELEPORTING */}
      <motion.div 
        className="hidden md:block absolute top-0 bottom-0 z-20 p-4 lg:p-6"
        style={{ width: '50%' }}
        initial={false}
        animate={{ left: isAuthenticated ? '0%' : '50%' }}
        transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="w-full h-full rounded-[2rem] bg-cover bg-center shadow-lg" style={{ backgroundImage: `url('/tutoring-bg.jpg')` }} />
      </motion.div>

      {/* LEFT COLUMN: Login Content */}
      <div className="w-full md:w-1/2 flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {!isAuthenticated && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT COLUMN: Role Selection Content */}
      <div className="w-full md:w-1/2 flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {isAuthenticated && (
            <motion.div 
              key="roles"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6, delay: 1.3, ease: "easeOut" }}
              className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16"
            >
              <div className="w-full max-w-md mx-auto flex flex-col justify-center h-full">
                <div className="mb-10 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-granite-900 dark:text-white mb-3">
                    ¿Cómo deseas usar la plataforma?
                  </h2>
                  <p className="text-sm text-granite-500 dark:text-deep-space-blue-200 leading-relaxed">
                    Elige tu rol para esta sesión. Podrás acceder a herramientas personalizadas según el perfil que selecciones.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => onComplete('student')}
                    className="group flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-deep-space-blue-900/40 border-2 border-granite-100 dark:border-deep-space-blue-800 hover:border-deep-space-blue-400 dark:hover:border-emerald-400 hover:shadow-lg hover:shadow-deep-space-blue-500/10 dark:hover:shadow-emerald-500/10 transition-all duration-300 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-deep-space-blue-50 dark:bg-deep-space-blue-900/50 text-deep-space-blue-600 dark:text-deep-space-blue-400 group-hover:bg-deep-space-blue-600 group-hover:text-white dark:group-hover:bg-emerald-400 dark:group-hover:text-deep-space-blue-950 transition-colors">
                        <Student weight="duotone" className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-granite-900 dark:text-white group-hover:text-deep-space-blue-600 dark:group-hover:text-emerald-400 transition-colors">
                          Quiero entrar como Estudiante
                        </h3>
                        <p className="text-xs text-granite-500 dark:text-deep-space-blue-300 mt-0.5">
                          Busca tutorías y organiza tus estudios.
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-granite-50 dark:bg-deep-space-blue-800 text-granite-400 dark:text-deep-space-blue-400 group-hover:bg-deep-space-blue-100 group-hover:text-deep-space-blue-600 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onComplete('tutor')}
                    className="group flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-deep-space-blue-900/40 border-2 border-granite-100 dark:border-deep-space-blue-800 hover:border-emerald-400 dark:hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/10 transition-all duration-300 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:bg-emerald-400 dark:group-hover:text-deep-space-blue-950 transition-colors">
                        <GraduationCap weight="duotone" className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-granite-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Quiero ser Tutor
                        </h3>
                        <p className="text-xs text-granite-500 dark:text-deep-space-blue-300 mt-0.5">
                          Imparte tutorías y comparte tu conocimiento.
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-granite-50 dark:bg-deep-space-blue-800 text-granite-400 dark:text-deep-space-blue-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
