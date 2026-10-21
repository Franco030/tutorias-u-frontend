import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Body1,
  Button,
  Caption1,
  Field,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Radio,
  RadioGroup,
  Spinner,
  Subtitle1,
  Text,
  tokens,
} from "@fluentui/react-components";
import { DocumentArrowUp24Regular } from "@fluentui/react-icons";
import { useAuth } from "../../context/AuthContext";
import { MateriaSelector } from "../../components/ui/MateriaSelector";
import { Page, Surface } from "../../components/ui/Page";
import { PageHero } from "../../components/ui/PageHero";
import { fotos } from "../../assets/fotos";
import { Stepper } from "../../components/ui/Stepper";

const useStyles = makeStyles({
  layout: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
    "@media (min-width: 1024px)": {
      display: "grid",
      gridTemplateColumns: "220px minmax(0, 1fr)",
      gap: tokens.spacingHorizontalXXXL,
      alignItems: "start",
    },
  },
  aside: {
    "@media (min-width: 1024px)": {
      position: "sticky",
      top: tokens.spacingVerticalXXL,
    },
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
    minWidth: 0,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
    scrollMarginTop: tokens.spacingVerticalXXL,
    ":focus-visible": {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: "2px",
    },
  },
  sectionHead: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  upload: {
    display: "grid",
    gridTemplateColumns: "24px minmax(0, 1fr)",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusMedium,
    border: `${tokens.strokeWidthThin} dashed ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground2,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "24px minmax(0, 1fr) auto",
    },
    "& > button": {
      gridColumn: "1 / -1",
      "@media (min-width: 640px)": {
        gridColumn: "auto",
      },
    },
  },
  uploadIcon: {
    color: tokens.colorNeutralForeground3,
  },
  uploadText: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  fileName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  hiddenInput: {
    display: "none",
  },
  questions: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
  },
  submitRow: {
    display: "flex",
    flexDirection: "column-reverse",
    gap: tokens.spacingVerticalS,
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: tokens.spacingHorizontalL,
    },
  },
});

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

const TAMANO_MAXIMO_ARCHIVO = 5 * 1024 * 1024;
const TIPOS_ARCHIVO = /\.(pdf|png|jpe?g|webp)$/i;

export default function AplicacionTutor() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { updateLocalUser } = useAuth();
  const inputArchivo = useRef(null);

  const [materias, setMaterias] = useState([]);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState("");

  // Mismas reglas que el backend (ValidadorArchivos): PDF o imagen de hasta 5 MB.
  const elegirArchivo = (elegido) => {
    if (elegido && elegido.size > TAMANO_MAXIMO_ARCHIVO) {
      setArchivo(null);
      setErrorArchivo("El archivo supera los 5 MB. Elige uno más ligero.");
      return;
    }
    if (elegido && !TIPOS_ARCHIVO.test(elegido.name)) {
      setArchivo(null);
      setErrorArchivo("Solo se aceptan archivos PDF, PNG, JPG o WEBP.");
      return;
    }
    setErrorArchivo("");
    setArchivo(elegido);
  };
  const [respuestasExamen, setRespuestasExamen] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [cargandoMaterias, setCargandoMaterias] = useState(true);

  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        setError("");
        const data = await getMaterias();
        setMaterias(data);
      } catch (err) {
        console.error("Error al cargar materias:", err);
        setError(err.message || "No se pudieron cargar las materias.");
      } finally {
        setCargandoMaterias(false);
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

  const pasos = [
    {
      id: "materias",
      titulo: "Materias",
      completo: materiasSeleccionadas.length > 0,
      pendiente: "Elige al menos una",
    },
    {
      id: "comprobante",
      titulo: "Comprobante",
      completo: archivo !== null,
      pendiente: "Sube un archivo",
    },
    {
      id: "cuestionario",
      titulo: "Cuestionario",
      completo: Object.keys(respuestasExamen).length === preguntasExamen.length,
      pendiente: `${Object.keys(respuestasExamen).length} de ${preguntasExamen.length} respondidas`,
    },
  ];
  const pendientes = pasos.filter((paso) => !paso.completo).map((paso) => paso.titulo.toLowerCase());

  return (
    <Page cargando={cargandoMaterias}>
      <PageHero
        title="Conviértete en tutor"
        description="Comparte lo que dominas con otros estudiantes. Completa las tres partes; la administración revisa tu postulación antes de habilitarte."
        foto={fotos.pizarron}
      />

      <div className={styles.layout}>
        <aside className={styles.aside}>
          <Stepper pasos={pasos} label="Progreso de la postulación" />
        </aside>

        <div className={styles.content}>
          <Surface as="section" id="materias" tabIndex={-1} aria-labelledby="titulo-materias" className={styles.section}>
            <div className={styles.sectionHead}>
              <Subtitle1 as="h2" id="titulo-materias">
                1. Materias que deseas impartir
              </Subtitle1>
              <Body1 className={styles.muted}>Selecciona una o más. Podrás ajustarlas una vez aprobado.</Body1>
            </div>
            <MateriaSelector
              materias={materias}
              cargando={cargandoMaterias}
              seleccionadas={materiasSeleccionadas}
              onToggle={toggleMateria}
              disabled={loading}
            />
          </Surface>

          <Surface as="section" id="comprobante" tabIndex={-1} aria-labelledby="titulo-comprobante" className={styles.section}>
            <div className={styles.sectionHead}>
              <Subtitle1 as="h2" id="titulo-comprobante">
                2. Comprobante
              </Subtitle1>
              <Body1 className={styles.muted}>
                Un documento que respalde tu dominio de las materias (kárdex, constancia, certificado). PDF o imagen de hasta 5 MB.
              </Body1>
            </div>
            <div className={styles.upload}>
              <DocumentArrowUp24Regular className={styles.uploadIcon} aria-hidden="true" />
              <div className={styles.uploadText}>
                <Text weight="semibold" className={styles.fileName}>
                  {archivo ? archivo.name : "Ningún archivo seleccionado"}
                </Text>
                <Caption1 className={styles.muted}>
                  {archivo ? `${(archivo.size / 1024 / 1024).toFixed(1)} MB` : "PDF, PNG, JPG o WEBP"}
                </Caption1>
              </div>
              <Button
                appearance={archivo ? "secondary" : "primary"}
                onClick={() => inputArchivo.current?.click()}
                disabled={loading}
              >
                {archivo ? "Cambiar archivo" : "Elegir archivo"}
              </Button>
              <input
                ref={inputArchivo}
                id="file-upload"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => elegirArchivo(e.target.files[0] || null)}
                className={styles.hiddenInput}
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>
            {errorArchivo && (
              <MessageBar intent="error" layout="multiline">
                <MessageBarBody>{errorArchivo}</MessageBarBody>
              </MessageBar>
            )}
          </Surface>

          <Surface as="section" id="cuestionario" tabIndex={-1} aria-labelledby="titulo-cuestionario" className={styles.section}>
            <div className={styles.sectionHead}>
              <Subtitle1 as="h2" id="titulo-cuestionario">
                3. Cuestionario introductorio
              </Subtitle1>
              <Body1 className={styles.muted}>Tres preguntas sobre cómo das una tutoría.</Body1>
            </div>
            <div className={styles.questions}>
              {preguntasExamen.map((pregunta, index) => (
                <Field key={pregunta.id} label={`${index + 1}. ${pregunta.pregunta}`} required>
                  <RadioGroup
                    name={`pregunta-${pregunta.id}`}
                    value={respuestasExamen[pregunta.id] || ""}
                    onChange={(_, data) =>
                      setRespuestasExamen((prev) => ({
                        ...prev,
                        [pregunta.id]: data.value,
                      }))
                    }
                    disabled={loading}
                  >
                    {pregunta.opciones.map((opcion) => (
                      <Radio key={opcion} value={opcion} label={opcion} />
                    ))}
                  </RadioGroup>
                </Field>
              ))}
            </div>
          </Surface>

          {error && (
            <MessageBar intent="error" layout="multiline">
              <MessageBarBody>{error}</MessageBarBody>
            </MessageBar>
          )}

          {mensajeExito && (
            <MessageBar intent="success" layout="multiline">
              <MessageBarBody>{mensajeExito}. Te llevamos al estado de tu solicitud…</MessageBarBody>
            </MessageBar>
          )}

          <div className={styles.submitRow}>
            <Caption1 className={styles.muted} role="status">
              {pendientes.length === 0
                ? "Todo listo para enviar."
                : `Falta completar: ${pendientes.join(", ")}.`}
            </Caption1>
            <Button
              appearance="primary"
              size="large"
              onClick={handleSubmit}
              disabled={!formularioValido || loading}
              icon={loading ? <Spinner size="tiny" /> : undefined}
            >
              {loading ? "Enviando postulación…" : "Enviar postulación"}
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}
