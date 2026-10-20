import { useId } from "react";
import { makeStyles, mergeClasses, tokens } from "@fluentui/react-components";

/*
 * Ilustraciones al estilo Fluent de Microsoft: volúmenes que "salen" de la
 * superficie, personas como símbolos (cabeza y torso), un anillo multicolor,
 * fondos limpios y una sola metáfora por ilustración.
 * Todo es SVG propio: los colores vienen de los tokens del tema (claro/oscuro)
 * y el volumen se logra con dos capas sobre cada forma (brillo y sombra).
 *
 * Composición en 480×300 con la zona importante entre y = 70 y y = 230, para
 * que el recorte `slice` funcione en bandas bajas y en paneles altos.
 */

const useStyles = makeStyles({
  svg: {
    display: "block",
    width: "100%",
    height: "100%",
  },
  brand: { fill: tokens.colorCompoundBrandBackground },
  teal: { fill: tokens.colorPaletteTealBorderActive },
  marigold: { fill: tokens.colorPaletteMarigoldBorderActive },
  berry: { fill: tokens.colorPaletteBerryBorderActive },
  lavender: { fill: tokens.colorPaletteLavenderBorderActive },
  green: { fill: tokens.colorPaletteLightGreenBorderActive },
  red: { fill: tokens.colorPaletteRedBorderActive },
  // El papel es blanco en ambos temas (como en las ilustraciones de Microsoft).
  paper: { fill: tokens.colorNeutralForegroundStaticInverted, fillOpacity: 0.95 },
  line: { fill: tokens.colorNeutralStroke1 },
  // Suelo: un velo del color de texto, se adapta solo a claro y oscuro.
  floor: { fill: `color-mix(in srgb, ${tokens.colorNeutralForeground1} 6%, transparent)` },
  whiteStroke: { stroke: tokens.colorNeutralForegroundStaticInverted },
  // Paradas de degradado (stop-color no admite clases de fill).
  stopBrand: { stopColor: tokens.colorCompoundBrandBackground },
  stopTeal: { stopColor: tokens.colorPaletteTealBorderActive },
  stopMarigold: { stopColor: tokens.colorPaletteMarigoldBorderActive },
  stopBerry: { stopColor: tokens.colorPaletteBerryBorderActive },
  stopLavender: { stopColor: tokens.colorPaletteLavenderBorderActive },
  stopLight: { stopColor: tokens.colorNeutralForegroundStaticInverted },
  stopShade: { stopColor: tokens.colorNeutralShadowKeyDarker },
  stopBg: { stopColor: tokens.colorCompoundBrandBackground },
  stopBgEnd: { stopColor: tokens.colorNeutralBackground3 },
});

const limpiarId = (id) => id.replace(/[^a-zA-Z0-9_-]/g, "");

// Gradientes compartidos de una ilustración: brillo, sombra, fondo y anillo.
function Defs({ id }) {
  const s = useStyles();
  return (
    <defs>
      <radialGradient id={`${id}-hl`} cx="0.32" cy="0.28" r="0.75">
        <stop offset="0" className={s.stopLight} stopOpacity="0.65" />
        <stop offset="0.55" className={s.stopLight} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-sh`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.45" className={s.stopShade} stopOpacity="0" />
        <stop offset="1" className={s.stopShade} stopOpacity="1" />
      </linearGradient>
      <radialGradient id={`${id}-bg`} cx="0.5" cy="0.55" r="0.75">
        <stop offset="0" className={s.stopBg} stopOpacity="0.18" />
        <stop offset="1" className={s.stopBgEnd} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-drop`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" className={s.stopShade} stopOpacity="0.9" />
        <stop offset="1" className={s.stopShade} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" className={s.stopBrand} />
        <stop offset="0.35" className={s.stopTeal} />
        <stop offset="0.65" className={s.stopMarigold} />
        <stop offset="1" className={s.stopBerry} />
      </linearGradient>
    </defs>
  );
}

// Una forma con volumen: color base + brillo arriba a la izquierda + sombra abajo.
function Volumen({ id, tono, children }) {
  const s = useStyles();
  return (
    <g>
      <g className={s[tono]}>{children}</g>
      <g fill={`url(#${id}-hl)`}>{children}</g>
      <g fill={`url(#${id}-sh)`} opacity="0.55">{children}</g>
    </g>
  );
}

