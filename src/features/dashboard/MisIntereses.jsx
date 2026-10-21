import { useEffect, useState } from "react";
import { useNotificar } from "../../hooks/useNotificar";
import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { getMaterias, getMisIntereses, guardarIntereses } from "../../services/materiaService";
import { MateriaSelector } from "../../components/ui/MateriaSelector";
import { Page, PageHeader, PageLoading, Surface } from "../../components/ui/Page";
import { SelectionLayout, SelectionPanel } from "../../components/ui/SelectionPanel";

export default function MisIntereses() {
  const notificar = useNotificar();
  const [materias, setMaterias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  // Selección guardada en el servidor, para saber si hay cambios pendientes.
  const [guardadas, setGuardadas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

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
          setGuardadas(ids);
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

      await guardarIntereses(seleccionadas);
      notificar("Intereses guardados", { cuerpo: "Las recomendaciones del inicio ya los usan." });

      setGuardadas(seleccionadas);
    } catch (err) {
      console.error("Error al guardar intereses:", err);
      setError("No se pudieron guardar tus materias. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const pendiente =
    seleccionadas.length !== guardadas.length ||
    seleccionadas.some((id) => !guardadas.includes(id));

  if (cargando) {
    return <PageLoading label="Cargando tus intereses…" />;
  }

  return (
    <Page>
      <PageHeader
        title="Mis intereses"
        description="Las materias en las que quieres recibir ayuda. Con ellas te recomendamos tutores."
      />

      {error && (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
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
