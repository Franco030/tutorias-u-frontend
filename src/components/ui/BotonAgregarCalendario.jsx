import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from "@fluentui/react-components";
import {
  CalendarAdd20Regular,
  ArrowDownload20Regular,
  Open20Regular,
} from "@fluentui/react-icons";
import {
  descargarArchivoIcs,
  generarEnlaceGoogle,
  generarEnlaceOutlook,
} from "../../lib/calendario";

export function BotonAgregarCalendario({
  tutoria,
  appearance = "secondary",
  size = "medium",
  disabled = false,
}) {
  if (!tutoria?.fechaHoraInicio) {
    return null;
  }

  const handleGoogle = () => {
    const url = generarEnlaceGoogle(tutoria);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOutlook = () => {
    const url = generarEnlaceOutlook(tutoria);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleIcs = () => {
    descargarArchivoIcs(tutoria);
  };

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance={appearance}
          size={size}
          disabled={disabled}
          icon={<CalendarAdd20Regular />}
          aria-label="Agregar tutoría al calendario"
        >
          Agregar al calendario
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem
            icon={<Open20Regular />}
            onClick={handleGoogle}
          >
            Google Calendar
          </MenuItem>
          <MenuItem
            icon={<Open20Regular />}
            onClick={handleOutlook}
          >
            Outlook (Microsoft 365)
          </MenuItem>
          <MenuItem
            icon={<ArrowDownload20Regular />}
            onClick={handleIcs}
          >
            Descargar archivo (.ics)
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}

export default BotonAgregarCalendario;
