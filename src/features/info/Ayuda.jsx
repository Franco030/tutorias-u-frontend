import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Body1,
  Button,
  Caption1,
  makeStyles,
  Subtitle2,
  tokens,
} from "@fluentui/react-components";
import { Mail20Regular } from "@fluentui/react-icons";
import { useAuth } from "../../context/AuthContext";
import { Page, PageHeader, PageSection, Surface } from "../../components/ui/Page";
import { EnlaceInterno } from "../../components/ui/EnlaceInterno";
import { getRol } from "../../components/shell/navigation";
import { institucional } from "./contenido";

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: tokens.spacingVerticalXXL,
    alignItems: "start",
    "@media (min-width: 1100px)": {
      gridTemplateColumns: "minmax(0, 1fr) 320px",
      columnGap: tokens.spacingHorizontalXXL,
    },
  },
  secciones: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXL,
    maxWidth: "80ch",
  },
  // Preguntas largas en pantallas angostas: el texto pasa a dos líneas con su
  // propio relleno, y la flecha conserva su tamaño al final (en Fluent el
  // espacio de la flecha se encoge hasta desaparecer cuando el texto lo llena).
  pregunta: {
    paddingBlock: tokens.spacingVerticalS,
    textAlign: "start",
  },
  flecha: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    marginInlineStart: "auto",
  },
  respuesta: {
    display: "block",
    paddingBlockEnd: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground2,
    maxWidth: "70ch",
  },
  contacto: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalS,
    "@media (min-width: 1100px)": {
      position: "sticky",
      top: tokens.spacingVerticalXXL,
    },
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  titulo: {
    margin: 0,
  },
});

const ESTUDIANTES = {
  id: "estudiantes",
  titulo: "Para estudiantes",
  preguntas: [
    [
      "¿Cómo reservo una tutoría?",
      "Busca un tutor en «Buscar tutores», abre su perfil y elige «Agendar cita». Escoge la materia, el día y un horario libre; si quieres, escribe qué necesitas repasar. La solicitud queda pendiente hasta que el tutor la acepte.",
    ],
    [
      "¿Por qué no puedo elegir ciertos días u horarios?",
      "El calendario solo muestra lo que el tutor tiene disponible. Quedan fuera los días que bloqueó, los horarios ya reservados y los que no cumplen la anticipación mínima que el tutor pide para recibir reservas.",
    ],
    [
      "¿Cuándo está confirmada mi cita?",
      "Cuando el tutor la acepta. Te llega un correo y la cita aparece en «Mis tutorías» con el enlace de la videollamada. Si la rechaza, también te avisamos por correo.",
    ],
    [
      "¿Cómo cancelo una cita?",
      "En «Mis tutorías», abre la cita y elige «Cancelar tutoría». Escribe el motivo: la otra persona lo recibe por correo.",
    ],
    [
      "¿Cómo califico una tutoría?",
      "Cuando la sesión termina aparece en la pestaña «Historial» de «Mis tutorías» con el botón «Calificar». Cada tutoría se califica una vez y la reseña se publica de forma anónima.",
    ],
  ],
};

const TUTORES = {
  id: "tutores",
  titulo: "Para tutores",
  preguntas: [
    [
      "¿Cómo me vuelvo tutor?",
      "Elige «Conviértete en tutor», indica las materias que dominas y sube un comprobante de estudios (PDF o imagen, hasta 5 MB). La administración lo revisa y verás el resultado en «Estado de solicitud»; también te avisamos por correo.",
    ],
    [
      "¿Cómo marco mi horario?",
      "En «Disponibilidad», pestaña «Horario semanal», arrastra sobre la rejilla para pintar las horas en que puedes dar tutorías. Con Shift o con el clic derecho borras. Cada hora pintada es una cita reservable de 1 hora. Al terminar, elige «Guardar cambios».",
    ],
    [
      "¿Y si un día no puedo dar tutorías?",
      "En «Disponibilidad», pestaña «Días sin tutorías», toca ese día en el calendario. Con Shift + clic marcas un rango, por ejemplo unas vacaciones. Bloquear un día no cancela las citas que ya tenías ese día.",
    ],
    [
      "¿Puedo pedir que reserven con anticipación?",
      "Sí. En «Disponibilidad», pestaña «Reservas», elige la anticipación mínima. Ahí mismo puedes guardar un enlace fijo de videollamada para no escribirlo en cada cita.",
    ],
    [
      "¿Cómo acepto o rechazo una solicitud?",
      "En «Solicitudes» aparecen las citas pendientes con el tema que pide el estudiante. Al aceptar, confirma el enlace de la videollamada; al rechazar puedes escribir un motivo. El estudiante recibe un correo en ambos casos.",
    ],
  ],
};

