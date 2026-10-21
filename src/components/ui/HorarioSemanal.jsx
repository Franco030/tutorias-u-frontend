import { Caption1, makeStyles, mergeClasses, Text, tokens } from "@fluentui/react-components";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
// Semana laboral: lunes primero (los índices siguen al backend, 0 = domingo).
const ORDEN = [1, 2, 3, 4, 5, 6, 0];

const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyleType: "none",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "104px minmax(0, 1fr)",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    minHeight: "44px",
    paddingBlock: tokens.spacingVerticalXS,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
    ":last-child": { borderBottomStyle: "none" },
  },
  day: {
    fontWeight: tokens.fontWeightSemibold,
  },
  dayEmpty: {
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightRegular,
  },
  blocks: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalXS,
  },
  block: {
    paddingBlock: "2px",
    paddingInline: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
});

/*
 * Semana de disponibilidad de solo lectura (lunes a domingo). Recibe los
 * bloques ya normalizados: { diaSemana, horaInicio, horaFin }.
 */
export function HorarioSemanal({ bloques }) {
  const styles = useStyles();

  return (
    <ul className={styles.list}>
      {ORDEN.map((dia) => {
        const delDia = bloques
          .filter((bloque) => bloque.diaSemana === dia)
          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
        return (
          <li key={dia} className={styles.row}>
            <Text className={mergeClasses(styles.day, delDia.length === 0 && styles.dayEmpty)}>
              {DIAS[dia]}
            </Text>
            {delDia.length === 0 ? (
              <Caption1 className={styles.muted}>Sin horarios</Caption1>
            ) : (
              <span className={styles.blocks}>
                {delDia.map((bloque) => (
                  <Caption1 key={`${bloque.horaInicio}-${bloque.horaFin}`} className={styles.block}>
                    {bloque.horaInicio} – {bloque.horaFin}
                  </Caption1>
                ))}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default HorarioSemanal;
