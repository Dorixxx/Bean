
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface BeadColor {
  id: string; // The display code (e.g., "P01")
  name: string;
  hex: string;
  rgb: RGB;
}

// Configuration types
export interface BrandConfig {
  id: string;
  name: string;
  colors: BeadColor[];
}

export interface PalettePreset {
  id: string;
  name: string;
  description?: string;
  colors: BeadColor[]; // The specific subset of colors for this palette
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
  paletteId: string;
  dither: boolean;
  showGrid: boolean;
  showNumbers: boolean;
  pixelShape: 'circle' | 'square';
}

export type ProcessingStatus = 'IDLE' | 'PROCESSING' | 'DONE';
