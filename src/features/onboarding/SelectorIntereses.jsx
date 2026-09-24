import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  getMaterias,
  guardarIntereses,
} from "../../services/materiaService";

import imagen1 from "../../assets/onboarding/intereses-1.jpg";
import imagen2 from "../../assets/onboarding/intereses-2.jpg";
import imagen3 from "../../assets/onboarding/intereses-3.jpg";

const imagenes = [
  {
    src: imagen1,
    titulo: "Aprende a tu manera",
    descripcion:
      "Encuentra tutorías relacionadas con las materias que más te interesan.",
  },
  {
    src: imagen2,
    titulo: "Conecta con tus tutores",
    descripcion:
      "Descubre personas y recursos que pueden ayudarte a seguir aprendiendo.",
  },
  {
    src: imagen3,
    titulo: "Personaliza tu experiencia",
    descripcion:
      "Tus intereses nos ayudan a mostrarte contenido más relevante.",
  },
];

const normalizarTexto = (texto = "") => {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

import { useAuth } from "../../context/AuthContext";

export default function SelectorIntereses() {
  const navigate = useNavigate();
  const { markOnboardingAsComplete } = useAuth();

  const [materias, setMaterias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [cargandoMaterias, setCargandoMaterias] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [imagenActual, setImagenActual] = useState(0);

  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        setCargandoMaterias(true);
        setError("");

        const data = await getMaterias();

        setMaterias(data);
      } catch (err) {
        console.error("Error al cargar materias:", err);

        setError(
          err.message || "No se pudieron cargar las materias."
        );
      } finally {
        setCargandoMaterias(false);
      }
    };

    cargarMaterias();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setImagenActual((actual) =>
        actual === imagenes.length - 1 ? 0 : actual + 1
      );
    }, 5000);

    return () => clearInterval(interval);
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
    if (seleccionadas.length === 0) {
      return;
    }

    try {
      setGuardando(true);
      setError("");

      await guardarIntereses(seleccionadas);
      
      markOnboardingAsComplete();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error al guardar intereses:", err);

      setError(
        err.message ||
          "No se pudieron guardar tus materias. Intenta nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleOmitir = () => {
    markOnboardingAsComplete();
    navigate("/", { replace: true });
  };

  if (cargandoMaterias) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-granite-50 dark:bg-deep-space-blue-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-deep-space-blue-200 border-t-deep-space-blue-600 dark:border-deep-space-blue-800 dark:border-t-emerald-400 animate-spin"></div>
          <p className="text-deep-space-blue-600 dark:text-emerald-400 font-medium">Cargando materias...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-granite-50 dark:bg-deep-space-blue-950">
      <div className="min-h-screen grid lg:grid-cols-2">

        {/* IZQUIERDA — Selección de materias */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-xl">

            <div className="mb-10">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-deep-space-blue-500 dark:text-emerald-400 mb-3">
                Personaliza tu experiencia
              </p>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-granite-900 dark:text-white">
                ¿Qué materias te interesan?
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-granite-500 dark:text-deep-space-blue-300">
                Selecciona las materias que te gustaría explorar.
                Podrás modificar tus intereses más adelante.
              </p>
            </div>

            {/* Buscador */}
            <div className="mb-6">
              <label
                htmlFor="buscar-materia"
                className="sr-only"
              >
                Buscar materia
              </label>

              <input
                id="buscar-materia"
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar materia"
                autoComplete="off"
                className="
                  w-full
                  rounded-md
                  border
                  border-granite-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-granite-900
                  outline-none
                  transition-colors
                  placeholder:text-granite-400
                  focus:border-deep-space-blue-500
                  dark:border-deep-space-blue-800
                  dark:bg-deep-space-blue-900/40
                  dark:text-white
                  dark:placeholder:text-deep-space-blue-400
                  dark:focus:border-emerald-500
                "
              />
            </div>

            {/* Chips */}
            {materiasFiltradas.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-8">
                {materiasFiltradas.map((materia) => {
                  const estaSeleccionada =
                    seleccionadas.includes(materia.id);

                  return (
                    <button
                      key={materia.id}
                      type="button"
                      onClick={() => toggleMateria(materia.id)}
                      aria-pressed={estaSeleccionada}
                      className={`
                        rounded-md
                        border
                        px-4
                        py-2
                        text-sm
                        font-medium
                        cursor-pointer
                        transition-all
                        duration-200
                        ${
                          estaSeleccionada
                            ? `
                              bg-deep-space-blue-600
                              border-deep-space-blue-600
                              text-white
                              dark:bg-emerald-500
                              dark:border-emerald-500
                              dark:text-deep-space-blue-950
                            `
                            : `
                              bg-white
                              border-granite-200
                              text-granite-700
                              hover:border-deep-space-blue-400
                              hover:bg-deep-space-blue-50
                              dark:bg-deep-space-blue-900/40
                              dark:border-deep-space-blue-800
                              dark:text-deep-space-blue-200
                              dark:hover:border-emerald-500
                            `
                        }
                      `}
                    >
                      {materia.nombre}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mb-8 rounded-md border border-granite-200 bg-white px-5 py-6 text-center dark:border-deep-space-blue-800 dark:bg-deep-space-blue-900/40">
                <p className="text-sm text-granite-500 dark:text-deep-space-blue-300">
                  No se encontraron materias que coincidan con
                  {" "}
                  <span className="font-medium text-granite-700 dark:text-white">
                    “{busqueda}”
                  </span>
                  .
                </p>
              </div>
            )}

            <p className="text-xs text-granite-400 dark:text-deep-space-blue-400 mb-6">
              {seleccionadas.length === 0
                ? "Aún no has seleccionado ninguna materia."
                : `${seleccionadas.length} ${
                    seleccionadas.length === 1
                      ? "materia seleccionada"
                      : "materias seleccionadas"
                  }`}
            </p>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-md border border-burgundy-200 bg-burgundy-50 px-4 py-3 text-sm text-burgundy-700"
              >
                {error}
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col gap-3">

              <button
                type="button"
                onClick={handleGuardar}
                disabled={
                  guardando || seleccionadas.length === 0
                }
                className="
                  w-full
                  rounded-md
                  bg-deep-space-blue-600
                  px-8
                  py-3
                  text-sm
                  font-medium
                  text-white
                  cursor-pointer
                  transition
                  hover:bg-deep-space-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  dark:bg-emerald-500
                  dark:text-deep-space-blue-950
                "
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar y Continuar"}
              </button>

              <button
                type="button"
                onClick={handleOmitir}
                disabled={guardando}
                className="
                  w-full
                  py-2
                  text-sm
                  font-medium
                  text-granite-500
                  hover:text-deep-space-blue-600
                  dark:text-deep-space-blue-300
                  dark:hover:text-emerald-400
                  cursor-pointer
                  transition-colors
                  disabled:opacity-50
                "
              >
                Omitir por ahora
              </button>

            </div>
          </div>
        </section>

        {/* DERECHA — Carrusel */}
        <section className="hidden lg:block relative overflow-hidden bg-deep-space-blue-950">

          <AnimatePresence mode="wait">
            <motion.img
              key={imagenActual}
              src={imagenes[imagenActual].src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-deep-space-blue-950/90 via-deep-space-blue-950/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-12">

            <AnimatePresence mode="wait">
              <motion.div
                key={imagenActual}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-3xl font-medium text-white mb-3">
                  {imagenes[imagenActual].titulo}
                </h2>

                <p className="max-w-md text-sm leading-relaxed text-white/70">
                  {imagenes[imagenActual].descripcion}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 mt-7">
              {imagenes.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Mostrar imagen ${index + 1}`}
                  onClick={() => setImagenActual(index)}
                  className={`
                    h-1.5
                    rounded-full
                    cursor-pointer
                    transition-all
                    duration-300
                    ${
                      index === imagenActual
                        ? "w-8 bg-white"
                        : "w-1.5 bg-white/40 hover:bg-white/70"
                    }
                  `}
                />
              ))}
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}