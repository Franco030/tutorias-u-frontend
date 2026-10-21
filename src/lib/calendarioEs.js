import { defaultCalendarStrings } from "@fluentui/react-calendar-compat";

// Textos del calendario de Fluent en español (México).
export const calendarioEs = {
  ...defaultCalendarStrings,
  months: [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ],
  shortMonths: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  days: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  shortDays: ["D", "L", "M", "X", "J", "V", "S"],
  goToToday: "Ir a hoy",
  prevMonthAriaLabel: "Mes anterior",
  nextMonthAriaLabel: "Mes siguiente",
  prevYearAriaLabel: "Año anterior",
  nextYearAriaLabel: "Año siguiente",
  prevYearRangeAriaLabel: "Años anteriores",
  nextYearRangeAriaLabel: "Años siguientes",
  closeButtonAriaLabel: "Cerrar",
  selectedDateFormatString: "Fecha seleccionada: {0}",
  todayDateFormatString: "Hoy, {0}",
  monthPickerHeaderAriaLabel: "{0}, cambiar año",
  yearPickerHeaderAriaLabel: "{0}, cambiar mes",
  dayMarkedAriaLabel: "marcado",
};

export default calendarioEs;
