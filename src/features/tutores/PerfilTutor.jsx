import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar,
  Body1,
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  Button,
  Caption1,
  makeStyles,
  Spinner,
  Tag,
  Title2,
  tokens,
} from "@fluentui/react-components";
import { CalendarAdd20Regular, PersonQuestionMark24Regular, Star16Filled } from "@fluentui/react-icons";
import { getDisponibilidadTutor, getTutorById } from "../../services/tutorService";
import { HorarioSemanal } from "../../components/ui/HorarioSemanal";
import BookingModal from "./BookingModal";
import ResenasTutor from "./ResenasTutor";
import { IlustracionComunidad } from "../../components/illustrations/Ilustraciones";
import { EmptyState } from "../../components/ui/EmptyState";
import { Page, PageLoading, PageSection, Surface } from "../../components/ui/Page";
import { opiniones } from "../../lib/formato";

const useStyles = makeStyles({
  breadcrumb: {
    marginInlineStart: `calc(${tokens.spacingHorizontalS} * -1)`,
  },
  // Tarjeta de perfil en capas: banda de marca, avatar superpuesto con anillo.
  banner: {
    height: "96px",
    backgroundColor: tokens.colorBrandBackground2,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalL,
    paddingInline: tokens.spacingHorizontalXL,
    paddingBottom: tokens.spacingVerticalXL,
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: tokens.spacingHorizontalXL,
    },
  },
  avatar: {
    marginTop: "-48px",
    borderRadius: tokens.borderRadiusCircular,
    boxShadow: `0 0 0 4px ${tokens.colorNeutralBackground1}, ${tokens.shadow8}`,
  },
  identity: {
    flexGrow: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  name: {
    margin: 0,
    overflowWrap: "anywhere",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: "tabular-nums",
  },
  star: {
    color: tokens.colorPaletteMarigoldForeground1,
  },
  cta: {
    flexShrink: 0,
    whiteSpace: "nowrap",
    width: "100%",
    "@media (min-width: 640px)": {
      width: "auto",
    },
  },
  details: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: tokens.spacingVerticalXXL,
    alignItems: "start",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
      columnGap: tokens.spacingHorizontalXXL,
    },
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
});

export default function PerfilTutor() {
  const styles = useStyles();
  const { id } = useParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  // Horario semanal: carga aparte para no bloquear el perfil si falla.
  const [horario, setHorario] = useState({ bloques: [], cargando: true, error: false });

  useEffect(() => {
    let activo = true;
    getDisponibilidadTutor(id)
      .then((data) => {
        if (!activo) return;
        const bloques = (Array.isArray(data) ? data : []).map((bloque) => ({
          diaSemana: Number(bloque.diaSemana ?? bloque.DiaSemana),
          horaInicio: String(bloque.horaInicio ?? bloque.HoraInicio).slice(0, 5),
          horaFin: String(bloque.horaFin ?? bloque.HoraFin).slice(0, 5),
        }));
        setHorario({ bloques, cargando: false, error: false });
      })
      .catch(() => {
        if (activo) setHorario({ bloques: [], cargando: false, error: true });
      });
    return () => {
      activo = false;
    };
  }, [id]);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getTutorById(id);
        setTutor(data);
      } catch (err) {
        if (err.status === 404) {
          setError(
            "El perfil del tutor no fue encontrado o no está disponible."
          );
        } else {
          setError("Ocurrió un error al cargar el perfil del tutor.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  const handleAgendar = () => {
    setBookingOpen(true);
  };

  if (loading) {
    return <PageLoading label="Cargando perfil…" />;
  }

  if (error || !tutor) {
    return (
      <Page>
        <EmptyState
          icon={<PersonQuestionMark24Regular />}
          ilustracion={<IlustracionComunidad />}
          title="Perfil no encontrado"
          description={error || "El perfil del tutor no fue encontrado o no está disponible."}
          action={
            <Button appearance="secondary" onClick={() => navigate("/")}>
              Volver al inicio
            </Button>
          }
        />
      </Page>
    );
  }

  const rating = Number(tutor.calificacionPromedio);
  const hasRating = Number.isFinite(rating) && rating > 0;
  const totalResenas = Number(tutor.totalResenas) || 0;

  return (
    <>
      <Page cargando={horario.cargando}>
        <Breadcrumb aria-label="Ruta de navegación" className={styles.breadcrumb}>
          <BreadcrumbItem>
            <BreadcrumbButton onClick={() => navigate("/tutores")}>Buscar tutores</BreadcrumbButton>
          </BreadcrumbItem>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton current>{tutor.nombre}</BreadcrumbButton>
          </BreadcrumbItem>
        </Breadcrumb>

        <Surface flush>
          <div className={styles.banner} aria-hidden="true" />
          <div className={styles.hero}>
            <Avatar
              name={tutor.nombre}
              image={tutor.fotoUrl ? { src: tutor.fotoUrl, alt: "" } : undefined}
              size={96}
              color="colorful"
              className={styles.avatar}
            />
            <div className={styles.identity}>
              <Title2 as="h1" className={styles.name}>
                {tutor.nombre}
              </Title2>
              <Caption1 className={styles.rating}>
                {hasRating && <Star16Filled className={styles.star} aria-hidden="true" />}
                {hasRating
                  ? `${rating.toFixed(1)} de 5${totalResenas > 0 ? ` · ${opiniones(totalResenas)}` : ""}`
                  : "Aún sin calificaciones"}
              </Caption1>
            </div>
            <Button
              appearance="primary"
              size="large"
              icon={<CalendarAdd20Regular />}
              className={styles.cta}
              onClick={handleAgendar}
            >
              Agendar cita
            </Button>
          </div>
        </Surface>

        <div className={styles.details}>
          <PageSection id="materias" title="Materias que enseña">
            {tutor.materias && tutor.materias.length > 0 ? (
              <div className={styles.tags}>
                {tutor.materias.map((materia) => (
                  <Tag key={materia} appearance="outline" shape="rounded">
                    {materia}
                  </Tag>
                ))}
              </div>
            ) : (
              <Body1 className={styles.muted}>No hay materias registradas.</Body1>
            )}
          </PageSection>

          <PageSection id="horario" title="Horario semanal">
            <Surface>
              {horario.cargando ? (
                <Spinner size="tiny" label="Cargando horario…" labelPosition="after" />
              ) : horario.error ? (
                <Body1 className={styles.muted}>No se pudo cargar el horario. Puedes verlo al agendar.</Body1>
              ) : horario.bloques.length === 0 ? (
                <Body1 className={styles.muted}>Este tutor aún no publica horarios.</Body1>
              ) : (
                <HorarioSemanal bloques={horario.bloques} />
              )}
            </Surface>
          </PageSection>
        </div>

        {/* `key`: al cambiar de tutor se reinicia la carga. */}
        <ResenasTutor key={id} tutorId={id} />
      </Page>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        tutorId={id}
        materiasDisponibles={tutor.materias || []}
        antelacionMinimaHoras={tutor.antelacionMinimaHoras ?? 0}
      />
    </>
  );
}
