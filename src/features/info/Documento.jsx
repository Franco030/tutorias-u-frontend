import { Body1, makeStyles, Subtitle1, tokens } from "@fluentui/react-components";
import { useAuth } from "../../context/AuthContext";
import { Page, PageHeader, Surface } from "../../components/ui/Page";

const useStyles = makeStyles({
  documento: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXL,
    maxWidth: "80ch",
  },
  seccion: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    "& p, & ul": {
      margin: 0,
    },
    "& ul": {
      paddingInlineStart: tokens.spacingHorizontalXL,
      display: "flex",
      flexDirection: "column",
      gap: tokens.spacingVerticalXS,
    },
  },
  titulo: {
    margin: 0,
  },
});

/*
 * Documento de texto largo (Términos, Privacidad): encabezado de página y una
 * sola tarjeta con secciones. Se lee también sin sesión; en ese caso no hay
 * shell y "Volver" lleva al acceso.
 */
export function Documento({ titulo, descripcion, secciones }) {
  const styles = useStyles();
  const { isAuthenticated } = useAuth();

  return (
    <Page>
      <PageHeader title={titulo} description={descripcion} backTo={isAuthenticated ? undefined : "/"} />
      <Surface as="article" className={styles.documento}>
        {secciones.map(({ titulo: tituloSeccion, contenido }) => (
          <section key={tituloSeccion} className={styles.seccion}>
            <Subtitle1 as="h2" className={styles.titulo}>
              {tituloSeccion}
            </Subtitle1>
            <Body1 as="div">{contenido}</Body1>
          </section>
        ))}
      </Surface>
    </Page>
  );
}

export default Documento;
