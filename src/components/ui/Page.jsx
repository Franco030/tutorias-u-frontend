import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Body1,
  Button,
  makeStyles,
  mergeClasses,
  Spinner,
  Subtitle2,
  Title2,
  tokens,
} from "@fluentui/react-components";
import { ArrowLeft20Regular } from "@fluentui/react-icons";
import { delayedFade, pageFade } from "../../theme/motion";
import { CargaDePaginaContext } from "../../hooks/useCargaDePagina";

// Tiempo máximo que la página espera a sus datos antes de mostrarse con
// esqueletos (mismo umbral que el spinner diferido).
const ESPERA_MAXIMA_MS = 300;

const useStyles = makeStyles({
  page: {
    boxSizing: "border-box",
    width: "100%",
    // Como en las apps de Windows: el contenido arranca junto a la navegación
    // y ocupa todo el lienzo; no se centra en una columna.
    marginInline: 0,
    paddingBlock: `${tokens.spacingVerticalXXL} ${tokens.spacingVerticalXXXL}`,
    paddingInline: tokens.spacingHorizontalL,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXL,
    // Rangos sin solaparse: Griffel no ordena las media queries por ancho.
    "@media (min-width: 640px) and (max-width: 1439px)": {
      paddingInline: tokens.spacingHorizontalXXXL,
    },
    "@media (min-width: 1440px)": {
      paddingInline: "48px",
    },
  },
  // Mientras sus secciones cargan (máx. 300 ms) la página está montada pero
  // invisible; al estar lista hace un único fundido ya con los datos.
  oculta: {
    opacity: 0,
  },
  diferido: {
    display: "inline-flex",
    ...delayedFade,
  },
  visible: pageFade,
  header: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  back: {
    alignSelf: "flex-start",
    marginInlineStart: `calc(${tokens.spacingHorizontalS} * -1)`,
    marginBlockEnd: tokens.spacingVerticalXS,
  },
  title: {
    margin: 0,
    overflowWrap: "anywhere",
    fontSize: tokens.fontSizeBase600,
    lineHeight: tokens.lineHeightBase600,
    "@media (min-width: 640px)": {
      fontSize: tokens.fontSizeHero800,
      lineHeight: tokens.lineHeightHero800,
    },
  },
  description: {
    color: tokens.colorNeutralForeground3,
    maxWidth: "65ch",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    minHeight: "32px",
  },
  sectionTitle: {
    margin: 0,
  },
  surface: {
    boxSizing: "border-box",
    minWidth: 0,
    padding: tokens.spacingHorizontalXL,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow4,
    "@media (max-width: 479px)": {
      padding: tokens.spacingHorizontalL,
    },
  },
  flush: {
    padding: 0,
    overflow: "hidden",
    "@media (max-width: 479px)": {
      padding: 0,
    },
  },
  loading: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50dvh",
    ...delayedFade,
  },
  footerActions: {
    display: "flex",
    flexDirection: "column-reverse",
    gap: tokens.spacingVerticalS,
    "@media (min-width: 640px)": {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
    },
  },
});

// Contenedor de tarjeta estándar (fondo 1, borde sutil, sombra 2).
export function Surface({ children, flush = false, className, as: Component = "div", ...props }) {
  const styles = useStyles();
  return (
    <Component className={mergeClasses(styles.surface, flush && styles.flush, className)} {...props}>
      {children}
    </Component>
  );
}

export function PageLoading({ label }) {
  const styles = useStyles();
  return (
    <div className={styles.loading}>
      <Spinner label={label} />
    </div>
  );
}

// Indicador de carga secundario (dentro de diálogos o secciones): aparece
// solo si la espera supera 300 ms.
export function Diferido({ children }) {
  const styles = useStyles();
  return <span className={styles.diferido}>{children}</span>;
}

// Fila de acciones al pie de un formulario (apiladas en móvil, a la derecha en escritorio).
export function FormActions({ children }) {
  const styles = useStyles();
  return <div className={styles.footerActions}>{children}</div>;
}

export function Page({ children, className, cargando = false }) {
  const styles = useStyles();
  const [visible, setVisible] = useState(false);
  const pendientes = useRef(new Set());
  const montada = useRef(false);

  const carga = useMemo(
    () => ({
      agregar: (id) => pendientes.current.add(id),
      quitar: (id) => {
        pendientes.current.delete(id);
        // Se revisa en un microtask: si la sección se vuelve a registrar en el
        // mismo ciclo (remontaje de StrictMode), la página no se adelanta.
        queueMicrotask(() => {
          if (montada.current && pendientes.current.size === 0) setVisible(true);
        });
      },
    }),
    []
  );

  // Carga propia de la pantalla (la que renderiza <Page cargando={...}>).
  useLayoutEffect(() => {
    if (!cargando) return undefined;
    carga.agregar("pagina");
    return () => carga.quitar("pagina");
  }, [cargando, carga]);

  // Los efectos de las secciones corren antes que este: si ninguna quedó
  // cargando, la página se muestra antes del primer pintado.
  useLayoutEffect(() => {
    montada.current = true;
    if (pendientes.current.size === 0) {
      setVisible(true);
      return () => {
        montada.current = false;
      };
    }
    const limite = setTimeout(() => setVisible(true), ESPERA_MAXIMA_MS);
    return () => {
      montada.current = false;
      clearTimeout(limite);
    };
  }, []);

  return (
    <CargaDePaginaContext.Provider value={carga}>
      <main
        className={mergeClasses(
          styles.page,
          visible ? styles.visible : styles.oculta,
          className
        )}
        aria-busy={!visible || undefined}
      >
        {children}
      </main>
    </CargaDePaginaContext.Provider>
  );
}

export function PageHeader({ title, description, actions, backTo, backLabel = "Volver" }) {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        {backTo !== undefined && (
          <Button
            appearance="subtle"
            size="small"
            icon={<ArrowLeft20Regular />}
            className={styles.back}
            onClick={() => (backTo === -1 ? navigate(-1) : navigate(backTo))}
          >
            {backLabel}
          </Button>
        )}
        <Title2 as="h1" className={styles.title}>
          {title}
        </Title2>
        {description && <Body1 className={styles.description}>{description}</Body1>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

export function PageSection({ title, actions, children, id }) {
  const styles = useStyles();
  const headingId = id ? `${id}-titulo` : undefined;

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      {(title || actions) && (
        <div className={styles.sectionHeader}>
          {title && (
            <Subtitle2 as="h2" id={headingId} className={styles.sectionTitle}>
              {title}
            </Subtitle2>
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