function Sombra({ id, cx, cy, rx, ry = rx * 0.22 }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-drop)`} opacity="0.5" />;
}

// Persona como símbolo: cabeza esférica y torso en cúpula.
function Persona({ id, x, y, s = 30, tono }) {
  const w = s * 0.78;
  return (
    <g>
      <Sombra id={id} cx={x} cy={y + 2} rx={w * 1.15} />
      <Volumen id={id} tono={tono}>
        <path d={`M${x - w} ${y} V${y - s * 0.32} A${w} ${w} 0 0 1 ${x + w} ${y - s * 0.32} V${y} Z`} />
      </Volumen>
      <Volumen id={id} tono={tono}>
        <circle cx={x} cy={y - s * 1.42} r={s * 0.42} />
      </Volumen>
    </g>
  );
}

function Esfera({ id, cx, cy, r, tono, sombra = true }) {
  return (
    <g>
      {sombra && <Sombra id={id} cx={cx} cy={cy + r * 2.4} rx={r * 0.9} />}
      <Volumen id={id} tono={tono}>
        <circle cx={cx} cy={cy} r={r} />
      </Volumen>
    </g>
  );
}

// `ajuste="cubrir"` recorta (bandas anchas); `ajuste="contener"` no recorta (paneles altos).
function Base({ id, children, className, label, ajuste = "cubrir" }) {
  const s = useStyles();
  return (
    <svg
      viewBox="0 0 480 300"
      preserveAspectRatio={ajuste === "contener" ? "xMidYMid meet" : "xMidYMid slice"}
      className={mergeClasses(s.svg, className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Defs id={id} />
      <rect width="480" height="300" fill={`url(#${id}-bg)`} />
      {children}
    </svg>
  );
}

/* Comunidad: una persona al centro rodeada de otras, unidas por un anillo. */
export function IlustracionComunidad({ className, label, ajuste }) {
  const s = useStyles();
  const id = `il-${limpiarId(useId())}`;
  const anillo = { cx: 240, cy: 178, rx: 168, ry: 40 };
  const arco = (sup) =>
    `M${anillo.cx - anillo.rx} ${anillo.cy} A${anillo.rx} ${anillo.ry} 0 0 ${sup ? 1 : 0} ${anillo.cx + anillo.rx} ${anillo.cy}`;

  return (
    <Base id={id} className={className} label={label} ajuste={ajuste}>
      <ellipse cx="240" cy="194" rx="118" ry="24" className={s.floor} />
      {/* Mitad trasera del anillo y las personas de atrás */}
      <path d={arco(true)} fill="none" stroke={`url(#${id}-ring)`} strokeWidth="9" strokeLinecap="round" opacity="0.55" />
      <Persona id={id} x={132} y={156} s={21} tono="teal" />
      <Persona id={id} x={350} y={154} s={21} tono="lavender" />
      {/* Persona central sobre su plataforma */}
      <Persona id={id} x={240} y={182} s={38} tono="brand" />
      {/* Mitad delantera del anillo y las personas de adelante */}
      <path d={arco(false)} fill="none" stroke={`url(#${id}-ring)`} strokeWidth="11" strokeLinecap="round" />
      <Persona id={id} x={162} y={214} s={23} tono="marigold" />
      <Persona id={id} x={322} y={216} s={23} tono="berry" />
      <Esfera id={id} cx={96} cy={100} r={9} tono="marigold" sombra={false} />
      <Esfera id={id} cx={392} cy={96} r={12} tono="teal" sombra={false} />
      <Esfera id={id} cx={298} cy={86} r={6} tono="berry" sombra={false} />
    </Base>
  );
}

