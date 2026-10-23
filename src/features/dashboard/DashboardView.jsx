import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
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
  Spinner,
  Text,
  tokens,
} from "@fluentui/react-components";
import {
  CalendarEmpty24Regular,
  LockClosed20Regular,
  PeopleSearch24Regular,
  Star20Regular,
  TaskListSquareLtr24Regular,
  Video20Regular,
} from "@fluentui/react-icons";
import { useAuth } from "../../context/AuthContext";
import { useCargaDePagina } from "../../hooks/useCargaDePagina";
import { getCitasPendientes, getHistorialTutorias, getProximasTutorias } from "../../services/citaService";
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
import { descripcionDeFila } from "../../lib/filas";
import { esTutorAprobado, tieneSolicitudTutor } from "../../components/shell/navigation";
import { useAhora } from "../../hooks/useAhora";
import { useNotificar } from "../../hooks/useNotificar";
import { duracionLegible, faseDeSesion } from "../../lib/sesion";
import CalificarTutoriaModal from "../tutores/CalificarTutoriaModal";

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

// La cuenta regresiva aparece para las sesiones aceptadas de las próximas 24 h.
const HORIZONTE_CUENTA_MIN = 24 * 60;

// Segunda línea de la fila: la cuenta regresiva cuando la sesión está cerca o en curso.
function metaDeSesion(sesion, estado) {
  const con = `con ${sesion.rolOpuestoNombre}`;
  if (!estado || (estado.fase === "pronto" && estado.minutos > HORIZONTE_CUENTA_MIN)) {
    return `${formatoSesion.format(new Date(sesion.fechaHoraInicio))} · ${con}`;
  }
  if (estado.fase === "en-curso") return `Termina en ${duracionLegible(estado.minutos)} · ${con}`;
  if (estado.fase === "terminada") return `Terminó · ${con}`;
  return `Empieza en ${duracionLegible(estado.minutos)} · ${con}`;
}

/*
 * Próximas sesiones. Las cercanas llevan cuenta regresiva en la misma fila;
 * desde 10 minutos antes y durante su hora, la fila ofrece "Unirse"; al
 * terminar, el estudiante la califica ahí mismo. La hora se cuenta en la zona
 * de la plataforma y se refresca cada 30 s.
 */
const sePuedeUnir = (sesion, ahora) => {
  const fase = faseDeSesion(sesion, ahora)?.fase;
  return (fase === "unirse" || fase === "en-curso") && Boolean(sesion.linkReunion);
};

// Próximas sesiones del panel. Se cargan a nivel de panel: si hay una sesión a
// la que unirse, su botón es el primario de la vista y el del encabezado baja a
// secundario (un solo primario por vista).
function useProximas() {
  const carga = useCarga(getProximasTutorias);
  const ahora = useAhora();
  const unirseId = carga.datos.find((sesion) => sePuedeUnir(sesion, ahora))?.id ?? null;
  return { ...carga, ahora, unirseId };
}

function ProximasSesiones({ proximas, to = "/mis-tutorias", esEstudiante = false }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const notificar = useNotificar();
  const { datos, cargando, error, ahora, unirseId } = proximas;
  const [porCalificar, setPorCalificar] = useState(null);
  const [preparando, setPreparando] = useState(null);
  const [calificadas, setCalificadas] = useState([]);

  const filas = datos.filter((sesion) => !calificadas.includes(sesion.id)).slice(0, MAX_FILAS);

  // El historial completa en el backend la sesión que terminó; solo entonces se califica.
  const calificar = async (sesion) => {
    setPreparando(sesion.id);
    try {
      await getHistorialTutorias();
      setPorCalificar(sesion);
    } catch (err) {
      console.error("No se pudo preparar la calificación:", err);
      navigate(to);
    } finally {
      setPreparando(null);
    }
  };

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
            const estado = faseDeSesion(sesion, ahora);
            const fase = estado?.fase;
            const enCurso = fase === "en-curso";
            const puedeUnirse = sePuedeUnir(sesion, ahora);
            const puedeCalificar = fase === "terminada" && esEstudiante;
            const filaId = `proxima-${sesion.id}`;
            const comunes = {
              id: filaId,
              fecha,
              title: sesion.materia,
              meta: metaDeSesion(sesion, estado),
              muted: fase === "terminada",
            };

            if (puedeUnirse || puedeCalificar) {
              return (
                <SessionRow
                  key={sesion.id}
                  {...comunes}
                  actions={
                    <>
                      {/* En móvil lo dice la segunda línea ("Termina en…"), como las demás insignias. */}
                      {enCurso && (
                        <span className={styles.badgeDesktop}>
                          <Badge appearance="tint" color="danger" shape="rounded">
                            En curso
                          </Badge>
                        </span>
                      )}
                      {puedeUnirse ? (
                        <Button
                          as="a"
                          href={sesion.linkReunion}
                          target="_blank"
                          rel="noopener noreferrer"
                          appearance={sesion.id === unirseId ? "primary" : "secondary"}
                          icon={<Video20Regular />}
                          aria-describedby={descripcionDeFila(filaId)}
                        >
                          Unirse
                        </Button>
                      ) : (
                        <Button
                          icon={preparando === sesion.id ? <Spinner size="tiny" /> : <Star20Regular />}
                          disabled={preparando === sesion.id}
                          onClick={() => calificar(sesion)}
                          aria-describedby={descripcionDeFila(filaId)}
                        >
                          Calificar
                        </Button>
                      )}
                    </>
                  }
                />
              );
            }

            return (
              <SessionRow
                key={sesion.id}
                to={to}
                {...comunes}
                end={
                  enCurso ? (
                    <Badge appearance="tint" color="danger" shape="rounded">
                      En curso
                    </Badge>
                  ) : (
                    <span className={styles.badgeDesktop}>
                      <EstadoBadge estado={sesion.estado} />
                    </span>
                  )
                }
              />
            );
          })}
        </SessionList>
      )}
      <CalificarTutoriaModal
        tutoria={porCalificar}
        onClose={() => setPorCalificar(null)}
        onCalificada={(tutoria) => {
          setCalificadas((ids) => [...ids, tutoria.id]);
          notificar("Gracias por tu reseña", { cuerpo: `${tutoria.materia} con ${tutoria.rolOpuestoNombre}` });
        }}
      />
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
  const proximas = useProximas();

  return (
    <>
      <PageHeader
        title="Panel de control"
        description="Tus próximas sesiones y tutores para las materias que te interesan."
        actions={
          <Button
            appearance={proximas.unirseId ? "secondary" : "primary"}
            onClick={() => navigate("/tutores")}
          >
            Buscar tutores
          </Button>
        }
      />
      <ProximasSesiones proximas={proximas} esEstudiante />
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
  const proximas = useProximas();

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

      <ProximasSesiones proximas={proximas} />
    </>
  );
}

function PanelTutor() {
  const navigate = useNavigate();
  const proximas = useProximas();

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
            <Button
              appearance={proximas.unirseId ? "secondary" : "primary"}
              onClick={() => navigate("/tutor/mis-tutorias")}
            >
              Ver solicitudes
            </Button>
          </>
        }
      />
      <SolicitudesPendientes />
      <ProximasSesiones proximas={proximas} />
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
