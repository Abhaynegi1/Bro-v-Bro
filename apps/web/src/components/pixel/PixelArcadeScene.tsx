import React from 'react';
import { PixelCharacter } from './PixelCharacter';

export const PixelArcadeScene: React.FC = () => {
  return (
    <div className="w-full relative max-w-xl mx-auto my-7 p-5 sm:p-7 bg-darkNavy border-3 border-ink shadow-pixel-lg overflow-hidden select-none">
      {/* Background stars / dust */}
      <div className="absolute inset-0 dither-pattern-light opacity-25 pointer-events-none" />

      {/* Floating decorative pixel stars */}
      <div className="absolute top-4 left-6 text-cartridgeYellow text-sm font-pixel animate-pulse">★</div>
      <div className="absolute top-8 right-10 text-cartridgeYellow text-xs font-pixel animate-pulse" style={{ animationDelay: '0.7s' }}>✦</div>
      <div className="absolute top-14 left-1/4 text-white/50 text-[10px] font-pixel">★</div>
      <div className="absolute top-6 right-1/3 text-pixelPink text-xs font-pixel animate-pulse" style={{ animationDelay: '1.2s' }}>♥</div>

      {/* Scene Content Area */}
      <div className="relative z-10 flex items-end justify-between px-2 sm:px-8 pt-4 pb-2 min-h-[190px]">
        {/* Left Side: Bro 01 (Red Bandana + Cyan Jersey) */}
        <div className="flex flex-col items-center">
          <div className="mb-2.5 bg-ink border-2 border-crtCyan px-2.5 py-0.5 text-[10px] font-arcade text-crtCyan tracking-wider shadow-pixel-sm">
            BRO 01
          </div>
          <PixelCharacter type="bro1" size={88} pose="ready" />
        </div>

        {/* Center: Colorful Retro Arcade Machine + CRT Setup */}
        <div className="flex flex-col items-center mx-2 sm:mx-4">
          <svg
            width="150"
            height="135"
            viewBox="0 0 54 48"
            style={{ shapeRendering: 'crispEdges' }}
            className="drop-shadow-lg"
          >
            {/* Floor tile grid */}
            <rect x="0" y="42" width="54" height="6" fill="#151C30" />
            <line x1="0" y1="42" x2="54" y2="42" stroke="#43566B" strokeWidth="0.8" />
            <line x1="9" y1="42" x2="9" y2="48" stroke="#24334E" strokeWidth="0.8" />
            <line x1="18" y1="42" x2="18" y2="48" stroke="#24334E" strokeWidth="0.8" />
            <line x1="27" y1="42" x2="27" y2="48" stroke="#24334E" strokeWidth="0.8" />
            <line x1="36" y1="42" x2="36" y2="48" stroke="#24334E" strokeWidth="0.8" />
            <line x1="45" y1="42" x2="45" y2="48" stroke="#24334E" strokeWidth="0.8" />

            {/* Arcade Cabinet Outline */}
            <rect x="11" y="4" width="22" height="38" fill="#171A1F" stroke="#111522" strokeWidth="1" />
            
            {/* Arcade Marquee Banner */}
            <rect x="13" y="6" width="18" height="5" fill="#E84B4B" />
            <text x="22" y="10" textAnchor="middle" fill="#FFF7DC" fontSize="3.5" fontFamily="'Press Start 2P', monospace" fontWeight="bold">BvB</text>

            {/* Glowing Arcade Screen Frame */}
            <rect x="13" y="13" width="18" height="15" fill="#151C30" stroke="#42B8C7" strokeWidth="1" />
            {/* Screen Content: Colorful 1v1 Battle */}
            <rect x="15" y="17" width="4" height="6" fill="#E84B4B" />
            <rect x="25" y="17" width="4" height="6" fill="#69B85A" />
            <rect x="20" y="16" width="4" height="1.5" fill="#F4D35E" />
            <circle cx="22" cy="20" r="1.5" fill="#42B8C7" />

            {/* Controls Panel */}
            <rect x="11" y="29" width="22" height="6.5" fill="#24334E" stroke="#171A1F" strokeWidth="0.8" />
            {/* Red Joystick */}
            <rect x="15" y="30" width="1.5" height="3.5" fill="#FFF7DC" />
            <circle cx="15.7" cy="29.5" r="1.5" fill="#E84B4B" />
            {/* Buttons: Cyan, Yellow, Green */}
            <circle cx="21" cy="31.5" r="1.2" fill="#42B8C7" />
            <circle cx="24.5" cy="32.5" r="1.2" fill="#F4D35E" />
            <circle cx="28" cy="31.5" r="1.2" fill="#69B85A" />

            {/* Cabinet Coin Slot & Door */}
            <rect x="19" y="37" width="6" height="3" fill="#111522" />
            <rect x="21" y="37.5" width="2" height="1" fill="#F4D35E" />

            {/* Right Mini CRT Monitor on Wooden Desk */}
            <rect x="35" y="19" width="16" height="14" fill="#171A1F" stroke="#43566B" strokeWidth="0.8" />
            <rect x="37" y="21" width="12" height="10" fill="#42B8C7" />
            <line x1="38" y1="24" x2="47" y2="24" stroke="#171A1F" strokeWidth="0.8" />
            <line x1="38" y1="27" x2="44" y2="27" stroke="#171A1F" strokeWidth="0.8" />

            {/* Desk / Table */}
            <rect x="34" y="33" width="18" height="9" fill="#4A3728" />

            {/* Game Cartridge on floor */}
            <rect x="3" y="39" width="7" height="3.5" fill="#F4D35E" stroke="#171A1F" strokeWidth="0.6" />
            <rect x="4.5" y="40" width="4" height="1.2" fill="#E84B4B" />

            {/* Potted Pixel Cactus */}
            <rect x="47" y="35" width="5.5" height="4.5" fill="#E84B4B" stroke="#171A1F" strokeWidth="0.5" />
            <rect x="48.5" y="29" width="2.5" height="6.5" fill="#69B85A" />
            <rect x="46.5" y="31" width="2" height="2" fill="#69B85A" />
            <rect x="51" y="32" width="2" height="2" fill="#69B85A" />

            {/* Colorful Floor Cables */}
            <path d="M 33 35 Q 38 41 42 42" fill="none" stroke="#E84B4B" strokeWidth="1" />
            <path d="M 11 38 Q 6 41 3 42" fill="none" stroke="#42B8C7" strokeWidth="1" />
          </svg>
        </div>

        {/* Right Side: Bro 02 (Yellow Headband + Green Jersey) */}
        <div className="flex flex-col items-center">
          <div className="mb-2.5 bg-ink border-2 border-cartridgeYellow px-2.5 py-0.5 text-[10px] font-arcade text-cartridgeYellow tracking-wider shadow-pixel-sm">
            BRO 02
          </div>
          <PixelCharacter type="bro2" size={88} pose="waiting" />
        </div>
      </div>

      {/* Floor Status Strip */}
      <div className="w-full border-t-2 border-[#24334E] pt-2 flex justify-between items-center text-[10px] font-mono text-paper/70 px-2">
        <span className="font-arcade tracking-wider text-arcadeRed">● INSERT COIN</span>
        <span className="font-pixel text-[9px] text-cartridgeYellow tracking-widest animate-pulse">1v1 READY</span>
        <span className="font-arcade tracking-wider">STAGE 01</span>
      </div>
    </div>
  );
};
