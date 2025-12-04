
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
  dither: boolean,
  removeBackground: boolean
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

      // Clear with transparent black first
      ctx.clearRect(0, 0, width, height);
      
      // Draw and resize image
      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const grid: BeadPixel[][] = [];
      
      // Initialize grid
      for (let y = 0; y < height; y++) {
        grid[y] = [];
      }

      // =========================================================
      // Background Detection: Flood Fill Algorithm
      // =========================================================
      // Instead of removing ALL pixels that match the background color,
      // we only remove pixels connected to the image border (Flood Fill).
      
      const isBackgroundMask = new Uint8Array(width * height); // 0 = Keep, 1 = Remove

      if (removeBackground) {
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];
        const bgA = data[3];

        // Helper: Check if a pixel matches the background color (from top-left)
        const isMatch = (idx: number) => {
             const r = data[idx];
             const g = data[idx+1];
             const b = data[idx+2];
             const a = data[idx+3];
             
             // 1. If the pixel is already transparent, it is definitely background
             if (a < 50) return true;

             // 2. If we are detecting a solid color background (bgA > 50)
             if (bgA > 50) {
                 const dist = Math.sqrt(
                    Math.pow(r - bgR, 2) + 
                    Math.pow(g - bgG, 2) + 
                    Math.pow(b - bgB, 2)
                 );
                 // Tolerance of ~45 covers JPEG artifacts and resizing anti-aliasing
                 return dist < 45; 
             }
             
             return false;
        };

        const queue: number[] = [];
        const visited = new Uint8Array(width * height);
        
        // Seed points: Start from 4 corners
        const corners = [0, width - 1, (height - 1) * width, width * height - 1];
        
        corners.forEach(idx => {
            // Only start flood fill if the corner actually looks like background
            if (isMatch(idx * 4)) {
                queue.push(idx);
                visited[idx] = 1;
                isBackgroundMask[idx] = 1;
            }
        });

        // BFS Flood Fill
        let head = 0;
        while(head < queue.length) {
            const curr = queue[head++];
            const cx = curr % width;
            const cy = Math.floor(curr / width);
            
            const neighbors = [
                { x: cx + 1, y: cy },
                { x: cx - 1, y: cy },
                { x: cx, y: cy + 1 },
                { x: cx, y: cy - 1 }
            ];
            
            for (const n of neighbors) {
                if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
                    const nIdx = n.y * width + n.x;
                    if (visited[nIdx] === 0) {
                        visited[nIdx] = 1;
                        if (isMatch(nIdx * 4)) {
                            // It matches background color and is connected to border -> Remove it
                            isBackgroundMask[nIdx] = 1;
                            queue.push(nIdx);
                        } else {
                            // It does NOT match background -> It's the edge of the subject. 
                            // Stop here. Do not add to queue.
                        }
                    }
                }
            }
        }
      }

      // Process pixels
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const maskIdx = y * width + x;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          let isBackground = false;
          
          // 1. Transparency check (Always remove transparent pixels)
          if (a < 50) {
            isBackground = true;
          } 
          // 2. Flood filled background removal
          else if (removeBackground && isBackgroundMask[maskIdx] === 1) {
             isBackground = true;
          }

          if (isBackground) {
             grid[y][x] = {
               x,
               y,
               colorId: null,
               color: null,
             };
             continue;
          }

          // Blend with white if semi-transparent (simulating white pegboard)
          // unless alpha is very low (handled above)
          const alpha = a / 255;
          const blendedR = r * alpha + 255 * (1 - alpha);
          const blendedG = g * alpha + 255 * (1 - alpha);
          const blendedB = b * alpha + 255 * (1 - alpha);

          const currentPixel: RGB = { r: blendedR, g: blendedG, b: blendedB };
          const closest = findClosestColor(currentPixel, palette);

          // Floyd-Steinberg Dithering
          if (dither) {
            const errR = blendedR - closest.rgb.r;
            const errG = blendedG - closest.rgb.g;
            const errB = blendedB - closest.rgb.b;

            const distributeError = (dx: number, dy: number, factor: number) => {
              if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height) {
                const nIdx = ((y + dy) * width + (x + dx)) * 4;
                // Only distribute error to non-transparent pixels that are NOT marked as background
                const nMaskIdx = (y + dy) * width + (x + dx);
                if (data[nIdx + 3] > 50 && (!removeBackground || isBackgroundMask[nMaskIdx] === 0)) {
                    data[nIdx] = Math.min(255, Math.max(0, data[nIdx] + errR * factor));
                    data[nIdx + 1] = Math.min(255, Math.max(0, data[nIdx + 1] + errG * factor));
                    data[nIdx + 2] = Math.min(255, Math.max(0, data[nIdx + 2] + errB * factor));
                }
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
