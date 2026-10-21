import { useEffect, useState } from "react";
import { useNotificar } from "../../hooks/useNotificar";
import {
  Button,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { CalendarEmpty24Regular, History24Regular, Video20Regular } from "@fluentui/react-icons";
import {
  getHistorialTutorias,
  getProximasTutorias,
} from "../../services/citaService";
import TutoriaDetallesModal from "./TutoriaDetallesModal";
import { IlustracionCalendario } from "../../components/illustrations/Ilustraciones";
import { EmptyState } from "../../components/ui/EmptyState";
import { EstadoBadge } from "../../components/ui/EstadoBadge";
import { Page, PageHeader } from "../../components/ui/Page";
import { formatoSesion } from "../../lib/formato";
import {
  SessionList,
  SessionListSkeleton,
  SessionRow,
} from "../../components/ui/SessionList";

const useStyles = makeStyles({
  tabs: {
    marginBlockEnd: `calc(${tokens.spacingVerticalXXL} * -0.5)`,
  },
});

export default function ProximasTutorias() {
  const notificar = useNotificar();
  const styles = useStyles();
  const [tutorias, setTutorias] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [pestana, setPestana] = useState("proximas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tutoriaSeleccionada, setTutoriaSeleccionada] = useState(null);

  useEffect(() => {
    const cargarTutorias = async () => {
      try {
        setLoading(true);
        setError("");

        const [data, dataHistorial] = await Promise.all([
          getProximasTutorias(),
          getHistorialTutorias(),
        ]);

        if (!Array.isArray(data) || !Array.isArray(dataHistorial)) {
          throw new Error("La respuesta del servidor no es válida.");
        }

        setTutorias(data);
        setHistorial(dataHistorial);
      } catch (err) {
        console.error("Error al cargar tutorías:", err);
        setError(
          err.message || "No se pudieron cargar las próximas tutorías."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarTutorias();
  }, []);

  const abrirDetalles = (tutoria) => {
    setTutoriaSeleccionada(tutoria);
  };

  const cerrarDetalles = () => {
    setTutoriaSeleccionada(null);
  };

  const handleCancelled = (tutoria) => {
    notificar("Tutoría cancelada", { cuerpo: tutoria.materia, intent: "info" });
    setTutorias((actuales) =>
      actuales.filter((actual) => actual.id !== tutoria.id)
    );
    setHistorial((actuales) => [
      { ...tutoria, estado: "Cancelada" },
      ...actuales.filter((actual) => actual.id !== tutoria.id),
    ]);
  };

  const esProximas = pestana === "proximas";
  const listaActual = esProximas ? tutorias : historial;

  return (
    <Page cargando={loading}>
      <PageHeader
        title="Mis tutorías"
        description="Tus próximas sesiones y el historial de las anteriores. Abre una para ver el enlace y las notas."
      />

      <TabList
        className={styles.tabs}
        selectedValue={pestana}
        onTabSelect={(_, data) => setPestana(data.value)}
        aria-label="Sesiones de tutoría"
      >
        <Tab value="proximas">Próximas sesiones{!loading && ` (${tutorias.length})`}</Tab>
        <Tab value="historial">Historial</Tab>
      </TabList>

      {loading ? (
        <SessionListSkeleton rows={3} />
      ) : error ? (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      ) : listaActual.length === 0 ? (
        <EmptyState
          icon={esProximas ? <CalendarEmpty24Regular /> : <History24Regular />}
          ilustracion={<IlustracionCalendario />}
          title={esProximas ? "No tienes próximas tutorías" : "Tu historial está vacío"}
          description={
            esProximas
              ? "Tus sesiones pendientes y aceptadas aparecerán aquí."
              : "Las sesiones pasadas, canceladas o rechazadas aparecerán aquí."
          }
        />
      ) : (
        <SessionList label={esProximas ? "Próximas sesiones" : "Historial de sesiones"}>
          {listaActual.map((tutoria) => {
            const fecha = new Date(tutoria.fechaHoraInicio);
            // Con enlace de reunión, la fila ofrece "Unirse" directo (sin abrir detalles).
            const puedeUnirse =
              esProximas && Boolean(tutoria.linkReunion) && (tutoria.estado || "Aceptada") === "Aceptada";
            if (puedeUnirse) {
              return (
                <SessionRow
                  key={tutoria.id}
                  fecha={fecha}
                  title={tutoria.materia}
                  meta={`${formatoSesion.format(fecha)} · con ${tutoria.rolOpuestoNombre}`}
                  actions={
                    <>
                      <Button onClick={() => abrirDetalles(tutoria)}>Detalles</Button>
                      <Button
                        as="a"
                        href={tutoria.linkReunion}
                        target="_blank"
                        rel="noopener noreferrer"
                        appearance="primary"
                        icon={<Video20Regular />}
                        aria-label={`Unirse a ${tutoria.materia} con ${tutoria.rolOpuestoNombre}`}
                      >
                        Unirse
                      </Button>
                    </>
                  }
                />
              );
            }
            return (
              <SessionRow
                key={tutoria.id}
                fecha={fecha}
                muted={!esProximas}
                title={tutoria.materia}
                meta={`${formatoSesion.format(fecha)} · con ${tutoria.rolOpuestoNombre}`}
                end={<EstadoBadge estado={tutoria.estado || "Aceptada"} />}
                onClick={() => abrirDetalles(tutoria)}
                ariaLabel={`Ver detalles de ${tutoria.materia} con ${tutoria.rolOpuestoNombre}`}
              />
            );
          })}
        </SessionList>
      )}

      <TutoriaDetallesModal
        isOpen={tutoriaSeleccionada !== null}
        onClose={cerrarDetalles}
        tutoria={tutoriaSeleccionada}
        onCancelled={handleCancelled}
      />
    </Page>
  );
}
