import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { AnimatedThemeToggler } from "../../components/ui/animated-theme-toggler";

// Login dependencies
import GoogleLoginButton from "./GoogleLoginButton";
import MicrosoftLoginButton from "./MicrosoftLoginButton";
import LocalAuthForm from "./LocalAuthForm";
import { AlertCircle, GraduationCap, BookOpen } from "lucide-react";

export function AuthView({ onComplete }) {
  const { isAuthenticated, error, clearError } = useAuth();

  return (
    <div className="grow relative flex flex-col md:flex-row overflow-hidden bg-white dark:bg-deep-space-blue-950 transition-colors duration-300">
      {/* Theme Toggler */}
      <div
        className={`absolute z-30 transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${!isAuthenticated ? "bottom-6 left-6" : "top-6 right-6 md:bottom-6 md:top-auto md:right-6 md:left-auto"}`}
      >
        <AnimatedThemeToggler className="p-2 rounded-full bg-granite-100 dark:bg-deep-space-blue-900 hover:bg-granite-200 dark:hover:bg-deep-space-blue-800 transition-colors shadow-sm" />
      </div>

      {/* BACKGROUND IMAGE - ABSOLUTE POSITIONING TO PREVENT TELEPORTING */}
      <motion.div
        className="hidden md:block absolute top-0 bottom-0 z-20 p-4 lg:p-6"
        style={{ width: "50%" }}
        initial={false}
        animate={{ left: isAuthenticated ? "0%" : "50%" }}
        transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div
          className="w-full h-full rounded-[2rem] bg-cover bg-center shadow-lg"
          style={{ backgroundImage: `url('/tutoring-bg.jpg')` }}
        />
      </motion.div>

      {/* LEFT COLUMN: Auth Content */}
      <div className="w-full md:w-1/2 flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {!isAuthenticated && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24"
            >
              <div className="w-full max-w-md mx-auto">
                <div className="mb-10 text-left">
                  <div className="md:hidden flex items-center justify-center w-16 h-16 bg-deep-space-blue-50 dark:bg-deep-space-blue-900/50 rounded-2xl mb-6 mx-auto border border-deep-space-blue-100 dark:border-deep-space-blue-800 transition-colors duration-300">
                    <svg
                      className="w-8 h-8 text-deep-space-blue-600 dark:text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 14L2 8L12 2L22 8L12 14Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 15L12 21L22 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tighter text-deep-space-blue-600 dark:text-white flex items-center leading-none">
                    Acceder
                  </h1>
                  <p className="mt-3 text-granite-500 dark:text-deep-space-blue-200">
                    Ingresa con tu cuenta institucional para continuar.
                  </p>
                </div>

                <div className="space-y-5">
                  <LocalAuthForm />

                  <div className="flex items-center gap-4 my-6">
                    <div className="grow border-t border-granite-200 dark:border-granite-800" />
                    <span className="text-xs font-medium text-granite-400 dark:text-granite-500 uppercase tracking-wider">
                      o continúa con
                    </span>
                    <div className="grow border-t border-granite-200 dark:border-granite-800" />
                  </div>

                  <GoogleLoginButton />
                  <MicrosoftLoginButton />
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
              exit={{ opacity: 0, x: 30, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24"
            >
              <div className="w-full max-w-md mx-auto">
                <div className="mb-10 text-left">
                  <h2 className="text-3xl font-bold tracking-tighter text-granite-900 dark:text-white mb-3 flex items-center">
                    Selecciona tu perfil
                  </h2>
                  <p className="text-sm text-granite-500 dark:text-deep-space-blue-200 leading-relaxed">
                    Elige tu rol para esta sesión. Podrás acceder a herramientas
                    personalizadas según el perfil que selecciones.
                  </p>
                </div>

                <div className="flex flex-col gap-6 group/list">
                  <button
                    type="button"
                    onClick={() => onComplete("student")}
                    className="group/btn relative inline-flex items-center justify-start w-max px-8 py-4 cursor-pointer transition-opacity duration-700 opacity-100 group-hover/list:opacity-20 hover:!opacity-100"
                  >
                    <span className="absolute top-0 left-0 h-[1px] w-0 bg-deep-space-blue-600 dark:bg-emerald-400 transition-all duration-[200ms] delay-[600ms] group-hover/btn:w-full group-hover/btn:delay-0 ease-linear"></span>
                    <span className="absolute top-0 right-0 w-[1px] h-0 bg-deep-space-blue-600 dark:bg-emerald-400 transition-all duration-[200ms] delay-[400ms] group-hover/btn:h-full group-hover/btn:delay-[200ms] ease-linear"></span>
                    <span className="absolute bottom-0 right-0 h-[1px] w-0 bg-deep-space-blue-600 dark:bg-emerald-400 transition-all duration-[200ms] delay-[200ms] group-hover/btn:w-full group-hover/btn:delay-[400ms] ease-linear"></span>
                    <span className="absolute bottom-0 left-0 w-[1px] h-0 bg-deep-space-blue-600 dark:bg-emerald-400 transition-all duration-[200ms] delay-0 group-hover/btn:h-full group-hover/btn:delay-[600ms] ease-linear"></span>

                    <span
                      className="inline-block text-3xl sm:text-4xl font-light text-granite-800 dark:text-granite-100 group-hover/btn:text-deep-space-blue-600 dark:group-hover/btn:text-emerald-400 tracking-normal group-hover/btn:tracking-[0.15em] -left-8 group-hover/btn:left-0 relative z-10"
                      style={{
                        transition:
                          "left 800ms ease-out, letter-spacing 800ms ease-out",
                      }}
                    >
                      Estudiante
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onComplete("tutor")}
                    className="group/btn relative inline-flex items-center justify-start w-max px-8 py-4 cursor-pointer transition-opacity duration-700 opacity-100 group-hover/list:opacity-20 hover:!opacity-100"
                  >
                    <span className="absolute top-0 left-0 h-[1px] w-0 bg-deep-space-blue-600 dark:bg-emerald-400 transition-all duration-[200ms] delay-[600ms] group-hover/btn:w-full group-hover/btn:delay-0 ease-linear"></span>
                    <span className="absolute top-0 right-0 w-[1px] h-0 bg-deep-space-blue-600 dark:bg-emerald-400 transition-all duration-[200ms] delay-[400ms] group-hover/btn:h-full group-hover/btn:delay-[200ms] ease-linear"></span>
                    <span className="absolute bottom-0 right-0 h-[1px] w-0 bg-deep-space-blue-600 dark:bg-emerald-400 transition-all duration-[200ms] delay-[200ms] group-hover/btn:w-full group-hover/btn:delay-[400ms] ease-linear"></span>
                    <span className="absolute bottom-0 left-0 w-[1px] h-0 bg-deep-space-blue-600 dark:bg-emerald-400 transition-all duration-[200ms] delay-0 group-hover/btn:h-full group-hover/btn:delay-[600ms] ease-linear"></span>

                    <span
                      className="inline-block text-3xl sm:text-4xl font-light text-granite-800 dark:text-granite-100 group-hover/btn:text-deep-space-blue-600 dark:group-hover/btn:text-emerald-400 tracking-normal group-hover/btn:tracking-[0.15em] -left-8 group-hover/btn:left-0 relative z-10"
                      style={{
                        transition:
                          "left 800ms ease-out, letter-spacing 800ms ease-out",
                      }}
                    >
                      Tutor
                    </span>
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
