type IconProps = { size?: number; className?: string };

const base = (size = 16, className = '') => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'currentColor',
  shapeRendering: 'crispEdges' as const,
  'aria-hidden': true as const,
  class: `pixel-nav-icon ${className}`.trim(),
});

export function PixelHomeIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <title>Home</title>
      <path d="M7 2h2v1h2v1h2v2h1v8H9v-4H7v4H2V6h1V4h2V3h2V2zm0 3v1H5v6h1V9h4v3h1V6H9V5H7z" />
    </svg>
  );
}

export function PixelBookIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <title>Learn</title>
      <path d="M2 3h5v1h2V3h5v10H9v-1H7v1H2V3zm2 2v6h3V5H4zm5 0v6h3V5H9z" />
    </svg>
  );
}

export function PixelGamesIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <title>Games</title>
      <path d="M4 3h8v1h1v1h1v6h-1v1h-1v1H4v-1H3v-1H2V5h1V4h1V3zm2 3H5v1H4v1h1v1h1V8h1V7H6V6zm5 0h-1v2h1V7h1V6zm0 2h1v1h-1V8zm-1 1h1v1h-1V9z" />
    </svg>
  );
}

export function PixelLayersIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <title>Frameworks</title>
      <path d="M7 2h2v1h2v1h3v2h-1v1h-1v1h-2v1H7V8H5V7H4V6H3V4h3V3h1V2zm-4 7h10v1H3V9zm1 2h8v1H4v-1zm1 2h6v1H5v-1z" />
    </svg>
  );
}

export function PixelCrownIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <title>Senior Mode</title>
      <path fill="var(--gold, #f7c55c)" d="M2 4h2v2h2v1h1V4h2v3h1V6h2V4h2v7H2V4zm1 8h10v2H3v-2z" />
    </svg>
  );
}

export function PixelSunIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <title>Sun</title>
      <path d="M7 1h2v2H7V1zm0 12h2v2H7v-2zm-6-6h2v2H1V7zm12 0h2v2h-2V7zM3 3h2v2H3V3zm8 0h2v2h-2V3zM3 11h2v2H3v-2zm8 0h2v2h-2v-2zM5 5h6v6H5V5z" />
    </svg>
  );
}

export function PixelMoonIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <title>Moon</title>
      <path d="M6 2h4v1h2v1h1v2h1v4h-1v2h-1v1h-2v1H6v-1h3v-1h2v-2h1V7h-1V5h-2V4H8V3H6V2z" />
    </svg>
  );
}

export function PixelSettingsIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <title>Settings</title>
      <path d="M7 1h2v2H7V1zm0 12h2v2H7v-2zm5-6h2v2h-2V7zM1 7h2v2H1V7zm9-4h2v2h-2V3zM3 11h2v2H3v-2zm8 0h2v2h-2v-2zM3 3h2v2H3V3zm3 3h4v4H6V6z" />
    </svg>
  );
}
