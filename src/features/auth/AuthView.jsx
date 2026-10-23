import { useState } from "react";
import {
  Body1,
  Button,
  Caption1,
  Divider,
  makeStyles,
  MessageBar,
  shorthands,
  MessageBarActions,
  MessageBarBody,
  Spinner,
  Subtitle2,
  Title2,
  tokens,
} from "@fluentui/react-components";
import {
  ChevronRight20Regular,
  Dismiss16Regular,
  HatGraduation24Regular,
  PeopleSearch24Regular,
} from "@fluentui/react-icons";
import { useAuth } from "../../context/AuthContext";
import { InterruptorTema } from "../../components/InterruptorTema";
import { EnlaceInterno } from "../../components/ui/EnlaceInterno";
import { BrandMark } from "../../components/shell/BrandMark";
import GoogleLoginButton from "./GoogleLoginButton";
import MicrosoftLoginButton from "./MicrosoftLoginButton";
import LocalAuthForm from "./LocalAuthForm";
import { fotos } from "../../assets/fotos";
import { Photo } from "../../components/ui/Photo";
import { pageFade } from "../../theme/motion";

const useStyles = makeStyles({
  // Patrón de inicio de sesión de Microsoft: foto a pantalla completa y una
  // tarjeta centrada con el logotipo, el formulario y las opciones.
  root: {
    position: "relative",
    flexGrow: 1,
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingBlock: tokens.spacingVerticalXXXL,
    paddingInline: tokens.spacingHorizontalL,
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground3,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  // Velo de marca sobre la foto: unifica el color y da contraste a la tarjeta.
  veil: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${tokens.colorBrandBackground} 30%, transparent), color-mix(in srgb, ${tokens.colorNeutralBackground3} 55%, transparent))`,
  },
  // Abajo a la izquierda, solo el interruptor: el único lugar, fuera del menú
  // de usuario, donde se cambia el tema.
  themeToggle: {
    position: "absolute",
    bottom: tokens.spacingVerticalM,
    left: tokens.spacingHorizontalM,
    zIndex: 1,
  },
  // Abajo a la derecha, como en el inicio de sesión de Microsoft: enlaces
  // pequeños sobre el fondo, sin barra de pie de página.
  legales: {
    position: "absolute",
    bottom: tokens.spacingVerticalM,
    right: tokens.spacingHorizontalM,
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXXS,
    borderRadius: tokens.borderRadiusMedium,
    // Fondo sólido para el contraste del texto sobre la foto (sin vidrio).
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
  },
  enlaceLegal: {
    fontSize: "inherit",
    color: tokens.colorNeutralForeground2,
  },
  surface: {
    position: "relative",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "440px",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
    padding: tokens.spacingHorizontalXXL,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow64,
    ...pageFade,
    "@media (max-width: 479px)": {
      paddingInline: tokens.spacingHorizontalL,
    },
  },
  heading: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  title: {
    margin: 0,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  providers: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: tokens.spacingVerticalS,
  },
  roles: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  role: {
    display: "grid",
    gridTemplateColumns: "40px minmax(0, 1fr) 20px",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    width: "100%",
    padding: tokens.spacingHorizontalL,
    textAlign: "start",
    font: "inherit",
    color: tokens.colorNeutralForeground1,
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusLarge,
    transitionProperty: "background-color, border-color",
    transitionDuration: tokens.durationFaster,
    transitionTimingFunction: tokens.curveEasyEase,
    "@media (hover: hover)": {
      ":hover": {
        backgroundColor: tokens.colorNeutralBackground1Hover,
        ...shorthands.borderColor(tokens.colorNeutralStroke1Hover),
      },
    },
    ":active": {
      backgroundColor: tokens.colorNeutralBackground1Pressed,
    },
    ":focus-visible": {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: "2px",
    },
    ":disabled": {
      cursor: "not-allowed",
      color: tokens.colorNeutralForegroundDisabled,
      backgroundColor: tokens.colorNeutralBackgroundDisabled,
    },
  },
  roleIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
  },
  roleText: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  roleEnd: {
    display: "flex",
    color: tokens.colorNeutralForeground3,
  },
  switchAccount: {
    alignSelf: "flex-start",
  },
});

const ROLES = [
  {
    id: "Estudiante",
    descripcion: "Busca tutores por materia y agenda sesiones con ellos.",
    icon: PeopleSearch24Regular,
  },
  {
    id: "Tutor",
    descripcion: "Comparte lo que dominas y gestiona tus horarios y citas.",
    icon: HatGraduation24Regular,
  },
];

function AccesoPanel() {
  const styles = useStyles();
  // Errores que no vienen de un formulario: sesión expirada (401) o el
  // regreso de Microsoft con un error del servidor.
  const { error, clearError } = useAuth();

  return (
    <>
      <div className={styles.heading}>
        <Title2 as="h1" className={styles.title}>
          Inicia sesión
        </Title2>
        <Body1 className={styles.muted}>Con tu correo registrado o tu cuenta institucional.</Body1>
      </div>

      {error && (
        <MessageBar intent="warning" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="transparent"
                size="small"
                aria-label="Descartar aviso"
                icon={<Dismiss16Regular />}
                onClick={clearError}
              />
            }
          />
        </MessageBar>
      )}

      <LocalAuthForm />

      <Divider>o continúa con</Divider>

      <div className={styles.providers}>
        <MicrosoftLoginButton />
        <GoogleLoginButton />
      </div>
    </>
  );
}

function SeleccionRol({ onComplete }) {
  const styles = useStyles();
  const { isLoading, error, logout } = useAuth();
  const [rolElegido, setRolElegido] = useState(null);

  const elegir = (rol) => {
    setRolElegido(rol);
    onComplete(rol);
  };

  return (
    <>
      <div className={styles.heading}>
        <Title2 as="h1" className={styles.title}>
          Selecciona tu perfil
        </Title2>
        <Body1 className={styles.muted}>
          Define cómo usarás TutoriasU. Cada perfil abre herramientas distintas.
        </Body1>
      </div>

      {error && (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.roles}>
        {ROLES.map(({ id, descripcion, icon: Icon }) => {
          const ocupado = isLoading && rolElegido === id;
          return (
            <button
              key={id}
              type="button"
              className={styles.role}
              onClick={() => elegir(id)}
              disabled={isLoading}
              aria-labelledby={`rol-${id}`}
              aria-describedby={`rol-${id}-desc`}
            >
              <span className={styles.roleIcon} aria-hidden="true">
                <Icon />
              </span>
              <span className={styles.roleText}>
                <Subtitle2 id={`rol-${id}`}>{id}</Subtitle2>
                <Caption1 id={`rol-${id}-desc`} className={styles.muted}>
                  {descripcion}
                </Caption1>
              </span>
              <span className={styles.roleEnd} aria-hidden="true">
                {ocupado ? <Spinner size="tiny" /> : <ChevronRight20Regular />}
              </span>
            </button>
          );
        })}
      </div>

      <Button appearance="transparent" size="small" className={styles.switchAccount} onClick={logout}>
        Usar otra cuenta
      </Button>
    </>
  );
}

export function AuthView({ onComplete }) {
  const styles = useStyles();
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} aria-hidden="true">
        <Photo foto={fotos.pizarron} rounded={false} decorativa prioridad className={styles.backdrop} />
        <div className={styles.veil} />
      </div>

      <InterruptorTema className={styles.themeToggle} />

      <nav className={styles.legales} aria-label="Información">
        <EnlaceInterno to="/ayuda" className={styles.enlaceLegal}>
          Ayuda
        </EnlaceInterno>
        <EnlaceInterno to="/terminos" className={styles.enlaceLegal}>
          Términos
        </EnlaceInterno>
        <EnlaceInterno to="/privacidad" className={styles.enlaceLegal}>
          Privacidad
        </EnlaceInterno>
      </nav>

      <main className={styles.surface}>
        <BrandMark />
        {isAuthenticated ? <SeleccionRol onComplete={onComplete} /> : <AccesoPanel />}
      </main>
    </div>
  );
}
