
import { Navigate, Outlet, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import VerifyEmailPage from "./features/auth/VerifyEmailPage";
import AprobacionTutores from "./features/admin/AprobacionTutores";
import { useAuth } from "./context/AuthContext";
import { AppShell } from "./components/shell/AppShell";
import { AuthView } from "./features/auth/AuthView";
import { useEffect, useState } from "react";
import SelectorIntereses from "./features/onboarding/SelectorIntereses";
import AplicacionTutor from "./features/onboarding/AplicacionTutor";
import MisIntereses from "./features/dashboard/MisIntereses";
import EstadoSolicitud from "./features/onboarding/EstadoSolicitud";
import PerfilTutor from "./features/tutores/PerfilTutor";
import CatalogoTutores from "./features/tutores/CatalogoTutores";
import MisMateriasTutor from "./features/tutores/MisMateriasTutor";
import ConfiguracionDisponibilidad from "./features/tutores/ConfiguracionDisponibilidad";
import MisTutorias from "./features/tutores/MisTutorias";
import ProximasTutorias from "./features/tutores/ProximasTutorias";

import { DashboardView } from "./features/dashboard/DashboardView";

function AppContent() {
  const { isAuthenticated, user, updateRole } = useAuth();
  const navigate = useNavigate();
  const [hasSelectedRoleState, setHasSelectedRoleState] = useState(false);
  const [selectedRoleState, setSelectedRoleState] = useState(null);

  const isAdministrator =
    user?.rol?.trim().toLowerCase() === "administrador";

  useEffect(() => {
    if (isAuthenticated && isAdministrator) {
      navigate("/admin/aprobaciones", { replace: true });
    }
  }, [isAuthenticated, isAdministrator, navigate]);

  const isRolNuevo = user?.rol
    ? user.rol.trim().toLowerCase() === "nuevo"
    : false;

  const hasSelectedRole =
    hasSelectedRoleState ||
    (isAuthenticated && user?.rol && !isRolNuevo);

  const selectedRole =
    selectedRoleState ||
    (isAuthenticated && user?.rol && !isRolNuevo ? user.rol : null);

  if (
    !isAuthenticated &&
    (hasSelectedRoleState || selectedRoleState !== null)
  ) {
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

  if (isAuthenticated && hasSelectedRole) {
    return <DashboardView selectedRole={selectedRole} />;
  }

  return <AuthView onComplete={handleRoleSelection} />;
}

function AdminGuard() {
  const { isAuthenticated, user } = useAuth();

  const isAdministrator =
    user?.rol?.trim().toLowerCase() === "administrador";

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

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (
    user?.estadoAprobacion &&
    user.estadoAprobacion.trim().toLowerCase() !== "ninguno"
  ) {
    return <Navigate to="/estado-solicitud" replace />;
  }

  return <AplicacionTutor />;
}

function StudentGuard({ children }) {
  const { isAuthenticated, user } = useAuth();

  const isStudent =
    user?.rol?.trim().toLowerCase() === "estudiante";

  if (!isAuthenticated || !isStudent) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ApprovedTutorGuard({ children }) {
  const { isAuthenticated, user } = useAuth();

  const isTutor =
    user?.rol?.trim().toLowerCase() === "tutor";

  const isApproved =
    user?.estadoAprobacion?.trim().toLowerCase() === "aprobado";

  if (!isAuthenticated || !isTutor) {
    return <Navigate to="/" replace />;
  }

  if (!isApproved) {
    return <Navigate to="/estado-solicitud" replace />;
  }

  return children;
}

// US-4: Acceso para estudiantes y tutores autenticados.
function ProximasTutoriasGuard({ children }) {
  const { isAuthenticated, user } = useAuth();

  const rol = user?.rol?.trim().toLowerCase();

  const tieneAcceso =
    isAuthenticated &&
    (rol === "estudiante" || rol === "tutor");

  if (!tieneAcceso) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/*
 * Layout persistente: el shell (barra + navegación) se monta una sola vez y
 * solo cambia el contenido de la ruta. Acceso, selección de rol y el
 * onboarding de intereses se muestran sin shell.
 */
function ShellLayout() {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();

  const rol = user?.rol?.trim().toLowerCase();
  const tieneRol = isAuthenticated && Boolean(rol) && rol !== "nuevo";
  const enOnboarding =
    pathname === "/intereses" && rol === "estudiante" && !user?.onboardingCompleto;

  if (!tieneRol || enOnboarding) {
    return <Outlet />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export function App() {
  return (
    <Routes>
      <Route
        path="/verificar-correo"
        element={<VerifyEmailPage />}
      />

      <Route element={<ShellLayout />}>
        <Route path="/" element={<AppContent />} />

        <Route
          path="/admin/aprobaciones"
          element={<AdminGuard />}
        />

        <Route
          path="/intereses"
          element={<StudentInterestsGuard />}
        />

        <Route
          path="/aplicar-tutor"
          element={<AplicacionTutorGuard />}
        />

        <Route
          path="/estado-solicitud"
          element={<EstadoSolicitud />}
        />

        <Route
          path="/tutores"
          element={
            <StudentGuard>
              <CatalogoTutores />
            </StudentGuard>
          }
        />

        <Route
          path="/tutor/:id"
          element={
            <StudentGuard>
              <PerfilTutor />
            </StudentGuard>
          }
        />

        <Route
          path="/tutor/mis-materias"
          element={
            <ApprovedTutorGuard>
              <MisMateriasTutor />
            </ApprovedTutorGuard>
          }
        />

        <Route
          path="/tutor/disponibilidad"
          element={
            <ApprovedTutorGuard>
              <ConfiguracionDisponibilidad />
            </ApprovedTutorGuard>
          }
        />

        <Route
          path="/tutor/mis-tutorias"
          element={
            <ApprovedTutorGuard>
              <MisTutorias />
            </ApprovedTutorGuard>
          }
        />

        <Route
          path="/mis-tutorias"
          element={
            <ProximasTutoriasGuard>
              <ProximasTutorias />
            </ProximasTutoriasGuard>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
