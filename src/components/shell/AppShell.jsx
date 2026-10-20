import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Badge,
  DrawerBody,
  DrawerHeader,
  Hamburger,
  makeStyles,
  mergeClasses,
  OverlayDrawer,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import { useAuth } from "../../context/AuthContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { getApiBaseUrl } from "../../services/apiClient";
import { keyframes } from "../../theme/motion";
import { DarkModeToggle } from "../DarkModeToggle";
import { BrandMark } from "./BrandMark";
import { SideNav } from "./SideNav";
import { UserMenu } from "./UserMenu";
import { getActiveNavValue, getNavSections } from "./navigation";

const DESKTOP_QUERY = "(min-width: 1024px)";
const RAIL_WIDTH = "56px";

const useStyles = makeStyles({
  // Capa base: material tipo Mica (neutro con un 5 % de la marca).
  root: {
    height: "100dvh",
    display: "grid",
    gridTemplateRows: "48px minmax(0, 1fr)",
    backgroundColor: `color-mix(in srgb, ${tokens.colorBrandBackground} 5%, ${tokens.colorNeutralBackground3})`,
  },
  // El botón de menú (32 px) queda centrado sobre la columna de íconos del riel (56 px).
  titleBar: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    paddingInlineStart: "12px",
    paddingInlineEnd: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  brandLink: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: tokens.borderRadiusMedium,
    paddingInline: tokens.spacingHorizontalXS,
    color: "inherit",
    textDecorationLine: "none",
    ":focus-visible": {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
    },
  },
  envBadge: {
    display: "none",
    "@media (min-width: 640px)": {
      display: "inline-flex",
    },
  },
  spacer: { flexGrow: 1 },
  body: {
    position: "relative",
    display: "flex",
    minHeight: 0,
  },
  // Riel compacto fijo: nunca cambia de ancho, así el contenido no se mueve.
  rail: {
    flexShrink: 0,
    width: RAIL_WIDTH,
    overflowX: "hidden",
    overflowY: "auto",
    transitionProperty: "opacity",
    transitionDuration: tokens.durationFast,
  },
  railHidden: {
    opacity: 0,
  },
  // Panel expandido: capa acrílica sobre el contenido (modo LeftCompact de Windows).
  pane: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    width: "280px",
    overflowY: "auto",
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground3} 82%, transparent)`,
    backdropFilter: "blur(30px) saturate(125%)",
    borderRight: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow28,
    // Acoplado a la ventana y encima de la esquina del lienzo: esquinas rectas.
    clipPath: "inset(0 -40px 0 0)",
    visibility: "visible",
    transitionProperty: "clip-path, box-shadow, visibility",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMax,
  },
  // Cerrado se recorta al ancho del riel (que queda debajo) y se oculta.
  paneClosed: {
    clipPath: `inset(0 calc(100% - ${RAIL_WIDTH}) 0 0)`,
    boxShadow: "none",
    visibility: "hidden",
    transitionDuration: tokens.durationFast,
    transitionTimingFunction: tokens.curveAccelerateMid,
  },
  // Capa de contenido: superficie sobre la base, con borde y sombra.
  canvas: {
    position: "relative",
    flexGrow: 1,
    minWidth: 0,
    overflowY: "auto",
    backgroundColor: tokens.colorNeutralBackground2,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow4,
    "@media (min-width: 1024px)": {
      borderLeft: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
      borderTopLeftRadius: tokens.borderRadiusXLarge,
    },
  },
  page: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    animationName: keyframes.fadeIn,
    animationDuration: tokens.durationNormal,
    animationTimingFunction: tokens.curveEasyEase,
    animationFillMode: "both",
  },
  drawer: {
    width: "300px",
    maxWidth: "85vw",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  drawerHeader: {
    paddingBlock: tokens.spacingVerticalM,
  },
  drawerBody: {
    paddingInline: 0,
  },
});

/*
 * Ventana estilo app de Windows: barra de título de 48 px, riel de íconos fijo
 * y, al abrir el menú, un panel acrílico sobre el contenido (escritorio) o un
 * cajón superpuesto (móvil). El lienzo nunca cambia de ancho al abrir/cerrar.
 * Se monta una vez (ShellLayout en App.jsx); al navegar solo entra la página.
 */
export function AppShell({ children }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const paneRef = useRef(null);
  const hamburgerRef = useRef(null);

  const isAzureProd = getApiBaseUrl().includes("azurewebsites.net");
  const sections = getNavSections(user);
  const selectedValue = getActiveNavValue(sections, pathname);

  // Panel de escritorio: cierre ligero (clic fuera o Escape) y foco al abrir.
  useEffect(() => {
    if (!isDesktop || !menuAbierto) return undefined;

    paneRef.current?.querySelector('[aria-current="page"], a')?.focus({ preventScroll: true });

    const alPresionar = (event) => {
      if (paneRef.current?.contains(event.target) || hamburgerRef.current?.contains(event.target)) return;
      setMenuAbierto(false);
    };
    const alTeclear = (event) => {
      if (event.key === "Escape") {
        setMenuAbierto(false);
        hamburgerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", alPresionar);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alPresionar);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [isDesktop, menuAbierto]);

  return (
    <div className={styles.root}>
      <header className={styles.titleBar}>
        <Tooltip content={menuAbierto ? "Cerrar navegación" : "Abrir navegación"} relationship="label">
          <Hamburger
            ref={hamburgerRef}
            onClick={() => setMenuAbierto((valor) => !valor)}
            aria-expanded={menuAbierto}
          />
        </Tooltip>

        <a
          href="/"
          className={styles.brandLink}
          onClick={(event) => {
            event.preventDefault();
            navigate("/");
          }}
        >
          <BrandMark />
        </a>

        {!isAzureProd && (
          <Badge appearance="tint" color="informative" size="small" className={styles.envBadge}>
            Dev local
          </Badge>
        )}

        <div className={styles.spacer} />

        <DarkModeToggle />
        <UserMenu />
      </header>

      <div className={styles.body}>
        {isDesktop && (
          <>
            <aside className={mergeClasses(styles.rail, menuAbierto && styles.railHidden)} aria-hidden={menuAbierto || undefined}>
              <SideNav sections={sections} selectedValue={selectedValue} compact />
            </aside>
            <div
              ref={paneRef}
              className={mergeClasses(styles.pane, !menuAbierto && styles.paneClosed)}
              inert={!menuAbierto}
            >
              <SideNav
                sections={sections}
                selectedValue={selectedValue}
                onNavigate={() => setMenuAbierto(false)}
              />
            </div>
          </>
        )}

        <div className={styles.canvas}>
          <div key={pathname} className={styles.page}>
            {children}
          </div>
        </div>
      </div>

      {!isDesktop && (
        <OverlayDrawer
          open={menuAbierto}
          onOpenChange={(_, data) => setMenuAbierto(data.open)}
          className={styles.drawer}
          aria-label="Navegación principal"
        >
          <DrawerHeader className={styles.drawerHeader}>
            <BrandMark />
          </DrawerHeader>
          <DrawerBody className={styles.drawerBody}>
            <SideNav
              sections={sections}
              selectedValue={selectedValue}
              onNavigate={() => setMenuAbierto(false)}
            />
          </DrawerBody>
        </OverlayDrawer>
      )}
    </div>
  );
}

export default AppShell;
