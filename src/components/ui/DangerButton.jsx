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
  outline: {
    color: tokens.colorStatusDangerForeground1,
    ":hover": {
      color: tokens.colorStatusDangerForeground1,
      backgroundColor: tokens.colorStatusDangerBackground1,
    },
    ":hover:active": {
      color: tokens.colorStatusDangerForeground1,
      backgroundColor: tokens.colorStatusDangerBackground2,
    },
  },
});

// Botón para acciones destructivas (cancelar, rechazar). `variant="outline"` para la versión secundaria.
export function DangerButton({ variant = "primary", className, disabled, ...props }) {
  const styles = useStyles();
  return (
    <Button
      appearance={variant === "primary" ? "primary" : "secondary"}
      disabled={disabled}
      className={mergeClasses(!disabled && styles[variant], className)}
      {...props}
    />
  );
}

export default DangerButton;
