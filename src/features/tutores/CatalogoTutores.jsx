import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { getTutores } from "../../services/tutorService";

export default function CatalogoTutores() {
  const navigate = useNavigate();
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

  const normalizarTexto = (texto = "") => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const tutoresFiltrados = tutores.filter((tutor) => {
    const term = normalizarTexto(busqueda);
    const nombreCoincide = normalizarTexto(tutor.nombre).includes(term);
    const materiasCoincide = tutor.materias?.some(m => normalizarTexto(m).includes(term));
    return nombreCoincide || materiasCoincide;
  });

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <main className="min-h-screen bg-granite-50 dark:bg-deep-space-blue-950 py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-granite-200 dark:border-deep-space-blue-800 pb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-md hover:bg-granite-200 dark:hover:bg-deep-space-blue-800 transition-colors text-granite-600 dark:text-deep-space-blue-300"
            aria-label="Volver al panel"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-granite-900 dark:text-white tracking-tight">
              Catálogo de Tutores
            </h1>
            <p className="text-sm text-granite-500 dark:text-deep-space-blue-300 mt-1">
              Encuentra al tutor ideal para las materias en las que necesitas apoyo.
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-granite-400 dark:text-deep-space-blue-400" />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o materia..."
            className="w-full rounded-md border border-granite-200 bg-white pl-11 pr-4 py-3 text-sm text-granite-900 outline-none transition-colors placeholder:text-granite-400 focus:border-deep-space-blue-500 dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/40 dark:text-white dark:placeholder:text-deep-space-blue-400 dark:focus:border-emerald-500"
          />
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
             <div className="w-10 h-10 border-4 border-deep-space-blue-200 border-t-deep-space-blue-600 dark:border-deep-space-blue-800 dark:border-t-emerald-400 animate-spin"></div>
             <p className="text-granite-500 dark:text-deep-space-blue-300">Cargando tutores...</p>
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-6 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : tutoresFiltrados.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-deep-space-blue-900/20 border border-granite-200 dark:border-deep-space-blue-800 rounded-lg">
            <p className="text-granite-500 dark:text-deep-space-blue-300 text-lg">
              No se encontraron tutores con tu búsqueda "{busqueda}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutoresFiltrados.map((tutor) => (
              <button
                key={tutor.id}
                onClick={() => navigate(`/tutor/${tutor.id}`)}
                className="flex flex-col text-left bg-white dark:bg-deep-space-blue-900/40 border border-granite-200 dark:border-deep-space-blue-800 hover:border-deep-space-blue-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all rounded-lg p-6 overflow-hidden group"
              >
                <div className="flex items-center gap-4 mb-4">
                  {tutor.fotoUrl ? (
                    <img
                      src={tutor.fotoUrl}
                      alt={tutor.nombre}
                      className="w-16 h-16 rounded-full object-cover border-2 border-granite-50 dark:border-deep-space-blue-800"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-granite-50 dark:border-deep-space-blue-800 bg-deep-space-blue-50 dark:bg-deep-space-blue-800/50 flex items-center justify-center text-xl font-medium text-deep-space-blue-600 dark:text-emerald-400">
                      {getInitial(tutor.nombre)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-medium text-granite-900 dark:text-white line-clamp-1 group-hover:text-deep-space-blue-600 dark:group-hover:text-emerald-400 transition-colors">
                      {tutor.nombre}
                    </h3>
                  </div>
                </div>

                <div className="mt-2 flex-1 w-full">
                  <h4 className="text-xs font-medium text-granite-500 dark:text-deep-space-blue-400 uppercase tracking-wider mb-3 border-b border-granite-100 dark:border-deep-space-blue-800/50 pb-2">
                    Especialidades
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tutor.materias?.slice(0, 3).map((materia, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-granite-50 dark:bg-deep-space-blue-900/50 text-granite-700 dark:text-deep-space-blue-200 text-xs rounded-md border border-granite-200 dark:border-deep-space-blue-800"
                      >
                        {materia}
                      </span>
                    ))}
                    {tutor.materias?.length > 3 && (
                      <span className="px-3 py-1 bg-granite-50 dark:bg-deep-space-blue-900/50 text-granite-500 dark:text-deep-space-blue-400 text-xs rounded-md border border-granite-200 dark:border-deep-space-blue-800">
                        +{tutor.materias.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
