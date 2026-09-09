import { GraduationCap, Student } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export function RoleSelectionView({ onSelectRole }) {
  return (
    <div className="w-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center h-full">

        
        <motion.div 
          className="w-full max-w-md mx-auto flex flex-col justify-center h-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
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
              onClick={() => onSelectRole('student')}
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
              onClick={() => onSelectRole('tutor')}
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
        </motion.div>
    </div>
  );
}

export default RoleSelectionView;
