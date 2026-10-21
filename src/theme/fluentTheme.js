import { createDarkTheme, createLightTheme } from "@fluentui/react-components";

/*
 * Rampa de marca TutoriasU generada en OKLCH a partir de #456ad1 (tono 80).
 * 80 es el fondo de marca en modo claro (blanco encima: 4.96:1).
 * En modo oscuro el fondo de marca usa 70 (blanco encima: 6.25:1)
 * y el texto de marca usa 110/120 (≥ 5.6:1 sobre #292929).
 */
export const brandTutoriasU = {
  10: "#050d28",
  20: "#0c183d",
  30: "#142553",
  40: "#1d326b",
  50: "#273f83",
  60: "#304d9c",
  70: "#3b5bb6",
  80: "#456ad1",
  90: "#587cd9",
  100: "#6d8ee1",
  110: "#81a0e8",
  120: "#96b1ef",
  130: "#acc2f6",
  140: "#c2d4fc",
  150: "#dae5fe",
  160: "#f3f7fe",
};

const fontFamilyBase =
  "'Segoe UI Variable Text', 'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif";

const fontOverrides = {
  fontFamilyBase,
};

export const lightTheme = {
  ...createLightTheme(brandTutoriasU),
  ...fontOverrides,
};

export const darkTheme = {
  ...createDarkTheme(brandTutoriasU),
  ...fontOverrides,
  colorBrandForeground1: brandTutoriasU[110],
  colorBrandForeground2: brandTutoriasU[120],
  colorBrandForegroundLink: brandTutoriasU[110],
  colorBrandForegroundLinkHover: brandTutoriasU[120],
  colorBrandForegroundLinkPressed: brandTutoriasU[100],
  colorBrandForegroundLinkSelected: brandTutoriasU[110],
  colorCompoundBrandForeground1: brandTutoriasU[110],
  colorCompoundBrandForeground1Hover: brandTutoriasU[120],
  colorCompoundBrandForeground1Pressed: brandTutoriasU[100],
  colorCompoundBrandStroke: brandTutoriasU[110],
  colorCompoundBrandStrokeHover: brandTutoriasU[120],
  colorCompoundBrandStrokePressed: brandTutoriasU[100],
  colorNeutralForeground2BrandHover: brandTutoriasU[110],
  colorNeutralForeground2BrandPressed: brandTutoriasU[100],
  colorNeutralForeground2BrandSelected: brandTutoriasU[110],
  colorNeutralForeground3BrandHover: brandTutoriasU[110],
  colorNeutralForeground3BrandPressed: brandTutoriasU[100],
  colorNeutralForeground3BrandSelected: brandTutoriasU[110],
};