const CUENTA = {
  id: "cuenta",
  titulo: "Tu cuenta",
  preguntas: [
    [
      "No me llegó el correo de verificación",
      "Revisa la carpeta de spam o correo no deseado. Si no está, escríbenos desde la dirección con la que te registraste.",
    ],
    [
      "Olvidé mi contraseña",
      "Por ahora no hay recuperación automática de contraseña. Escríbenos desde el correo de tu cuenta y te ayudamos. Si tu cuenta es de Google o Microsoft, entra con ese botón: no necesitas contraseña de TutoriasU.",
    ],
    [
      "¿Cómo cambio entre tema claro y oscuro?",
      "Toca tu foto de perfil, arriba a la derecha, y activa o desactiva «Tema oscuro».",
    ],
  ],
};

function Preguntas({ seccion }) {
  const styles = useStyles();
  return (
    <PageSection id={seccion.id} title={seccion.titulo}>
      <Surface flush>
        <Accordion collapsible multiple>
          {seccion.preguntas.map(([pregunta, respuesta]) => (
            <AccordionItem key={pregunta} value={pregunta}>
              <AccordionHeader
                size="large"
                expandIconPosition="end"
                button={{ className: styles.pregunta }}
                expandIcon={{ className: styles.flecha }}
              >
                {pregunta}
              </AccordionHeader>
              <AccordionPanel>
                <Body1 as="p" className={styles.respuesta}>
                  {respuesta}
                </Body1>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Surface>
    </PageSection>
  );
}

/*
 * Ayuda y soporte: preguntas frecuentes por tema (primero las del rol de quien
 * la abre) y, al lado, cómo contactar a soporte.
 */
export default function Ayuda() {
  const styles = useStyles();
  const { isAuthenticated, user } = useAuth();
  const secciones = getRol(user) === "tutor" ? [TUTORES, ESTUDIANTES, CUENTA] : [ESTUDIANTES, TUTORES, CUENTA];
  const { correoSoporte } = institucional;

  return (
    <Page>
      <PageHeader
        title="Ayuda y soporte"
        description="Respuestas a las dudas más comunes sobre TutoriasU."
        backTo={isAuthenticated ? undefined : "/"}
      />
      <div className={styles.layout}>
        <div className={styles.secciones}>
          {secciones.map((seccion) => (
            <Preguntas key={seccion.id} seccion={seccion} />
          ))}
        </div>

        <Surface as="aside" className={styles.contacto} aria-labelledby="titulo-contacto">
          <Subtitle2 as="h2" id="titulo-contacto" className={styles.titulo}>
            ¿No encontraste tu respuesta?
          </Subtitle2>
          <Body1 className={styles.muted}>
            Escríbenos y cuéntanos qué intentabas hacer, qué pasó y, si puedes, agrega una captura de pantalla.
          </Body1>
          <Button as="a" href={`mailto:${correoSoporte}`} appearance="primary" icon={<Mail20Regular />}>
            Escribir a soporte
          </Button>
          <Caption1 className={styles.muted}>{correoSoporte}</Caption1>
          <Caption1 className={styles.muted}>
            Consulta también los <EnlaceInterno to="/terminos">Términos de uso</EnlaceInterno> y el{" "}
            <EnlaceInterno to="/privacidad">Aviso de privacidad</EnlaceInterno>.
          </Caption1>
        </Surface>
      </div>
    </Page>
  );
}
