import { Body1, makeStyles, Subtitle2, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
    borderRadius: tokens.borderRadiusXLarge,
    border: `${tokens.strokeWidthThin} dashed ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  icon: {
    color: tokens.colorNeutralForeground3,
    fontSize: "28px",
    display: "flex",
  },
  description: {
    color: tokens.colorNeutralForeground3,
    maxWidth: "60ch",
  },
  action: {
    marginTop: tokens.spacingVerticalXS,
  },
});

// Vacío en tres tiempos: qué falta, por qué importa, la siguiente acción.
export function EmptyState({ icon, title, description, action }) {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <Subtitle2 as="p">{title}</Subtitle2>
      {description && <Body1 className={styles.description}>{description}</Body1>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export default EmptyState;
