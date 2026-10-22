
import { Navigate, Outlet, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AppShell } from "./components/shell/AppShell";
import { PageLoading } from "./components/ui/Page";
import { AuthView } from "./features/auth/AuthView";
import PaginaNoEncontrada from "./features/PaginaNoEncontrada";
import { Suspense, useEffect, useState } from "react";
import { pantallaDiferida } from "./lib/pantallaDiferida";

// Acceso y panel de inicio van en el paquete principal (primera pantalla);
// el resto se carga por ruta para aligerar la carga inicial.
const pantallas = {
  VerifyEmailPage: () => import("./features/auth/VerifyEmailPage"),
  AprobacionTutores: () => import("./features/admin/AprobacionTutores"),
  SelectorIntereses: () => import("./features/onboarding/SelectorIntereses"),
  AplicacionTutor: () => import("./features/onboarding/AplicacionTutor"),
  MisIntereses: () => import("./features/dashboard/MisIntereses"),
  EstadoSolicitud: () => import("./features/onboarding/EstadoSolicitud"),
  PerfilTutor: () => import("./features/tutores/PerfilTutor"),
  CatalogoTutores: () => import("./features/tutores/CatalogoTutores"),
  MisMateriasTutor: () => import("./features/tutores/MisMateriasTutor"),
  ConfiguracionDisponibilidad: () => import("./features/tutores/ConfiguracionDisponibilidad"),
  MisTutorias: () => import("./features/tutores/MisTutorias"),
  ProximasTutorias: () => import("./features/tutores/ProximasTutorias"),
};

const VerifyEmailPage = pantallaDiferida(pantallas.VerifyEmailPage);
const AprobacionTutores = pantallaDiferida(pantallas.AprobacionTutores);
const SelectorIntereses = pantallaDiferida(pantallas.SelectorIntereses);
const AplicacionTutor = pantallaDiferida(pantallas.AplicacionTutor);
const MisIntereses = pantallaDiferida(pantallas.MisIntereses);
const EstadoSolicitud = pantallaDiferida(pantallas.EstadoSolicitud);
const PerfilTutor = pantallaDiferida(pantallas.PerfilTutor);
const CatalogoTutores = pantallaDiferida(pantallas.CatalogoTutores);
const MisMateriasTutor = pantallaDiferida(pantallas.MisMateriasTutor);
const ConfiguracionDisponibilidad = pantallaDiferida(pantallas.ConfiguracionDisponibilidad);
const MisTutorias = pantallaDiferida(pantallas.MisTutorias);
const ProximasTutorias = pantallaDiferida(pantallas.ProximasTutorias);

// Con la app ya en reposo se descargan las demás pantallas en segundo plano:
// al navegar no hay espera de código y solo se ve el fundido de la página.
function usePrecargarPantallas() {
  useEffect(() => {
    const precargar = () =>
      [
        VerifyEmailPage, AprobacionTutores, SelectorIntereses, AplicacionTutor, MisIntereses,
        EstadoSolicitud, PerfilTutor, CatalogoTutores, MisMateriasTutor,
        ConfiguracionDisponibilidad, MisTutorias, ProximasTutorias,
      ].forEach((pantalla) => pantalla.precargar().catch(() => {}));
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(precargar, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(precargar, 2000);
    return () => window.clearTimeout(id);
  }, []);
}

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
      {/* Suspense dentro del shell: la barra y la navegación no parpadean. */}
      <Suspense fallback={<PageLoading />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

export function App() {
  usePrecargarPantallas();

  return (
    <Suspense fallback={<PageLoading />}>
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

        <Route path="*" element={<PaginaNoEncontrada />} />
      </Route>
    </Routes>
    </Suspense>
  );
}

export default App;
