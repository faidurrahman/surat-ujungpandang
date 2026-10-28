import React from 'react';

export function NetworkBackground({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full opacity-15 pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      viewBox="0 0 800 600"
    >
      <defs>
        <linearGradient id="netLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Network / Constellation Polygons */}
      <polygon points="60,50 180,110 140,240 40,180" fill="#ffffff" fillOpacity="0.04" />
      <polygon points="180,110 320,70 380,190 260,220" fill="#ffffff" fillOpacity="0.05" />
      <polygon points="320,70 490,40 560,150 380,190" fill="#ffffff" fillOpacity="0.04" />
      <polygon points="560,150 720,80 760,230 630,260" fill="#ffffff" fillOpacity="0.05" />
      <polygon points="140,240 260,220 330,380 190,410" fill="#ffffff" fillOpacity="0.04" />
      <polygon points="260,220 380,190 470,320 330,380" fill="#ffffff" fillOpacity="0.06" />
      <polygon points="380,190 560,150 630,260 470,320" fill="#ffffff" fillOpacity="0.04" />
      <polygon points="470,320 630,260 710,390 540,440" fill="#ffffff" fillOpacity="0.05" />
      <polygon points="190,410 330,380 410,530 250,560" fill="#ffffff" fillOpacity="0.04" />
      <polygon points="330,380 470,320 540,440 410,530" fill="#ffffff" fillOpacity="0.05" />
      <polygon points="540,440 710,390 770,520 600,560" fill="#ffffff" fillOpacity="0.04" />

      {/* Solid & Dashed Connection Lines */}
      <g stroke="url(#netLineGrad)" strokeWidth="1" fill="none">
        <path d="M60,50 L180,110 L320,70 L490,40 L720,80" />
        <path d="M40,180 L140,240 L260,220 L380,190 L560,150 L630,260 L760,230" />
        <path d="M190,410 L330,380 L470,320 L540,440 L710,390" />
        <path d="M250,560 L410,530 L600,560 L770,520" />
        
        {/* Diagonal interconnections */}
        <path d="M60,50 L140,240 L190,410 L250,560" />
        <path d="M180,110 L260,220 L330,380 L410,530" />
        <path d="M320,70 L380,190 L470,320 L540,440 L600,560" />
        <path d="M490,40 L560,150 L630,260 L710,390 L770,520" />
        <path d="M720,80 L760,230" />
      </g>

      <g stroke="url(#netLineGrad)" strokeWidth="0.8" strokeDasharray="3 4" fill="none">
        <path d="M60,50 L260,220 M180,110 L380,190 M320,70 L560,150 M490,40 L630,260" />
        <path d="M140,240 L380,190 M260,220 L470,320 M380,190 L540,440 M470,320 L710,390" />
        <path d="M190,410 L410,530 M330,380 L600,560 M410,530 L710,390" />
      </g>

      {/* Network Nodes (Dots) */}
      <g fill="#ffffff">
        <circle cx="60" cy="50" r="3" />
        <circle cx="180" cy="110" r="3.5" />
        <circle cx="320" cy="70" r="3" />
        <circle cx="490" cy="40" r="3.5" />
        <circle cx="720" cy="80" r="3" />
        <circle cx="40" cy="180" r="2.5" />
        <circle cx="140" cy="240" r="3" />
        <circle cx="260" cy="220" r="3.5" />
        <circle cx="380" cy="190" r="4" />
        <circle cx="560" cy="150" r="3.5" />
        <circle cx="630" cy="260" r="3" />
        <circle cx="760" cy="230" r="3" />
        <circle cx="190" cy="410" r="3" />
        <circle cx="330" cy="380" r="3.5" />
        <circle cx="470" cy="320" r="4" />
        <circle cx="540" cy="440" r="3.5" />
        <circle cx="710" cy="390" r="3" />
        <circle cx="250" cy="560" r="2.5" />
        <circle cx="410" cy="530" r="3.5" />
        <circle cx="600" cy="560" r="3" />
        <circle cx="770" cy="520" r="3" />
      </g>
    </svg>
  );
}
