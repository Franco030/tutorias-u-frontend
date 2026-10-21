import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Body1,
  Button,
  makeStyles,
  Title2,
  tokens,
} from "@fluentui/react-components";
import { useAuth } from "../../context/AuthContext";
import { Page, Surface } from "../../components/ui/Page";
import { IlustracionRevision } from "../../components/illustrations/Ilustraciones";

const useStyles = makeStyles({
  banner: {
    height: "200px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingHorizontalXL,
    "@media (min-width: 640px)": {
      padding: tokens.spacingHorizontalXXXL,
    },
  },
  title: {
    margin: 0,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
    maxWidth: "60ch",
  },
});

export default function EstadoSolicitud() {
  const styles = useStyles();
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
    <Page narrow>
      <Surface flush>
        <div className={styles.banner}>
          <IlustracionRevision estado={estado === "aprobado" || estado === "rechazado" ? estado : "pendiente"} />
        </div>
        <div className={styles.card}>
          <Badge appearance="tint" color={tono.color} shape="rounded">
            {etiqueta}
          </Badge>
          <Title2 as="h1" className={styles.title}>
            {titulo}
          </Title2>
          <Body1 className={styles.muted}>{mensaje}</Body1>
          <Button appearance={estado === "aprobado" ? "primary" : "secondary"} onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        </div>
      </Surface>
    </Page>
  );
}
