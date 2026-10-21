import { Switch, Tooltip } from "@fluentui/react-components";
import { useTheme } from "../context/ThemeContext";

// Interruptor de tema del acceso, sin etiqueta visible (nombre accesible y
// tooltip). Dentro de la app el tema se cambia desde el menú de usuario.
export function InterruptorTema({ className }) {
  const { isDark, setTheme } = useTheme();
  return (
    <Tooltip content="Tema oscuro" relationship="label" withArrow>
      <Switch
        className={className}
        checked={isDark}
        onChange={(_, data) => setTheme(data.checked ? "dark" : "light")}
      />
    </Tooltip>
  );
}

export default InterruptorTema;
