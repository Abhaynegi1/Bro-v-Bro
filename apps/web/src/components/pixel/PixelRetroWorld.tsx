import React from 'react';
import { PixelCharacter } from './PixelCharacter';

interface PixelRetroWorldProps {
  theme: 'day' | 'night';
}

export const PixelRetroWorld: React.FC<PixelRetroWorldProps> = ({ theme }) => {
  const isNight = theme === 'night';

  return (
    <div className="w-full relative h-[180px] xs:h-[220px] sm:h-[340px] md:h-[440px] lg:h-[480px] overflow-hidden select-none pointer-events-none mt-auto flex-shrink-0">
      {/* ================= BACKGROUND SKY STARS (NIGHT ONLY) ================= */}
      {isNight && (
        <div className="absolute inset-0">
          {[
            { top: '8%', left: '4%', delay: '0s', size: 4 },
            { top: '18%', left: '12%', delay: '0.7s', size: 5 },
            { top: '10%', left: '24%', delay: '1.2s', size: 3 },
            { top: '28%', left: '34%', delay: '0.4s', size: 4 },
            { top: '14%', left: '46%', delay: '1.5s', size: 5 },
            { top: '6%', left: '58%', delay: '0.9s', size: 4 },
            { top: '22%', left: '70%', delay: '0.2s', size: 5 },
            { top: '15%', left: '84%', delay: '1.8s', size: 3 },
            { top: '30%', left: '92%', delay: '1.1s', size: 4 },
            { top: '38%', left: '8%', delay: '0.6s', size: 3 },
            { top: '34%', left: '78%', delay: '1.3s', size: 4 },
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
                boxShadow: '0 0 4px #FFFFFF',
              }}
            />
          ))}

          {/* 4-Point Pixel Cross Stars */}
          <div className="absolute top-[14%] left-[18%] text-white text-[14px] font-pixel animate-pulse">✦</div>
          <div className="absolute top-[10%] left-[66%] text-cartridgeYellow text-[16px] font-pixel animate-pulse" style={{ animationDelay: '0.8s' }}>★</div>
          <div className="absolute top-[24%] left-[82%] text-white text-[12px] font-pixel animate-pulse" style={{ animationDelay: '1.4s' }}>✦</div>
        </div>
      )}

      {/* ================= FLOATING CLOUDS (BIGGER & LAYERED) ================= */}
      <div
        className="absolute top-[4%] left-[-15%] opacity-90 transition-opacity duration-700"
        style={{ animation: 'cloud-float 55s linear infinite' }}
      >
        <svg width="170" height="65" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
          <path
            d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z M 14 0 h 4 v 2 h -4 z"
            fill={isNight ? '#273461' : '#FFFFFF'}
          />
        </svg>
      </div>

      <div
        className="absolute top-[16%] left-[45%] opacity-85 transition-opacity duration-700"
        style={{ animation: 'cloud-float 70s linear infinite', animationDelay: '-25s' }}
      >
        <svg width="135" height="52" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
          <path
            d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z"
            fill={isNight ? '#202C50' : '#FFFFFF'}
          />
        </svg>
      </div>

      {/* ================= LAYERED MOUNTAINS (TALLER & FULL WIDTH) ================= */}
      <div className="absolute bottom-[70px] xs:bottom-[85px] sm:bottom-[130px] md:bottom-[160px] w-full">
        <svg
          viewBox="0 0 800 110"
          className="w-full h-[60px] xs:h-[75px] sm:h-[110px] md:h-[130px]"
          preserveAspectRatio="none"
          style={{ shapeRendering: 'crispEdges' }}
        >
          {/* Back distant silhouette */}
          <polygon
            points="0,110 0,60 50,60 100,32 160,32 210,50 280,28 340,28 410,55 500,24 580,24 650,52 720,34 780,34 800,45 800,110"
            fill={isNight ? '#162347' : '#8AA4DC'}
          />
          {/* Middle range */}
          <polygon
            points="0,110 0,75 90,75 170,45 250,45 330,75 430,42 520,42 610,70 700,50 770,50 800,70 800,110"
            fill={isNight ? '#1D2D57' : '#728FCC'}
          />
        </svg>
      </div>

      {/* ================= CHARACTERS, ARCADE & SCENERY (LARGE & PROMINENT) ================= */}
      <div className="absolute bottom-[68px] xs:bottom-[83px] sm:bottom-[128px] md:bottom-[158px] w-full flex items-end justify-center px-2 xs:px-4 sm:px-12 z-10">
        <div className="w-full max-w-6xl flex items-end justify-center md:justify-between gap-3 xs:gap-6 sm:gap-10">
          
          {/* Left Trees Group (Visible on md+) */}
          <div className="hidden md:flex items-end gap-3 sm:gap-6">
            <svg
              width="80"
              height="115"
              viewBox="0 0 16 22"
              style={{ shapeRendering: 'crispEdges' }}
              className="drop-shadow-sm"
            >
              <rect x="5" y="0" width="6" height="2" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="3" y="2" width="10" height="3" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="1" y="5" width="14" height="4" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="3" y="9" width="10" height="2" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="4" y="3" width="2" height="1" fill={isNight ? '#2F7537' : '#69BA54'} />
              <rect x="2" y="6" width="3" height="1" fill={isNight ? '#2F7537' : '#69BA54'} />
              <rect x="6" y="11" width="4" height="11" fill={isNight ? '#4A2A14' : '#784323'} />
              <rect x="5" y="20" width="6" height="2" fill={isNight ? '#381F0E' : '#5C3319'} />
            </svg>
          </div>

          {/* Bro 01 (Left Challenger) */}
          <div className="flex flex-col items-center">
            <div className="block sm:hidden">
              <PixelCharacter type="bro1" size={56} pose="ready" />
            </div>
            <div className="hidden sm:block md:hidden">
              <PixelCharacter type="bro1" size={85} pose="ready" />
            </div>
            <div className="hidden md:block">
              <PixelCharacter type="bro1" size={120} pose="ready" />
            </div>
          </div>

          {/* Center Arcade Machine (Responsive) */}
          <div className="flex flex-col items-center mx-1 xs:mx-3 sm:mx-8">
            <svg
              viewBox="0 0 32 40"
              style={{ shapeRendering: 'crispEdges' }}
              className="drop-shadow-lg w-[70px] h-[88px] xs:w-[90px] xs:h-[114px] sm:w-[130px] sm:h-[165px] md:w-[155px] md:h-[195px]"
            >
              {/* Cabinet Body */}
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
              {/* CRT Screen Scanlines */}
              <line x1="7" y1="14" x2="25" y2="14" stroke="#0EA5E9" strokeWidth="0.8" />
              <line x1="7" y1="17" x2="25" y2="17" stroke="#0EA5E9" strokeWidth="0.8" />
              <line x1="7" y1="20" x2="25" y2="20" stroke="#0EA5E9" strokeWidth="0.8" />
              <line x1="7" y1="23" x2="25" y2="23" stroke="#0EA5E9" strokeWidth="0.8" />

              {/* 1v1 Battle Pixels */}
              <rect x="10" y="15" width="4" height="4" fill="#E84040" className="animate-pulse" />
              <rect x="18" y="17" width="4" height="4" fill="#FACC15" className="animate-pulse" />
              <circle cx="16" cy="14" r="1.5" fill="#FFFFFF" />

              {/* Control Panel */}
              <rect x="4" y="27" width="24" height="5" fill="#1E293B" stroke="#000000" strokeWidth="0.8" />
              <circle cx="8" cy="29.5" r="1.8" fill="#E84040" />
              <circle cx="14" cy="29.5" r="1.5" fill="#FACC15" />
              <circle cx="18" cy="29.5" r="1.5" fill="#4ADE80" />
              <circle cx="22" cy="29.5" r="1.5" fill="#38BDF8" />

              {/* Coin Slot */}
              <rect x="11" y="34" width="10" height="5" fill="#0A0F1D" />
              <rect x="13" y="35" width="2" height="3" fill="#FACC15" />
              <rect x="17" y="35" width="2" height="3" fill="#FACC15" />
            </svg>
          </div>

          {/* Bro 02 (Right Challenger) */}
          <div className="flex flex-col items-center">
            <div className="block sm:hidden">
              <PixelCharacter type="bro2" size={56} pose="waiting" />
            </div>
            <div className="hidden sm:block md:hidden">
              <PixelCharacter type="bro2" size={85} pose="waiting" />
            </div>
            <div className="hidden md:block">
              <PixelCharacter type="bro2" size={120} pose="waiting" />
            </div>
          </div>

          {/* Right Trees Group (Visible on md+) */}
          <div className="hidden md:flex items-end gap-3 sm:gap-6">
            <svg
              width="80"
              height="115"
              viewBox="0 0 16 22"
              style={{ shapeRendering: 'crispEdges' }}
              className="drop-shadow-sm"
            >
              <rect x="5" y="0" width="6" height="2" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="3" y="2" width="10" height="3" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="1" y="5" width="14" height="4" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="3" y="9" width="10" height="2" fill={isNight ? '#225B28' : '#49A238'} />
              <rect x="4" y="3" width="2" height="1" fill={isNight ? '#2F7537' : '#69BA54'} />
              <rect x="2" y="6" width="3" height="1" fill={isNight ? '#2F7537' : '#69BA54'} />
              <rect x="6" y="11" width="4" height="11" fill={isNight ? '#4A2A14' : '#784323'} />
              <rect x="5" y="20" width="6" height="2" fill={isNight ? '#381F0E' : '#5C3319'} />
            </svg>
          </div>
        </div>
      </div>

      {/* ================= PLATFORM GROUND: GRASS + DIRT LAYER (TO BOTTOM EDGE) ================= */}
      <div className="absolute bottom-0 w-full h-[70px] xs:h-[85px] sm:h-[130px] md:h-[160px]">
        {/* Grass Top */}
        <div
          className="w-full h-[16px] sm:h-[24px] relative transition-colors duration-500"
          style={{ backgroundColor: isNight ? '#235830' : '#4CA12F' }}
        >
          {/* Jagged blades spanning full width */}
          <div className="absolute -top-[5px] sm:-top-[7px] left-0 w-full overflow-hidden flex">
            {Array.from({ length: 180 }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 sm:w-3 h-2.5 sm:h-3 flex-shrink-0 transition-colors duration-500"
                style={{
                  backgroundColor: isNight ? '#235830' : '#4CA12F',
                  clipPath: i % 2 === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'polygon(30% 20%, 0% 100%, 100% 100%)',
                }}
              />
            ))}
          </div>
          {/* Grass root shadow */}
          <div
            className="absolute bottom-0 left-0 w-full h-[4px] sm:h-[5px] opacity-40 transition-colors duration-500"
            style={{ backgroundColor: isNight ? '#173D21' : '#2D6B19' }}
          />
        </div>

        {/* Dirt Texture (Reaches Bottom Edge) */}
        <div
          className="w-full h-[54px] xs:h-[69px] sm:h-[106px] md:h-[136px] relative transition-colors duration-500"
          style={{
            backgroundColor: isNight ? '#3D2513' : '#8B5A2B',
            backgroundImage: `
              radial-gradient(${isNight ? '#26160A' : '#6A411B'} 18%, transparent 19%),
              radial-gradient(${isNight ? '#52341D' : '#A77038'} 18%, transparent 19%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
          }}
        >
          {/* Horizontal strata lines */}
          <div
            className="w-full h-[2px] absolute top-[20px] sm:top-[28px] opacity-35"
            style={{ backgroundColor: isNight ? '#1A0E06' : '#573314' }}
          />
          <div
            className="w-full h-[2px] absolute top-[40px] sm:top-[60px] opacity-35"
            style={{ backgroundColor: isNight ? '#1A0E06' : '#573314' }}
          />
        </div>
      </div>
    </div>
  );
};
