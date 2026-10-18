
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, BookOpen } from "lucide-react";
import {
  getHistorialTutorias,
  getProximasTutorias,
} from "../../services/citaService";
import TutoriaDetallesModal from "./TutoriaDetallesModal";

export default function ProximasTutorias() {
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

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const abrirDetalles = (tutoria) => {
    setTutoriaSeleccionada(tutoria);
  };

  const cerrarDetalles = () => {
    setTutoriaSeleccionada(null);
  };

  const handleCancelled = (tutoria) => {
    setTutorias((actuales) =>
      actuales.filter((actual) => actual.id !== tutoria.id)
    );
    setHistorial((actuales) => [
      { ...tutoria, estado: "Cancelada" },
      ...actuales.filter((actual) => actual.id !== tutoria.id),
    ]);
  };

  const listaActual = pestana === "proximas" ? tutorias : historial;

  return (
    <main className="min-h-screen bg-granite-50 px-6 py-10 dark:bg-deep-space-blue-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-granite-900 dark:text-white">
            Mis Tutorías
          </h1>

          <p className="mt-2 text-granite-600 dark:text-deep-space-blue-300">
            Consulta tus próximas sesiones y el historial de tutorías.
          </p>
        </div>

        <div
          className="mb-6 flex w-fit rounded-lg border border-granite-200 bg-white p-1 dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/40"
          role="tablist"
          aria-label="Sesiones de tutoría"
        >
          <button
            type="button"
            role="tab"
            aria-selected={pestana === "proximas"}
            onClick={() => setPestana("proximas")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              pestana === "proximas"
                ? "bg-deep-space-blue-600 text-white dark:bg-emerald-500 dark:text-deep-space-blue-950"
                : "text-granite-700 hover:bg-granite-100 dark:text-deep-space-blue-200 dark:hover:bg-deep-space-blue-800"
            }`}
          >
            Próximas Sesiones
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pestana === "historial"}
            onClick={() => setPestana("historial")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              pestana === "historial"
                ? "bg-deep-space-blue-600 text-white dark:bg-emerald-500 dark:text-deep-space-blue-950"
                : "text-granite-700 hover:bg-granite-100 dark:text-deep-space-blue-200 dark:hover:bg-deep-space-blue-800"
            }`}
          >
            Historial de Sesiones
          </button>
        </div>

        {loading && (
          <div className="py-12 text-center text-granite-600 dark:text-deep-space-blue-300">
            Cargando tutorías...
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {!loading && !error && listaActual.length === 0 && (
          <div className="rounded-lg border border-granite-200 bg-white p-10 text-center dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/40">
            <CalendarDays className="mx-auto mb-4 h-10 w-10 text-granite-400" />

            <h2 className="text-lg font-medium text-granite-900 dark:text-white">
              {pestana === "proximas"
                ? "No tienes próximas tutorías"
                : "Tu historial de tutorías está vacío"}
            </h2>

            <p className="mt-2 text-sm text-granite-600 dark:text-deep-space-blue-300">
              {pestana === "proximas"
                ? "Tus próximas sesiones aparecerán aquí."
                : "Las sesiones pasadas, canceladas o rechazadas aparecerán aquí."}
            </p>
          </div>
        )}

        {!loading && !error && listaActual.length > 0 && (
          <div className="space-y-4">
            {listaActual.map((tutoria) => (
              <div
                key={tutoria.id}
                className="rounded-lg border border-granite-200 bg-white p-6 shadow-sm dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/40"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-granite-900 dark:text-white">
                      {tutoria.materia}
                    </h2>

                    <p className="text-sm text-granite-600 dark:text-deep-space-blue-200">
                      Con: {tutoria.rolOpuestoNombre}
                    </p>

                    <span className="inline-flex rounded-full bg-granite-100 px-3 py-1 text-xs font-medium text-granite-700 dark:bg-deep-space-blue-800 dark:text-deep-space-blue-100">
                      {tutoria.estado || "Aceptada"}
                    </span>

                    <div className="flex flex-wrap gap-4 text-sm text-granite-600 dark:text-deep-space-blue-300">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {formatearFecha(tutoria.fechaHoraInicio)}
                      </span>

                      <span className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {formatearHora(tutoria.fechaHoraInicio)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => abrirDetalles(tutoria)}
                    className="cursor-pointer rounded-md bg-deep-space-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-deep-space-blue-700 dark:bg-emerald-500 dark:text-deep-space-blue-950 dark:hover:bg-emerald-600"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Ver detalles
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TutoriaDetallesModal
        isOpen={tutoriaSeleccionada !== null}
        onClose={cerrarDetalles}
        tutoria={tutoriaSeleccionada}
        onCancelled={handleCancelled}
      />
    </main>
  );
}
