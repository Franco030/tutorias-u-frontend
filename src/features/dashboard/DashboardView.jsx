import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Caption1,
  Link,
  makeStyles,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
  Skeleton,
  SkeletonItem,
  Text,
  tokens,
} from "@fluentui/react-components";
import {
  CalendarEmpty24Regular,
  LockClosed20Regular,
  PeopleSearch24Regular,
  TaskListSquareLtr24Regular,
} from "@fluentui/react-icons";
import { useAuth } from "../../context/AuthContext";
import { useCargaDePagina } from "../../hooks/useCargaDePagina";
import { getCitasPendientes, getProximasTutorias } from "../../services/citaService";
import { getTutoresRecomendados } from "../../services/tutorService";
import TutorCard from "../../components/TutorCard";
import { IlustracionCalendario, IlustracionComunidad, IlustracionRevision } from "../../components/illustrations/Ilustraciones";
import { Page, PageHeader, PageSection } from "../../components/ui/Page";
import { EmptyState } from "../../components/ui/EmptyState";
import { TarjetaIlustrada } from "../../components/ui/TarjetaIlustrada";
import { EstadoBadge } from "../../components/ui/EstadoBadge";
import { formatoSesion } from "../../lib/formato";
import {
  SessionList,
  SessionListSkeleton,
  SessionRow,
} from "../../components/ui/SessionList";
import { esTutorAprobado, tieneSolicitudTutor } from "../../components/shell/navigation";

const MAX_FILAS = 3;

const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyleType: "none",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow4,
    overflow: "hidden",
  },
  badgeDesktop: {
    display: "none",
    "@media (min-width: 640px)": { display: "inline-flex" },
  },
  grid: {
    display: "grid",
    // auto-fill en lugar de media queries: Griffel no garantiza su orden.
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
    gap: tokens.spacingHorizontalL,
  },
  locked: {
    display: "flex",
    alignItems: "flex-start",
    gap: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
    color: tokens.colorNeutralForegroundDisabled,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
    ":last-child": {
      borderBottomStyle: "none",
    },
  },
  lockedText: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  lockedTitle: {
    color: tokens.colorNeutralForeground2,
    fontWeight: tokens.fontWeightSemibold,
  },
  lockedIcon: {
    flexShrink: 0,
    marginTop: "2px",
  },
});


function useCarga(cargar, activo = true) {
  const [estado, setEstado] = useState({ datos: [], cargando: activo, error: "" });

  useEffect(() => {
    if (!activo) return undefined;
    let vigente = true;

    cargar()
      .then((datos) => {
        if (vigente) setEstado({ datos: Array.isArray(datos) ? datos : [], cargando: false, error: "" });
      })
      .catch((err) => {
        console.error("Error al cargar el panel:", err);
        if (vigente) setEstado({ datos: [], cargando: false, error: "No se pudo cargar esta sección. Revisa tu conexión y recarga la página." });
      });

    return () => {
      vigente = false;
    };
  }, [cargar, activo]);

  useCargaDePagina(estado.cargando);
  return estado;
}

function EnlaceSeccion({ to, children }) {
  const navigate = useNavigate();
  return (
    <Link
      href={to}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </Link>
  );
}

function ProximasSesiones({ to = "/mis-tutorias" }) {
  const styles = useStyles();
  const { datos, cargando, error } = useCarga(getProximasTutorias);
  const filas = datos.slice(0, MAX_FILAS);

  return (
    <PageSection
      id="proximas"
      title="Próximas sesiones"
      actions={datos.length > 0 && <EnlaceSeccion to={to}>Ver todas</EnlaceSeccion>}
    >
      {cargando ? (
        <SessionListSkeleton />
      ) : error ? (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      ) : filas.length === 0 ? (
        <EmptyState
          icon={<CalendarEmpty24Regular />}
          ilustracion={<IlustracionCalendario />}
          title="No tienes sesiones programadas"
          description="Cuando una tutoría sea aceptada aparecerá aquí con su fecha y enlace de reunión."
        />
      ) : (
        <SessionList label="Próximas sesiones">
          {filas.map((sesion) => {
            const fecha = new Date(sesion.fechaHoraInicio);
            return (
              <SessionRow
                key={sesion.id}
                to={to}
                fecha={fecha}
                title={sesion.materia}
                meta={`${formatoSesion.format(fecha)} · con ${sesion.rolOpuestoNombre}`}
                end={
                  <span className={styles.badgeDesktop}>
                    <EstadoBadge estado={sesion.estado} />
                  </span>
                }
              />
            );
          })}
        </SessionList>
      )}
    </PageSection>
  );
}

