import React from 'react';
import { PixelCharacter } from './PixelCharacter';

interface PixelRetroWorldProps {
  theme: 'day' | 'night';
}

export const PixelRetroWorld: React.FC<PixelRetroWorldProps> = ({ theme }) => {
  const isNight = theme === 'night';

  return (
    <div className="w-full relative h-[220px] sm:h-[260px] md:h-[290px] overflow-hidden select-none pointer-events-none mt-auto flex-shrink-0">
      {/* ================= BACKGROUND SKY STARS (NIGHT ONLY) ================= */}
      {isNight && (
        <div className="absolute inset-0">
          {[
            { top: '10%', left: '5%', delay: '0s', size: 3 },
            { top: '22%', left: '14%', delay: '0.7s', size: 4 },
            { top: '12%', left: '26%', delay: '1.2s', size: 2 },
            { top: '30%', left: '38%', delay: '0.4s', size: 3 },
            { top: '15%', left: '48%', delay: '1.5s', size: 4 },
            { top: '8%', left: '62%', delay: '0.9s', size: 3 },
            { top: '25%', left: '74%', delay: '0.2s', size: 4 },
            { top: '18%', left: '88%', delay: '1.8s', size: 2 },
            { top: '35%', left: '94%', delay: '1.1s', size: 3 },
            { top: '42%', left: '8%', delay: '0.6s', size: 2 },
            { top: '38%', left: '82%', delay: '1.3s', size: 3 },
          ].map((star, i) => (
            <div
              key={i}
              className="absolute bg-white animate-pulse"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
                boxShadow: '0 0 3px #FFFFFF',
              }}
            />
          ))}

          {/* Special 4-Point Pixel Cross Stars */}
          <div className="absolute top-[18%] left-[20%] text-white text-[11px] font-pixel animate-pulse">✦</div>
          <div className="absolute top-[12%] left-[70%] text-cartridgeYellow text-[13px] font-pixel animate-pulse" style={{ animationDelay: '0.8s' }}>★</div>
          <div className="absolute top-[28%] left-[84%] text-white text-[10px] font-pixel animate-pulse" style={{ animationDelay: '1.4s' }}>✦</div>
        </div>
      )}

      {/* Floating Pixel Clouds */}
      <div
        className="absolute top-[5%] left-[-10%] opacity-90 transition-opacity duration-700"
        style={{ animation: 'cloud-float 50s linear infinite' }}
      >
        <svg width="120" height="46" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
          <path
            d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z M 14 0 h 4 v 2 h -4 z"
            fill={isNight ? '#273461' : '#FFFFFF'}
          />
        </svg>
      </div>

      <div
        className="absolute top-[20%] left-[55%] opacity-80 transition-opacity duration-700"
        style={{ animation: 'cloud-float 65s linear infinite', animationDelay: '-22s' }}
      >
        <svg width="95" height="38" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
          <path
            d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z"
            fill={isNight ? '#202C50' : '#FFFFFF'}
          />
        </svg>
      </div>

      {/* ================= LAYERED MOUNTAINS (FULL WIDTH) ================= */}
      <div className="absolute bottom-[78px] w-full">
        <svg
          viewBox="0 0 800 65"
          className="w-full h-[65px]"
          preserveAspectRatio="none"
          style={{ shapeRendering: 'crispEdges' }}
        >
          {/* Back distant silhouette */}
          <polygon
            points="0,65 0,38 45,38 90,22 140,22 190,35 250,20 300,20 360,40 440,18 510,18 570,38 640,24 700,24 760,42 800,32 800,65"
            fill={isNight ? '#162347' : '#8AA4DC'}
          />
          {/* Middle range */}
          <polygon
            points="0,65 0,48 80,48 150,30 220,30 290,52 380,32 460,32 540,50 620,36 690,36 770,55 800,50 800,65"
            fill={isNight ? '#1D2D57' : '#728FCC'}
          />
        </svg>
      </div>

      {/* ================= CHARACTERS, ARCADE & SCENERY (FULL WIDTH HORIZONTAL) ================= */}
      <div className="absolute bottom-[78px] w-full flex items-end justify-center px-4 sm:px-8 z-10">
        <div className="w-full max-w-4xl flex items-end justify-between">
          {/* Left Tree */}
          <div className="flex items-end gap-3 sm:gap-6">
            <svg width="44" height="60" viewBox="0 0 16 22" style={{ shapeRendering: 'crispEdges' }}>
              <rect x="5" y="0" width="6" height="2" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="3" y="2" width="10" height="3" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="1" y="5" width="14" height="4" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="3" y="9" width="10" height="2" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="4" y="3" width="2" height="1" fill={isNight ? '#2F7537' : '#69BA54'} />
              <rect x="6" y="11" width="4" height="11" fill={isNight ? '#4A2A14' : '#784323'} />
              <rect x="5" y="20" width="6" height="2" fill={isNight ? '#381F0E' : '#5C3319'} />
            </svg>

            {/* Flowers */}
            <div className="hidden sm:flex items-end gap-1.5 pb-0.5">
              <div className="w-1.5 h-3 bg-gameboyGreen relative">
                <div className="w-2.5 h-2.5 bg-arcadeRed absolute -top-2 -left-0.5" />
              </div>
              <div className="w-1.5 h-2 bg-gameboyGreen relative">
                <div className="w-2 h-2 bg-cartridgeYellow absolute -top-1.5 -left-0.5" />
              </div>
            </div>
          </div>

          {/* Bro 01 (Left Challenger) */}
          <div className="flex flex-col items-center">
            <PixelCharacter type="bro1" size={72} pose="ready" />
          </div>

          {/* Center Arcade Machine with Striped Awning */}
          <div className="flex flex-col items-center mx-2 sm:mx-6">
            <svg
              width="85"
              height="110"
              viewBox="0 0 32 40"
              style={{ shapeRendering: 'crispEdges' }}
              className="drop-shadow-md"
            >
              {/* Cabinet Outer Body */}
              <rect x="4" y="6" width="24" height="34" fill="#121829" stroke="#000000" strokeWidth="1" />

              {/* Red & White Striped Awning Marquee */}
              <rect x="3" y="4" width="26" height="6" fill="#171F36" />
              <rect x="4" y="4" width="4" height="5" fill="#E84040" />
              <rect x="8" y="4" width="4" height="5" fill="#FFFFFF" />
              <rect x="12" y="4" width="4" height="5" fill="#E84040" />
              <rect x="16" y="4" width="4" height="5" fill="#FFFFFF" />
              <rect x="20" y="4" width="4" height="5" fill="#E84040" />
              <rect x="24" y="4" width="4" height="5" fill="#FFFFFF" />
              <line x1="3" y1="9" x2="29" y2="9" stroke="#000000" strokeWidth="1" />

              {/* Glowing CRT Screen Bezel */}
              <rect x="6" y="11" width="20" height="15" fill="#0C1322" stroke="#253556" strokeWidth="1" />
              {/* Screen Inner Background */}
              <rect x="7" y="12" width="18" height="13" fill="#38BDF8" />
              {/* CRT Screen Scanline overlay */}
              <line x1="7" y1="14" x2="25" y2="14" stroke="#0EA5E9" strokeWidth="0.8" />
              <line x1="7" y1="17" x2="25" y2="17" stroke="#0EA5E9" strokeWidth="0.8" />
              <line x1="7" y1="20" x2="25" y2="20" stroke="#0EA5E9" strokeWidth="0.8" />
              <line x1="7" y1="23" x2="25" y2="23" stroke="#0EA5E9" strokeWidth="0.8" />

              {/* 1v1 Battle Pixels on Screen */}
              <rect x="11" y="15" width="3" height="3" fill="#E84040" className="animate-pulse" />
              <rect x="18" y="18" width="3" height="3" fill="#FACC15" className="animate-pulse" />
              <circle cx="16" cy="14" r="1" fill="#FFFFFF" />

              {/* Control Panel Shelf */}
              <rect x="4" y="27" width="24" height="5" fill="#1E293B" stroke="#000000" strokeWidth="0.8" />
              {/* Red joystick & buttons */}
              <circle cx="9" cy="29.5" r="1.5" fill="#E84040" />
              <circle cx="14" cy="29.5" r="1.3" fill="#FACC15" />
              <circle cx="18" cy="29.5" r="1.3" fill="#4ADE80" />
              <circle cx="22" cy="29.5" r="1.3" fill="#38BDF8" />

              {/* Coin Slot */}
              <rect x="11" y="34" width="10" height="5" fill="#0A0F1D" />
              <rect x="13" y="35" width="2" height="3" fill="#FACC15" />
              <rect x="17" y="35" width="2" height="3" fill="#FACC15" />
            </svg>
          </div>

          {/* Bro 02 (Right Challenger) */}
          <div className="flex flex-col items-center">
            <PixelCharacter type="bro2" size={72} pose="waiting" />
          </div>

          {/* Right Tree */}
          <div className="flex items-end gap-3 sm:gap-6">
            <div className="hidden sm:flex items-end gap-1.5 pb-0.5">
              <div className="w-1.5 h-2.5 bg-gameboyGreen relative">
                <div className="w-2 h-2 bg-white absolute -top-1.5 -left-0.5" />
              </div>
              <div className="w-1.5 h-3 bg-gameboyGreen relative">
                <div className="w-2.5 h-2.5 bg-pixelPink absolute -top-2 -left-0.5" />
              </div>
            </div>

            <svg width="44" height="60" viewBox="0 0 16 22" style={{ shapeRendering: 'crispEdges' }}>
              <rect x="5" y="0" width="6" height="2" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="3" y="2" width="10" height="3" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="1" y="5" width="14" height="4" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="3" y="9" width="10" height="2" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="4" y="3" width="2" height="1" fill={isNight ? '#2F7537' : '#69BA54'} />
              <rect x="6" y="11" width="4" height="11" fill={isNight ? '#4A2A14' : '#784323'} />
              <rect x="5" y="20" width="6" height="2" fill={isNight ? '#381F0E' : '#5C3319'} />
            </svg>
          </div>
        </div>
      </div>

      {/* ================= PLATFORM GROUND: GRASS + DIRT LAYER (FULL WIDTH) ================= */}
      <div className="absolute bottom-0 w-full h-[78px]">
        {/* Grass Top */}
        <div
          className="w-full h-[18px] relative transition-colors duration-500"
          style={{ backgroundColor: isNight ? '#235830' : '#4CA12F' }}
        >
          {/* Jagged blades spanning full width */}
          <div className="absolute -top-[5px] left-0 w-full overflow-hidden flex">
            {Array.from({ length: 180 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 flex-shrink-0 transition-colors duration-500"
                style={{
                  backgroundColor: isNight ? '#235830' : '#4CA12F',
                  clipPath: i % 2 === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'polygon(30% 20%, 0% 100%, 100% 100%)',
                }}
              />
            ))}
          </div>
          {/* Grass root line */}
          <div
            className="absolute bottom-0 left-0 w-full h-[4px] opacity-40 transition-colors duration-500"
            style={{ backgroundColor: isNight ? '#173D21' : '#2D6B19' }}
          />
        </div>

        {/* Dirt Texture (Full Width) */}
        <div
          className="w-full h-[60px] relative transition-colors duration-500"
          style={{
            backgroundColor: isNight ? '#3D2513' : '#8B5A2B',
            backgroundImage: `
              radial-gradient(${isNight ? '#26160A' : '#6A411B'} 15%, transparent 16%),
              radial-gradient(${isNight ? '#52341D' : '#A77038'} 15%, transparent 16%)
            `,
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        >
          {/* Horizontal strata lines */}
          <div
            className="w-full h-[1px] absolute top-[20px] opacity-30"
            style={{ backgroundColor: isNight ? '#1A0E06' : '#573314' }}
          />
          <div
            className="w-full h-[1px] absolute top-[40px] opacity-30"
            style={{ backgroundColor: isNight ? '#1A0E06' : '#573314' }}
          />
        </div>
      </div>
    </div>
  );
};
