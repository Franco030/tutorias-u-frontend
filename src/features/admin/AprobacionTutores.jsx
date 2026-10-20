import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Caption1,
  makeStyles,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Spinner,
  Text,
  tokens,
} from '@fluentui/react-components';
import { ArrowClockwise20Regular, Checkmark20Regular, PeopleCheckmark24Regular } from '@fluentui/react-icons';
import {
  aprobarTutor,
  getSolicitudesPendientes,
} from '../../services/adminService';
import { EmptyState } from '../../components/ui/EmptyState';
import { Page, PageHeader, PageSection, Surface } from '../../components/ui/Page';
import { SessionListSkeleton } from '../../components/ui/SessionList';

const useStyles = makeStyles({
  list: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '40px minmax(0, 1fr)',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalL,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
    ':last-child': {
      borderBottomStyle: 'none',
    },
    '@media (min-width: 640px)': {
      gridTemplateColumns: '40px minmax(0, 1fr) auto',
    },
  },
  identity: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  email: {
    color: tokens.colorNeutralForeground3,
  },
  action: {
    gridColumn: '1 / -1',
    '@media (min-width: 640px)': {
      gridColumn: 'auto',
    },
  },
});

function getErrorMessage(error) {
  if (error?.status === 403) {
    return 'No tienes permisos para consultar las solicitudes de tutores.';
  }

  return error?.message || 'No fue posible cargar las solicitudes.';
}

export default function AprobacionTutores() {
  const styles = useStyles();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const cargarSolicitudes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSolicitudesPendientes();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const cargarSolicitudesIniciales = async () => {
      try {
        const data = await getSolicitudesPendientes();
        if (isMounted) {
          setSolicitudes(Array.isArray(data) ? data : []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void cargarSolicitudesIniciales();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAprobar = async (id) => {
    setApprovingId(id);
    setError(null);
    setFeedback(null);

    try {
      await aprobarTutor(id);
      setSolicitudes((current) => current.filter((solicitud) => solicitud.id !== id));
      setFeedback('Tutor aprobado. Ya puede configurar sus materias y horarios.');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <Page>
      <PageHeader
        title="Aprobación de tutores"
        description="Revisa las solicitudes pendientes antes de habilitar a un tutor para enseñar."
        actions={
          <Button
            appearance="secondary"
            icon={<ArrowClockwise20Regular />}
            onClick={cargarSolicitudes}
            disabled={loading}
          >
            Actualizar
          </Button>
        }
      />

      {feedback && (
        <MessageBar intent="success" layout="multiline">
          <MessageBarBody>{feedback}</MessageBarBody>
        </MessageBar>
      )}

      {error && (
        <MessageBar intent="error" layout="multiline">
          <MessageBarBody>{error}</MessageBarBody>
          <MessageBarActions>
            <Button onClick={cargarSolicitudes}>Reintentar</Button>
          </MessageBarActions>
        </MessageBar>
      )}

      <PageSection
        id="pendientes"
        title={loading ? 'Solicitudes pendientes' : `Solicitudes pendientes (${solicitudes.length})`}
      >
        {loading ? (
          <SessionListSkeleton rows={3} />
        ) : solicitudes.length === 0 ? (
          <EmptyState
            icon={<PeopleCheckmark24Regular />}
            title="No hay solicitudes por revisar"
            description="Cuando un estudiante se postule como tutor, su solicitud aparecerá aquí."
          />
        ) : (
          <Surface flush>
            <ul className={styles.list}>
              {solicitudes.map((solicitud) => {
                const aprobando = approvingId === solicitud.id;
                return (
                  <li key={solicitud.id} className={styles.row}>
                    <Avatar name={solicitud.nombre} color="colorful" />
                    <div className={styles.identity}>
                      <Text weight="semibold" className={styles.truncate}>
                        {solicitud.nombre}
                      </Text>
                      <Caption1 className={styles.truncate}>
                        <span className={styles.email}>{solicitud.correo}</span>
                      </Caption1>
                    </div>
                    <Button
                      appearance="primary"
                      className={styles.action}
                      onClick={() => handleAprobar(solicitud.id)}
                      disabled={approvingId !== null}
                      icon={aprobando ? <Spinner size="tiny" /> : <Checkmark20Regular />}
                      aria-label={`Aprobar a ${solicitud.nombre}`}
                    >
                      {aprobando ? 'Aprobando…' : 'Aprobar'}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </Surface>
        )}
      </PageSection>
    </Page>
  );
}
