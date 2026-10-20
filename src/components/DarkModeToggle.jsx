import { Button, makeStyles, tokens, Tooltip } from "@fluentui/react-components";
import { WeatherMoon20Regular, WeatherSunny20Regular } from "@fluentui/react-icons";
import { useTheme } from "../context/ThemeContext";
import { keyframes } from "../theme/motion";

const useStyles = makeStyles({
  icon: {
    display: "flex",
    animationName: keyframes.spinIn,
    animationDuration: tokens.durationGentle,
    animationTimingFunction: tokens.curveDecelerateMax,
  },
});

export function DarkModeToggle({ className }) {
  const styles = useStyles();
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro";

  return (
    <Tooltip content={label} relationship="label" withArrow>
      <Button
        appearance="subtle"
        className={className}
        icon={
          <span key={isDark ? "sol" : "luna"} className={styles.icon}>
            {isDark ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
          </span>
        }
        onClick={toggleTheme}
      />
    </Tooltip>
  );
}

export default DarkModeToggle;
