import { makeStyles, tokens } from "@fluentui/react-components";
import { BrandMark } from "../../components/shell/BrandMark";
import { Surface } from "../../components/ui/Page";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
    "@media (min-width: 640px)": {
      paddingInline: tokens.spacingHorizontalXXXL,
    },
  },
  main: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacingHorizontalL,
  },
  card: {
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "440px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: tokens.spacingVerticalM,
  },
});

/*
 * Pantallas de cuenta que se abren desde un enlace del correo (verificar el
 * correo, restablecer la contraseña): sin shell, con la marca arriba y una
 * tarjeta centrada de 440 px.
 */
export function CuentaLayout({ children }) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <BrandMark />
      </div>
      <main className={styles.main}>
        <Surface className={styles.card}>{children}</Surface>
      </main>
    </div>
  );
}

export default CuentaLayout;
