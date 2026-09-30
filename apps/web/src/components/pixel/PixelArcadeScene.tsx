import React from 'react';
import { PixelCharacter } from './PixelCharacter';

export const PixelArcadeScene: React.FC = () => {
  return (
    <div className="w-full relative max-w-lg mx-auto my-6 p-4 sm:p-6 bg-[#151C30] border-2 border-paper shadow-pixel-light overflow-hidden select-none">
      {/* Background stars / dust */}
      <div className="absolute inset-0 dither-pattern-light opacity-30 pointer-events-none" />

      {/* Floating decorative pixel stars */}
      <div className="absolute top-3 left-4 text-cartridgeYellow text-xs font-pixel animate-pulse">★</div>
      <div className="absolute top-6 right-8 text-cartridgeYellow text-[10px] font-pixel animate-pulse" style={{ animationDelay: '0.8s' }}>✦</div>
      <div className="absolute top-12 left-1/3 text-paper/40 text-[8px] font-pixel">★</div>
      <div className="absolute top-4 right-1/4 text-pixelPink text-[10px] font-pixel">♥</div>

      {/* Scene Content Area */}
      <div className="relative z-10 flex items-end justify-between px-2 sm:px-6 pt-4 pb-1 min-h-[160px]">
        {/* Left Side: Bro 01 */}
        <div className="flex flex-col items-center">
          <div className="mb-2 bg-ink/90 border border-crtCyan px-2 py-0.5 text-[9px] font-arcade text-crtCyan tracking-wider shadow-pixel-sm">
            BRO 01
          </div>
          <PixelCharacter type="bro1" size={72} pose="ready" />
        </div>

        {/* Center: Retro Arcade Machine + CRT Monitor */}
        <div className="flex flex-col items-center mx-2 sm:mx-6">
          <svg
            width="120"
            height="110"
            viewBox="0 0 48 44"
            style={{ shapeRendering: 'crispEdges' }}
            className="drop-shadow-md"
          >
            {/* Arcade Cabinet Outline */}
            <rect x="8" y="4" width="20" height="36" fill="#111522" stroke="#43566B" strokeWidth="1" />
            <rect x="10" y="6" width="16" height="4" fill="#E84A4A" />
            <text x="18" y="9.5" textAnchor="middle" fill="#FFF7DC" fontSize="3" fontFamily="'Press Start 2P', monospace" fontWeight="bold">BvB</text>

            {/* Arcade Screen */}
            <rect x="10" y="12" width="16" height="14" fill="#151C30" stroke="#49B8D1" strokeWidth="0.8" />
            {/* Screen Content: Mini 1v1 Battle */}
            <rect x="12" y="16" width="3" height="5" fill="#E84A4A" />
            <rect x="21" y="16" width="3" height="5" fill="#67B85A" />
            <rect x="16" y="15" width="4" height="1" fill="#F4D35E" />

            {/* Controls Panel */}
            <rect x="8" y="27" width="20" height="6" fill="#1E293B" />
            {/* Joystick */}
            <rect x="12" y="28" width="1.5" height="3" fill="#FFF7DC" />
            <circle cx="12.7" cy="27.5" r="1.2" fill="#E84A4A" />
            {/* Buttons */}
            <circle cx="18" cy="29" r="1" fill="#49B8D1" />
            <circle cx="21" cy="30" r="1" fill="#F4D35E" />
            <circle cx="24" cy="29" r="1" fill="#67B85A" />

            {/* Cabinet Coin Slot */}
            <rect x="16" y="35" width="4" height="2" fill="#0B0F19" />
            <rect x="17.5" y="35.5" width="1" height="1" fill="#F4D35E" />

            {/* Right Mini CRT Monitor on Table */}
            <rect x="30" y="18" width="14" height="13" fill="#111522" stroke="#43566B" strokeWidth="0.8" />
            <rect x="32" y="20" width="10" height="8" fill="#49B8D1" opacity="0.85" />
            <line x1="33" y1="23" x2="41" y2="23" stroke="#111522" strokeWidth="0.5" />
            <line x1="33" y1="25" x2="38" y2="25" stroke="#111522" strokeWidth="0.5" />

            {/* Table / Stand */}
            <rect x="29" y="31" width="16" height="9" fill="#2C221E" />

            {/* Game Cartridge on floor */}
            <rect x="1" y="37" width="6" height="3" fill="#F4D35E" stroke="#111522" strokeWidth="0.5" />
            <rect x="2" y="38" width="4" height="1" fill="#E84A4A" />

            {/* Potted Pixel Plant / Cactus */}
            <rect x="42" y="33" width="5" height="4" fill="#E84A4A" />
            <rect x="43.5" y="28" width="2" height="5" fill="#67B85A" />
            <rect x="42" y="29.5" width="1.5" height="1.5" fill="#67B85A" />
            <rect x="45.5" y="30.5" width="1.5" height="1.5" fill="#67B85A" />

            {/* Cables connecting on floor */}
            <path d="M 28 33 Q 32 38 35 40" fill="none" stroke="#E84A4A" strokeWidth="0.8" />
            <path d="M 8 36 Q 4 39 2 40" fill="none" stroke="#49B8D1" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Right Side: Bro 02 */}
        <div className="flex flex-col items-center">
          <div className="mb-2 bg-ink/90 border border-cartridgeYellow px-2 py-0.5 text-[9px] font-arcade text-cartridgeYellow tracking-wider shadow-pixel-sm">
            BRO 02
          </div>
          <PixelCharacter type="bro2" size={72} pose="waiting" />
        </div>
      </div>

      {/* Floor / Ground line */}
      <div className="w-full border-t-2 border-paper/40 pt-1 flex justify-between items-center text-[8px] font-mono text-paper/60 px-1">
        <span>INSERT COIN</span>
        <span className="font-arcade tracking-widest text-cartridgeYellow animate-pulse">1v1 READY</span>
        <span>STAGE 01</span>
      </div>
    </div>
  );
};
