import { tokens } from "@fluentui/react-components";

/*
 * Hover y presionado para elementos sutiles sobre la base del shell (Mica).
 * colorSubtleBackgroundHover de Fluent es #f5f5f5 en claro, prácticamente el
 * mismo tono que la base (contraste 1.07:1): el hover no se veía. Un velo del
 * color de texto oscurece en claro y aclara en oscuro, así siempre contrasta
 * con lo que tenga detrás (≈1.2:1 en claro, ≈1.3:1 en oscuro).
 */
export const veloHover = `color-mix(in srgb, ${tokens.colorNeutralForeground1} 10%, transparent)`;
export const veloPresionado = `color-mix(in srgb, ${tokens.colorNeutralForeground1} 14%, transparent)`;
