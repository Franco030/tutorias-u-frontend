import { MotionBehaviourProvider } from "@fluentui/react-motion";
import { Calendar, DayOfWeek } from "@fluentui/react-calendar-compat";
import { calendarioEs } from "../../lib/calendarioEs";

/*
 * Calendar de Fluent con los textos en español y la semana empezando en lunes.
 *
 * Va sin la animación de cambio de mes: en @fluentui/react-calendar-compat
 * 0.4.8, después de ir a un mes anterior, el siguiente render (elegir un día,
 * escribir en un campo cercano) vuelve a montar las filas y la animación se
 * repite, y el calendario parpadea.
 */
export function Calendario(props) {
  return (
    <MotionBehaviourProvider value="skip">
      <Calendar
        strings={calendarioEs}
        firstDayOfWeek={DayOfWeek.Monday}
        showGoToToday={false}
        isMonthPickerVisible={false}
        highlightSelectedMonth
        {...props}
      />
    </MotionBehaviourProvider>
  );
}

export default Calendario;
