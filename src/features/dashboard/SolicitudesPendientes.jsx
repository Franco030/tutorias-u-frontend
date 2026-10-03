import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import { obtenerCitasPendientes } from "../../services/citaService";
import ItemSolicitud from "./ItemSolicitud";

export default function SolicitudesPendientes() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;

    const cargarSolicitudes = async () => {
      setCargando(true);
      setError("");

      try {
        const resultado = await obtenerCitasPendientes();
        if (!cancelado) {
          setSolicitudes(Array.isArray(resultado) ? resultado : []);
        }
      } catch (err) {
        if (!cancelado) {
          setError(err?.message || "No se pudieron cargar las solicitudes pendientes.");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargarSolicitudes();

    return () => {
      cancelado = true;
    };
  }, [intento]);

  return (
    <main className="min-h-screen bg-granite-50 px-4 py-8 dark:bg-deep-space-blue-950 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex items-start gap-4 border-b border-granite-200 pb-6 dark:border-deep-space-blue-800">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Volver al panel"
            className="rounded-md p-2 text-granite-600 transition-colors hover:bg-granite-200 dark:text-deep-space-blue-300 dark:hover:bg-deep-space-blue-800"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-granite-900 dark:text-white">Solicitudes Pendientes</h1>
            <p className="mt-1 text-sm text-granite-500 dark:text-deep-space-blue-300">
              Sesiones que esperan tu respuesta.
            </p>
          </div>
        </header>

        {cargando ? (
          <div role="status" className="flex items-center gap-3 py-10 text-sm text-granite-600 dark:text-deep-space-blue-300">
            <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-granite-300 border-t-deep-space-blue-600 dark:border-deep-space-blue-700 dark:border-t-emerald-400" />
            Cargando solicitudes...
          </div>
        ) : error ? (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-4 text-sm text-red-700 dark:text-red-400">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setIntento((actual) => actual + 1)}
              className="rounded-md border border-current px-3 py-2 font-medium hover:bg-red-500/10"
            >
              Reintentar
            </button>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Inbox aria-hidden="true" className="mb-4 h-10 w-10 text-granite-400 dark:text-deep-space-blue-400" />
            <h2 className="text-lg font-medium text-granite-900 dark:text-white">No tienes solicitudes pendientes</h2>
            <p className="mt-2 max-w-md text-sm text-granite-500 dark:text-deep-space-blue-300">
              Cuando un estudiante solicite una sesión contigo, aparecerá aquí.
            </p>
          </div>
        ) : (
          <section aria-label="Solicitudes pendientes" className="space-y-3">
            {solicitudes.map((solicitud) => (
              <ItemSolicitud key={solicitud.citaId} solicitud={solicitud} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}