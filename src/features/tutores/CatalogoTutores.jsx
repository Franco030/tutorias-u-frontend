import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Caption1,
  Dropdown,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Option,
  SearchBox,
  Skeleton,
  SkeletonItem,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { PeopleSearch24Regular } from "@fluentui/react-icons";
import { getTutores } from "../../services/tutorService";
import { getMaterias } from "../../services/materiaService";
import TutorCard from "../../components/TutorCard";
import { IlustracionComunidad } from "../../components/illustrations/Ilustraciones";
import { EmptyState } from "../../components/ui/EmptyState";
import { Page, PageHeader } from "../../components/ui/Page";
import { normalizarTexto } from "../../lib/texto";

const POR_PAGINA = 12;
const TODAS = "__todas__";

const ORDENES = {
  calificacion: "Mejor calificados",
  nombre: "Nombre (A–Z)",
  materias: "Más materias",
};

const useStyles = makeStyles({
  toolbar: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: tokens.spacingHorizontalM,
    rowGap: tokens.spacingVerticalS,
    alignItems: "center",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "minmax(0, 360px) minmax(0, 220px) minmax(0, 200px) 1fr",
    },
  },
  search: {
    width: "100%",
    maxWidth: "none",
  },
  dropdown: {
    minWidth: 0,
    width: "100%",
  },
  count: {
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: "tabular-nums",
    "@media (min-width: 768px)": {
      justifySelf: "end",
    },
  },
  tabs: {
    overflowX: "auto",
    marginInline: `calc(${tokens.spacingHorizontalS} * -1)`,
    scrollbarWidth: "none",
  },
  grid: {
    display: "grid",
    // auto-fill en lugar de media queries: Griffel no garantiza su orden.
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
    gap: tokens.spacingHorizontalL,
  },
  more: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalS,
  },
});

