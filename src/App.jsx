import { Navigate, Routes, Route, useNavigate } from "react-router-dom";
import VerifyEmailPage from "./features/auth/VerifyEmailPage";
import AprobacionTutores from "./features/admin/AprobacionTutores";
import { useAuth } from "./context/AuthContext";
import { motion } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { AuthView } from "./features/auth/AuthView";
import { useEffect, useState } from "react";
import SelectorIntereses from "./features/onboarding/SelectorIntereses";
import AplicacionTutor from "./features/onboarding/AplicacionTutor";
import MisIntereses from "./features/dashboard/MisIntereses";
import EstadoSolicitud from "./features/onboarding/EstadoSolicitud";
import PerfilTutor from "./features/tutores/PerfilTutor";
import CatalogoTutores from "./features/tutores/CatalogoTutores";
import MisMateriasTutor from "./features/tutores/MisMateriasTutor";

import { DashboardView } from "./features/dashboard/DashboardView";

function AppContent() {
  const { isAuthenticated, user, updateRole } = useAuth();
  const navigate = useNavigate();
  const [hasSelectedRoleState, setHasSelectedRoleState] = useState(false);
  const [selectedRoleState, setSelectedRoleState] = useState(null);
  const isAdministrator = user?.rol?.trim().toLowerCase() === "administrador";

  useEffect(() => {
    if (isAuthenticated && isAdministrator) {
      navigate("/admin/aprobaciones", { replace: true });
    }
  }, [isAuthenticated, isAdministrator, navigate]);

  const isRolNuevo = user?.rol ? user.rol.trim().toLowerCase() === 'nuevo' : false;
  const hasSelectedRole = hasSelectedRoleState || (isAuthenticated && user?.rol && !isRolNuevo);
  const selectedRole = selectedRoleState || (isAuthenticated && user?.rol && !isRolNuevo ? user.rol : null);

  // Limpiar el estado local si el usuario cierra sesión (Actualización en fase de render, mejor práctica que useEffect)
  if (!isAuthenticated && (hasSelectedRoleState || selectedRoleState !== null)) {
    setHasSelectedRoleState(false);
    setSelectedRoleState(null);
  }

  const handleRoleSelection = async (role) => {
    try {
      const authData = await updateRole(role);

      const rolNormalizado =
        authData?.rol?.trim().toLowerCase() ||
        role.trim().toLowerCase();

      if (rolNormalizado === "estudiante") {
        navigate("/intereses", { replace: true });
        return;
      }

      if (rolNormalizado === "tutor") {
        navigate("/aplicar-tutor", { replace: true });
        return;
      }

      if (rolNormalizado === "administrador") {
        navigate("/admin/aprobaciones", { replace: true });
        return;
      }

      setSelectedRoleState(role);
      setHasSelectedRoleState(true);
    } catch (err) {
      console.error("Error al asignar el rol:", err);
    }
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

function AdminGuard() {
  const { isAuthenticated, user } = useAuth();
  const isAdministrator = user?.rol?.trim().toLowerCase() === "administrador";

  if (!isAuthenticated || !isAdministrator) {
    return <Navigate to="/" replace />;
  }

  return <AprobacionTutores />;
}

function StudentInterestsGuard() {
  const { isAuthenticated, user } = useAuth();

  const isStudent =
    user?.rol?.trim().toLowerCase() === "estudiante";

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isStudent) {
    return <Navigate to="/" replace />;
  }

  if (user?.onboardingCompleto) {
    return <MisIntereses />;
  }

  return <SelectorIntereses />;
}

function AplicacionTutorGuard() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (user?.estadoAprobacion && user.estadoAprobacion.trim().toLowerCase() !== "ninguno") {
    return <Navigate to="/estado-solicitud" replace />;
  }

  return <AplicacionTutor />;
}

function StudentGuard({ children }) {
  const { isAuthenticated, user } = useAuth();
  const isStudent = user?.rol?.trim().toLowerCase() === "estudiante";

  if (!isAuthenticated || !isStudent) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ApprovedTutorGuard({ children }) {
  const { isAuthenticated, user } = useAuth();
  const isTutor = user?.rol?.trim().toLowerCase() === "tutor";
  const isApproved = user?.estadoAprobacion?.trim().toLowerCase() === "aprobado";

  if (!isAuthenticated || !isTutor) {
    return <Navigate to="/" replace />;
  }

  if (!isApproved) {
    return <Navigate to="/estado-solicitud" replace />;
  }

  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AppContent />} />
      <Route path="/verificar-correo" element={<VerifyEmailPage />} />
      <Route path="/admin/aprobaciones" element={<AdminGuard />} />
      <Route path="/intereses" element={<StudentInterestsGuard />} />
      <Route path="/aplicar-tutor" element={<AplicacionTutorGuard />} />
      <Route path="/estado-solicitud" element={<EstadoSolicitud />} />
      <Route path="/tutores" element={<StudentGuard><CatalogoTutores /></StudentGuard>} />
      <Route path="/tutor/:id" element={<StudentGuard><PerfilTutor /></StudentGuard>} />
      <Route path="/tutor/mis-materias" element={<ApprovedTutorGuard><MisMateriasTutor /></ApprovedTutorGuard>} />
    </Routes>
  );
}

export default App;
