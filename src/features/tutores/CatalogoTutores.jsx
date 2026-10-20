import { useEffect, useState } from "react";
import {
  Caption1,
  makeStyles,
  MessageBar,
  MessageBarBody,
  SearchBox,
  Skeleton,
  SkeletonItem,
  tokens,
} from "@fluentui/react-components";
import { PeopleSearch24Regular } from "@fluentui/react-icons";
import { getTutores } from "../../services/tutorService";
import TutorCard from "../../components/TutorCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { Page, PageHeader } from "../../components/ui/Page";

const useStyles = makeStyles({
  toolbar: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
  },
  search: {
    width: "100%",
    maxWidth: "none",
    "@media (min-width: 640px)": {
      maxWidth: "420px",
    },
  },
  count: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: "tabular-nums",
  },
  grid: {
    display: "grid",
    // auto-fill en lugar de media queries: Griffel no garantiza su orden.
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
    gap: tokens.spacingHorizontalL,
  },
});

const normalizarTexto = (texto = "") => {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export default function CatalogoTutores() {
  const styles = useStyles();
  const [tutores, setTutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchTutores = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTutores();
        setTutores(Array.isArray(data) ? data : (data?.content || []));
      } catch (err) {
        console.error("Error al cargar tutores:", err);
        setError("No se pudo cargar la lista de tutores. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutores();
  }, []);

  const tutoresFiltrados = tutores.filter((tutor) => {
    const term = normalizarTexto(busqueda);
    const nombreCoincide = normalizarTexto(tutor.nombre).includes(term);
    const materiasCoincide = tutor.materias?.some(m => normalizarTexto(m).includes(term));
    return nombreCoincide || materiasCoincide;
  });

  return (
    <Page>
      <PageHeader
        title="Buscar tutores"
        description="Encuentra a quien domina la materia en la que necesitas apoyo y agenda una sesión."
      />

      <div className={styles.toolbar}>
        <SearchBox
          className={styles.search}
          placeholder="Nombre o materia"
          aria-label="Buscar por nombre o materia"
          value={busqueda}
          onChange={(_, data) => setBusqueda(data.value)}
        />
        {!loading && !error && (
          <Caption1 className={styles.count} role="status">
            {tutoresFiltrados.length === 1 ? "1 tutor" : `${tutoresFiltrados.length} tutores`}
          </Caption1>
        )}
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} aria-label="Cargando tutores">
              <SkeletonItem shape="rectangle" style={{ height: "128px" }} />
            </Skeleton>
          ))}
        </div>
      ) : error ? (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      ) : tutoresFiltrados.length === 0 ? (
        <EmptyState
          icon={<PeopleSearch24Regular />}
          title={busqueda ? `Ningún tutor coincide con “${busqueda}”` : "Aún no hay tutores disponibles"}
          description={
            busqueda
              ? "Prueba con el nombre de la materia sin abreviar o con otra palabra."
              : "Los tutores aparecen aquí cuando la administración aprueba su solicitud."
          }
        />
      ) : (
        <div className={styles.grid}>
          {tutoresFiltrados.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} to={`/tutor/${tutor.id}`} />
          ))}
        </div>
      )}
    </Page>
  );
}
