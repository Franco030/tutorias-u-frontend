import { Badge } from "@fluentui/react-components";

const ESTADOS = {
  pendiente: { color: "warning", label: "Pendiente" },
  aceptada: { color: "brand", label: "Aceptada" },
  completada: { color: "success", label: "Completada" },
  cancelada: { color: "subtle", label: "Cancelada" },
  rechazada: { color: "danger", label: "Rechazada" },
};

export function EstadoBadge({ estado }) {
  const clave = estado?.trim().toLowerCase() || "aceptada";
  const config = ESTADOS[clave] || { color: "informative", label: estado };

  return (
    <Badge appearance="tint" color={config.color} shape="rounded">
      {config.label}
    </Badge>
  );
}

export default EstadoBadge;
