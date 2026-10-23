import { useEffect, useState } from 'react';
import { useNotificar } from '../../hooks/useNotificar';
import {
  Avatar,
  Body1,
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  makeStyles,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Spinner,
  Tag,
  Text,
  Textarea,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowClockwise20Regular,
  Checkmark20Regular,
  DocumentSearch20Regular,
  PeopleCheckmark24Regular,
} from '@fluentui/react-icons';
import {
  aprobarTutor,
  getSolicitudesPendientes,
  rechazarTutor,
} from '../../services/adminService';
import { DangerButton } from '../../components/ui/DangerButton';
import { IlustracionRevision } from '../../components/illustrations/Ilustraciones';
import { EmptyState } from '../../components/ui/EmptyState';
import { Page, PageHeader, PageSection, Surface } from '../../components/ui/Page';
import { SessionListSkeleton } from '../../components/ui/SessionList';

const formatoFecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' });

const useStyles = makeStyles({
  rechazo: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
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
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
    '@media (min-width: 640px)': {
      gridColumn: 'auto',
      justifyContent: 'flex-end',
    },
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalXS,
  },
});

function getErrorMessage(error) {
  if (error?.status === 403) {
    return 'No tienes permisos para consultar las solicitudes de tutores.';
  }

  return error?.message || 'No fue posible cargar las solicitudes.';
}

export default function AprobacionTutores() {
  const notificar = useNotificar();
  const styles = useStyles();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  // Rechazo con confirmación: la solicitud sale de la lista y no se recupera aquí.
  const [porRechazar, setPorRechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState(null);

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

    try {
      await aprobarTutor(id);
      const aprobado = solicitudes.find((solicitud) => solicitud.id === id);
      setSolicitudes((current) => current.filter((solicitud) => solicitud.id !== id));
      notificar('Tutor aprobado', {
        cuerpo: `${aprobado?.nombre ?? 'El tutor'} ya puede configurar sus materias y horarios.`,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setApprovingId(null);
    }
  };

  const confirmarRechazo = async () => {
    const solicitud = porRechazar;
    if (!solicitud) return;
    setApprovingId(solicitud.id);
    setError(null);
    try {
      await rechazarTutor(solicitud.id, motivoRechazo.trim());
      setSolicitudes((current) => current.filter((s) => s.id !== solicitud.id));
      notificar('Solicitud rechazada', { cuerpo: solicitud.nombre, intent: 'info' });
      setPorRechazar(null);
      setMotivoRechazo('');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <Page cargando={loading}>
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
            ilustracion={<IlustracionRevision estado="aprobado" />}
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
                      <Text weight="semibold" className={styles.truncate} id={`aspirante-${solicitud.id}`}>
                        {solicitud.nombre}
                      </Text>
                      <Caption1 className={styles.truncate}>
                        <span className={styles.email}>
                          {solicitud.correo}
                          {solicitud.fechaSolicitud &&
                            ` · ${formatoFecha.format(new Date(solicitud.fechaSolicitud))}`}
                        </span>
                      </Caption1>
                      {solicitud.materias?.length > 0 && (
                        <div className={styles.tags} role="group" aria-label="Materias solicitadas">
                          {solicitud.materias.map((materia) => (
                            <Tag key={materia} size="small" appearance="outline" shape="rounded">
                              {materia}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={styles.action}>
                      {solicitud.urlCredencial && (
                        <Button
                          as="a"
                          href={solicitud.urlCredencial}
                          target="_blank"
                          rel="noopener noreferrer"
                          appearance="subtle"
                          icon={<DocumentSearch20Regular />}
                        >
                          Ver comprobante
                        </Button>
                      )}
                      <DangerButton
                        variant="outline"
                        onClick={() => setPorRechazar(solicitud)}
                        disabled={approvingId !== null}
                        aria-describedby={`aspirante-${solicitud.id}`}
                      >
                        Rechazar
                      </DangerButton>
                      <Button
                        onClick={() => handleAprobar(solicitud.id)}
                        disabled={approvingId !== null}
                        icon={aprobando ? <Spinner size="tiny" /> : <Checkmark20Regular />}
                        aria-describedby={`aspirante-${solicitud.id}`}
                      >
                        {aprobando ? 'Aprobando…' : 'Aprobar'}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Surface>
        )}
      </PageSection>

      <Dialog
        open={Boolean(porRechazar)}
        onOpenChange={(_, data) => {
          if (!data.open && approvingId === null) {
            setPorRechazar(null);
            setMotivoRechazo('');
          }
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>¿Rechazar esta solicitud?</DialogTitle>
            <DialogContent className={styles.rechazo}>
              <Body1>
                {porRechazar &&
                  `${porRechazar.nombre} verá su solicitud como rechazada. Podrá volver a postularse más adelante.`}
              </Body1>
              <Field label="Motivo del rechazo" required hint="Se incluye en el correo que recibe el aspirante.">
                <Textarea
                  value={motivoRechazo}
                  onChange={(_, data) => setMotivoRechazo(data.value)}
                  placeholder="Escribe el motivo del rechazo…"
                  maxLength={500}
                  resize="vertical"
                  rows={3}
                />
              </Field>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setPorRechazar(null);
                  setMotivoRechazo('');
                }}
                disabled={approvingId !== null}
              >
                Volver
              </Button>
              <DangerButton
                onClick={confirmarRechazo}
                disabled={approvingId !== null || !motivoRechazo.trim()}
                icon={approvingId !== null ? <Spinner size="tiny" /> : undefined}
              >
                {approvingId !== null ? 'Rechazando…' : 'Rechazar solicitud'}
              </DangerButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </Page>
  );
}
