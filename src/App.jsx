import { Routes, Route } from "react-router-dom";
import VerifyEmailPage from "./features/auth/VerifyEmailPage";
import { useAuth } from "./context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { AuthView } from "./features/auth/AuthView";
import { AnimatedThemeToggler } from "./components/ui/animated-theme-toggler";
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle,
  ExternalLink,
  Shield,
  Key,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { getApiBaseUrl } from "./services/apiClient";

function DashboardView({ selectedRole }) {
  const { user, logout } = useAuth();

  return (
    <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
      <div className="text-center space-y-8 max-w-lg w-full">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-granite-900 dark:text-white">
          Has ingresado como{" "}
          <span className="font-medium text-deep-space-blue-600 dark:text-emerald-400 capitalize">
            {selectedRole || user?.rol || "Estudiante"}
          </span>
        </h1>

        <p className="text-sm text-granite-500 dark:text-deep-space-blue-300 tracking-wide">
          El panel principal y sus herramientas estarán disponibles
          próximamente. Por el momento, hemos verificado tu identidad con éxito:
        </p>

        <div className="py-12 flex flex-col items-center gap-5 relative">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-granite-200 dark:bg-deep-space-blue-800 -z-10 -translate-y-1/2"></div>

          {user?.fotoUrl ? (
            <img
              src={user.fotoUrl}
              alt={user.nombre}
              className="w-24 h-24 rounded-full object-cover bg-white dark:bg-deep-space-blue-950 p-1 ring-1 ring-granite-200 dark:ring-deep-space-blue-800"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white dark:bg-deep-space-blue-950 text-deep-space-blue-600 dark:text-emerald-400 text-3xl font-light flex items-center justify-center ring-1 ring-granite-200 dark:ring-deep-space-blue-800 p-1">
              <div className="w-full h-full rounded-full bg-deep-space-blue-50 dark:bg-deep-space-blue-900/50 flex items-center justify-center">
                {user?.nombre?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-deep-space-blue-950 px-6 py-2">
            <h2 className="text-2xl font-medium text-granite-900 dark:text-white">
              {user?.nombre}
            </h2>
            <p className="text-sm text-granite-500 dark:text-deep-space-blue-400 mt-1">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="group relative inline-flex items-center justify-center w-max px-8 py-3 cursor-pointer mt-4"
        >
          <span className="absolute inset-0 border border-granite-200 dark:border-deep-space-blue-800 group-hover:border-burgundy-600 dark:group-hover:border-burgundy-500 transition-colors duration-500 rounded-full"></span>
          <span className="inline-block text-xs font-semibold text-granite-600 dark:text-deep-space-blue-300 group-hover:text-burgundy-600 dark:group-hover:text-burgundy-400 tracking-widest uppercase transition-colors duration-500 relative z-10">
            Cerrar Sesión
          </span>
        </button>
      </div>
    </main>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [hasSelectedRole, setHasSelectedRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setHasSelectedRole(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-granite-50 dark:bg-deep-space-blue-950 text-granite-900 dark:text-white transition-colors duration-300 relative">
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
            <DashboardView selectedRole={selectedRole} />
          </motion.div>
        </div>
      ) : (
        <AuthView onComplete={handleRoleSelection} />
      )}
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AppContent />} />
      <Route path="/verificar-correo" element={<VerifyEmailPage />} />
    </Routes>
  );
}

export default App;
