import React from 'react';
import type { RoomState } from '@bvb/shared';

interface PixelDraftAtmosphereProps {
  theme: 'day' | 'night';
  roomState: RoomState;
  children?: React.ReactNode;
}

export const PixelDraftAtmosphere: React.FC<PixelDraftAtmosphereProps> = ({
  theme,
  roomState,
  children,
}) => {
  const isNight = theme === 'night';
  const playerA = roomState.players.playerA;
  const playerB = roomState.players.playerB;
  const match = roomState.currentMatch;
  const targetWins = match?.seriesCondition.type === 'FIRST_TO_N' ? match.seriesCondition.targetPoints : 3;
  const scoreA = match?.scores.playerA ?? 0;
  const scoreB = match?.scores.playerB ?? 0;

  return (
    <div className="w-full flex-1 flex flex-col justify-between relative overflow-hidden min-h-full">
      {/* ================= FLOATING RETRO SKY CLOUDS ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div
          className="absolute top-[4%] left-[-8%] opacity-70"
          style={{ animation: 'cloud-float 65s linear infinite' }}
        >
          <svg width="150" height="58" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
            <path
              d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z M 14 0 h 4 v 2 h -4 z"
              fill={isNight ? '#1E2C4F' : '#FFFFFF'}
            />
          </svg>
        </div>

        <div
          className="absolute top-[18%] left-[55%] opacity-60 hidden md:block"
          style={{ animation: 'cloud-float 80s linear infinite', animationDelay: '-30s' }}
        >
          <svg width="120" height="46" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
            <path
              d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z"
              fill={isNight ? '#172340' : '#FFFFFF'}
            />
          </svg>
        </div>

        {/* Ambient Pixel Sparkles '+' and '★' */}
        <span className="absolute top-[8%] left-[10%] text-ink/30 text-lg font-pixel animate-pulse">+</span>
        <span className="absolute top-[22%] left-[18%] text-cartridgeYellow text-sm font-pixel animate-pulse" style={{ animationDelay: '0.8s' }}>✦</span>
        <span className="absolute top-[12%] right-[12%] text-ink/30 text-lg font-pixel animate-pulse" style={{ animationDelay: '1.2s' }}>+</span>
        <span className="absolute top-[26%] right-[20%] text-pixelPink text-xs font-pixel animate-pulse" style={{ animationDelay: '0.5s' }}>♥</span>
        <span className="absolute top-[50%] left-[5%] text-cartridgeYellow text-xs font-pixel animate-pulse" style={{ animationDelay: '1.5s' }}>★</span>
        <span className="absolute top-[65%] right-[6%] text-crtCyan text-sm font-pixel animate-pulse" style={{ animationDelay: '0.9s' }}>✦</span>
        <span className="absolute top-[40%] right-[4%] text-ink/30 text-base font-pixel">+</span>
      </div>

      {/* ================= LEFT SIDE ARCADE DECOR (DESKTOP) ================= */}
      <div className="hidden 2xl:flex flex-col items-center justify-end absolute left-4 bottom-16 pointer-events-none z-0 select-none opacity-90 transition-opacity">
        {/* Hanging Game Controller */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-[2px] h-20 bg-ink" />
          <svg width="44" height="28" viewBox="0 0 22 14" style={{ shapeRendering: 'crispEdges' }}>
            <rect x="2" y="2" width="18" height="10" fill="#18243A" />
            <rect x="1" y="4" width="20" height="6" fill="#18243A" />
            <rect x="1" y="6" width="4" height="7" fill="#18243A" />
            <rect x="17" y="6" width="4" height="7" fill="#18243A" />
            <rect x="4" y="5" width="4" height="2" fill="#E84B4B" />
            <rect x="5" y="4" width="2" height="4" fill="#E84B4B" />
            <rect x="14" y="5" width="2" height="2" fill="#42B8C7" />
            <rect x="16" y="6" width="2" height="2" fill="#F4D35E" />
          </svg>
        </div>

        {/* Arcade Cabinet + Potted Plant */}
        <div className="flex items-end gap-3">
          <svg width="86" height="120" viewBox="0 0 42 58" style={{ shapeRendering: 'crispEdges' }}>
            <rect x="4" y="2" width="34" height="54" fill="#171A1F" />
            <rect x="2" y="52" width="38" height="6" fill="#111522" />
            <rect x="6" y="4" width="30" height="8" fill="#E84B4B" />
            <rect x="8" y="6" width="26" height="4" fill="#FFEAA7" />
            <rect x="6" y="14" width="30" height="22" fill="#151C30" stroke="#42B8C7" strokeWidth="1" />
            <rect x="8" y="16" width="26" height="18" fill="#42B8C7" />
            <rect x="12" y="21" width="3" height="4" fill="#171A1F" />
            <rect x="23" y="21" width="3" height="4" fill="#171A1F" />
            <rect x="15" y="28" width="8" height="2" fill="#171A1F" />
            <rect x="14" y="27" width="2" height="2" fill="#171A1F" />
            <rect x="22" y="27" width="2" height="2" fill="#171A1F" />
            <rect x="4" y="38" width="34" height="8" fill="#24334E" />
            <rect x="11" y="39" width="2" height="4" fill="#FFF7DC" />
            <circle cx="12" cy="38" r="2" fill="#E84B4B" />
            <circle cx="20" cy="41" r="1.5" fill="#42B8C7" />
            <circle cx="25" cy="41" r="1.5" fill="#F4D35E" />
            <circle cx="30" cy="41" r="1.5" fill="#69B85A" />
            <rect x="15" y="48" width="12" height="6" fill="#111522" />
            <rect x="18" y="49" width="2" height="2" fill="#F4D35E" />
          </svg>

          <svg width="40" height="55" viewBox="0 0 20 28" style={{ shapeRendering: 'crispEdges' }}>
            <rect x="4" y="18" width="12" height="9" fill="#D35400" />
            <rect x="3" y="17" width="14" height="2" fill="#E67E22" />
            <rect x="5" y="16" width="10" height="2" fill="#4A3728" />
            <rect x="9" y="8" width="2" height="9" fill="#27AE60" />
            <rect x="5" y="13" width="4" height="3" fill="#2ECC71" />
            <rect x="11" y="12" width="4" height="3" fill="#2ECC71" />
            <rect x="6" y="9" width="3" height="3" fill="#2ECC71" />
            <rect x="11" y="8" width="3" height="3" fill="#2ECC71" />
            <rect x="8" y="4" width="4" height="4" fill="#2ECC71" />
          </svg>
        </div>
      </div>

      {/* ================= RIGHT SIDE ARCADE DECOR (DESKTOP) ================= */}
      <div className="hidden 2xl:flex flex-col items-center justify-end absolute right-4 bottom-16 pointer-events-none z-0 select-none opacity-90 transition-opacity">
        <div className="flex flex-col items-center mb-4">
          <div className="w-[2px] h-14 bg-ink" />
          <svg width="40" height="24" viewBox="0 0 20 12" style={{ shapeRendering: 'crispEdges' }}>
            <polygon points="10,1 2,10 18,10" fill="#18243A" />
            <rect x="8" y="10" width="4" height="2" fill="#F4D35E" />
          </svg>
        </div>

        <div className="mb-3 px-3 py-1.5 bg-[#18243A] text-cartridgeYellow border-2 border-ink shadow-pixel font-arcade text-[10px] tracking-wider font-bold">
          👑 BETTER BRO
        </div>

        <div className="flex items-end gap-3">
          <svg width="80" height="95" viewBox="0 0 40 48" style={{ shapeRendering: 'crispEdges' }}>
            <rect x="3" y="6" width="34" height="28" fill="#171A1F" />
            <rect x="5" y="8" width="30" height="24" fill="#42B8C7" />
            <rect x="11" y="14" width="3" height="4" fill="#171A1F" />
            <rect x="25" y="14" width="3" height="4" fill="#171A1F" />
            <rect x="15" y="21" width="9" height="2" fill="#171A1F" />
            <rect x="14" y="20" width="2" height="2" fill="#171A1F" />
            <rect x="23" y="20" width="2" height="2" fill="#171A1F" />
            <rect x="16" y="34" width="8" height="6" fill="#24334E" />
            <rect x="10" y="40" width="20" height="4" fill="#171A1F" />
            <rect x="2" y="44" width="36" height="4" fill="#4A3728" />
          </svg>

          <svg width="60" height="85" viewBox="0 0 30 42" style={{ shapeRendering: 'crispEdges' }}>
            <rect x="18" y="4" width="2" height="26" fill="#171A1F" />
            <polygon points="18,5 6,11 18,17" fill="#E84B4B" />
            <rect x="4" y="28" width="24" height="12" fill="#27AE60" />
            <rect x="8" y="24" width="18" height="6" fill="#2ECC71" />
            <rect x="12" y="20" width="12" height="6" fill="#2ECC71" />
            <rect x="0" y="36" width="30" height="6" fill="#1E8449" />
          </svg>
        </div>
      </div>

      {/* ================= MAIN DRAFT CHILDREN CONTENT ================= */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>

      {/* ================= RETRO BOTTOM ARCADE TICKER MARQUEE ================= */}
      <footer className="w-full bg-[#0A0F1D] text-white border-t-4 border-ink relative z-20 flex-shrink-0 select-none shadow-pixel-lg">
        {/* Striped / Checkered Pixel Accent Ribbon */}
        <div
          className="w-full h-1.5"
          style={{
            background: 'repeating-linear-gradient(90deg, #E84B4B 0, #E84B4B 8px, #F4D35E 8px, #F4D35E 16px, #42B8C7 16px, #42B8C7 24px, #18243A 24px, #18243A 32px)',
          }}
        />

        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between text-xs font-arcade">
          {/* Left: Pixel Logo & Insert Coin */}
          <div className="flex items-center gap-2">
            <span className="text-arcadeRed font-bold">🕹️</span>
            <span className="font-pixel text-[11px] tracking-wider hidden sm:inline">BRO [v] BRO</span>
            <span className="hidden md:inline text-white/50 text-[10px]">•</span>
            <span className="text-cartridgeYellow text-[10px] tracking-widest uppercase font-bold animate-pulse">
              ★ INSERT COIN • PLAY • REPEAT ★
            </span>
          </div>

          {/* Right: 1P vs 2P Heart Counters */}
          <div className="flex items-center gap-4 sm:gap-6 text-[11px]">
            {/* Player 1 Hearts */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-arcadeRed">1P</span>
              <span className="text-white/80 font-mono text-[10px] hidden sm:inline truncate max-w-[60px]">
                {playerA?.name || 'HOST'}
              </span>
              <div className="flex items-center gap-0.5 text-arcadeRed">
                {Array.from({ length: targetWins }).map((_, i) => (
                  <span key={i} className={i < scoreA ? 'text-arcadeRed' : 'text-slate-600 opacity-50'}>
                    ♥
                  </span>
                ))}
              </div>
            </div>

            <span className="text-white/40">|</span>

            {/* Player 2 Hearts */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-crtCyan">2P</span>
              <span className="text-white/80 font-mono text-[10px] hidden sm:inline truncate max-w-[60px]">
                {playerB?.name || 'GUEST'}
              </span>
              <div className="flex items-center gap-0.5 text-crtCyan">
                {Array.from({ length: targetWins }).map((_, i) => (
                  <span key={i} className={i < scoreB ? 'text-crtCyan' : 'text-slate-600 opacity-50'}>
                    ♥
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
