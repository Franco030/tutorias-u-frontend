import { useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { AuthView } from './features/auth/AuthView';
import { AnimatedThemeToggler } from './components/ui/animated-theme-toggler';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle,
  ExternalLink,
  Shield,
  Key,
  Copy,
} from 'lucide-react';
import { useState } from 'react';
import { getApiBaseUrl } from './services/apiClient';

function DashboardView() {
  const { user, token, logout } = useAuth();
  const [copiedToken, setCopiedToken] = useState(false);
  const apiUrl = getApiBaseUrl();

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <main className="w-full px-4 sm:px-8 lg:px-12 py-8 space-y-8">
      <section className="rounded-2xl bg-white dark:bg-deep-space-blue-900/40 border border-granite-200 dark:border-deep-space-blue-800 p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-granite-500 dark:text-deep-space-blue-400 mb-2 uppercase tracking-wide">
            <Shield className="w-3.5 h-3.5" />
            <span>Sesión autenticada</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-granite-900 dark:text-white" style={{ fontFamily: "'Comfortaa', sans-serif" }}>
            ¡Hola, {user?.nombre || 'Estudiante'}!
          </h1>
          <p className="mt-3 text-granite-500 dark:text-deep-space-blue-200 text-sm sm:text-base leading-relaxed">
            Te damos la bienvenida al portal académico. Tu sesión está sincronizada
            y protegida mediante tokens JWT validados por el backend en ASP.NET Core.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-deep-space-blue-900/40 border border-granite-200 dark:border-deep-space-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-granite-500 dark:text-deep-space-blue-300">Rol Activo</span>
            <div className="p-2 rounded-lg bg-sage-green-50 dark:bg-sage-green-900/40 text-sage-green-600 dark:text-sage-green-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-granite-900 dark:text-white">
            {user?.rol || 'Estudiante'}
          </p>
          <span className="text-xs text-deep-space-blue-500 dark:text-deep-space-blue-400 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle className="w-3 h-3" /> Permisos vigentes
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-deep-space-blue-900/40 border border-granite-200 dark:border-deep-space-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-granite-500 dark:text-deep-space-blue-300">Tutorías Asignadas</span>
            <div className="p-2 rounded-lg bg-tea-green-50 dark:bg-tea-green-900/40 text-tea-green-600 dark:text-tea-green-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-granite-900 dark:text-white">0 Activas</p>
          <span className="text-xs text-granite-500 dark:text-deep-space-blue-400 mt-1 block">
            Próximo ciclo académico
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-deep-space-blue-900/40 border border-granite-200 dark:border-deep-space-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-granite-500 dark:text-deep-space-blue-300">Horas Acumuladas</span>
            <div className="p-2 rounded-lg bg-burgundy-50 dark:bg-burgundy-950/60 text-burgundy-600 dark:text-burgundy-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-granite-900 dark:text-white">0 hrs</p>
          <span className="text-xs text-granite-500 dark:text-deep-space-blue-400 mt-1 block">
            Acompañamiento registrado
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-deep-space-blue-900/40 border border-granite-200 dark:border-deep-space-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-granite-500 dark:text-deep-space-blue-300">Backend Conectado</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-sm font-semibold text-granite-900 dark:text-white truncate">
            {apiUrl.replace(/^https?:\/\//, '')}
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> API Online
          </span>
        </div>
      </section>

      <section className="p-6 rounded-2xl bg-white dark:bg-deep-space-blue-900/40 border border-granite-200 dark:border-deep-space-blue-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-deep-space-blue-500 dark:text-deep-space-blue-400" />
            <h2 className="text-base font-semibold text-granite-900 dark:text-white">
              Detalles del Token JWT de Sesión (Backend)
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCopyToken}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-sage-green-600 dark:text-sage-green-400 bg-sage-green-50 dark:bg-sage-green-900/40 hover:bg-sage-green-100 dark:hover:bg-sage-green-900/60 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedToken ? '¡Copiado!' : 'Copiar Token'}</span>
          </button>
        </div>

        <p className="text-xs text-granite-500 dark:text-deep-space-blue-300">
          Este token fue validado y devuelto por el controlador <code>/api/auth/[google|microsoft]</code>{' '}
          del backend en ASP.NET Core y se adjunta de forma automática en cada petición con{' '}
          <code>Authorization: Bearer &lt;token&gt;</code> mediante <code>apiClient</code>.
        </p>

        <div className="p-3.5 rounded-xl bg-granite-50 dark:bg-deep-space-blue-950/50 text-granite-700 dark:text-deep-space-blue-200 font-mono text-xs overflow-x-auto border border-granite-200 dark:border-deep-space-blue-800">
          <p className="break-all whitespace-pre-wrap">
            {token || 'No token found'}
          </p>
        </div>
      </section>

    </main>
  );
}

export function App() {
  const { isAuthenticated } = useAuth();
  const [hasSelectedRole, setHasSelectedRole] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-deep-space-blue-950 text-granite-900 dark:text-white transition-colors duration-300 relative">
      {isAuthenticated && hasSelectedRole ? (
        <div className="grow relative flex flex-col">
          <Navbar />
          <motion.div 
            key="dashboard" 
            className="flex-1 flex flex-col z-0"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DashboardView />
          </motion.div>
        </div>
      ) : (
        <AuthView onComplete={() => setHasSelectedRole(true)} />
      )}
    </div>
  );
}

export default App;
