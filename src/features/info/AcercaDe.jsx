import { Body1, Caption1, Link, makeStyles, Subtitle1, tokens } from "@fluentui/react-components";
import { useAuth } from "../../context/AuthContext";
import { Page, PageHeader, PageSection, Surface } from "../../components/ui/Page";
import { EnlaceInterno } from "../../components/ui/EnlaceInterno";
import { LogoMark } from "../../components/shell/BrandMark";
import { compilacion, institucional } from "./contenido";

const ANIO = new Date().getFullYear();

const useStyles = makeStyles({
  contenido: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXL,
    maxWidth: "80ch",
  },
  app: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalL,
  },
  appTexto: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  titulo: {
    margin: 0,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  parrafo: {
    margin: 0,
  },
  enlaces: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: tokens.spacingHorizontalXL,
    rowGap: tokens.spacingVerticalS,
  },
});

/*
 * Acerca de, al estilo de la sección "About" de las apps de Windows: nombre,
 * logo y versión arriba; quiénes somos; y los enlaces de ayuda y legales.
 */
export default function AcercaDe() {
  const styles = useStyles();
  const { isAuthenticated } = useAuth();
  const { responsable, correoSoporte } = institucional;

  return (
    <Page>
      <PageHeader title="Acerca de TutoriasU" backTo={isAuthenticated ? undefined : "/"} />
      <div className={styles.contenido}>
        <Surface className={styles.app}>
          <LogoMark size={48} />
          <div className={styles.appTexto}>
            <Subtitle1 as="p" className={styles.titulo}>
              TutoriasU
            </Subtitle1>
            <Caption1 className={styles.muted}>Compilación {compilacion}</Caption1>
          </div>
        </Surface>

        <PageSection id="que-es" title="Qué es TutoriasU">
          <Body1 as="p" className={styles.parrafo}>
            Una plataforma para que los estudiantes universitarios encuentren a un compañero que domine la materia
            que se les complica y agenden una tutoría con él. Quien sabe, enseña; quien necesita, aprende. Los
            tutores pasan por una revisión de la administración antes de recibir citas.
          </Body1>
        </PageSection>

        <PageSection id="quienes-somos" title="Quiénes somos">
          <Body1 as="p" className={styles.parrafo}>
            TutoriasU es un proyecto de {responsable}. Si tienes una duda, una idea o encontraste un error,
            escribe a <Link href={`mailto:${correoSoporte}`}>{correoSoporte}</Link>.
          </Body1>
        </PageSection>

        <PageSection id="informacion" title="Ayuda e información legal">
          <div className={styles.enlaces}>
            <EnlaceInterno to="/ayuda">Ayuda y soporte</EnlaceInterno>
            <EnlaceInterno to="/terminos">Términos de uso</EnlaceInterno>
            <EnlaceInterno to="/privacidad">Aviso de privacidad</EnlaceInterno>
          </div>
          <Caption1 className={styles.muted}>
            © {ANIO} {responsable}
          </Caption1>
        </PageSection>
      </div>
    </Page>
  );
}
