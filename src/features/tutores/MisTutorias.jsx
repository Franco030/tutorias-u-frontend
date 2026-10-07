import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  aceptarCita,
  getCitasPendientes,
  rechazarCita,
} from "../../services/citaService";
import ConfirmarTutoriaModal from "./ConfirmarTutoriaModal";

const formatearFecha = (fecha) => {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(fecha));
};

export default function MisTutorias() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [rechazandoId, setRechazandoId] = useState(null);

  useEffect(() => {
    const cargarCitas = async () => {
      try {
        setCargando(true);
        setError("");

        const data = await getCitasPendientes();
        setCitas(data);
      } catch (err) {
        console.error("Error al cargar citas pendientes:", err);

        setError(
          err.message || "No se pudieron cargar las solicitudes pendientes."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarCitas();
  }, []);

  const removerCita = (id) => {
    setCitas((prev) => prev.filter((cita) => cita.id !== id));
  };

  const handleAceptar = (cita) => {
    setError("");
    setCitaSeleccionada(cita);
  };

  const handleConfirmarAceptacion = async (data) => {
    if (!citaSeleccionada) {
      return;
    }

    try {
      setGuardando(true);
      setError("");

      await aceptarCita(citaSeleccionada.id, data);

      removerCita(citaSeleccionada.id);
      setCitaSeleccionada(null);
    } catch (err) {
      console.error("Error al aceptar la cita:", err);

      setError(
        err.message || "No se pudo aceptar la solicitud."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleRechazar = async (cita) => {
    const confirmar = window.confirm(
      `¿Deseas rechazar la solicitud de ${cita.estudianteNombre}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setRechazandoId(cita.id);
      setError("");

      await rechazarCita(cita.id);

      removerCita(cita.id);
    } catch (err) {
      console.error("Error al rechazar la cita:", err);

      setError(
        err.message || "No se pudo rechazar la solicitud."
      );
    } finally {
      setRechazandoId(null);
    }
  };

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-granite-50 dark:bg-deep-space-blue-950">
        <p className="text-sm text-granite-500 dark:text-deep-space-blue-300">
          Cargando solicitudes...
        </p>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-granite-50 px-4 py-10 dark:bg-deep-space-blue-950">
        <div className="mx-auto max-w-5xl">

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-deep-space-blue-500 dark:text-emerald-400">
                Tutorías
              </p>

              <h1 className="mt-2 text-3xl font-semibold text-granite-900 dark:text-white">
                Solicitudes pendientes
              </h1>

              <p className="mt-2 text-sm text-granite-500 dark:text-deep-space-blue-300">
                Revisa las solicitudes de estudiantes y decide cuáles puedes atender.
              </p>
            </div>

            <Link
              to="/"
              className="text-sm font-medium text-deep-space-blue-600 hover:underline dark:text-emerald-400"
            >
              Volver al panel
            </Link>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-burgundy-200 bg-burgundy-50 px-4 py-3 text-sm text-burgundy-700"
            >
              {error}
            </div>
          )}

          {citas.length === 0 ? (
            <div className="rounded-2xl border border-granite-200 bg-white px-6 py-14 text-center dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/40">
              <h2 className="text-lg font-medium text-granite-900 dark:text-white">
                No tienes solicitudes pendientes
              </h2>

              <p className="mt-2 text-sm text-granite-500 dark:text-deep-space-blue-300">
                Cuando un estudiante solicite una tutoría, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {citas.map((cita) => (
                <article
                  key={cita.id}
                  className="rounded-2xl border border-granite-200 bg-white p-6 dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/40"
                >
                  <div className="mb-5">
                    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                      {cita.estado}
                    </span>

                    <h2 className="mt-4 text-xl font-semibold text-granite-900 dark:text-white">
                      {cita.materiaNombre}
                    </h2>

                    <p className="mt-1 text-sm text-granite-500 dark:text-deep-space-blue-300">
                      Solicitud de {cita.estudianteNombre}
                    </p>
                  </div>

                  <div className="mb-6 rounded-xl bg-granite-50 p-4 dark:bg-deep-space-blue-950/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-granite-400 dark:text-deep-space-blue-400">
                      Fecha y hora
                    </p>

                    <p className="mt-1 text-sm font-medium text-granite-800 dark:text-deep-space-blue-100">
                      {formatearFecha(cita.fechaHoraInicio)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => handleAceptar(cita)}
                      disabled={rechazandoId === cita.id}
                      className="
                        flex-1
                        rounded-full
                        bg-deep-space-blue-600
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-deep-space-blue-700
                        disabled:opacity-50
                        dark:bg-emerald-500
                        dark:text-deep-space-blue-950
                      "
                    >
                      Aceptar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRechazar(cita)}
                      disabled={rechazandoId === cita.id}
                      className="
                        flex-1
                        rounded-full
                        border
                        border-burgundy-200
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-burgundy-600
                        transition
                        hover:bg-burgundy-50
                        disabled:opacity-50
                        dark:border-burgundy-800
                        dark:text-burgundy-400
                      "
                    >
                      {rechazandoId === cita.id
                        ? "Rechazando..."
                        : "Rechazar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmarTutoriaModal
        cita={citaSeleccionada}
        abierto={Boolean(citaSeleccionada)}
        guardando={guardando}
        onCerrar={() => {
          if (!guardando) {
            setCitaSeleccionada(null);
          }
        }}
        onConfirmar={handleConfirmarAceptacion}
      />
    </>
  );
}