function SolicitudesPendientes() {
  const styles = useStyles();
  const { datos, cargando, error } = useCarga(getCitasPendientes);
  const filas = datos.slice(0, MAX_FILAS);
  const destino = "/tutor/mis-tutorias";

  return (
    <PageSection
      id="pendientes"
      title={datos.length > 0 ? `Solicitudes por responder (${datos.length})` : "Solicitudes por responder"}
      actions={datos.length > 0 && <EnlaceSeccion to={destino}>Responder</EnlaceSeccion>}
    >
      {cargando ? (
        <SessionListSkeleton />
      ) : error ? (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      ) : filas.length === 0 ? (
        <EmptyState
          icon={<TaskListSquareLtr24Regular />}
          ilustracion={<IlustracionRevision estado="aprobado" />}
          title="No hay solicitudes pendientes"
          description="Cuando un estudiante pida una tutoría contigo, podrás aceptarla o rechazarla desde aquí."
        />
      ) : (
        <SessionList label="Solicitudes por responder">
          {filas.map((cita) => {
            const fecha = new Date(cita.fechaHoraInicio);
            return (
              <SessionRow
                key={cita.id}
                to={destino}
                fecha={fecha}
                title={cita.materiaNombre}
                meta={`${formatoSesion.format(fecha)} · ${cita.estudianteNombre}`}
                end={
                  <span className={styles.badgeDesktop}>
                    <EstadoBadge estado={cita.estado || "Pendiente"} />
                  </span>
                }
              />
            );
          })}
        </SessionList>
      )}
    </PageSection>
  );
}

function TutoresRecomendados() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { datos, cargando, error } = useCarga(getTutoresRecomendados);

  return (
    <PageSection id="recomendados" title="Tutores afines a tus intereses">
      {cargando ? (
        <div className={styles.grid}>
          {[0, 1, 2].map((n) => (
            <Skeleton key={n} aria-label="Cargando tutores">
              <SkeletonItem shape="rectangle" style={{ height: "128px" }} />
            </Skeleton>
          ))}
        </div>
      ) : error ? (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      ) : datos.length === 0 ? (
        <EmptyState
          icon={<PeopleSearch24Regular />}
          ilustracion={<IlustracionComunidad />}
          title="Aún no hay recomendaciones"
          description="Las recomendaciones salen de las materias que marcas como interés. Agrega algunas o explora el catálogo completo."
          action={
            <Button appearance="secondary" onClick={() => navigate("/intereses")}>
              Elegir materias
            </Button>
          }
        />
      ) : (
        <div className={styles.grid}>
          {datos.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} to={`/tutor/${tutor.id}`} />
          ))}
        </div>
      )}
    </PageSection>
  );
}

function PanelEstudiante({ user }) {
  const navigate = useNavigate();
  const solicitudEnviada = tieneSolicitudTutor(user);

  return (
    <>
      <PageHeader
        title="Panel de control"
        description="Tus próximas sesiones y tutores para las materias que te interesan."
        actions={
          <Button appearance="primary" icon={<PeopleSearch24Regular />} onClick={() => navigate("/tutores")}>
            Buscar tutores
          </Button>
        }
      />
      <ProximasSesiones />
      <TutoresRecomendados />
      <TarjetaIlustrada
        ilustracion={<IlustracionComunidad />}
        title={solicitudEnviada ? "Tu postulación como tutor" : "¿Dominas alguna materia?"}
        description={
          solicitudEnviada
            ? "Consulta en qué etapa está la revisión de tu solicitud."
            : "Postúlate como tutor para dar tutorías a otros estudiantes de tu universidad."
        }
        action={
          <Button
            appearance="secondary"
            onClick={() => navigate(solicitudEnviada ? "/estado-solicitud" : "/aplicar-tutor")}
          >
            {solicitudEnviada ? "Ver estado" : "Postularme"}
          </Button>
        }
      />
    </>
  );
}

