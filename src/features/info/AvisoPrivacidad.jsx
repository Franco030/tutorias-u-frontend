import { Link } from "@fluentui/react-components";
import { Documento } from "./Documento";
import { institucional } from "./contenido";

const { responsable, domicilio, correoSoporte, actualizacionLegal } = institucional;

const correo = <Link href={`mailto:${correoSoporte}`}>{correoSoporte}</Link>;

/*
 * Aviso de privacidad integral. Describe los datos que la plataforma guarda
 * realmente (backend: Usuarios, Citas, Reseñas, comprobantes en Azure Blob).
 * Borrador para revisión: no sustituye una revisión legal.
 */
const secciones = [
  {
    titulo: "Quién es responsable de tus datos",
    contenido: (
      <p>
        {responsable}, con domicilio en {domicilio}, es responsable del uso y protección de tus datos personales
        en TutoriasU. Para cualquier asunto relacionado con este aviso escribe a {correo}.
      </p>
    ),
  },
  {
    titulo: "Qué datos recabamos",
    contenido: (
      <>
        <p>Según cómo uses la plataforma, guardamos:</p>
        <ul>
          <li>Datos de cuenta: nombre, correo electrónico, contraseña cifrada y rol (estudiante o tutor).</li>
          <li>
            Si entras con Google o Microsoft: el identificador de tu cuenta, tu nombre, tu correo y, si la
            compartes, tu foto de perfil.
          </li>
          <li>Datos académicos: las materias que te interesan o que impartes.</li>
          <li>
            Si te postulas como tutor: el comprobante de estudios que subes, tu horario de disponibilidad, los días
            sin tutorías y tu enlace de videollamada.
          </li>
          <li>
            Datos de uso: las citas que solicitas o atiendes (fecha, materia, tema y notas), sus cancelaciones y
            las reseñas que escribes.
          </li>
        </ul>
        <p>No recabamos datos personales sensibles.</p>
      </>
    ),
  },
  {
    titulo: "Para qué los usamos",
    contenido: (
      <>
        <p>Usamos tus datos para lo necesario para dar el servicio:</p>
        <ul>
          <li>Crear y administrar tu cuenta e iniciar sesión.</li>
          <li>Mostrar a los estudiantes el perfil, las materias y el horario de los tutores aprobados.</li>
          <li>Agendar, confirmar, cancelar y dar seguimiento a las tutorías.</li>
          <li>Enviarte correos sobre tu cuenta y tus citas.</li>
          <li>Revisar las postulaciones de tutor con el comprobante que entregas.</li>
          <li>Publicar la calificación promedio de cada tutor a partir de las reseñas.</li>
        </ul>
        <p>No usamos tus datos con fines publicitarios ni los vendemos.</p>
      </>
    ),
  },
  {
    titulo: "Con quién los compartimos",
    contenido: (
      <>
        <p>
          Otros usuarios ven solo lo necesario: los estudiantes ven el perfil público del tutor, y el tutor ve el
          nombre del estudiante y el tema de cada cita que recibe. Las reseñas se publican de forma anónima: solo
          se muestran la calificación, el comentario y la fecha.
        </p>
        <p>
          La plataforma funciona sobre servicios de Microsoft Azure (alojamiento, base de datos, almacenamiento de
          archivos y envío de correos), y el inicio de sesión con Google o Microsoft lo procesan esos proveedores.
          Ellos tratan los datos por cuenta nuestra y bajo sus propias medidas de seguridad. No hacemos otras
          transferencias, salvo las que exija una autoridad competente.
        </p>
      </>
    ),
  },
  {
    titulo: "Tus derechos",
    contenido: (
      <>
        <p>
          Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su uso (derechos ARCO), así como
          revocar tu consentimiento. Escribe a {correo} indicando tu nombre, el correo de tu cuenta, el derecho que
          quieres ejercer y, si aplica, los datos que quieres corregir. Te responderemos en un máximo de 20 días
          hábiles.
        </p>
      </>
    ),
  },
  {
    titulo: "Almacenamiento en tu navegador",
    contenido: (
      <p>
        No usamos cookies de rastreo ni de publicidad. Guardamos en tu navegador tu sesión, para no pedirte que
        inicies sesión en cada visita, y tu preferencia de tema claro u oscuro. La sesión se borra al cerrar
        sesión; ambas, al limpiar los datos del sitio en tu navegador.
      </p>
    ),
  },
  {
    titulo: "Cambios a este aviso",
    contenido: (
      <p>
        Si cambia este aviso, publicaremos la nueva versión en esta misma página con su fecha de actualización. Si
        el cambio afecta cómo usamos tus datos, te avisaremos por correo.
      </p>
    ),
  },
];

export default function AvisoPrivacidad() {
  return (
    <Documento
      titulo="Aviso de privacidad"
      descripcion={`Cómo tratamos tus datos personales en TutoriasU. Última actualización: ${actualizacionLegal}.`}
      secciones={secciones}
    />
  );
}
