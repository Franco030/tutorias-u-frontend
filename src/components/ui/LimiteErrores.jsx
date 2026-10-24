import { Component } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Link, makeStyles, tokens } from "@fluentui/react-components";
import { Page, PageHeader } from "./Page";
import { TarjetaIlustrada } from "./TarjetaIlustrada";
import { IlustracionRevision } from "../illustrations/Ilustraciones";

const useStyles = makeStyles({
  acciones: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: tokens.spacingHorizontalL,
  },
});

// Tras publicar una versión nueva, una pantalla que todavía no se había
// descargado ya no existe en el servidor: recargar lo resuelve.
const esVersionNueva = (error) =>
  /dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(error?.message ?? "");

function PantallaError({ error }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const versionNueva = esVersionNueva(error);

  return (
    <Page>
      <PageHeader
        title={versionNueva ? "Hay una versión nueva" : "Algo salió mal"}
        description={
          versionNueva
            ? "TutoriasU se actualizó mientras la tenías abierta."
            : "Esta pantalla tuvo un error y no se pudo mostrar."
        }
      />
      <TarjetaIlustrada
        ilustracion={<IlustracionRevision estado="rechazado" />}
        title={versionNueva ? "Recarga para usar la versión nueva" : "Recarga la página para intentarlo de nuevo"}
        description={
          versionNueva
            ? "Lo que ya guardaste no se perdió; solo hace falta descargar la versión actual."
            : "Lo que ya guardaste no se perdió. Si vuelve a pasar, escríbenos desde Ayuda y soporte contándonos qué estabas haciendo."
        }
        action={
          <span className={styles.acciones}>
            <Button appearance="primary" onClick={() => window.location.reload()}>
              Recargar la página
            </Button>
            <Link
              href="/"
              onClick={(event) => {
                event.preventDefault();
                navigate("/");
              }}
            >
              Ir al inicio
            </Link>
          </span>
        }
      />
    </Page>
  );
}

class Limite extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Error al mostrar la pantalla:", error, info.componentStack);
  }

  // Al cambiar de ruta se intenta otra vez. Sin `key`: una llave por ruta
  // volvía a montar todo lo de adentro (también el shell) en cada navegación
  // y el menú lateral perdía sus transiciones.
  componentDidUpdate(anteriores) {
    if (this.state.error && anteriores.pathname !== this.props.pathname) {
      this.setState({ error: null });
    }
  }

  render() {
    return this.state.error ? <PantallaError error={this.state.error} /> : this.props.children;
  }
}

/*
 * Si una pantalla falla al dibujarse, muestra "Algo salió mal" en su lugar en
 * vez de dejar la app en blanco. Dentro del shell, la navegación sigue a la
 * mano; al cambiar de ruta el límite se reinicia y la nueva pantalla se
 * intenta otra vez.
 */
export function LimiteErrores({ children }) {
  const { pathname } = useLocation();
  return <Limite pathname={pathname}>{children}</Limite>;
}

export default LimiteErrores;
