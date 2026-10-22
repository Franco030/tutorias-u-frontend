import { Dropdown, Field, Input, makeStyles, Option, Subtitle2, tokens } from "@fluentui/react-components";
import { Surface } from "../../../components/ui/Page";
import { esEnlaceWeb } from "../../../lib/enlaces";

const OPCIONES_ANTELACION = [
  { horas: 0, texto: "Sin mínimo" },
  { horas: 1, texto: "1 hora" },
  { horas: 2, texto: "2 horas" },
  { horas: 6, texto: "6 horas" },
  { horas: 12, texto: "12 horas" },
  { horas: 24, texto: "1 día" },
  { horas: 48, texto: "2 días" },
  { horas: 72, texto: "3 días" },
];

const useStyles = makeStyles({
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
    maxWidth: "640px",
  },
});

/*
 * Preferencias de reserva del tutor: con cuánta anticipación aceptan citas
 * y el enlace de videollamada que se usa por defecto al aceptar una.
 */
export function PreferenciasReserva({ preferencias, onCambiar, deshabilitado = false }) {
  const styles = useStyles();
  const { antelacionMinimaHoras, linkReunion } = preferencias;
  const opciones = OPCIONES_ANTELACION.some((o) => o.horas === antelacionMinimaHoras)
    ? OPCIONES_ANTELACION
    : [...OPCIONES_ANTELACION, { horas: antelacionMinimaHoras, texto: `${antelacionMinimaHoras} horas` }];
  const enlaceInvalido = Boolean(linkReunion?.trim()) && !esEnlaceWeb(linkReunion.trim());

  return (
    <Surface as="section" className={styles.panel} aria-labelledby="titulo-reservas">
      <Subtitle2 as="h2" id="titulo-reservas">
        Cómo te reservan
      </Subtitle2>

      <Field
        label="Anticipación mínima para reservar"
        hint="Los estudiantes no podrán agendar horarios que empiecen antes de este plazo."
      >
        <Dropdown
          value={opciones.find((o) => o.horas === antelacionMinimaHoras)?.texto ?? ""}
          selectedOptions={[String(antelacionMinimaHoras)]}
          onOptionSelect={(_, data) =>
            onCambiar({ ...preferencias, antelacionMinimaHoras: Number(data.optionValue) })
          }
          disabled={deshabilitado}
        >
          {opciones.map((opcion) => (
            <Option key={opcion.horas} value={String(opcion.horas)}>
              {opcion.texto}
            </Option>
          ))}
        </Dropdown>
      </Field>

      <Field
        label="Enlace fijo de videollamada"
        hint="Se llena solo al aceptar una cita; puedes cambiarlo en cada una. Déjalo vacío para escribirlo cada vez."
        validationState={enlaceInvalido ? "error" : "none"}
        validationMessage={enlaceInvalido ? "Escribe una dirección web completa (https://…)." : undefined}
      >
        <Input
          type="url"
          value={linkReunion ?? ""}
          onChange={(_, data) => onCambiar({ ...preferencias, linkReunion: data.value })}
          maxLength={255}
          placeholder="https://meet.google.com/…"
          disabled={deshabilitado}
        />
      </Field>
    </Surface>
  );
}

export default PreferenciasReserva;
