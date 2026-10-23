import { Button, makeStyles, mergeClasses, shorthands, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  primary: {
    backgroundColor: tokens.colorStatusDangerBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    ...shorthands.borderColor("transparent"),
    ":hover": {
      backgroundColor: tokens.colorStatusDangerBackground3Hover,
      color: tokens.colorNeutralForegroundOnBrand,
    },
    ":hover:active": {
      backgroundColor: tokens.colorStatusDangerBackground3Pressed,
      color: tokens.colorNeutralForegroundOnBrand,
    },
  },
  // colorPaletteRedForeground1 llega a 4.5:1 sobre las tarjetas en claro y en
  // oscuro; colorStatusDangerForeground1 se queda en 4.16:1 en oscuro.
  outline: {
    color: tokens.colorPaletteRedForeground1,
    ":hover": {
      color: tokens.colorPaletteRedForeground1,
      backgroundColor: tokens.colorStatusDangerBackground1,
    },
    ":hover:active": {
      color: tokens.colorPaletteRedForeground1,
      backgroundColor: tokens.colorStatusDangerBackground2,
    },
  },
});

// Botón para acciones destructivas (cancelar, rechazar). `variant="outline"` para la versión secundaria.
export function DangerButton({ variant = "primary", className, disabled, disabledFocusable, ...props }) {
  const styles = useStyles();
  return (
    <Button
      appearance={variant === "primary" ? "primary" : "secondary"}
      disabled={disabled}
      disabledFocusable={disabledFocusable}
      className={mergeClasses(!disabled && !disabledFocusable && styles[variant], className)}
      {...props}
    />
  );
}

export default DangerButton;
