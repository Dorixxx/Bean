
import { BeadColor, BeadPixel, RGB } from './types';

// Euclidean distance squared
function getColorDistance(c1: RGB, c2: RGB): number {
  // Simple weighted distance for better human perception
  // R: 0.3, G: 0.59, B: 0.11
  return (
    Math.pow(c1.r - c2.r, 2) * 0.3 +
    Math.pow(c1.g - c2.g, 2) * 0.59 +
    Math.pow(c1.b - c2.b, 2) * 0.11
  );
}

function findClosestColor(target: RGB, palette: BeadColor[]): BeadColor {
  let minDistance = Infinity;
  let closest = palette[0];

  for (const color of palette) {
    const distance = getColorDistance(target, color.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  }
  return closest;
}

export function processImageToBeads(
  imageSrc: string,
  width: number,
  height: number,
  palette: BeadColor[],
  dither: boolean
): Promise<BeadPixel[][]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw and resize image
      // Using simple resize. For better results, one might use a step-down resize
      // but canvas drawImage is usually sufficient for pixel art preview.
      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const grid: BeadPixel[][] = [];
      
      // Initialize grid
      for (let y = 0; y < height; y++) {
        grid[y] = [];
      }

      // Process pixels
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          // If fully transparent, default to white or skip? 
          // Current logic maps transparent to closest color (usually white/black)
          // To improve: handle alpha. For now, we blend with white background if alpha < 255
          const alpha = a / 255;
          const blendedR = r * alpha + 255 * (1 - alpha);
          const blendedG = g * alpha + 255 * (1 - alpha);
          const blendedB = b * alpha + 255 * (1 - alpha);

          const currentPixel: RGB = { r: blendedR, g: blendedG, b: blendedB };
          const closest = findClosestColor(currentPixel, palette);

          // Simple Floyd-Steinberg Dithering
          if (dither) {
            const errR = blendedR - closest.rgb.r;
            const errG = blendedG - closest.rgb.g;
            const errB = blendedB - closest.rgb.b;

            const distributeError = (dx: number, dy: number, factor: number) => {
              if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height) {
                const nIdx = ((y + dy) * width + (x + dx)) * 4;
                // Note: Modifying the buffer directly affects subsequent pixels
                // We ignore alpha for error diffusion simplicity here
                data[nIdx] = Math.min(255, Math.max(0, data[nIdx] + errR * factor));
                data[nIdx + 1] = Math.min(255, Math.max(0, data[nIdx + 1] + errG * factor));
                data[nIdx + 2] = Math.min(255, Math.max(0, data[nIdx + 2] + errB * factor));
              }
            };

            distributeError(1, 0, 7 / 16);
            distributeError(-1, 1, 3 / 16);
            distributeError(0, 1, 5 / 16);
            distributeError(1, 1, 1 / 16);
          }

          grid[y][x] = {
            x,
            y,
            colorId: closest.id,
            color: closest,
          };
        }
      }
      resolve(grid);
    };
    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });
}

export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  targetSize: number, // Max dimension
  lockAspectRatio: boolean
): { width: number; height: number } {
  if (!lockAspectRatio) return { width: targetSize, height: targetSize };
  
  const aspect = originalWidth / originalHeight;
  if (aspect > 1) {
    return { width: targetSize, height: Math.round(targetSize / aspect) };
  } else {
    return { width: Math.round(targetSize * aspect), height: targetSize };
  }
}