const HERRAMIENTAS_TUTOR = [
  { titulo: "Materias que imparto", descripcion: "Elegir las especialidades que enseñas." },
  { titulo: "Disponibilidad", descripcion: "Publicar los horarios en los que recibes citas." },
  { titulo: "Solicitudes", descripcion: "Aceptar o rechazar las tutorías que te piden." },
];

function PanelTutorPendiente({ user }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const solicitudEnviada = tieneSolicitudTutor(user);

  return (
    <>
      <PageHeader
        title="Panel de control"
        description="Las herramientas de tutor se activan cuando la administración aprueba tu solicitud."
      />
      <MessageBar intent={solicitudEnviada ? "info" : "warning"} layout="multiline">
        <MessageBarBody>
          <MessageBarTitle>
            {solicitudEnviada ? "Solicitud en revisión" : "Postulación sin enviar"}
          </MessageBarTitle>
          {solicitudEnviada
            ? "Te avisaremos cuando la administración responda."
            : "Envía tus materias, tu comprobante y el cuestionario para empezar."}
        </MessageBarBody>
        <MessageBarActions>
          <Button onClick={() => navigate(solicitudEnviada ? "/estado-solicitud" : "/aplicar-tutor")}>
            {solicitudEnviada ? "Ver estado" : "Completar postulación"}
          </Button>
        </MessageBarActions>
      </MessageBar>

      <PageSection id="bloqueadas" title="Disponible al ser aprobado">
        <ul className={styles.list}>
          {HERRAMIENTAS_TUTOR.map((herramienta) => (
            <li
              key={herramienta.titulo}
              className={styles.locked}
            >
              <LockClosed20Regular className={styles.lockedIcon} aria-hidden="true" />
              <span className={styles.lockedText}>
                <Text className={styles.lockedTitle}>{herramienta.titulo}</Text>
                <Caption1>{herramienta.descripcion}</Caption1>
              </span>
            </li>
          ))}
        </ul>
      </PageSection>

      <ProximasSesiones />
    </>
  );
}

function PanelTutor() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Panel de control"
        description="Solicitudes por responder y tus próximas sesiones."
        actions={
          <>
            <Button appearance="secondary" onClick={() => navigate("/tutor/disponibilidad")}>
              Disponibilidad
            </Button>
            <Button appearance="primary" onClick={() => navigate("/tutor/mis-tutorias")}>
              Ver solicitudes
            </Button>
          </>
        }
      />
      <SolicitudesPendientes />
      <ProximasSesiones />
    </>
  );
}

function PanelAdministrador() {
  const navigate = useNavigate();
  return (
    <PageHeader
      title="Panel de control"
      description="Revisa las solicitudes de estudiantes que quieren ser tutores."
      actions={
        <Button appearance="primary" onClick={() => navigate("/admin/aprobaciones")}>
          Aprobación de tutores
        </Button>
      }
    />
  );
}

export function DashboardView({ selectedRole }) {
  const { user } = useAuth();
  const activeRole = (selectedRole || user?.rol || "Estudiante").trim().toLowerCase();

  let contenido;
  if (activeRole === "administrador") contenido = <PanelAdministrador />;
  else if (activeRole === "tutor")
    contenido = esTutorAprobado(user) ? <PanelTutor /> : <PanelTutorPendiente user={user} />;
  else contenido = <PanelEstudiante user={user} />;

  return <Page>{contenido}</Page>;
}

export default DashboardView;
