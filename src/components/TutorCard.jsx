import { Link } from "react-router-dom";
import {
  Avatar,
  Caption1,
  makeStyles,
  Tag,
  Text,
  tokens,
} from "@fluentui/react-components";
import { Star16Filled, Star16Regular } from "@fluentui/react-icons";
import { liftOnHover } from "../theme/motion";

const MAX_MATERIAS = 3;

const useStyles = makeStyles({
  card: {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    width: "100%",
    minWidth: 0,
    padding: tokens.spacingHorizontalL,
    textAlign: "start",
    font: "inherit",
    color: tokens.colorNeutralForeground1,
    textDecorationLine: "none",
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow4,
    ...liftOnHover,
    ":focus-visible": {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: "2px",
    },
  },
  head: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  headText: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  name: {
    fontWeight: tokens.fontWeightSemibold,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXXS,
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: "tabular-nums",
  },
  star: {
    color: tokens.colorPaletteMarigoldForeground1,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalXS,
    rowGap: tokens.spacingVerticalXS,
  },
  empty: {
    color: tokens.colorNeutralForeground3,
  },
});

export default function TutorCard({ tutor, to, onClick }) {
  const styles = useStyles();
  const rating = Number(tutor.calificacionPromedio);
  const hasRating = Number.isFinite(rating) && rating > 0;
  const materias = tutor.materias || [];
  const restantes = materias.length - MAX_MATERIAS;

  const contenido = (
    <>
      <div className={styles.head}>
        <Avatar
          name={tutor.nombre}
          image={tutor.fotoUrl ? { src: tutor.fotoUrl, alt: "" } : undefined}
          size={48}
          color="colorful"
        />
        <div className={styles.headText}>
          <Text className={styles.name}>{tutor.nombre}</Text>
          {"calificacionPromedio" in tutor && (
            <Caption1 className={styles.rating}>
              {hasRating ? (
                <Star16Filled className={styles.star} aria-hidden="true" />
              ) : (
                <Star16Regular aria-hidden="true" />
              )}
              {hasRating ? `${rating.toFixed(1)} de 5` : "Sin calificación"}
            </Caption1>
          )}
        </div>
      </div>

      {materias.length > 0 ? (
        <div className={styles.tags}>
          {materias.slice(0, MAX_MATERIAS).map((materia) => (
            <Tag key={materia} size="small" appearance="outline" shape="rounded">
              {materia}
            </Tag>
          ))}
          {restantes > 0 && (
            <Tag size="small" appearance="brand" shape="rounded">
              +{restantes} más
            </Tag>
          )}
        </div>
      ) : (
        <Caption1 className={styles.empty}>Sin materias registradas</Caption1>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={styles.card}>
        {contenido}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.card}
    >
      {contenido}
    </button>
  );
}
