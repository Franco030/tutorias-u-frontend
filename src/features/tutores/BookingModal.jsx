import { useEffect, useMemo, useState } from "react";
import {
  Body1,
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Field,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Option,
  Radio,
  RadioGroup,
  Spinner,
  Subtitle1,
  tokens,
} from "@fluentui/react-components";
import { CheckmarkCircle48Regular, Dismiss24Regular } from "@fluentui/react-icons";
import { agendarCita, getHorasOcupadas } from "../../services/citaService";
import { getMaterias } from "../../services/materiaService";
import { getDisponibilidadTutor } from "../../services/tutorService";

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const FECHA_DIAS_FUTUROS = 90;

const normalizarBloque = (bloque) => ({
  diaSemana: Number(bloque.diaSemana ?? bloque.DiaSemana),
  horaInicio: String(bloque.horaInicio ?? bloque.HoraInicio).slice(0, 5),
  horaFin: String(bloque.horaFin ?? bloque.HoraFin).slice(0, 5),
});

const fechaComoClave = (fecha) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

const crearFechaHoraUtc = (fecha, hora) => `${fecha}T${hora}:00.000Z`;

const useStyles = makeStyles({
  surface: {
    width: "min(560px, calc(100vw - 32px))",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  slots: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
    columnGap: tokens.spacingHorizontalS,
  },
  slotLabel: {
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  success: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalS,
    paddingBlock: tokens.spacingVerticalM,
  },
  successIcon: {
    color: tokens.colorPaletteGreenForeground1,
  },
});

