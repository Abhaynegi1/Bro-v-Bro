import React from 'react';

interface HowToPlayViewProps {
  onBack: () => void;
  onOpenCreate: () => void;
  onOpenJoin: () => void;
  theme: 'day' | 'night';
  onToggleTheme: () => void;
}

export const HowToPlayView: React.FC<HowToPlayViewProps> = ({
  onBack,
  onOpenCreate,
  onOpenJoin,
  theme,
  onToggleTheme,
}) => {
  const isNight = theme === 'night';

  // Dynamic theme colors with high contrast for night mode
  const cardBg = isNight
    ? 'bg-[#142247] text-white border-2 border-[#4A68B1] shadow-[8px_8px_0px_#050A18]'
    : 'bg-white text-ink border-3 border-black shadow-pixel-lg';
  const headingText = isNight ? 'text-white' : 'text-[#0A0F1D]';
  const subText = isNight ? 'text-[#E2EAF8]' : 'text-[#1F2937]';
  const dividerBorder = isNight ? 'border-[#3B5496]' : 'border-black';
  const iconBoxBg = isNight
    ? 'bg-[#0B132B] border border-[#4A68B1] shadow-sm'
    : 'bg-[#0A0F1D] border border-black shadow-pixel-sm';

  return (
    <div
      className="w-full min-h-screen flex flex-col justify-start select-none transition-colors duration-700 relative overflow-x-hidden"
      style={{
        backgroundColor: isNight ? '#0D193A' : '#72B6F4',
      }}
    >
      {/* ================= IDENTICAL FULL-WIDTH TOP HEADER BAR ================= */}
      <header className="w-full bg-[#0A0F1D] text-white px-5 sm:px-10 py-3 flex items-center justify-between border-b-2 border-black z-30 flex-shrink-0 sticky top-0 shadow-md">
        {/* Left: Pixel Logo (Returns to Arena on click) */}
        <div
          onClick={onBack}
          className="flex items-center gap-1.5 font-pixel text-sm sm:text-base tracking-wider cursor-pointer group select-none"
          title="Return to Arena"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">BRO</span>
          <span className="text-arcadeRed font-bold text-xs sm:text-sm">[v]</span>
          <span className="group-hover:translate-x-0.5 transition-transform">BRO</span>
        </div>

        {/* Right: ARENA link & NIGHT/DAY button (Exact match to LandingView) */}
        <div className="flex items-center gap-5 sm:gap-7">
          <button
            type="button"
            onClick={onBack}
            className="font-pixel text-xs sm:text-sm text-white/90 hover:text-white uppercase tracking-wider hover:underline transition-all flex items-center gap-1.5"
          >
            <span>◄</span>
            <span>ARENA</span>
          </button>

          {/* Night / Day Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="bg-white hover:bg-cream text-black font-pixel text-xs sm:text-sm px-4 py-1.5 border-2 border-white rounded shadow-sm hover:scale-105 active:scale-95 transition-transform uppercase tracking-wider font-bold"
          >
            {isNight ? 'DAY' : 'NIGHT'}
          </button>
        </div>
      </header>

      {/* ================= BACKGROUND TWINKLING STARS (NIGHT ONLY) ================= */}
      {isNight && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[
            { top: '8%', left: '5%', delay: '0s', size: 3 },
            { top: '15%', left: '15%', delay: '0.7s', size: 4 },
            { top: '12%', left: '30%', delay: '1.2s', size: 3 },
            { top: '25%', left: '45%', delay: '0.4s', size: 4 },
            { top: '18%', left: '62%', delay: '1.5s', size: 3 },
            { top: '10%', left: '78%', delay: '0.9s', size: 4 },
            { top: '22%', left: '90%', delay: '0.2s', size: 3 },
            { top: '35%', left: '8%', delay: '1.8s', size: 4 },
            { top: '45%', left: '85%', delay: '1.1s', size: 3 },
            { top: '55%', left: '12%', delay: '0.6s', size: 4 },
            { top: '65%', left: '80%', delay: '1.3s', size: 3 },
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
          <div className="absolute top-[10%] left-[22%] text-white text-[12px] font-pixel animate-pulse">✦</div>
          <div className="absolute top-[8%] left-[72%] text-cartridgeYellow text-[14px] font-pixel animate-pulse" style={{ animationDelay: '0.8s' }}>★</div>
          <div className="absolute top-[30%] left-[88%] text-white text-[11px] font-pixel animate-pulse" style={{ animationDelay: '1.4s' }}>✦</div>
        </div>
      )}

      {/* ================= BACKGROUND FLOATING CLOUDS (LIGHT DAY MODE ONLY) ================= */}
      {!isNight && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Cloud 1 - Top Left Large */}
          <div
            className="absolute top-[6%] left-[-8%] opacity-90"
            style={{ animation: 'cloud-float 50s linear infinite' }}
          >
            <svg width="220" height="85" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
              <path
                d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z M 14 0 h 4 v 2 h -4 z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          {/* Cloud 2 - Top Right Medium */}
          <div
            className="absolute top-[14%] right-[5%] opacity-85"
            style={{ animation: 'cloud-float 65s linear infinite', animationDelay: '-18s' }}
          >
            <svg width="170" height="65" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
              <path
                d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          {/* Cloud 3 - Mid Left */}
          <div
            className="absolute top-[38%] left-[2%] opacity-80 hidden md:block"
            style={{ animation: 'cloud-float 58s linear infinite', animationDelay: '-32s' }}
          >
            <svg width="150" height="58" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
              <path
                d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          {/* Cloud 4 - Mid Right */}
          <div
            className="absolute top-[58%] right-[8%] opacity-75 hidden lg:block"
            style={{ animation: 'cloud-float 72s linear infinite', animationDelay: '-45s' }}
          >
            <svg width="180" height="70" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
              <path
                d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z M 14 0 h 4 v 2 h -4 z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          {/* Cloud 5 - Lower Left */}
          <div
            className="absolute top-[78%] left-[6%] opacity-70 hidden sm:block"
            style={{ animation: 'cloud-float 62s linear infinite', animationDelay: '-12s' }}
          >
            <svg width="140" height="54" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
              <path
                d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 relative z-10">

        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Top Capsule (Matches LandingView) */}
          <div className="inline-block bg-white text-ink border-3 border-black px-5 py-1.5 sm:px-7 sm:py-2 rounded-full shadow-pixel font-pixel text-[10px] sm:text-xs md:text-sm font-bold tracking-wider uppercase mb-5">
            + 1V1 ULTIMATE GAMER GAUNTLET GUIDE +
          </div>

          {/* 3D Title + Pixel Heart + Sun/Moon */}
          <div className="relative inline-flex items-center justify-center my-2">
            <div className="flex items-center font-pixel text-3xl sm:text-5xl md:text-6xl tracking-normal">
              <span className={`mr-2 sm:mr-3 ${isNight ? 'text-white' : 'text-[#0A0F1D]'}`}>
                HOW TO PLAY
              </span>
              <span className="pixel-text-3d-gold">BRO</span>

              {/* Pixel Heart */}
              <div className="mx-2 sm:mx-3 flex items-center">
                <svg
                  width="36"
                  height="32"
                  viewBox="0 0 12 11"
                  style={{ shapeRendering: 'crispEdges' }}
                  className="drop-shadow-lg sm:w-[48px] sm:h-[42px]"
                >
                  <path
                    d="M 2 1 h 3 v 2 h 2 v -2 h 3 v 3 h -1 v 2 h -2 v 2 h -2 v 2 h -2 v -2 h -2 v -2 h -1 v -3 h 3 z"
                    fill="#EF4444"
                  />
                  <rect x="2" y="1" width="1" height="1" fill="#F87171" />
                  <rect x="7" y="1" width="1" height="1" fill="#F87171" />
                  <rect x="4" y="3" width="1" height="2" fill="#7F1D1D" />
                  <rect x="7" y="3" width="1" height="2" fill="#7F1D1D" />
                  <rect x="5" y="5" width="2" height="1" fill="#7F1D1D" />
                </svg>
              </div>

              <span className="pixel-text-3d-gold">BRO</span>
            </div>

            {/* Sun / Moon beside Title */}
            <div className="absolute -top-3 -right-10 sm:-right-14 animate-pixel-idle">
              {!isNight ? (
                <svg width="42" height="42" viewBox="0 0 14 14" style={{ shapeRendering: 'crispEdges' }}>
                  <rect x="6" y="0" width="2" height="2" fill="#FCD34D" />
                  <rect x="6" y="12" width="2" height="2" fill="#FCD34D" />
                  <rect x="0" y="6" width="2" height="2" fill="#FCD34D" />
                  <rect x="12" y="6" width="2" height="2" fill="#FCD34D" />
                  <rect x="2" y="2" width="2" height="2" fill="#FCD34D" />
                  <rect x="10" y="2" width="2" height="2" fill="#FCD34D" />
                  <rect x="2" y="10" width="2" height="2" fill="#FCD34D" />
                  <rect x="10" y="10" width="2" height="2" fill="#FCD34D" />
                  <rect x="3" y="2" width="8" height="10" fill="#FBBF24" />
                  <rect x="2" y="3" width="10" height="8" fill="#FBBF24" />
                  <rect x="5" y="5" width="1" height="2" fill="#171A1F" />
                  <rect x="8" y="5" width="1" height="2" fill="#171A1F" />
                  <rect x="5" y="8" width="1" height="1" fill="#171A1F" />
                  <rect x="6" y="9" width="2" height="1" fill="#171A1F" />
                  <rect x="8" y="8" width="1" height="1" fill="#171A1F" />
                </svg>
              ) : (
                <svg width="42" height="42" viewBox="0 0 14 14" style={{ shapeRendering: 'crispEdges' }}>
                  <rect x="3" y="2" width="8" height="10" fill="#FEF08A" />
                  <rect x="2" y="3" width="10" height="8" fill="#FEF08A" />
                  <rect x="5" y="5" width="1" height="2" fill="#1E293B" />
                  <rect x="8" y="5" width="1" height="2" fill="#1E293B" />
                  <rect x="5" y="8" width="1" height="1" fill="#1E293B" />
                  <rect x="6" y="9" width="2" height="1" fill="#1E293B" />
                  <rect x="8" y="8" width="1" height="1" fill="#1E293B" />
                  <rect x="1" y="2" width="1" height="1" fill="#FFFFFF" />
                  <rect x="12" y="3" width="1" height="1" fill="#FFFFFF" />
                </svg>
              )}
            </div>
          </div>

          {/* Mottos in high-contrast card */}
          <div
            className={`max-w-2xl mx-auto ${
              isNight
                ? 'bg-[#142247] border-2 border-[#4A68B1] shadow-[8px_8px_0px_#050A18]'
                : 'bg-[#0A0F1D] border-3 border-black shadow-pixel-lg'
            } text-white p-5 sm:p-7 mt-5`}
          >
            <div className="font-mono text-xs sm:text-base font-bold tracking-wider uppercase space-y-1.5 text-center">
              <p className={isNight ? 'text-[#F1F5F9]' : 'text-white/90'}>
                FIND OUT WHO'S THE REAL GAMER AMONG YOU.
              </p>
              <p className="text-arcadeRed font-pixel text-sm sm:text-lg pt-2 tracking-widest animate-pulse drop-shadow-sm">
                SETTLE THE SCORE.
              </p>
            </div>
          </div>
        </div>

        {/* ================= 4 GOLDEN STEPS ================= */}
        <section className="mb-14 sm:mb-20">
          <div className={`flex items-center justify-between mb-6 pb-2.5 border-b-2 ${dividerBorder}`}>
            <h2 className={`font-pixel text-base sm:text-lg md:text-xl flex items-center gap-2.5 ${headingText}`}>
              <span className="text-arcadeRed">►</span> THE 4-STEP BATTLE PROTOCOL
            </h2>
            <span
              className={`text-[10px] sm:text-xs font-arcade uppercase tracking-wider font-bold ${
                isNight ? 'text-crtCyan' : 'text-black/60'
              }`}
            >
              ZERO INSTALL • INSTANT WEBSOCKET
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Step 1 */}
            <div className={`${cardBg} p-6 sm:p-7 hover:-translate-y-1 transition-all relative`}>
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`px-2.5 py-1 ${
                    isNight ? 'bg-crtCyan text-darkNavy font-bold' : 'bg-[#0A0F1D] text-white'
                  } font-pixel text-[11px] sm:text-xs tracking-wider`}
                >
                  STEP 01
                </span>
                <span className={`font-pixel text-xl sm:text-2xl text-cartridgeYellow ${iconBoxBg} px-2.5 py-1`}>
                  🕹️
                </span>
              </div>
              <h3 className={`font-arcade text-base sm:text-lg font-bold uppercase mb-2 ${isNight ? 'text-white' : 'text-[#0A0F1D]'}`}>
                CREATE YOUR ROOM
              </h3>
              <p className={`font-mono text-xs sm:text-sm ${subText} leading-relaxed`}>
                Pick your Bro handle and match target (Best of 1, 3, or 5 rounds). The server generates an exclusive 5-character Bro Code and an instant 1-click invite link.
              </p>
            </div>

            {/* Step 2 */}
            <div className={`${cardBg} p-6 sm:p-7 hover:-translate-y-1 transition-all relative`}>
              <div className="flex items-start justify-between mb-4">
                <span className="px-2.5 py-1 bg-arcadeRed text-white font-pixel text-[11px] sm:text-xs tracking-wider font-bold">
                  STEP 02
                </span>
                <span className={`font-pixel text-xl sm:text-2xl text-crtCyan ${iconBoxBg} px-2.5 py-1`}>
                  📲
                </span>
              </div>
              <h3 className={`font-arcade text-base sm:text-lg font-bold uppercase mb-2 ${isNight ? 'text-white' : 'text-[#0A0F1D]'}`}>
                CALL YOUR BRO
              </h3>
              <p className={`font-mono text-xs sm:text-sm ${subText} leading-relaxed`}>
                Send the code or link over Discord, WhatsApp, or shout it across the room. No registration, no app store download, and no password required. One click connects you.
              </p>
            </div>

            {/* Step 3 */}
            <div className={`${cardBg} p-6 sm:p-7 hover:-translate-y-1 transition-all relative`}>
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`px-2.5 py-1 ${
                    isNight ? 'bg-cartridgeYellow text-darkNavy font-bold' : 'bg-mutedNavy text-white'
                  } font-pixel text-[11px] sm:text-xs tracking-wider`}
                >
                  STEP 03
                </span>
                <span className={`font-pixel text-xl sm:text-2xl text-gameboyGreen ${iconBoxBg} px-2.5 py-1`}>
                  ⚔️
                </span>
              </div>
              <h3 className={`font-arcade text-base sm:text-lg font-bold uppercase mb-2 ${isNight ? 'text-white' : 'text-[#0A0F1D]'}`}>
                RUN THE GAUNTLET
              </h3>
              <p className={`font-mono text-xs sm:text-sm ${subText} leading-relaxed`}>
                Once both Bros lock in "READY", the gauntlet initiates. Quick-fire retro mini-games test your tactical thinking, reflex speed, memory, and nerve.
              </p>
            </div>

            {/* Step 4 */}
            <div className={`${cardBg} p-6 sm:p-7 hover:-translate-y-1 transition-all relative`}>
              <div className="flex items-start justify-between mb-4">
                <span className="px-2.5 py-1 bg-gameboyGreen text-darkNavy font-pixel text-[11px] sm:text-xs tracking-wider font-bold">
                  STEP 04
                </span>
                <span className={`font-pixel text-xl sm:text-2xl text-cartridgeYellow ${iconBoxBg} px-2.5 py-1`}>
                  👑
                </span>
              </div>
              <h3 className={`font-arcade text-base sm:text-lg font-bold uppercase mb-2 ${isNight ? 'text-white' : 'text-[#0A0F1D]'}`}>
                CLAIM ULTIMATE BRAGGING RIGHTS
              </h3>
              <p className={`font-mono text-xs sm:text-sm ${subText} leading-relaxed`}>
                Real-time synchronized scoreboard tracks each round. The winner officially becomes the better gamer for the next month—and the loser legally cannot deny it. 100% undisputed victory proof.
              </p>
            </div>
          </div>
        </section>

        {/* ================= READY TO BATTLE CTA ================= */}
        <div className={`${cardBg} p-8 sm:p-12 text-center`}>
          <p
            className={`font-arcade text-xs sm:text-sm ${
              isNight ? 'text-[#FF6666]' : 'text-arcadeRed'
            } font-bold tracking-widest uppercase mb-2 sm:mb-3`}
          >
            ENOUGH TALK. TIME TO BATTLE.
          </p>
          <h3
            className={`font-pixel text-lg sm:text-2xl md:text-3xl uppercase mb-6 sm:mb-8 ${
              isNight ? 'text-white' : 'text-[#0A0F1D]'
            }`}
          >
            PROVE YOU'RE THE REAL GAMER
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={onOpenCreate}
              className={`px-7 py-3.5 sm:px-9 sm:py-4 md:px-11 md:py-4.5 bg-[#5BA538] hover:bg-[#4E932E] text-white border-3 border-black font-pixel text-sm sm:text-base md:text-lg tracking-wider uppercase ${
                isNight ? 'shadow-[6px_6px_0px_#050A18]' : 'shadow-pixel-lg'
              } transition-all hover:-translate-y-1 active:translate-y-0.5 active:shadow-sm min-w-[200px] sm:min-w-[240px]`}
            >
              CREATE ROOM
            </button>
            <button
              type="button"
              onClick={onOpenJoin}
              className={`px-6 py-3.5 sm:px-8 sm:py-4 md:px-10 md:py-4.5 bg-[#3E80ED] hover:bg-[#2563EB] text-white border-3 border-black font-pixel text-sm sm:text-base md:text-lg tracking-wider uppercase ${
                isNight ? 'shadow-[6px_6px_0px_#050A18]' : 'shadow-pixel-lg'
              } transition-all hover:-translate-y-1 active:translate-y-0.5 active:shadow-sm min-w-[200px] sm:min-w-[240px]`}
            >
              JOIN ROOM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
