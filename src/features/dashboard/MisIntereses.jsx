import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Save } from "lucide-react";
import { getMaterias, getMisIntereses, guardarIntereses } from "../../services/materiaService";

const normalizarTexto = (texto = "") => {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

export default function MisIntereses() {
  const navigate = useNavigate();

  const [materias, setMaterias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const [todasLasMaterias, misIntereses] = await Promise.all([
          getMaterias(),
          getMisIntereses().catch(() => [])
        ]);

        setMaterias(todasLasMaterias || []);
        
        if (Array.isArray(misIntereses)) {
          const ids = misIntereses.map(m => typeof m === 'object' ? m.id : m);
          setSeleccionadas(ids);
        }

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar las materias. Intenta nuevamente.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const materiasFiltradas = materias.filter((materia) => {
    const nombreNormalizado = normalizarTexto(materia.nombre);
    const busquedaNormalizada = normalizarTexto(busqueda.trim());
    return nombreNormalizado.includes(busquedaNormalizada);
  });

  const toggleMateria = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id)
        ? prev.filter((materiaId) => materiaId !== id)
        : [...prev, id]
    );
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setError("");
      setMensajeExito("");

      await guardarIntereses(seleccionadas);
      setMensajeExito("Tus intereses se han actualizado correctamente.");
      
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (err) {
      console.error("Error al guardar intereses:", err);
      setError("No se pudieron guardar tus materias. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-granite-50 dark:bg-deep-space-blue-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-deep-space-blue-200 border-t-deep-space-blue-600 dark:border-deep-space-blue-800 dark:border-t-emerald-400 animate-spin"></div>
          <p className="text-deep-space-blue-600 dark:text-emerald-400 font-medium">Cargando tus intereses...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-granite-50 dark:bg-deep-space-blue-950 py-10 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header con botón regresar */}
        <div className="flex items-center gap-4 border-b border-granite-200 dark:border-deep-space-blue-800 pb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-md hover:bg-granite-200 dark:hover:bg-deep-space-blue-800 transition-colors text-granite-600 dark:text-deep-space-blue-300"
            aria-label="Volver al panel"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-granite-900 dark:text-white tracking-tight">Mis Intereses</h1>
            <p className="text-sm text-granite-500 dark:text-deep-space-blue-300 mt-1">
              Administra las materias en las que deseas recibir ayuda.
            </p>
          </div>
        </div>

        {/* Notificaciones */}
        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        {mensajeExito && (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            {mensajeExito}
          </div>
        )}

        {/* Buscador */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-granite-400 dark:text-deep-space-blue-400" />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar materia por nombre..."
            className="
              w-full rounded-md border border-granite-200 bg-white
              pl-11 pr-4 py-3 text-sm text-granite-900 outline-none transition-colors
              placeholder:text-granite-400 focus:border-deep-space-blue-500
              dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/40 dark:text-white
              dark:placeholder:text-deep-space-blue-400 dark:focus:border-emerald-500
            "
          />
        </div>

        {/* Sección de materias */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-medium text-granite-900 dark:text-white">Catálogo de materias</h2>
            <span className="text-xs font-medium text-deep-space-blue-600 dark:text-emerald-400 bg-deep-space-blue-50 dark:bg-emerald-500/10 px-3 py-1 rounded-md">
              {seleccionadas.length} seleccionadas
            </span>
          </div>

          {materiasFiltradas.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-6 bg-white dark:bg-deep-space-blue-900/20 border border-granite-200 dark:border-deep-space-blue-800 rounded-lg">
              {materiasFiltradas.map((materia) => {
                const estaSeleccionada = seleccionadas.includes(materia.id);

                return (
                  <button
                    key={materia.id}
                    type="button"
                    onClick={() => toggleMateria(materia.id)}
                    className={`
                      rounded-md border px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-200
                      ${
                        estaSeleccionada
                          ? "bg-deep-space-blue-600 border-deep-space-blue-600 text-white shadow-sm dark:bg-emerald-500 dark:border-emerald-500 dark:text-deep-space-blue-950"
                          : "bg-granite-50 border-granite-200 text-granite-700 hover:border-deep-space-blue-400 hover:bg-white dark:bg-deep-space-blue-900/40 dark:border-deep-space-blue-800 dark:text-deep-space-blue-200 dark:hover:border-emerald-500"
                      }
                    `}
                  >
                    {materia.nombre}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-deep-space-blue-900/20 border border-granite-200 dark:border-deep-space-blue-800 rounded-lg">
              <p className="text-granite-500 dark:text-deep-space-blue-300">
                No se encontraron materias con el nombre "{busqueda}"
              </p>
            </div>
          )}
        </div>

        {/* Botón Guardar */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex items-center gap-2 bg-deep-space-blue-600 hover:bg-deep-space-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-deep-space-blue-950"
          >
            <Save className="w-4 h-4" />
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

      </div>
    </main>
  );
}