export default function BookingModal({
  isOpen,
  onClose,
  tutorId,
  materiasDisponibles,
}) {
  const [materiaId, setMateriaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState("");
  const [materias, setMaterias] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [cargandoOcupados, setCargandoOcupados] = useState(false);
  const [errorOcupados, setErrorOcupados] = useState("");
  const [cargando, setCargando] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;

    let activo = true;
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");
        setMensajeExito("");
        setMateriaId("");
        setFecha("");
        setBloqueSeleccionado("");
        setMaterias([]);
        setDisponibilidad([]);
        setHorariosOcupados([]);
        setErrorOcupados("");

        const [catalogo, bloquesTutor] = await Promise.all([
          getMaterias(),
          getDisponibilidadTutor(tutorId),
        ]);

        if (!activo) return;

        const nombresDisponibles = new Set(
          (materiasDisponibles || []).map((nombre) =>
            nombre.trim().toLowerCase()
          )
        );
        setMaterias(
          (catalogo || []).filter((materia) =>
            nombresDisponibles.has(materia.nombre.trim().toLowerCase())
          )
        );
        setDisponibilidad(
          (Array.isArray(bloquesTutor) ? bloquesTutor : []).map(
            normalizarBloque
          )
        );
      } catch (err) {
        console.error("Error al cargar datos de la reserva:", err);
        if (activo) {
          setError(
            "No se pudieron cargar las materias y horarios del tutor."
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDatos();
    return () => {
      activo = false;
    };
  }, [isOpen, tutorId, materiasDisponibles]);

  useEffect(() => {
    if (!isOpen || !fecha) return undefined;

    let activo = true;
    const cargarHorariosOcupados = async () => {
      try {
        setCargandoOcupados(true);
        setErrorOcupados("");
        setHorariosOcupados([]);
        const horarios = await getHorasOcupadas(tutorId, fecha);
        if (!Array.isArray(horarios)) {
          throw new Error("La respuesta de horarios ocupados no es válida.");
        }
        if (activo) {
          setHorariosOcupados(horarios);
        }
      } catch (err) {
        console.error("Error al consultar los horarios ocupados:", err);
        if (activo) {
          setErrorOcupados(
            "No se pudieron verificar los horarios ocupados. Intenta nuevamente."
          );
        }
      } finally {
        if (activo) setCargandoOcupados(false);
      }
    };

    cargarHorariosOcupados();
    return () => {
      activo = false;
    };
  }, [isOpen, fecha, tutorId]);

  const opcionesFecha = useMemo(() => {
    const hoy = new Date();
    const opciones = [];

    for (let offset = 0; offset < FECHA_DIAS_FUTUROS; offset += 1) {
      const dia = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate() + offset
      );
      const clave = fechaComoClave(dia);
      const bloquesDelDia = disponibilidad.filter(
        (bloque) => bloque.diaSemana === dia.getDay()
      );
      const tieneHorarioFuturo = bloquesDelDia.some(
        (bloque) =>
          new Date(crearFechaHoraUtc(clave, bloque.horaInicio)) > new Date()
      );

      opciones.push({
        value: clave,
        label: `${DIAS_SEMANA[dia.getDay()]}, ${dia.toLocaleDateString("es-MX", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
        disabled: !tieneHorarioFuturo,
      });
    }
    return opciones;
  }, [disponibilidad]);

  const bloquesDisponibles = useMemo(() => {
    if (!fecha) return [];
    const ahora = new Date();
    const diaSemana = new Date(`${fecha}T12:00:00`).getDay();

    return disponibilidad.filter(
      (bloque) =>
        bloque.diaSemana === diaSemana &&
        new Date(crearFechaHoraUtc(fecha, bloque.horaInicio)) > ahora
    ).map((bloque) => ({
      ...bloque,
      ocupado: horariosOcupados.includes(bloque.horaInicio),
    }));
  }, [disponibilidad, fecha, horariosOcupados]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setMensajeExito("");

    if (errorOcupados) {
      setError(errorOcupados);
      return;
    }
    if (!materiaId) {
      setError("Selecciona una materia.");
      return;
    }
    if (!fecha || !bloqueSeleccionado) {
      setError("Selecciona una fecha y un bloque de horario disponible.");
      return;
    }

    const bloque = bloquesDisponibles[Number(bloqueSeleccionado)];
    if (!bloque || bloque.ocupado) {
      setError("El horario seleccionado ya no está disponible.");
      return;
    }

    const fechaHoraInicio = crearFechaHoraUtc(fecha, bloque.horaInicio);
    const fechaHoraFin = crearFechaHoraUtc(fecha, bloque.horaFin);
    if (new Date(fechaHoraInicio) <= new Date()) {
      setError("No puedes agendar una cita en una fecha u hora pasada.");
      return;
    }

    try {
      setSubmitting(true);
      await agendarCita({
        tutorId: Number(tutorId),
        materiaId: Number(materiaId),
        fechaHoraInicio,
        fechaHoraFin,
      });

      setMensajeExito(
        "Tu solicitud de cita quedó en estado Pendiente."
      );
      setMateriaId("");
      setFecha("");
      setBloqueSeleccionado("");
    } catch (err) {
      console.error("Error al agendar la cita:", err);
      setError(
        err.message || "No se pudo agendar la cita. Intenta nuevamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const styles = useStyles();
  const fechasDisponibles = opcionesFecha.filter((opcion) => !opcion.disabled);
  const fechaSeleccionada = opcionesFecha.find((opcion) => opcion.value === fecha);
  const materiaSeleccionada = materias.find((materia) => String(materia.id) === materiaId);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(_, data) => {
        if (!data.open && !submitting) onClose();
      }}
    >
      <DialogSurface className={styles.surface}>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  aria-label="Cerrar"
                  icon={<Dismiss24Regular />}
                  onClick={onClose}
                  disabled={submitting}
                />
              }
            >
              Agendar cita
            </DialogTitle>

            <DialogContent>
              {mensajeExito ? (
                <div className={styles.success} role="status">
                  <CheckmarkCircle48Regular className={styles.successIcon} aria-hidden="true" />
                  <Subtitle1>Solicitud enviada</Subtitle1>
                  <Body1 className={styles.muted}>
                    {mensajeExito} El tutor la revisará y la verás en “Mis tutorías”.
                  </Body1>
                </div>
              ) : (
                <div className={styles.form}>
                  <Body1 className={styles.muted}>
                    Elige la materia y uno de los horarios que el tutor tiene disponibles.
                  </Body1>

                  <Field label="Materia" required>
                    <Dropdown
                      id="materia"
                      placeholder={cargando ? "Cargando materias…" : "Selecciona una materia"}
                      value={materiaSeleccionada?.nombre || ""}
                      selectedOptions={materiaId ? [materiaId] : []}
                      onOptionSelect={(_, data) => setMateriaId(data.optionValue || "")}
                      disabled={cargando || submitting}
                    >
                      {materias.map((materia) => (
                        <Option key={materia.id} value={String(materia.id)}>
                          {materia.nombre}
                        </Option>
                      ))}
                    </Dropdown>
                  </Field>

                  <Field
                    label="Fecha"
                    required
                    hint={
                      !cargando && disponibilidad.length > 0
                        ? "Solo se muestran los días en que el tutor atiende."
                        : undefined
                    }
                  >
                    <Dropdown
                      id="fecha"
                      placeholder="Selecciona una fecha"
                      value={fechaSeleccionada?.label || ""}
                      selectedOptions={fecha ? [fecha] : []}
                      onOptionSelect={(_, data) => {
                        const valor = data.optionValue || "";
                        setFecha(valor);
                        setBloqueSeleccionado("");
                        setHorariosOcupados([]);
                        setErrorOcupados("");
                        setCargandoOcupados(Boolean(valor));
                      }}
                      disabled={cargando || submitting || fechasDisponibles.length === 0}
                    >
                      {fechasDisponibles.map((opcion) => (
                        <Option key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </Option>
                      ))}
                    </Dropdown>
                  </Field>

                  {fecha && (
                    <Field
                      label="Horario disponible"
                      required
                      validationState={errorOcupados ? "error" : "none"}
                      validationMessage={errorOcupados || undefined}
                    >
                      {cargandoOcupados ? (
                        <Spinner size="tiny" label="Verificando compromisos del tutor…" labelPosition="after" />
                      ) : bloquesDisponibles.length === 0 ? (
                        <Caption1 className={styles.muted}>No quedan horarios este día.</Caption1>
                      ) : (
                        <RadioGroup
                          value={bloqueSeleccionado}
                          onChange={(_, data) => setBloqueSeleccionado(data.value)}
                          disabled={submitting}
                          className={styles.slots}
                        >
                          {bloquesDisponibles.map((bloque, indice) => (
                            <Radio
                              key={`${bloque.horaInicio}-${indice}`}
                              value={String(indice)}
                              disabled={bloque.ocupado}
                              label={
                                <span className={styles.slotLabel}>
                                  {bloque.horaInicio} – {bloque.horaFin}
                                  {bloque.ocupado ? " · ocupado" : ""}
                                </span>
                              }
                            />
                          ))}
                        </RadioGroup>
                      )}
                    </Field>
                  )}

                  {cargando && <Spinner size="tiny" label="Cargando horarios…" labelPosition="after" />}

                  {!cargando && disponibilidad.length === 0 && !error && (
                    <MessageBar intent="info" layout="multiline">
                      <MessageBarBody>Este tutor aún no tiene horarios disponibles para reservar.</MessageBarBody>
                    </MessageBar>
                  )}

                  {error && (
                    <MessageBar intent="error" layout="multiline">
                      <MessageBarBody>{error}</MessageBarBody>
                    </MessageBar>
                  )}
                </div>
              )}
            </DialogContent>

            <DialogActions>
              {mensajeExito ? (
                <Button appearance="primary" onClick={onClose}>
                  Cerrar
                </Button>
              ) : (
                <>
                  <Button appearance="secondary" onClick={onClose} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    appearance="primary"
                    disabled={
                      cargando ||
                      submitting ||
                      cargandoOcupados ||
                      Boolean(errorOcupados) ||
                      disponibilidad.length === 0
                    }
                    icon={submitting ? <Spinner size="tiny" /> : undefined}
                  >
                    {submitting ? "Agendando…" : "Confirmar cita"}
                  </Button>
                </>
              )}
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
