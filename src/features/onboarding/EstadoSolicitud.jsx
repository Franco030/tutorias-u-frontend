import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button } from "@fluentui/react-components";
import { useAuth } from "../../context/AuthContext";
import { Page, PageHeader } from "../../components/ui/Page";
import { TarjetaIlustrada } from "../../components/ui/TarjetaIlustrada";
import { IlustracionRevision } from "../../components/illustrations/Ilustraciones";

export default function EstadoSolicitud() {
  const navigate = useNavigate();
  const { user, refrescarSesion } = useAuth();

  // La resolución del administrador llega sin volver a iniciar sesión.
  useEffect(() => {
    refrescarSesion();
  }, [refrescarSesion]);

  // Normalizar el estado
  const estado = user?.estadoAprobacion?.trim().toLowerCase() || "pendiente";

  let tono;
  let etiqueta;
  let titulo;
  let mensaje;

  switch (estado) {
    case "aprobado":
      tono = { color: "success" };
      etiqueta = "Aprobada";
      titulo = "Fuiste aprobado como tutor";
      mensaje = "Tu solicitud fue revisada y aceptada. Desde el inicio puedes configurar tus materias y tu disponibilidad para empezar a recibir citas.";
      break;
    case "rechazado":
      tono = { color: "danger" };
      etiqueta = "Rechazada";
      titulo = "Solicitud rechazada";
      mensaje = "Por ahora tu solicitud no cumple con los requisitos. Puedes volver a intentarlo más adelante o contactar a la administración.";
      break;
    case "pendiente":
    default:
      tono = { color: "warning" };
      etiqueta = "En revisión";
      titulo = "Solicitud en revisión";
      mensaje = "Recibimos tus credenciales y materias. La administración está revisando tu perfil; cuando responda, verás el resultado aquí.";
      break;
  }

  return (
    <Page>
      <PageHeader
        title="Tu postulación como tutor"
        description="El resultado de la revisión de tus credenciales y materias."
      />
      <TarjetaIlustrada
        ilustracion={
          <IlustracionRevision estado={estado === "aprobado" || estado === "rechazado" ? estado : "pendiente"} />
        }
        etiqueta={
          <Badge appearance="tint" color={tono.color} shape="rounded">
            {etiqueta}
          </Badge>
        }
        title={titulo}
        description={mensaje}
        action={
          <Button appearance={estado === "aprobado" ? "primary" : "secondary"} onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        }
      />
    </Page>
  );
}
