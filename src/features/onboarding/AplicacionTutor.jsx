import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { getMaterias } from "../../services/materiaService";
import { subirArchivo } from "../../services/fileService";
import { aplicarComoTutor } from "../../services/tutorService";

const preguntasExamen = [
  {
    id: 1,
    pregunta: "¿Qué harías si un estudiante no comprende un tema?",
    opciones: [
      "Explicarlo de una manera diferente",
      "Continuar con el siguiente tema",
      "Pedirle que lo estudie por su cuenta",
    ],
  },
  {
    id: 2,
    pregunta: "¿Qué consideras más importante durante una tutoría?",
    opciones: [
      "Que el estudiante comprenda el tema",
      "Terminar lo más rápido posible",
      "Cubrir muchos temas aunque queden dudas",
    ],
  },
  {
    id: 3,
    pregunta: "Si un estudiante comete un error, ¿qué harías?",
    opciones: [
      "Ayudarle a identificar el error y explicarle cómo corregirlo",
      "Darle directamente la respuesta correcta",
      "Ignorar el error y continuar",
    ],
  },
];

export default function AplicacionTutor() {
  const navigate = useNavigate();
  const { updateLocalUser } = useAuth();

  const [materias, setMaterias] = useState([]);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [respuestasExamen, setRespuestasExamen] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        setError("");
        const data = await getMaterias();
        setMaterias(data);
      } catch (err) {
        console.error("Error al cargar materias:", err);
        setError(err.message || "No se pudieron cargar las materias.");
      }
    };
    cargarMaterias();
  }, []);

  const toggleMateria = (id) => {
    setMateriasSeleccionadas((prev) =>
      prev.includes(id)
        ? prev.filter((materiaId) => materiaId !== id)
        : [...prev, id]
    );
  };

  const formularioValido =
    materiasSeleccionadas.length > 0 &&
    archivo !== null &&
    Object.keys(respuestasExamen).length === preguntasExamen.length;

  const handleSubmit = async () => {
    if (!formularioValido || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMensajeExito("");

      const respuestaArchivo = await subirArchivo(archivo);
      let urlCredencial = "";
      if (typeof respuestaArchivo === "string") {
        urlCredencial = respuestaArchivo;
      } else if (respuestaArchivo) {
        urlCredencial = respuestaArchivo.url || respuestaArchivo.urlArchivo || respuestaArchivo.fileUrl || Object.values(respuestaArchivo)[0];
      }

      if (!urlCredencial) {
        throw new Error("El servidor no devolvió una URL válida para el archivo.");
      }

      if (!urlCredencial.startsWith("http")) {
        const baseUrl = window.location.origin;
        urlCredencial = `${baseUrl}${urlCredencial.startsWith("/") ? "" : "/"}${urlCredencial}`;
      }

      await aplicarComoTutor({
        urlCredencial: urlCredencial,
        materiaIds: materiasSeleccionadas.map(id => Number(id)),
      });

      updateLocalUser({ estadoAprobacion: "Pendiente" });
      setMensajeExito("Tu solicitud está en revisión");
      
      setTimeout(() => {
        navigate("/estado-solicitud", { replace: true });
      }, 1500);

    } catch (err) {
      console.error("Error al enviar la postulación:", err);
      setError(err.message || "No se pudo enviar la postulación. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-granite-50 dark:bg-deep-space-blue-950">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-granite-900 dark:text-white tracking-tight">
          Conviértete en Tutor
        </h1>
        
        <div className="mt-8">
          <h2 className="text-lg font-medium text-granite-900 dark:text-white border-b border-granite-200 dark:border-deep-space-blue-800 pb-2">
            Materias que deseas impartir
          </h2>
          <p className="mt-2 text-sm text-granite-500 dark:text-deep-space-blue-300">
            Selecciona una o más materias.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {materias.map((materia) => {
              const estaSeleccionada = materiasSeleccionadas.includes(materia.id);

              return (
                <button
                  key={materia.id}
                  type="button"
                  onClick={() => toggleMateria(materia.id)}
                  className={`
                    rounded-md border px-4 py-2 text-sm font-medium
                    cursor-pointer transition-all duration-200
                    ${
                      estaSeleccionada
                        ? "bg-deep-space-blue-600 border-deep-space-blue-600 text-white shadow-sm dark:bg-emerald-500 dark:border-emerald-500 dark:text-deep-space-blue-950"
                        : "bg-white border-granite-200 text-granite-700 hover:border-deep-space-blue-400 dark:bg-deep-space-blue-900/40 dark:border-deep-space-blue-800 dark:text-deep-space-blue-200 dark:hover:border-emerald-500"
                    }
                  `}
                >
                  {materia.nombre}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-medium text-granite-900 dark:text-white border-b border-granite-200 dark:border-deep-space-blue-800 pb-2">
            Comprobante
          </h2>
          <p className="mt-2 text-sm text-granite-500 dark:text-deep-space-blue-300">
            Sube tu comprobante en formato PDF o imagen.
          </p>

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setArchivo(e.target.files[0] || null)}
            className="mt-4 block w-full text-sm text-granite-600 dark:text-deep-space-blue-200
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-granite-100 file:text-granite-700
              hover:file:bg-granite-200
              dark:file:bg-deep-space-blue-800 dark:file:text-deep-space-blue-200 dark:hover:file:bg-deep-space-blue-700
              cursor-pointer"
          />
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-medium text-granite-900 dark:text-white border-b border-granite-200 dark:border-deep-space-blue-800 pb-2">
            Cuestionario introductorio
          </h2>
          <p className="mt-2 text-sm text-granite-500 dark:text-deep-space-blue-300">
            Responde las siguientes preguntas antes de enviar tu postulación.
          </p>

          <div className="mt-6 space-y-6">
            {preguntasExamen.map((pregunta, index) => (
              <div key={pregunta.id} className="bg-white dark:bg-deep-space-blue-900/20 p-6 rounded-lg border border-granite-200 dark:border-deep-space-blue-800">
                <p className="font-medium text-granite-800 dark:text-white">
                  {index + 1}. {pregunta.pregunta}
                </p>
                <div className="mt-4 space-y-3">
                  {pregunta.opciones.map((opcion) => (
                    <label
                      key={opcion}
                      className="flex items-center gap-3 text-sm text-granite-600 dark:text-deep-space-blue-200 cursor-pointer hover:text-deep-space-blue-600 dark:hover:text-emerald-400"
                    >
                      <input
                        type="radio"
                        name={`pregunta-${pregunta.id}`}
                        value={opcion}
                        checked={respuestasExamen[pregunta.id] === opcion}
                        onChange={() =>
                          setRespuestasExamen((prev) => ({
                            ...prev,
                            [pregunta.id]: opcion,
                          }))
                        }
                        className="accent-deep-space-blue-600 dark:accent-emerald-500"
                      />
                      <span>{opcion}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {mensajeExito && (
          <div className="mt-8 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              {mensajeExito}
            </p>
          </div>
        )}

        <div className="mt-8 pb-10">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formularioValido || loading}
            className="
              w-full sm:w-auto
              rounded-md
              bg-deep-space-blue-600
              px-10
              py-3
              text-sm
              font-medium
              text-white
              cursor-pointer
              transition
              hover:bg-deep-space-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:bg-emerald-500
              dark:hover:bg-emerald-600
              dark:text-deep-space-blue-950
            "
          >
            {loading ? "Enviando postulación..." : "Enviar postulación"}
          </button>
        </div>

      </div>
    </main>
  );
}