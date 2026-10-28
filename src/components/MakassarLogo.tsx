import React, { useEffect, useState } from 'react';

// In-memory singleton cache for processed transparent logo data URL
let transparentLogoUrlCache: string | null = null;
let processingPromise: Promise<string> | null = null;

/**
 * Automatically detects and eliminates white and near-white pixels from the outer
 * perimeter of the logo shield using HTML5 Canvas Breadth-First Search (BFS) flood fill.
 * All internal white elements inside the shield (e.g., paper icon, cotton buds, text)
 * remain 100% untouched and intact because the BFS cannot cross the shield's outer borders.
 */
function processLogoTransparency(sourceUrl: string): Promise<string> {
  if (transparentLogoUrlCache) {
    return Promise.resolve(transparentLogoUrlCache);
  }
  if (processingPromise) {
    return processingPromise;
  }

  processingPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(sourceUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) {
          resolve(sourceUrl);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(sourceUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const totalPixels = w * h;

        // Visited map and BFS queue for boundary flood fill
        const visited = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels);
        let head = 0;
        let tail = 0;

        // Identifies white and near-white exterior background pixels with tolerance for JPEG noise
        const isNearWhite = (r: number, g: number, b: number): boolean => {
          const minC = Math.min(r, g, b);
          const maxC = Math.max(r, g, b);
          // High brightness with low chromatic variance
          if (minC >= 215 && maxC - minC <= 35) {
            return true;
          }
          // Color distance from pure white (#FFFFFF)
          const dr = 255 - r;
          const dg = 255 - g;
          const db = 255 - b;
          return dr * dr + dg * dg + db * db <= 2400; // tolerance threshold
        };

        // 1. Seed the BFS queue with all near-white pixels directly on the 4 image borders
        // Top and bottom rows
        for (let x = 0; x < w; x++) {
          const topIdx = x;
          const botIdx = (h - 1) * w + x;
          const tPos = topIdx * 4;
          if (isNearWhite(data[tPos], data[tPos + 1], data[tPos + 2])) {
            visited[topIdx] = 1;
            queue[tail++] = topIdx;
          }
          const bPos = botIdx * 4;
          if (isNearWhite(data[bPos], data[bPos + 1], data[bPos + 2])) {
            visited[botIdx] = 1;
            queue[tail++] = botIdx;
          }
        }

        // Left and right columns
        for (let y = 1; y < h - 1; y++) {
          const leftIdx = y * w;
          const rightIdx = y * w + (w - 1);
          const lPos = leftIdx * 4;
          if (!visited[leftIdx] && isNearWhite(data[lPos], data[lPos + 1], data[lPos + 2])) {
            visited[leftIdx] = 1;
            queue[tail++] = leftIdx;
          }
          const rPos = rightIdx * 4;
          if (!visited[rightIdx] && isNearWhite(data[rPos], data[rPos + 1], data[rPos + 2])) {
            visited[rightIdx] = 1;
            queue[tail++] = rightIdx;
          }
        }

        // 2. BFS flood fill: expands outward-inward strictly through connected exterior white pixels
        while (head < tail) {
          const p = queue[head++];
          const px = p % w;
          const py = (p / w) | 0;

          // 4-neighborhood
          if (px > 0) {
            const np = p - 1;
            if (!visited[np]) {
              const pos = np * 4;
              if (isNearWhite(data[pos], data[pos + 1], data[pos + 2])) {
                visited[np] = 1;
                queue[tail++] = np;
              }
            }
          }
          if (px < w - 1) {
            const np = p + 1;
            if (!visited[np]) {
              const pos = np * 4;
              if (isNearWhite(data[pos], data[pos + 1], data[pos + 2])) {
                visited[np] = 1;
                queue[tail++] = np;
              }
            }
          }
          if (py > 0) {
            const np = p - w;
            if (!visited[np]) {
              const pos = np * 4;
              if (isNearWhite(data[pos], data[pos + 1], data[pos + 2])) {
                visited[np] = 1;
                queue[tail++] = np;
              }
            }
          }
          if (py < h - 1) {
            const np = p + w;
            if (!visited[np]) {
              const pos = np * 4;
              if (isNearWhite(data[pos], data[pos + 1], data[pos + 2])) {
                visited[np] = 1;
                queue[tail++] = np;
              }
            }
          }
        }

        // 3. Make all visited exterior background pixels completely transparent (Alpha = 0)
        for (let i = 0; i < totalPixels; i++) {
          if (visited[i]) {
            data[i * 4 + 3] = 0;
          }
        }

        // 4. Smooth de-fringing on outer border pixels to prevent harsh edges or white halos
        for (let p = 0; p < totalPixels; p++) {
          if (!visited[p]) {
            const px = p % w;
            const py = (p / w) | 0;
            const hasBgNeighbor =
              (px > 0 && visited[p - 1]) ||
              (px < w - 1 && visited[p + 1]) ||
              (py > 0 && visited[p - w]) ||
              (py < h - 1 && visited[p + w]);

            if (hasBgNeighbor) {
              const pos = p * 4;
              const r = data[pos];
              const g = data[pos + 1];
              const b = data[pos + 2];
              const minC = Math.min(r, g, b);
              const maxC = Math.max(r, g, b);
              // If it's a transitional white fringe pixel, smoothly taper alpha
              if (minC >= 185 && maxC - minC <= 35) {
                const alphaFactor = (255 - minC) / (255 - 185);
                data[pos + 3] = Math.round(Math.max(0, Math.min(255, alphaFactor * 255)));
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        transparentLogoUrlCache = dataUrl;
        resolve(dataUrl);
      } catch (err) {
        console.error('Error processing logo transparency:', err);
        resolve(sourceUrl);
      }
    };

    img.onerror = () => {
      resolve(sourceUrl);
    };

    img.src = sourceUrl;
  });

  return processingPromise;
}

// Pre-process logo immediately on module load in browser
if (typeof window !== 'undefined') {
  processLogoTransparency('/logo-epersuratan.png');
}

export function MakassarLogo({
  className = "w-14 h-14",
  alt = "Logo E-Persuratan Kecamatan Ujung Pandang"
}: {
  className?: string;
  alt?: string;
}) {
  const [logoSrc, setLogoSrc] = useState<string>(
    transparentLogoUrlCache || '/logo-epersuratan.png'
  );
  const [isReady, setIsReady] = useState<boolean>(!!transparentLogoUrlCache);

  useEffect(() => {
    if (transparentLogoUrlCache) {
      if (logoSrc !== transparentLogoUrlCache) {
        setLogoSrc(transparentLogoUrlCache);
      }
      setIsReady(true);
      return;
    }

    let isMounted = true;
    processLogoTransparency('/logo-epersuratan.png').then((url) => {
      if (isMounted) {
        setLogoSrc(url);
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [logoSrc]);

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <img
        src={logoSrc}
        alt={alt}
        className={`w-full h-full object-contain select-none pointer-events-none transition-all duration-300 drop-shadow-md ${
          isReady ? 'opacity-100' : 'opacity-90'
        }`}
        loading="eager"
      />
    </div>
  );
}
