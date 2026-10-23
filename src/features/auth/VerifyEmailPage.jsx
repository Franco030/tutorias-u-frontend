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
import { CuentaLayout } from './CuentaLayout';
import { ReenviarVerificacion } from './ReenviarVerificacion';

const useStyles = makeStyles({
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
    token ? 'Verificando tu correo electrónico…' : 'El enlace no trae el código de verificación.'
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
    <CuentaLayout>
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
            El enlace vence a las 24 horas. Escribe tu correo y te enviamos uno nuevo.
          </Body1>
          <ReenviarVerificacion appearance="primary" />
        </>
      )}
    </CuentaLayout>
  );
}

export default VerifyEmailPage;
