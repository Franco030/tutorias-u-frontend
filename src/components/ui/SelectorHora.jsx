import { useState } from "react";
import { makeStyles, mergeClasses } from "@fluentui/react-components";
import { TimePicker } from "@fluentui/react-timepicker-compat";

const useStyles = makeStyles({
  // El combobox de Fluent trae un ancho mínimo de 250 px: aquí ocupa su columna.
  root: {
    minWidth: 0,
    width: "100%",
  },
});

// Fecha fija: el TimePicker trabaja con Date, aquí solo importa la hora.
const ANCLA = new Date(2000, 0, 1);

const aFecha = (hora) => {
  const coincidencia = /^(\d{2}):(\d{2})$/.exec(hora ?? "");
  if (!coincidencia) return null;
  const fecha = new Date(ANCLA);
  fecha.setHours(Number(coincidencia[1]), Number(coincidencia[2]), 0, 0);
  return fecha;
};

const aTexto = (fecha) =>
  `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`;

/*
 * Selector de hora de Fluent 2 (combobox con la lista del día cada 30 min y
 * 24 h) que también acepta escribir una hora como "09:15". Trabaja con texto
 * "HH:mm": `onChange("")` si lo escrito no es una hora válida. Va dentro de un
 * <Field>, que le da la etiqueta y el mensaje de error.
 */
export function SelectorHora({ value, onChange, disabled, className, ...props }) {
  const styles = useStyles();
  const [texto, setTexto] = useState(value ?? "");
  const [anterior, setAnterior] = useState(value);

  // El valor puede cambiar desde fuera (p. ej. al reiniciar el formulario).
  if (value !== anterior) {
    setAnterior(value);
    setTexto(value ?? "");
  }

  return (
    <TimePicker
      {...props}
      className={mergeClasses(styles.root, className)}
      // Lista de horas de alto contenido (unas 7 opciones), debajo del campo.
      listbox={{ style: { maxHeight: "264px" } }}
      // Sin autoSize: si no, el posicionamiento estira la lista hasta el
      // borde de la ventana e ignora el alto máximo.
      positioning={{ position: "below", align: "start", autoSize: false, fallbackPositions: ["above-start"] }}
      freeform
      hourCycle="h23"
      increment={30}
      dateAnchor={ANCLA}
      formatDateToTimeString={aTexto}
      selectedTime={aFecha(value)}
      value={texto}
      disabled={disabled}
      onInput={(event) => setTexto(event.target.value)}
      onTimeChange={(_, data) => {
        const hora = data.selectedTime ? aTexto(data.selectedTime) : "";
        setTexto(data.selectedTime ? hora : data.selectedTimeText ?? "");
        onChange(hora);
      }}
    />
  );
}

export default SelectorHora;
