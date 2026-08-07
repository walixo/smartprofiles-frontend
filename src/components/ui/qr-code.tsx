import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { encodeQr, qrToSvgPath } from '@/lib/qr';

export interface QrCodeProps {
  value: string;
  /** Quiet zone in modules. The specification requires at least 4. */
  margin?: number;
  className?: string;
  title: string;
}

/**
 * Renders a QR code as inline SVG.
 *
 * Colours come from `currentColor` and the container background rather than
 * being baked in, so the code re-tones with the theme. Scanners need light
 * modules to stay genuinely light, so the backing rect is always painted —
 * an inverted code on a dark background will not scan reliably.
 */
export function QrCode({ value, margin = 4, className, title }: QrCodeProps) {
  const { path, extent } = useMemo(() => {
    const code = encodeQr(value);
    return { path: qrToSvgPath(code), extent: code.size + margin * 2 };
  }, [value, margin]);

  return (
    <svg
      viewBox={`0 0 ${extent} ${extent}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn('h-auto w-full', className)}
      shapeRendering="crispEdges"
    >
      <rect width={extent} height={extent} fill="#ffffff" />
      <g transform={`translate(${margin} ${margin})`} fill="#1b1513">
        <path d={path} />
      </g>
    </svg>
  );
}

/** Standalone SVG document for download — self-contained, no CSS dependencies. */
export function qrSvgDocument(value: string, margin = 4): string {
  const code = encodeQr(value);
  const extent = code.size + margin * 2;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${extent} ${extent}" width="${extent * 8}" height="${extent * 8}" shape-rendering="crispEdges">`,
    `<rect width="${extent}" height="${extent}" fill="#ffffff"/>`,
    `<g transform="translate(${margin} ${margin})" fill="#1b1513"><path d="${qrToSvgPath(code)}"/></g>`,
    '</svg>',
  ].join('');
}
