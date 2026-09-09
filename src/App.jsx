import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './features/auth/LoginPage';
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner de Bienvenida */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Sesión autenticada en TutoriasU</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ¡Hola, {user?.nombre || 'Estudiante'}! 👋
          </h1>
          <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
            Te damos la bienvenida al portal académico. Tu sesión está sincronizada
            y protegida mediante tokens JWT validados por el backend en ASP.NET Core.
          </p>
        </div>

        {/* Patrón decorativo de fondo */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Grid de Métricas / Estado */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Rol Activo</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {user?.rol || 'Estudiante'}
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle className="w-3 h-3" /> Permisos vigentes
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tutorías Asignadas</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">0 Activas</p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Próximo ciclo académico
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Horas Acumuladas</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">0 hrs</p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Acompañamiento registrado
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Backend Conectado</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white truncate">
            {apiUrl.replace(/^https?:\/\//, '')}
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> API Online
          </span>
        </div>
      </section>

      {/* Tarjeta de Detalles Técnicos de Autenticación */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Detalles del Token JWT de Sesión (Backend)
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCopyToken}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedToken ? '¡Copiado!' : 'Copiar Token'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Este token fue validado y devuelto por el controlador <code>/api/auth/[google|microsoft]</code>{' '}
          del backend en ASP.NET Core y se adjunta de forma automática en cada petición con{' '}
          <code>Authorization: Bearer &lt;token&gt;</code> mediante <code>apiClient</code>.
        </p>

        <div className="p-3.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
          <p className="break-all whitespace-pre-wrap">
            {token || 'No token found'}
          </p>
        </div>
      </section>

      {/* Acciones Rápidas */}
      <section className="flex justify-end">
        <button
          type="button"
          onClick={logout}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer"
        >
          Cerrar Sesión Segura
        </button>
      </section>
    </main>
  );
}

export function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <div className="grow">
        {isAuthenticated ? <DashboardView /> : <LoginPage />}
      </div>
    </div>
  );
}

export default App;
