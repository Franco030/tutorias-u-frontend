import { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Body1,
  Button,
  Caption1,
  Link,
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
import { BrandMark } from "../../components/shell/BrandMark";
import { MateriaSelector } from "../../components/ui/MateriaSelector";
import { PageLoading } from "../../components/ui/Page";
import { IlustracionAprender } from "../../components/illustrations/Ilustraciones";

const useStyles = makeStyles({
  // Asistente de primera vez: el contenido (con sus acciones al final) se
  // desplaza a la izquierda; la ilustración queda fija a la derecha.
  root: {
    height: "100dvh",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    backgroundColor: tokens.colorNeutralBackground2,
    "@media (min-width: 1100px)": {
      gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 36%)",
    },
  },
  column: {
    minWidth: 0,
    minHeight: 0,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  // Panel ilustrado a la derecha (solo en pantallas anchas).
  aside: {
    display: "none",
    "@media (min-width: 1100px)": {
      display: "block",
      minHeight: 0,
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
    boxShadow: tokens.shadow8,
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
    // Alineado a la izquierda con la marca y ocupando la columna (como el
    // lienzo de la app); los textos largos ya limitan su ancho de línea.
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
  // Acciones al pie del contenido, alineadas a la izquierda con él: la
  // primaria primero (Fluent 2) y "Omitir" como enlace, sin peso de botón.
  actions: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXL,
    rowGap: tokens.spacingVerticalM,
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
        </div>

        {cargandoMaterias ? (
          <PageLoading label="Cargando materias…" />
        ) : (
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

            <div className={styles.actions}>
              <Button
                appearance="primary"
                onClick={handleGuardar}
                disabled={guardando || seleccionadas.length === 0}
                icon={guardando ? <Spinner size="tiny" /> : undefined}
              >
                {guardando ? "Guardando…" : "Guardar y continuar"}
              </Button>
              <Link as="button" onClick={handleOmitir} disabled={guardando}>
                Omitir por ahora
              </Link>
            </div>
          </main>
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
