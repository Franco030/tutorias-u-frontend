import { useEffect, useState } from "react";
import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { getMaterias } from "../../services/materiaService";
import { getTutorById, updateMisMaterias } from "../../services/tutorService";
import { useAuth } from "../../context/AuthContext";
import { MateriaSelector } from "../../components/ui/MateriaSelector";
import { Page, PageHeader, PageLoading, Surface } from "../../components/ui/Page";
import { SelectionLayout, SelectionPanel } from "../../components/ui/SelectionPanel";

const normalizarTexto = (texto = "") => {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

export default function MisMateriasTutor() {
  const { user } = useAuth();

  const [materias, setMaterias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  // Selección guardada en el servidor, para saber si hay cambios pendientes.
  const [guardadas, setGuardadas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const [todasLasMaterias, tutorData] = await Promise.all([
          getMaterias(),
          getTutorById(user.id).catch(() => null)
        ]);

        const mats = todasLasMaterias || [];
        setMaterias(mats);

        if (tutorData && tutorData.materias) {
          const nombresTutor = tutorData.materias.map(m => normalizarTexto(m));
          const idsSeleccionados = mats
            .filter(m => nombresTutor.includes(normalizarTexto(m.nombre)))
            .map(m => m.id);

          setSeleccionadas(idsSeleccionados);
          setGuardadas(idsSeleccionados);
        }

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar las materias. Intenta nuevamente.");
      } finally {
        setCargando(false);
      }
    };

    if (user?.id) {
      cargarDatos();
    }
  }, [user]);

  const toggleMateria = (id) => {
    setMensajeExito("");
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

      await updateMisMaterias(seleccionadas);
      setMensajeExito("Tus materias se actualizaron. Los estudiantes ya las ven en tu perfil.");

      setGuardadas(seleccionadas);
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (err) {
      console.error("Error al guardar materias:", err);
      setError("No se pudieron guardar tus materias. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const pendiente =
    seleccionadas.length !== guardadas.length ||
    seleccionadas.some((id) => !guardadas.includes(id));

  if (cargando) {
    return <PageLoading label="Cargando materias…" />;
  }

  return (
    <Page>
      <PageHeader
        title="Materias que imparto"
        description="Las especialidades que aparecen en tu perfil y por las que los estudiantes te encuentran."
      />

      {error && (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      {mensajeExito && (
        <MessageBar intent="success" layout="multiline">
          <MessageBarBody>{mensajeExito}</MessageBarBody>
        </MessageBar>
      )}

      <SelectionLayout
        panel={
          <SelectionPanel
            materias={materias}
            seleccionadas={seleccionadas}
            onToggle={toggleMateria}
            onGuardar={handleGuardar}
            guardando={guardando}
            pendiente={pendiente}
          />
        }
      >
        <Surface>
          <MateriaSelector
            materias={materias}
            seleccionadas={seleccionadas}
            onToggle={toggleMateria}
            disabled={guardando}
          />
        </Surface>
      </SelectionLayout>
    </Page>
  );
}
