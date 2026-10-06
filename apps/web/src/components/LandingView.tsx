import React, { useState, useEffect } from 'react';
import { PixelRetroWorld } from './pixel/PixelRetroWorld';
import { PixelButton } from './pixel/PixelButton';

interface LandingViewProps {
  onCreateRoom: (hostName: string, targetWins: number) => Promise<void>;
  onJoinRoom: (code: string, guestName: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  onOpenHowToPlay?: () => void;
  initialModal?: 'create' | 'join' | null;
  theme: 'day' | 'night';
  onToggleTheme: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  isLoading,
  errorMessage,
  onOpenHowToPlay,
  initialModal,
  theme,
  onToggleTheme,
}) => {
  const [activeModal, setActiveModal] = useState<'create' | 'join' | null>(null);
  const [hostName, setHostName] = useState('');
  const [targetWins, setTargetWins] = useState<number>(3);
  const [joinCode, setJoinCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [slowLoading, setSlowLoading] = useState(false);

  const isNight = theme === 'night';

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLoading) {
      timer = setTimeout(() => setSlowLoading(true), 2500);
    } else {
      setSlowLoading(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Handle initial modal passed from parent (e.g. from How To Play page)
  useEffect(() => {
    if (initialModal) {
      setActiveModal(initialModal);
    }
  }, [initialModal]);

  // Check URL query parameters for ?code=ABCDE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setJoinCode(codeParam.toUpperCase());
      setActiveModal('join');
    }
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim() || isLoading) return;
    await onCreateRoom(hostName.trim(), targetWins);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !guestName.trim() || isLoading) return;
    await onJoinRoom(joinCode.trim().toUpperCase(), guestName.trim());
  };

  const handleQuickJoinClick = () => {
    setActiveModal('join');
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between relative overflow-hidden select-none">
      {/* ================= FULL-WIDTH TOP HEADER BAR ================= */}
      <header className="w-full bg-[#0A0F1D] text-white px-5 sm:px-10 py-3 flex items-center justify-between border-b-2 border-black z-30 flex-shrink-0">
        {/* Left: Pixel Logo */}
        <div className="flex items-center gap-1.5 font-pixel text-sm sm:text-base tracking-wider">
          <span>BRO</span>
          <span className="text-arcadeRed font-bold text-xs sm:text-sm">[v]</span>
          <span>BRO</span>
        </div>

        {/* Right: HOW TO PLAY link & NIGHT/DAY button */}
        <div className="flex items-center gap-5 sm:gap-7">
          {onOpenHowToPlay && (
            <button
              type="button"
              onClick={onOpenHowToPlay}
              className="font-pixel text-xs sm:text-sm text-white/90 hover:text-white uppercase tracking-wider hover:underline transition-all"
            >
              HOW TO PLAY
            </button>
          )}

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

      {/* ================= FULL-WIDTH MAIN GAME STAGE ================= */}
      <div
        className="w-full flex-1 flex flex-col justify-between relative overflow-hidden transition-colors duration-700"
        style={{
          backgroundColor: isNight ? '#0D193A' : '#72B6F4',
        }}
      >
        {/* Upper Sky Floating Clouds (Day Light Mode) */}
        {!isNight && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div
              className="absolute top-[3%] left-[-5%] opacity-85"
              style={{ animation: 'cloud-float 60s linear infinite' }}
            >
              <svg width="180" height="70" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
                <path
                  d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z M 14 0 h 4 v 2 h -4 z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
            <div
              className="absolute top-[8%] right-[2%] opacity-80"
              style={{ animation: 'cloud-float 75s linear infinite', animationDelay: '-22s' }}
            >
              <svg width="150" height="58" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
                <path
                  d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Upper Stage: HUD, Title, and Action Controls */}
        <div className="w-full flex flex-col items-center z-20 pt-2 sm:pt-4">
          
          {/* Top HUD: P1 (Hearts) - GAUNTLET PILL - (Hearts) P2 */}
          <div className="w-full max-w-6xl px-6 sm:px-12 flex items-center justify-between">
            {/* P1 Hearts */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 font-pixel text-sm sm:text-base text-white drop-shadow">
                <span className="font-bold">P1</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((h) => (
                    <svg key={h} width="20" height="18" viewBox="0 0 9 8" style={{ shapeRendering: 'crispEdges' }}>
                      <path d="M1 0 h3 v1 h1 v-1 h3 v2 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-2 h1 z" fill="#EF4444" />
                      <rect x="2" y="1" width="1" height="1" fill="#FFFFFF" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-xs text-white/90 font-pixel ml-8 leading-none">˘</span>
            </div>

            {/* Center Gauntlet Capsule */}
            <div className="bg-white text-ink border-3 border-black px-5 py-1.5 sm:px-7 sm:py-2 rounded-full shadow-pixel font-pixel text-[10px] sm:text-xs md:text-sm font-bold tracking-wider uppercase">
              + 1V1 ULTIMATE GAMER GAUNTLET +
            </div>

            {/* P2 Hearts */}
            <div className="flex items-center gap-2 font-pixel text-sm sm:text-base text-white drop-shadow">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((h) => (
                  <svg key={h} width="20" height="18" viewBox="0 0 9 8" style={{ shapeRendering: 'crispEdges' }}>
                    <path d="M1 0 h3 v1 h1 v-1 h3 v2 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-2 h1 z" fill="#EF4444" />
                    <rect x="2" y="1" width="1" height="1" fill="#FFFFFF" />
                  </svg>
                ))}
              </div>
              <span className="font-bold">P2</span>
            </div>
          </div>

          {/* Center Stage: Title + Sun/Moon + Tagline + Action Controls (Larger & Bolder) */}
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mt-3 sm:mt-6 px-4">
            
            {/* 3D BRO v BRO Pixel Title with Cute Sun/Moon */}
            <div className="relative inline-flex items-center justify-center my-2">
              <div className="flex items-center font-pixel text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-normal">
                {/* BRO (Orange 3D) */}
                <span className="pixel-text-3d-gold">BRO</span>

                {/* Pixel Heart with V cutout */}
                <div className="mx-3 sm:mx-5 flex items-center">
                  <svg
                    width="48"
                    height="42"
                    viewBox="0 0 12 11"
                    style={{ shapeRendering: 'crispEdges' }}
                    className="drop-shadow-lg sm:w-[60px] sm:h-[54px] md:w-[68px] md:h-[60px]"
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

                {/* BRO (Orange 3D) */}
                <span className="pixel-text-3d-gold">BRO</span>
              </div>

              {/* Sun (Day) or Moon (Night) positioned at top right of Title */}
              <div className="absolute -top-4 -right-12 sm:-right-16 md:-right-20 animate-pixel-idle">
                {!isNight ? (
                  /* Cute Pixel Sun with smiling face */
                  <svg width="48" height="48" viewBox="0 0 14 14" style={{ shapeRendering: 'crispEdges' }} className="sm:w-[60px] sm:h-[60px]">
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
                  /* Cute Pixel Moon with smiling face */
                  <svg width="48" height="48" viewBox="0 0 14 14" style={{ shapeRendering: 'crispEdges' }} className="sm:w-[60px] sm:h-[60px]">
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

            {/* Tagline */}
            <div className="space-y-1.5 mb-4 sm:mb-6">
              <p
                className={`font-pixel text-xs sm:text-sm md:text-base tracking-wider transition-colors duration-500 ${
                  isNight ? 'text-[#F1F5F9] font-bold' : 'text-[#171A1F]'
                }`}
              >
                FIND OUT WHO'S THE REAL GAMER AMONG YOU.
              </p>
              <p className="font-pixel text-base sm:text-lg md:text-2xl tracking-widest pixel-text-3d-red mt-1">
                SETTLE THE SCORE.
              </p>
            </div>


            {/* Error banner if any */}
            {errorMessage && (
              <div className="w-full max-w-md mb-4 p-3 bg-[#FFF5F5] border-2 border-arcadeRed text-arcadeRed font-mono font-bold text-xs sm:text-sm shadow-pixel text-center">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            {/* Primary Action Controls: [CREATE ROOM] OR [CODE] [JOIN] (Enlarged) */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 my-2 z-20 flex-wrap">
              {/* Green Create Room Button */}
              <button
                type="button"
                onClick={() => setActiveModal('create')}
                className="px-7 py-3.5 sm:px-9 sm:py-4 md:px-11 md:py-4.5 bg-[#5BA538] hover:bg-[#4E932E] text-white border-3 border-black font-pixel text-sm sm:text-base md:text-lg tracking-wider uppercase shadow-pixel-lg transition-all hover:-translate-y-1 active:translate-y-0.5 active:shadow-sm"
              >
                CREATE ROOM
              </button>

              {/* OR Text */}
              <span
                className={`font-pixel text-sm sm:text-base font-bold transition-colors duration-500 mx-1 ${
                  isNight ? 'text-white' : 'text-[#171A1F]'
                }`}
              >
                OR
              </span>

              {/* Joined CODE input + JOIN button */}
              <div className="flex items-center border-3 border-black shadow-pixel-lg bg-white">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="CODE"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickJoinClick();
                  }}
                  className="w-28 sm:w-36 md:w-44 py-3.5 sm:py-4 md:py-4.5 px-4 font-pixel text-sm sm:text-base md:text-lg text-center uppercase text-ink outline-none bg-transparent placeholder:text-ink/30"
                />
                <button
                  type="button"
                  onClick={handleQuickJoinClick}
                  className="px-6 py-3.5 sm:px-8 sm:py-4 md:px-10 md:py-4.5 bg-[#3E80ED] hover:bg-[#2563EB] text-white border-l-3 border-black font-pixel text-sm sm:text-base md:text-lg tracking-wider uppercase transition-colors"
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Stage: 2D Pixel Platformer Landscape Spanning Full Width & Reaching Bottom */}
        <PixelRetroWorld theme={theme} />
      </div>

      {/* ================= MODAL: CREATE ROOM ================= */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 bg-[#0A0F19]/75 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFDF5] text-ink border-3 border-ink p-6 sm:p-7 shadow-pixel-lg relative text-left">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3 mb-5">
              <span className="font-pixel text-sm text-darkNavy tracking-wider">CREATE ROOM</span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="font-pixel text-xs text-ink hover:text-arcadeRed p-1 transition-colors"
                title="Close"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1.5 text-ink">
                  YOUR BRO NAME:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={16}
                  placeholder="LUDWIG"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full bg-white border-2 border-ink px-4 py-2.5 text-ink font-mono font-bold text-base focus:outline-none focus:border-arcadeRed shadow-pixel-sm"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-2 text-ink">
                  HOW MANY ROUNDS?
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { wins: 1, label: '1 WIN' },
                    { wins: 3, label: 'FIRST TO 3' },
                    { wins: 5, label: 'FIRST TO 5' },
                  ].map((opt) => (
                    <button
                      key={opt.wins}
                      type="button"
                      onClick={() => setTargetWins(opt.wins)}
                      className={`py-3 px-2 border-2 font-mono font-bold text-xs sm:text-sm transition-all select-none ${
                        targetWins === opt.wins
                          ? 'bg-darkNavy text-paper border-arcadeRed shadow-pixel-sm -translate-y-0.5'
                          : 'bg-white text-ink border-ink hover:bg-cream'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <PixelButton
                  type="submit"
                  variant="navy"
                  size="md"
                  disabled={isLoading || !hostName.trim()}
                  className="w-full justify-center py-3.5"
                >
                  {isLoading ? (slowLoading ? 'WAKING UP SERVER...' : 'STARTING...') : 'START ROOM'}
                </PixelButton>
                {slowLoading && (
                  <p className="font-mono font-bold text-[11px] text-[#2563EB] animate-pulse text-center mt-2.5">
                    ⚡ Waking up game server from sleep... please wait a moment
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: JOIN ROOM ================= */}
      {activeModal === 'join' && (
        <div className="fixed inset-0 bg-[#0A0F19]/75 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFDF5] text-ink border-3 border-ink p-6 sm:p-7 shadow-pixel-lg relative text-left">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3 mb-5">
              <span className="font-pixel text-sm text-darkNavy tracking-wider">JOIN ROOM</span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="font-pixel text-xs text-ink hover:text-arcadeRed p-1 transition-colors"
                title="Close"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-5">
              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1.5 text-ink">
                  ENTER BRO CODE:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="K7X9P"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-white border-2 border-ink px-4 py-2.5 text-ink font-pixel tracking-widest text-center text-xl uppercase focus:outline-none focus:border-arcadeRed shadow-pixel-sm"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1.5 text-ink">
                  YOUR BRO NAME:
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="CONNOR"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-white border-2 border-ink px-4 py-2.5 text-ink font-mono font-bold text-base focus:outline-none focus:border-arcadeRed shadow-pixel-sm"
                />
              </div>

              <div className="pt-2">
                <PixelButton
                  type="submit"
                  variant="navy"
                  size="md"
                  disabled={isLoading || !joinCode.trim() || !guestName.trim()}
                  className="w-full justify-center py-3.5"
                >
                  {isLoading ? (slowLoading ? 'WAKING UP SERVER...' : 'JOINING...') : 'JOIN BATTLE'}
                </PixelButton>
                {slowLoading && (
                  <p className="font-mono font-bold text-[11px] text-[#2563EB] animate-pulse text-center mt-2.5">
                    ⚡ Waking up game server from sleep... please wait a moment
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