/* Aprender: un libro abierto del que se elevan volúmenes. */
export function IlustracionAprender({ className, label, ajuste }) {
  const s = useStyles();
  const id = `il-${limpiarId(useId())}`;

  return (
    <Base id={id} className={className} label={label} ajuste={ajuste}>
      <ellipse cx="240" cy="228" rx="150" ry="24" className={s.floor} />
      <Sombra id={id} cx={240} cy={226} rx={130} ry={16} />
      {/* Tapas y páginas */}
      <Volumen id={id} tono="brand">
        <path d="M240 214 L110 196 Q104 195 105 189 L112 168 L240 186 L368 168 L375 189 Q376 195 370 196 Z" />
      </Volumen>
      <path d="M240 186 L118 168 Q140 146 176 146 Q212 148 240 168 Z" className={s.paper} />
      <path d="M240 186 L362 168 Q340 146 304 146 Q268 148 240 168 Z" className={s.paper} />
      <path d="M240 186 L240 168" stroke="currentColor" opacity="0.15" />
      {[0, 1, 2].map((i) => (
        <g key={i} className={s.line} opacity="0.7">
          <rect x={140 + i * 4} y={160 + i * 7} width="70" height="3" rx="1.5" transform={`rotate(8 ${175 + i * 4} ${161 + i * 7})`} />
          <rect x={270 - i * 4} y={160 + i * 7} width="70" height="3" rx="1.5" transform={`rotate(-8 ${305 - i * 4} ${161 + i * 7})`} />
        </g>
      ))}
      {/* Volúmenes que se elevan */}
      <Esfera id={id} cx={240} cy={104} r={26} tono="lavender" sombra={false} />
      <Volumen id={id} tono="teal">
        <path d="M150 112 l22 -12 l22 12 l0 26 l-22 12 l-22 -12 Z" />
      </Volumen>
      <path d="M150 112 l22 12 l22 -12 M172 124 v26" fill="none" stroke="currentColor" opacity="0.12" />
      <g transform="translate(318 96) rotate(-18)">
        <ellipse cx="0" cy="0" rx="26" ry="12" fill="none" stroke={`url(#${id}-ring)`} strokeWidth="8" />
      </g>
      <Esfera id={id} cx={120} cy={70} r={7} tono="marigold" sombra={false} />
      <Esfera id={id} cx={372} cy={150} r={9} tono="berry" sombra={false} />
    </Base>
  );
}

const ESTADOS = {
  pendiente: { tono: "marigold", icono: "M-6 -10 V2 L6 8" },
  aprobado: { tono: "green", icono: "M-11 1 L-3 9 L12 -8" },
  rechazado: { tono: "red", icono: "M-9 -9 L9 9 M9 -9 L-9 9" },
};

/* Revisión: un documento con un distintivo que indica el estado. */
export function IlustracionRevision({ className, label, ajuste, estado = "pendiente" }) {
  const s = useStyles();
  const id = `il-${limpiarId(useId())}`;
  const config = ESTADOS[estado] || ESTADOS.pendiente;

  return (
    <Base id={id} className={className} label={label} ajuste={ajuste}>
      <ellipse cx="240" cy="230" rx="130" ry="22" className={s.floor} />
      <Sombra id={id} cx={232} cy={226} rx={92} ry={14} />
      {/* Documento trasero y delantero, ligeramente rotados */}
      <g transform="rotate(-8 214 150)">
        <Volumen id={id} tono="lavender">
          <rect x="160" y="70" width="110" height="146" rx="12" />
        </Volumen>
      </g>
      <g transform="rotate(5 250 150)">
        <rect x="190" y="74" width="120" height="152" rx="12" className={s.paper} />
        <rect x="190" y="74" width="120" height="152" rx="12" fill="none" stroke="currentColor" opacity="0.1" />
        <rect x="208" y="96" width="56" height="8" rx="4" className={s.brand} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="208" y={118 + i * 16} width={i === 3 ? 48 : 84} height="5" rx="2.5" className={s.line} />
        ))}
      </g>
      {/* Distintivo de estado */}
      <Esfera id={id} cx={318} cy={196} r={30} tono={config.tono} />
      <g transform="translate(318 196)">
        <path d={config.icono} fill="none" className={s.whiteStroke} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <Esfera id={id} cx={146} cy={96} r={10} tono="teal" sombra={false} />
      <Esfera id={id} cx={372} cy={92} r={7} tono="brand" sombra={false} />
    </Base>
  );
}