export default function CatalogoTutores() {
  const styles = useStyles();
  const [tutores, setTutores] = useState([]);
  const [catalogoMaterias, setCatalogoMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  // La búsqueda de la barra superior llega como ?q=.
  const consulta = searchParams.get("q") || "";
  const [busqueda, setBusqueda] = useState(consulta);
  const [consultaPrevia, setConsultaPrevia] = useState(consulta);
  if (consulta !== consultaPrevia) {
    setConsultaPrevia(consulta);
    setBusqueda(consulta);
  }
  const [categoria, setCategoria] = useState(TODAS);
  const [materia, setMateria] = useState("");
  const [orden, setOrden] = useState("calificacion");
  const [visibles, setVisibles] = useState(POR_PAGINA);

  useEffect(() => {
    const fetchTutores = async () => {
      try {
        setLoading(true);
        setError(null);
        const [data, materias] = await Promise.all([
          getTutores(),
          // Las categorías son un extra: si fallan, el catálogo sigue funcionando.
          getMaterias().catch(() => []),
        ]);
        setTutores(Array.isArray(data) ? data : (data?.content || []));
        setCatalogoMaterias(Array.isArray(materias) ? materias : []);
      } catch (err) {
        console.error("Error al cargar tutores:", err);
        setError("No se pudo cargar la lista de tutores. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutores();
  }, []);

  // Materia (normalizada) → categoría, a partir del catálogo de materias.
  const categoriaDe = useMemo(() => {
    const mapa = new Map();
    catalogoMaterias.forEach((m) => mapa.set(normalizarTexto(m.nombre), m.categoria || "Otras"));
    return mapa;
  }, [catalogoMaterias]);

  const categorias = useMemo(
    () => [...new Set(catalogoMaterias.map((m) => m.categoria).filter(Boolean))],
    [catalogoMaterias]
  );

  // Solo se ofrecen materias que algún tutor imparte.
  const materiasConTutor = useMemo(() => {
    const nombres = new Set();
    tutores.forEach((t) => (t.materias || []).forEach((m) => nombres.add(m)));
    return [...nombres]
      .filter((m) => categoria === TODAS || categoriaDe.get(normalizarTexto(m)) === categoria)
      .sort((a, b) => a.localeCompare(b, "es"));
  }, [tutores, categoria, categoriaDe]);

  const tutoresFiltrados = useMemo(() => {
    const term = normalizarTexto(busqueda);
    const lista = tutores.filter((tutor) => {
      const materias = tutor.materias || [];
      const coincideTexto =
        normalizarTexto(tutor.nombre).includes(term) ||
        materias.some((m) => normalizarTexto(m).includes(term));
      const coincideCategoria =
        categoria === TODAS || materias.some((m) => categoriaDe.get(normalizarTexto(m)) === categoria);
      const coincideMateria = !materia || materias.includes(materia);
      return coincideTexto && coincideCategoria && coincideMateria;
    });

    const calificacion = (t) => Number(t.calificacionPromedio) || 0;
    return [...lista].sort((a, b) => {
      if (orden === "nombre") return a.nombre.localeCompare(b.nombre, "es");
      if (orden === "materias") return (b.materias?.length || 0) - (a.materias?.length || 0);
      return calificacion(b) - calificacion(a) || a.nombre.localeCompare(b.nombre, "es");
    });
  }, [tutores, busqueda, categoria, materia, orden, categoriaDe]);

  const reiniciarPaginas = () => setVisibles(POR_PAGINA);
  const hayFiltros = Boolean(busqueda || materia || categoria !== TODAS);

  return (
    <Page cargando={loading}>
      <PageHeader
        title="Buscar tutores"
        description="Encuentra a quien domina la materia en la que necesitas apoyo y agenda una sesión."
      />

      <div className={styles.toolbar}>
        {categorias.length > 1 && (
          <div className={styles.tabs}>
            <TabList
              selectedValue={categoria}
              onTabSelect={(_, data) => {
                setCategoria(data.value);
                setMateria("");
                reiniciarPaginas();
              }}
              aria-label="Filtrar por categoría"
            >
              <Tab value={TODAS}>Todas</Tab>
              {categorias.map((cat) => (
                <Tab key={cat} value={cat}>
                  {cat}
                </Tab>
              ))}
            </TabList>
          </div>
        )}

        <div className={styles.filters}>
          <SearchBox
            className={styles.search}
            placeholder="Nombre o materia"
            aria-label="Buscar por nombre o materia"
            value={busqueda}
            onChange={(_, data) => {
              setBusqueda(data.value);
              reiniciarPaginas();
            }}
          />
          <Dropdown
            className={styles.dropdown}
            aria-label="Filtrar por materia"
            value={materia || "Todas las materias"}
            selectedOptions={[materia]}
            onOptionSelect={(_, data) => {
              setMateria(data.optionValue || "");
              reiniciarPaginas();
            }}
          >
            <Option value="">Todas las materias</Option>
            {materiasConTutor.map((m) => (
              <Option key={m} value={m}>
                {m}
              </Option>
            ))}
          </Dropdown>
          <Dropdown
            className={styles.dropdown}
            aria-label="Ordenar tutores"
            value={ORDENES[orden]}
            selectedOptions={[orden]}
            onOptionSelect={(_, data) => setOrden(data.optionValue || "calificacion")}
          >
            {Object.entries(ORDENES).map(([valor, texto]) => (
              <Option key={valor} value={valor}>
                {texto}
              </Option>
            ))}
          </Dropdown>
          {!loading && !error && (
            <Caption1 className={styles.count} role="status">
              {tutoresFiltrados.length === 1 ? "1 tutor" : `${tutoresFiltrados.length} tutores`}
            </Caption1>
          )}
        </div>
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
          ilustracion={<IlustracionComunidad />}
          title={hayFiltros ? "Ningún tutor coincide con los filtros" : "Aún no hay tutores disponibles"}
          description={
            hayFiltros
              ? "Prueba con otra materia, otra categoría o una palabra distinta."
              : "Los tutores aparecen aquí cuando la administración aprueba su solicitud."
          }
          action={
            hayFiltros && (
              <Button
                onClick={() => {
                  setBusqueda("");
                  setMateria("");
                  setCategoria(TODAS);
                  reiniciarPaginas();
                }}
              >
                Quitar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className={styles.grid}>
            {tutoresFiltrados.slice(0, visibles).map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} to={`/tutor/${tutor.id}`} />
            ))}
          </div>
          {tutoresFiltrados.length > visibles && (
            <div className={styles.more}>
              <Caption1 className={styles.count}>
                Mostrando {visibles} de {tutoresFiltrados.length}
              </Caption1>
              <Button onClick={() => setVisibles((n) => n + POR_PAGINA)}>Mostrar más</Button>
            </div>
          )}
        </>
      )}
    </Page>
  );
}
