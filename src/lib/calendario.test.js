import { describe, it, expect, vi } from "vitest";
import {
  obtenerFechasEvento,
  construirDatosEvento,
  generarEnlaceGoogle,
  generarEnlaceOutlook,
  generarContenidoIcs,
  descargarArchivoIcs,
} from "./calendario";

describe("calendario", () => {
  const tutoriaEjemplo = {
    id: 42,
    materia: "Cálculo Diferencial",
    rolOpuestoNombre: "Carlos Alumno",
    fechaHoraInicio: "2026-11-10T14:00:00",
    tema: "Derivadas y optimización",
    linkReunion: "https://meet.google.com/abc-defg-hij",
    notas: "Tener a la mano formulario",
    estado: "Aceptada",
  };

  describe("obtenerFechasEvento", () => {
    it("calcula fecha fin por defecto agregando 60 minutos si no viene especificada", () => {
      const fechas = obtenerFechasEvento(tutoriaEjemplo);
      expect(fechas.startCompact).toBe("20261110T140000");
      expect(fechas.endCompact).toBe("20261110T150000");
      expect(fechas.startIso).toBe("2026-11-10T14:00:00");
      expect(fechas.endIso).toBe("2026-11-10T15:00:00");
    });

    it("respeta fechaHoraFin si viene provista", () => {
      const fechas = obtenerFechasEvento({
        ...tutoriaEjemplo,
        fechaHoraFin: "2026-11-10T16:30:00",
      });
      expect(fechas.startCompact).toBe("20261110T140000");
      expect(fechas.endCompact).toBe("20261110T163000");
    });

    it("lanza un error si no hay fechaHoraInicio", () => {
      expect(() => obtenerFechasEvento({})).toThrow(
        "La tutoría no cuenta con fecha de inicio."
      );
    });
  });

  describe("construirDatosEvento", () => {
    it("incluye el título con materia y nombre de la contraparte", () => {
      const datos = construirDatosEvento(tutoriaEjemplo);
      expect(datos.titulo).toBe("Tutoría: Cálculo Diferencial con Carlos Alumno");
      expect(datos.descripcion).toContain("Tema a repasar: Derivadas y optimización");
      expect(datos.descripcion).toContain("Notas: Tener a la mano formulario");
      expect(datos.descripcion).toContain("Enlace de videollamada: https://meet.google.com/abc-defg-hij");
      expect(datos.ubicacion).toBe("https://meet.google.com/abc-defg-hij");
    });

    it("asigna valores por defecto limpios si faltan campos opcionales", () => {
      const datos = construirDatosEvento({
        fechaHoraInicio: "2026-11-10T14:00:00",
      });
      expect(datos.titulo).toBe("Tutoría: Tutoría");
      expect(datos.descripcion).toBe("Generado por TutoriasU");
      expect(datos.ubicacion).toBe("TutoriasU (En línea)");
    });
  });

  describe("generarEnlaceGoogle", () => {
    it("construye una URL válida hacia calendar.google.com con los parámetros adecuados", () => {
      const urlStr = generarEnlaceGoogle(tutoriaEjemplo);
      const url = new URL(urlStr);

      expect(url.origin).toBe("https://calendar.google.com");
      expect(url.pathname).toBe("/calendar/render");
      expect(url.searchParams.get("action")).toBe("TEMPLATE");
      expect(url.searchParams.get("text")).toBe("Tutoría: Cálculo Diferencial con Carlos Alumno");
      expect(url.searchParams.get("dates")).toBe("20261110T140000/20261110T150000");
      expect(url.searchParams.get("location")).toBe("https://meet.google.com/abc-defg-hij");
      expect(url.searchParams.get("ctz")).toBeDefined();
    });
  });

  describe("generarEnlaceOutlook", () => {
    it("construye un enlace profundo válido hacia Outlook Web", () => {
      const urlStr = generarEnlaceOutlook(tutoriaEjemplo);
      const url = new URL(urlStr);

      expect(url.origin).toBe("https://outlook.office.com");
      expect(url.searchParams.get("rru")).toBe("addevent");
      expect(url.searchParams.get("subject")).toBe("Tutoría: Cálculo Diferencial con Carlos Alumno");
      expect(url.searchParams.get("startdt")).toBe("2026-11-10T14:00:00");
      expect(url.searchParams.get("enddt")).toBe("2026-11-10T15:00:00");
    });
  });

  describe("generarContenidoIcs", () => {
    it("genera el formato RFC 5545 con VCALENDAR y VEVENT", () => {
      const ics = generarContenidoIcs(tutoriaEjemplo);

      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("VERSION:2.0");
      expect(ics).toContain("BEGIN:VEVENT");
      expect(ics).toContain("UID:tutoria-42@tutorias-u");
      expect(ics).toContain("DTSTART;TZID=");
      expect(ics).toContain("20261110T140000");
      expect(ics).toContain("DTEND;TZID=");
      expect(ics).toContain("20261110T150000");
      expect(ics).toContain("SUMMARY:Tutoría: Cálculo Diferencial con Carlos Alumno");
      expect(ics).toContain("END:VEVENT");
      expect(ics).toContain("END:VCALENDAR");
    });

    it("escapa adecuadamente caracteres especiales como comas y puntos y comas", () => {
      const tutoriaConComas = {
        ...tutoriaEjemplo,
        tema: "Tema 1, Tema 2; y Tema 3\nNueva línea",
      };
      const ics = generarContenidoIcs(tutoriaConComas);
      expect(ics).toContain("Tema 1\\, Tema 2\\; y Tema 3\\nNueva línea");
    });
  });

  describe("descargarArchivoIcs", () => {
    it("crea un elemento anchor y activa el click para descargar", () => {
      const clickMock = vi.fn();
      const appendSpy = vi.fn();
      const removeSpy = vi.fn();

      const fakeDoc = {
        createElement: vi.fn(() => ({
          href: "",
          setAttribute: vi.fn(),
          click: clickMock,
        })),
        body: {
          appendChild: appendSpy,
          removeChild: removeSpy,
        },
      };

      vi.stubGlobal("document", fakeDoc);
      vi.stubGlobal("URL", {
        createObjectURL: vi.fn(() => "blob:fake-url"),
        revokeObjectURL: vi.fn(),
      });

      descargarArchivoIcs(tutoriaEjemplo);

      expect(clickMock).toHaveBeenCalled();
      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();

      vi.unstubAllGlobals();
    });

    it("no falla si document no está definido", () => {
      vi.stubGlobal("document", undefined);
      expect(() => descargarArchivoIcs(tutoriaEjemplo)).not.toThrow();
      vi.unstubAllGlobals();
    });
  });
});
