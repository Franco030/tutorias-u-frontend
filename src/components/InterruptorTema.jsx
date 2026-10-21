import { Switch } from "@fluentui/react-components";
import { useTheme } from "../context/ThemeContext";

// Interruptor de tema con etiqueta visible. Dentro de la app el tema se
// cambia desde el menú de usuario; este solo se usa en el acceso.
export function InterruptorTema({ className }) {
  const { isDark, setTheme } = useTheme();
  return (
    <Switch
      className={className}
      label="Tema oscuro"
      checked={isDark}
      onChange={(_, data) => setTheme(data.checked ? "dark" : "light")}
    />
  );
}

export default InterruptorTema;
