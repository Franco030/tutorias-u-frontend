import { useNavigate } from "react-router-dom";
import { Body1, Button, Caption1, makeStyles, Title2, tokens } from "@fluentui/react-components";
import { Page } from "../components/ui/Page";
import patoPerdido from "../assets/pato-perdido.png";

const useStyles = makeStyles({
  // Con o sin el shell: ocupa el alto disponible y centra el contenido.
  root: {
    display: "grid",
    placeItems: "center",
    minHeight: "calc(100dvh - 160px)",
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalL}`,
  },
  contenido: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalS,
    maxWidth: "440px",
    textAlign: "center",
  },
  pato: {
    width: "220px",
    height: "auto",
    marginBottom: tokens.spacingVerticalM,
    filter: `drop-shadow(0 8px 12px color-mix(in srgb, ${tokens.colorNeutralShadowKey} 60%, transparent))`,
  },
  codigo: {
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: "0.08em",
  },
  titulo: {
    margin: 0,
  },
  texto: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    textAlign: "center",
  },
  accion: {
    marginTop: tokens.spacingVerticalL,
  },
});

/*
 * Ruta que no existe. Va dentro del shell si hay sesión (la navegación sigue
 * a la mano) y sola si no la hay.
 */
export default function PaginaNoEncontrada() {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <Page className={styles.root}>
      <div className={styles.contenido}>
        <img
          className={styles.pato}
          src={patoPerdido}
          width={480}
          height={545}
          alt="Un pato con arnés mira a la cámara, un poco desorientado"
        />
        <Caption1 className={styles.codigo}>ERROR 404</Caption1>
        <Title2 as="h1" className={styles.titulo}>
          Esta página no existe
        </Title2>
        <Body1 as="p" className={styles.texto}>
          Hasta el pato se perdió buscándola. Revisa la dirección o vuelve al inicio.
        </Body1>
        <Button className={styles.accion} appearance="primary" onClick={() => navigate("/", { replace: true })}>
          Volver al inicio
        </Button>
      </div>
    </Page>
  );
}
