import { Link } from "@fluentui/react-components";
import { EnlaceInterno } from "../../components/ui/EnlaceInterno";
import { Documento } from "./Documento";
import { institucional } from "./contenido";

const { responsable, correoSoporte, actualizacionLegal } = institucional;

/*
 * Términos de uso. Reglas que la plataforma ya aplica (aprobación de tutores,
 * cancelación con motivo, una reseña por cita completada) más las de
 * convivencia. Borrador para revisión: no sustituye una revisión legal.
 */
const secciones = [
  {
    titulo: "Qué es TutoriasU",
    contenido: (
      <p>
        TutoriasU es una plataforma, operada por {responsable}, que conecta a estudiantes universitarios con
        compañeros que dan tutorías en las materias que dominan. Al crear una cuenta o usar la plataforma aceptas
        estos términos.
      </p>
    ),
  },
  {
    titulo: "Tu cuenta",
    contenido: (
      <ul>
        <li>Usa tu nombre real y un correo al que tengas acceso; lo necesitas para verificar la cuenta.</li>
        <li>Cuida tu contraseña. Lo que se haga con tu cuenta es tu responsabilidad.</li>
        <li>Puedes pedir que eliminemos tu cuenta en cualquier momento escribiendo a soporte.</li>
      </ul>
    ),
  },
  {
    titulo: "Ser tutor",
    contenido: (
      <ul>
        <li>
          Para dar tutorías tienes que postularte con un comprobante de estudios. La administración lo revisa y
          puede aprobar o rechazar la postulación.
        </li>
        <li>Mantén tu horario y tus días sin tutorías al día para no recibir citas que no puedas atender.</li>
        <li>
          Las tutorías son entre estudiantes. No sustituyen las clases ni las asesorías oficiales, y TutoriasU no
          garantiza resultados académicos.
        </li>
      </ul>
    ),
  },
  {
    titulo: "Citas",
    contenido: (
      <ul>
        <li>Una cita queda confirmada cuando el tutor la acepta; antes de eso es una solicitud.</li>
        <li>
          Si no vas a poder asistir, cancela desde la plataforma con anticipación e indica el motivo: la otra
          persona recibe un aviso por correo.
        </li>
        <li>Trata a la otra persona con respeto durante la sesión y en los mensajes.</li>
      </ul>
    ),
  },
  {
    titulo: "Reseñas",
    contenido: (
      <p>
        Después de una tutoría completada puedes calificarla una vez. Las reseñas se publican de forma anónima y
        deben referirse a la sesión. Podemos retirar reseñas ofensivas, falsas o que incluyan datos personales.
      </p>
    ),
  },
  {
    titulo: "Lo que no está permitido",
    contenido: (
      <ul>
        <li>Hacerse pasar por otra persona o subir comprobantes falsos.</li>
        <li>Acosar, discriminar u ofender a otros usuarios.</li>
        <li>Usar la plataforma para cobrar, vender o anunciar servicios ajenos a las tutorías.</li>
        <li>Intentar acceder a cuentas o datos de otras personas, o afectar el funcionamiento del sitio.</li>
      </ul>
    ),
  },
  {
    titulo: "Suspensión de cuentas",
    contenido: (
      <p>
        Si una cuenta no cumple estos términos podemos suspenderla o retirarle el rol de tutor. Si crees que fue
        un error, escríbenos.
      </p>
    ),
  },
  {
    titulo: "Disponibilidad del servicio",
    contenido: (
      <p>
        Hacemos lo posible para que la plataforma funcione siempre, pero puede haber interrupciones por
        mantenimiento o fallas. TutoriasU se ofrece tal como está y sin costo.
      </p>
    ),
  },
  {
    titulo: "Privacidad y cambios",
    contenido: (
      <p>
        El uso de tus datos se explica en el <EnlaceInterno to="/privacidad">Aviso de privacidad</EnlaceInterno>
        . Si cambiamos estos términos publicaremos la nueva versión aquí. Para dudas, escribe a{" "}
        <Link href={`mailto:${correoSoporte}`}>{correoSoporte}</Link>.
      </p>
    ),
  },
];

export default function TerminosUso() {
  return (
    <Documento
      titulo="Términos de uso"
      descripcion={`Las reglas para usar TutoriasU. Última actualización: ${actualizacionLegal}.`}
      secciones={secciones}
    />
  );
}
