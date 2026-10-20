import { FluentProvider, makeStyles, tokens } from "@fluentui/react-components";
import { useTheme } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "./fluentTheme";

const useStyles = makeStyles({
  root: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
  },
});

// Conecta ThemeContext (clase .dark + localStorage) con el tema de Fluent.
export function FluentThemeBridge({ children }) {
  const { isDark } = useTheme();
  const styles = useStyles();

  return (
    <FluentProvider theme={isDark ? darkTheme : lightTheme}>
      {/* El layout va en un contenedor propio: las clases del provider se copian a los portales. */}
      <div className={styles.root}>{children}</div>
    </FluentProvider>
  );
}

export default FluentThemeBridge;
