import { useNavigate } from "react-router-dom";
import { Link } from "@fluentui/react-components";

/*
 * Link de Fluent hacia una ruta de la app: navega con el router (sin recargar)
 * y conserva el href para abrir en otra pestaña con Ctrl/Cmd o clic central.
 */
export function EnlaceInterno({ to, children, ...props }) {
  const navigate = useNavigate();
  return (
    <Link
      href={to}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        navigate(to);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}

export default EnlaceInterno;
