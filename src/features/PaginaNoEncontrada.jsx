import { useNavigate } from "react-router-dom";
import { Button, makeStyles, tokens } from "@fluentui/react-components";
import { Page, PageHeader } from "../components/ui/Page";
import { TarjetaIlustrada } from "../components/ui/TarjetaIlustrada";
import patoPerdido from "../assets/pato-perdido.png";

const useStyles = makeStyles({
  // Mismo encuadre que las ilustraciones: el pato entero dentro del panel.
  pato: {
    display: "block",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: tokens.spacingVerticalL,
  },
});

// TarjetaIlustrada le pasa `ajuste` como a sus ilustraciones; la foto siempre se contiene.
function PatoPerdido() {
  const styles = useStyles();
  return (
    <img
      className={styles.pato}
      src={patoPerdido}
      width={480}
      height={545}
      alt="Un pato con arnés mira a la cámara, un poco desorientado"
    />
  );
}

/*
 * Ruta que no existe: encabezado de página y tarjeta ilustrada, como las demás
 * pantallas de un solo mensaje. Va dentro del shell si hay sesión (la
 * navegación sigue a la mano) y sola si no la hay.
 */
export default function PaginaNoEncontrada() {
  const navigate = useNavigate();

  return (
    <Page>
      <PageHeader
        title="Esta página no existe"
        description="Error 404: la dirección no corresponde a ninguna página de TutoriasU."
      />
      <TarjetaIlustrada
        ilustracion={<PatoPerdido />}
        title="Hasta el pato se perdió buscándola"
        description="Revisa que la dirección esté bien escrita o vuelve al inicio para seguir desde ahí."
        action={
          <Button appearance="primary" onClick={() => navigate("/", { replace: true })}>
            Volver al inicio
          </Button>
        }
      />
    </Page>
  );
}
