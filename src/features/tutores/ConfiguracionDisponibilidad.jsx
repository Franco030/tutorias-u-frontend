import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getDisponibilidadTutor,
  guardarDisponibilidadTutor,
} from "../../services/tutorService";

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const normalizarBloque = (bloque) => ({
  diaSemana: Number(bloque.diaSemana ?? bloque.DiaSemana),
  horaInicio: String(bloque.horaInicio ?? bloque.HoraInicio).slice(0, 5),
  horaFin: String(bloque.horaFin ?? bloque.HoraFin).slice(0, 5),
});

export default function ConfiguracionDisponibilidad() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bloques, setBloques] = useState([]);
  const [diaSemana, setDiaSemana] = useState("1");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("10:00");
  const [cargando, setCargando] = useState(true);
  const [cargaCompleta, setCargaCompleta] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarDisponibilidad = async () => {
      try {
        setCargando(true);
        setError("");
        const disponibilidad = await getDisponibilidadTutor(user.id);
        if (activo) {
          setBloques(
            (Array.isArray(disponibilidad) ? disponibilidad : []).map(
              normalizarBloque
            )
          );
          setCargaCompleta(true);
        }
      } catch (err) {
        console.error("Error al cargar disponibilidad:", err);
        if (activo) {
          setError("No se pudo cargar tu disponibilidad. Intenta nuevamente.");
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    if (user?.id) cargarDisponibilidad();

    return () => {
      activo = false;
    };
  }, [user?.id]);

  const agregarBloque = () => {
    setError("");
    setMensajeExito("");

    if (!FORMATO_HORA.test(horaInicio) || !FORMATO_HORA.test(horaFin)) {
      setError("Ingresa una hora de inicio y fin válidas.");
      return;
    }

    if (horaInicio >= horaFin) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    const dia = Number(diaSemana);
    const seCruza = bloques.some(
      (bloque) =>
        bloque.diaSemana === dia &&
        horaInicio < bloque.horaFin &&
        horaFin > bloque.horaInicio
    );

    if (seCruza) {
      setError("Este bloque se cruza con otro horario del mismo día.");
      return;
    }

    setBloques((actuales) =>
      [...actuales, { diaSemana: dia, horaInicio, horaFin }].sort(
        (a, b) =>
          a.diaSemana - b.diaSemana ||
          a.horaInicio.localeCompare(b.horaInicio)
      )
    );
  };

  const retirarBloque = (indice) => {
    setBloques((actuales) => actuales.filter((_, i) => i !== indice));
    setMensajeExito("");
  };

  const handleGuardar = async () => {
    setError("");
    setMensajeExito("");

    try {
      setGuardando(true);
      const guardados = await guardarDisponibilidadTutor(bloques);
      setBloques(
        (Array.isArray(guardados) ? guardados : []).map(normalizarBloque)
      );
      setMensajeExito("Tu disponibilidad se guardó correctamente.");
    } catch (err) {
      console.error("Error al guardar disponibilidad:", err);
      setError(
        err.message || "No se pudo guardar tu disponibilidad. Intenta nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-granite-50 dark:bg-deep-space-blue-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-deep-space-blue-200 border-t-deep-space-blue-600 dark:border-deep-space-blue-800 dark:border-t-emerald-400 animate-spin" />
          <p className="font-medium text-deep-space-blue-600 dark:text-emerald-400">
            Cargando disponibilidad...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-granite-50 px-6 py-10 dark:bg-deep-space-blue-950">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center gap-4 border-b border-granite-200 pb-6 dark:border-deep-space-blue-800">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-md p-2 text-granite-600 transition-colors hover:bg-granite-200 dark:text-deep-space-blue-300 dark:hover:bg-deep-space-blue-800"
            aria-label="Volver al panel"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-granite-900 dark:text-white">
              Configuración de disponibilidad
            </h1>
            <p className="mt-1 text-sm text-granite-500 dark:text-deep-space-blue-300">
              Define los bloques semanales en los que puedes recibir citas.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {mensajeExito && (
          <div
            role="status"
            className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
          >
            {mensajeExito}
          </div>
        )}

        <section className="space-y-6 rounded-lg border border-granite-200 bg-white p-6 dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/30">
          <div>
            <h2 className="text-lg font-medium text-granite-900 dark:text-white">
              Añadir un bloque
            </h2>
            <p className="mt-1 text-sm text-granite-600 dark:text-deep-space-blue-300">
              Cada bloque será una opción de cita disponible para tus
              estudiantes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-4 sm:items-end">
            <label className="text-sm font-medium text-granite-800 dark:text-white">
              Día
              <select
                value={diaSemana}
                onChange={(event) => setDiaSemana(event.target.value)}
                disabled={guardando}
                className="mt-2 w-full rounded-md border border-granite-300 bg-white px-3 py-2.5 text-granite-900 dark:border-deep-space-blue-700 dark:bg-deep-space-blue-900 dark:text-white"
              >
                {DIAS_SEMANA.map((dia, index) => (
                  <option key={dia} value={index}>
                    {dia}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-granite-800 dark:text-white">
              Hora de inicio
              <input
                type="time"
                value={horaInicio}
                onChange={(event) => setHoraInicio(event.target.value)}
                disabled={guardando}
                className="mt-2 w-full rounded-md border border-granite-300 bg-white px-3 py-2.5 text-granite-900 dark:border-deep-space-blue-700 dark:bg-deep-space-blue-900 dark:text-white"
              />
            </label>

            <label className="text-sm font-medium text-granite-800 dark:text-white">
              Hora de fin
              <input
                type="time"
                value={horaFin}
                onChange={(event) => setHoraFin(event.target.value)}
                disabled={guardando}
                className="mt-2 w-full rounded-md border border-granite-300 bg-white px-3 py-2.5 text-granite-900 dark:border-deep-space-blue-700 dark:bg-deep-space-blue-900 dark:text-white"
              />
            </label>

            <button
              type="button"
              onClick={agregarBloque}
              disabled={guardando}
              className="flex items-center justify-center gap-2 rounded-md border border-deep-space-blue-600 px-4 py-2.5 font-medium text-deep-space-blue-700 transition-colors hover:bg-deep-space-blue-50 disabled:opacity-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
            >
              <Plus className="h-4 w-4" />
              Añadir
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-granite-900 dark:text-white">
                Tus bloques
              </h2>
              <p className="text-sm text-granite-500 dark:text-deep-space-blue-300">
                {bloques.length} {bloques.length === 1 ? "bloque" : "bloques"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando || !cargaCompleta}
              className="flex items-center gap-2 rounded-md bg-deep-space-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-deep-space-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:text-deep-space-blue-950 dark:hover:bg-emerald-600"
            >
              <Save className="h-4 w-4" />
              {guardando ? "Guardando..." : "Guardar disponibilidad"}
            </button>
          </div>

          {bloques.length === 0 ? (
            <div className="rounded-lg border border-dashed border-granite-300 px-6 py-10 text-center text-sm text-granite-600 dark:border-deep-space-blue-700 dark:text-deep-space-blue-300">
              Aún no tienes horarios configurados.
            </div>
          ) : (
            <ul className="divide-y divide-granite-100 rounded-lg border border-granite-200 bg-white dark:divide-deep-space-blue-800 dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/30">
              {bloques.map((bloque, indice) => (
                <li
                  key={`${bloque.diaSemana}-${bloque.horaInicio}-${bloque.horaFin}-${indice}`}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-granite-900 dark:text-white">
                      {DIAS_SEMANA[bloque.diaSemana]}
                    </p>
                    <p className="text-sm text-granite-600 dark:text-deep-space-blue-300">
                      {bloque.horaInicio} – {bloque.horaFin}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => retirarBloque(indice)}
                    disabled={guardando}
                    aria-label={`Retirar bloque del ${DIAS_SEMANA[bloque.diaSemana]} de ${bloque.horaInicio} a ${bloque.horaFin}`}
                    className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
