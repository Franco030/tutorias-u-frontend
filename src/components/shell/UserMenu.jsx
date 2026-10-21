import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Caption1,
  makeStyles,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  mergeClasses,
  Text,
  tokens,
} from "@fluentui/react-components";
import { CalendarLtr20Regular, SignOut20Regular } from "@fluentui/react-icons";
import { useAuth } from "../../context/AuthContext";
import { getRol } from "./navigation";

const useStyles = makeStyles({
  trigger: {
    minWidth: "auto",
    paddingInline: tokens.spacingHorizontalXS,
    gap: tokens.spacingHorizontalS,
  },
  triggerText: {
    display: "none",
    flexDirection: "column",
    alignItems: "flex-end",
    textAlign: "end",
    "@media (min-width: 768px)": {
      display: "flex",
    },
  },
  name: {
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase200,
    whiteSpace: "nowrap",
  },
  role: {
    color: tokens.colorNeutralForeground3,
    lineHeight: tokens.lineHeightBase100,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    maxWidth: "280px",
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  truncate: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
});

export function UserMenu() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  const rol = getRol(user);
  const puedeVerTutorias = rol === "estudiante" || rol === "tutor";
  const avatarImage = user.fotoUrl
    ? { src: user.fotoUrl, referrerPolicy: "no-referrer" }
    : undefined;

  return (
    <Menu positioning="below-end">
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          className={styles.trigger}
          title="Menú de usuario"
        >
          <span className={styles.triggerText}>
            <Text size={200} className={styles.name}>
              {user.nombre}
            </Text>
            <Caption1 className={styles.role}>{user.rol || "Usuario"}</Caption1>
          </span>
          <Avatar name={user.nombre} image={avatarImage} size={32} color="colorful" />
        </Button>
      </MenuTrigger>

      <MenuPopover>
        <div className={styles.header}>
          <Avatar name={user.nombre} image={avatarImage} size={40} color="colorful" />
          <div className={styles.headerText}>
            <Text weight="semibold" className={styles.truncate}>
              {user.nombre}
            </Text>
            <Caption1 className={mergeClasses(styles.truncate, styles.muted)}>{user.email}</Caption1>
          </div>
        </div>
        <MenuDivider />
        <MenuList>
          {puedeVerTutorias && (
            <MenuItem icon={<CalendarLtr20Regular />} onClick={() => navigate("/mis-tutorias")}>
              Mis tutorías
            </MenuItem>
          )}
          <MenuItem icon={<SignOut20Regular />} onClick={logout}>
            Cerrar sesión
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}

export default UserMenu;
