
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface BeadColor {
  id: string; // The display code (e.g., "S01", "P01")
  name: string;
  hex: string;
  rgb: RGB;
}

export interface PalettePreset {
  id: string;
  name: string;
  description?: string;
  colors: BeadColor[]; // The specific subset of colors for this palette
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  colors: BeadColor[]; // Master list of all colors for this brand
  presets: PalettePreset[]; // Available sets (e.g., 24 colors, 72 colors)
}

export interface BeadPixel {
  x: number;
  y: number;
  colorId: string;
  color: BeadColor;
}

export interface ProjectSettings {
  width: number; // in beads
  height: number; // in beads
  brandId: string; // Selected brand
  paletteId: string; // Selected preset within the brand
  dither: boolean;
  showGrid: boolean;
  showNumbers: boolean;
  pixelShape: 'circle' | 'square';
}

export type ProcessingStatus = 'IDLE' | 'PROCESSING' | 'DONE';
