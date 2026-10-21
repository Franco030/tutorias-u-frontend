import { useEffect, useState } from 'react';
import {
  Body1,
  makeStyles,
  mergeClasses,
  MessageBar,
  MessageBarBody,
  Spinner,
  Title2,
  tokens,
} from '@fluentui/react-components';
import { CheckmarkCircle48Regular, ErrorCircle48Regular } from '@fluentui/react-icons';
import authService from './authService';
import { BrandMark } from '../../components/shell/BrandMark';
import { Surface } from '../../components/ui/Page';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
    '@media (min-width: 640px)': {
      paddingInline: tokens.spacingHorizontalXXXL,
    },
  },
  main: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingHorizontalL,
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalM,
  },
  icon: { display: 'flex' },
  success: { color: tokens.colorPaletteGreenForeground1 },
  error: { color: tokens.colorPaletteRedForeground1 },
  title: { margin: 0 },
  muted: { color: tokens.colorNeutralForeground3 },
});

export function VerifyEmailPage() {
  const styles = useStyles();
  const queryParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const token = queryParams.get('token');

  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState(
    token ? 'Verificando tu correo electrónico...' : 'No se encontró el token de verificación en la URL.'
  );

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Correo verificado exitosamente.');
      } catch (err) {
        setStatus('error');
        setMessage(err?.message || 'Ocurrió un error al verificar el correo.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <BrandMark />
      </div>

      <main className={styles.main}>
        <Surface className={styles.card}>
          {status === 'loading' && (
            <>
              <Spinner size="large" />
              <Title2 as="h1" className={styles.title}>Verificando tu correo</Title2>
              <Body1 className={styles.muted}>Esto tarda unos segundos.</Body1>
            </>
          )}

          {status === 'success' && (
            <>
              <span className={mergeClasses(styles.icon, styles.success)} aria-hidden="true">
                <CheckmarkCircle48Regular />
              </span>
              <Title2 as="h1" className={styles.title}>Correo verificado</Title2>
              <Body1 className={styles.muted}>
                Ya puedes cerrar esta pestaña y volver a la ventana de TutoriasU para iniciar sesión.
              </Body1>
            </>
          )}

          {status === 'error' && (
            <>
              <span className={mergeClasses(styles.icon, styles.error)} aria-hidden="true">
                <ErrorCircle48Regular />
              </span>
              <Title2 as="h1" className={styles.title}>No pudimos verificar tu correo</Title2>
              <MessageBar intent="error" layout="multiline">
                <MessageBarBody>{message}</MessageBarBody>
              </MessageBar>
              <Body1 className={styles.muted}>
                Cierra esta pestaña y vuelve a intentarlo desde la aplicación. Si el enlace es antiguo, regístrate de nuevo para recibir otro.
              </Body1>
            </>
          )}
        </Surface>
      </main>
    </div>
  );
}

export default VerifyEmailPage;
