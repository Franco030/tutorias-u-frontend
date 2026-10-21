import { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Body1,
  Button,
  Caption1,
  makeStyles,
  MessageBar,
  MessageBarBody,
  Spinner,
  Subtitle1,
  Title2,
  tokens,
} from "@fluentui/react-components";

import {
  getMaterias,
  guardarIntereses,
} from "../../services/materiaService";
import { useAuth } from "../../context/AuthContext";
import DarkModeToggle from "../../components/DarkModeToggle";
import { BrandMark } from "../../components/shell/BrandMark";
import { MateriaSelector } from "../../components/ui/MateriaSelector";
import { PageLoading } from "../../components/ui/Page";
import { IlustracionAprender } from "../../components/illustrations/Ilustraciones";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    backgroundColor: tokens.colorNeutralBackground2,
    "@media (min-width: 1100px)": {
      gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 36%)",
    },
  },
  column: {
    minWidth: 0,
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
  },
  // Panel fotográfico fijo a la derecha (solo en pantallas anchas).
  aside: {
    display: "none",
    "@media (min-width: 1100px)": {
      display: "block",
      position: "sticky",
      top: 0,
      height: "100dvh",
      boxSizing: "border-box",
      padding: tokens.spacingHorizontalM,
    },
  },
  photoWrap: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow16,
  },
  illustration: {
    flexGrow: 1,
    minHeight: 0,
  },
  caption: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalXXL,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
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
    boxSizing: "border-box",
    flexGrow: 1,
    width: "100%",
    maxWidth: "800px",
    marginInline: "auto",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
    paddingBlock: tokens.spacingVerticalXL,
    paddingInline: tokens.spacingHorizontalL,
    "@media (min-width: 640px)": {
      paddingInline: tokens.spacingHorizontalXXXL,
    },
  },
  heading: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  step: {
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  title: {
    margin: 0,
    overflowWrap: "anywhere",
  },
  muted: {
    color: tokens.colorNeutralForeground3,
    maxWidth: "60ch",
  },
  surface: {
    padding: tokens.spacingHorizontalXL,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow2,
    "@media (max-width: 479px)": {
      padding: tokens.spacingHorizontalL,
    },
  },
  footer: {
    position: "sticky",
    bottom: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  footerInner: {
    boxSizing: "border-box",
    maxWidth: "800px",
    marginInline: "auto",
    display: "flex",
    flexDirection: "column-reverse",
    gap: tokens.spacingVerticalS,
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingInline: tokens.spacingHorizontalXXXL,
    },
  },
  hint: {
    color: tokens.colorNeutralForeground3,
    "@media (min-width: 640px)": {
      marginInlineEnd: "auto",
    },
  },
});

export default function SelectorIntereses() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { markOnboardingAsComplete } = useAuth();

  const [materias, setMaterias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);

  const [cargandoMaterias, setCargandoMaterias] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        setCargandoMaterias(true);
        setError("");

        const data = await getMaterias();

        setMaterias(data);
      } catch (err) {
        console.error("Error al cargar materias:", err);

        setError(
          err.message || "No se pudieron cargar las materias."
        );
      } finally {
        setCargandoMaterias(false);
      }
    };

    cargarMaterias();
  }, []);

  const toggleMateria = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id)
        ? prev.filter((materiaId) => materiaId !== id)
        : [...prev, id]
    );
  };

  // La navegación de React Router corre en una transición: marcar el
  // onboarding en la misma transición evita montar "Mis intereses" un instante.
  const finalizarOnboarding = () => {
    startTransition(() => {
      markOnboardingAsComplete();
      navigate("/", { replace: true });
    });
  };

  const handleGuardar = async () => {
    if (seleccionadas.length === 0) {
      return;
    }

    try {
      setGuardando(true);
      setError("");

      await guardarIntereses(seleccionadas);

      finalizarOnboarding();
    } catch (err) {
      console.error("Error al guardar intereses:", err);

      setError(
        err.message ||
          "No se pudieron guardar tus materias. Intenta nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleOmitir = () => {
    finalizarOnboarding();
  };

  return (
    <div className={styles.root}>
      <div className={styles.column}>
        <div className={styles.topBar}>
          <BrandMark />
          <DarkModeToggle />
        </div>

        {cargandoMaterias ? (
          <PageLoading label="Cargando materias…" />
        ) : (
          <>
            <main className={styles.main}>
              <div className={styles.heading}>
                <Caption1 className={styles.step}>Último paso</Caption1>
                <Title2 as="h1" className={styles.title}>
                  ¿Qué materias te interesan?
                </Title2>
                <Body1 className={styles.muted}>
                  Con ellas te recomendamos tutores afines. Puedes cambiarlas cuando quieras desde
                  “Mis intereses”.
                </Body1>
              </div>

              {error && (
                <MessageBar intent="error" layout="multiline">
                  <MessageBarBody>{error}</MessageBarBody>
                </MessageBar>
              )}

              <div className={styles.surface}>
                <MateriaSelector
                  materias={materias}
                  seleccionadas={seleccionadas}
                  onToggle={toggleMateria}
                  disabled={guardando}
                />
              </div>
            </main>

            <div className={styles.footer}>
              <div className={styles.footerInner}>
                <Caption1 className={styles.hint}>
                  {seleccionadas.length === 0
                    ? "Elige al menos una materia para guardar."
                    : "Puedes agregar más después."}
                </Caption1>
                <Button appearance="subtle" onClick={handleOmitir} disabled={guardando}>
                  Omitir por ahora
                </Button>
                <Button
                  appearance="primary"
                  onClick={handleGuardar}
                  disabled={guardando || seleccionadas.length === 0}
                  icon={guardando ? <Spinner size="tiny" /> : undefined}
                >
                  {guardando ? "Guardando…" : "Guardar y continuar"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <aside className={styles.aside}>
        <div className={styles.photoWrap}>
          <div className={styles.illustration}>
            <IlustracionAprender ajuste="contener" />
          </div>
          <div className={styles.caption}>
            <Subtitle1 as="p">Aprende a tu ritmo</Subtitle1>
            <Body1 as="p" className={styles.muted}>
              Tus intereses deciden qué tutores ves primero en el inicio.
            </Body1>
          </div>
        </div>
      </aside>
    </div>
  );
}
