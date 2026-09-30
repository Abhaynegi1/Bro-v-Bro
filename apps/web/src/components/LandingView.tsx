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

  const isNight = theme === 'night';

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
      <header className="w-full bg-[#0A0F1D] text-white px-4 sm:px-8 py-2.5 flex items-center justify-between border-b-2 border-black z-30 flex-shrink-0">
        {/* Left: Pixel Logo */}
        <div className="flex items-center gap-1 font-pixel text-xs sm:text-sm tracking-wider">
          <span>BRO</span>
          <span className="text-arcadeRed font-bold text-xs">[v]</span>
          <span>BRO</span>
        </div>

        {/* Right: HOW TO PLAY link & NIGHT/DAY button */}
        <div className="flex items-center gap-4 sm:gap-6">
          {onOpenHowToPlay && (
            <button
              type="button"
              onClick={onOpenHowToPlay}
              className="font-pixel text-[11px] sm:text-xs text-white/90 hover:text-white uppercase tracking-wider hover:underline transition-all"
            >
              HOW TO PLAY
            </button>
          )}

          {/* Night / Day Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="bg-white hover:bg-cream text-black font-pixel text-[10px] sm:text-xs px-3.5 py-1 border-2 border-white rounded shadow-sm hover:scale-105 active:scale-95 transition-transform uppercase tracking-wider font-bold"
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
        {/* Upper Stage: HUD, Title, and Action Controls */}
        <div className="w-full flex flex-col items-center z-20">
          
          {/* Top HUD: P1 (Hearts) - GAUNTLET PILL - (Hearts) P2 */}
          <div className="w-full max-w-5xl px-4 sm:px-8 pt-3 sm:pt-5 flex items-center justify-between">
            {/* P1 Hearts */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5 font-pixel text-[11px] sm:text-xs text-white drop-shadow">
                <span className="font-bold">P1</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((h) => (
                    <svg key={h} width="16" height="14" viewBox="0 0 9 8" style={{ shapeRendering: 'crispEdges' }}>
                      <path d="M1 0 h3 v1 h1 v-1 h3 v2 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-2 h1 z" fill="#EF4444" />
                      <rect x="2" y="1" width="1" height="1" fill="#FFFFFF" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-white/90 font-pixel ml-6 leading-none">˘</span>
            </div>

            {/* Center Gauntlet Capsule */}
            <div className="bg-white text-ink border-2 border-black px-3.5 py-1 rounded-full shadow-pixel-sm font-pixel text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
              + 1V1 RETRO GAUNTLET +
            </div>

            {/* P2 Hearts */}
            <div className="flex items-center gap-1.5 font-pixel text-[11px] sm:text-xs text-white drop-shadow">
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((h) => (
                  <svg key={h} width="16" height="14" viewBox="0 0 9 8" style={{ shapeRendering: 'crispEdges' }}>
                    <path d="M1 0 h3 v1 h1 v-1 h3 v2 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-2 h1 z" fill="#EF4444" />
                    <rect x="2" y="1" width="1" height="1" fill="#FFFFFF" />
                  </svg>
                ))}
              </div>
              <span className="font-bold">P2</span>
            </div>
          </div>

          {/* Center Stage: Title + Sun/Moon + Tagline + Action Controls */}
          <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center mt-2 sm:mt-4 px-4">
            
            {/* 3D BRO v BRO Pixel Title with Cute Sun/Moon */}
            <div className="relative inline-flex items-center justify-center my-1">
              <div className="flex items-center font-pixel text-3xl sm:text-4xl md:text-5xl tracking-normal">
                {/* BRO (Orange 3D) */}
                <span className="pixel-text-3d-gold">BRO</span>

                {/* Pixel Heart with V cutout */}
                <div className="mx-2 sm:mx-3 flex items-center">
                  <svg
                    width="36"
                    height="32"
                    viewBox="0 0 12 11"
                    style={{ shapeRendering: 'crispEdges' }}
                    className="drop-shadow-md sm:w-[42px] sm:h-[38px]"
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
              <div className="absolute -top-3 -right-10 sm:-right-12 animate-pixel-idle">
                {!isNight ? (
                  /* Cute Pixel Sun with smiling face */
                  <svg width="38" height="38" viewBox="0 0 14 14" style={{ shapeRendering: 'crispEdges' }}>
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
                  <svg width="38" height="38" viewBox="0 0 14 14" style={{ shapeRendering: 'crispEdges' }}>
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
            <div className="space-y-1 mb-3">
              <p
                className={`font-pixel text-[11px] sm:text-xs tracking-wider transition-colors duration-500 ${
                  isNight ? 'text-white/90' : 'text-[#171A1F]'
                }`}
              >
                YOUR BRO THINKS HE'S BETTER.
              </p>
              <p className="font-pixel text-xs sm:text-sm tracking-widest pixel-text-3d-red">
                PROVE HIM WRONG.
              </p>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="w-full max-w-sm mb-3 p-2 bg-[#FFF5F5] border-2 border-arcadeRed text-arcadeRed font-mono font-bold text-xs shadow-pixel text-center">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            {/* Primary Action Controls: [CREATE ROOM] OR [CODE] [JOIN] */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 my-2 z-20 flex-wrap">
              {/* Green Create Room Button */}
              <button
                type="button"
                onClick={() => setActiveModal('create')}
                className="px-5 py-2.5 bg-[#5BA538] hover:bg-[#4E932E] text-white border-2 border-black font-pixel text-xs sm:text-sm tracking-wider uppercase shadow-pixel transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
              >
                CREATE ROOM
              </button>

              {/* OR Text */}
              <span
                className={`font-pixel text-xs font-bold transition-colors duration-500 ${
                  isNight ? 'text-white' : 'text-[#171A1F]'
                }`}
              >
                OR
              </span>

              {/* Joined CODE input + JOIN button */}
              <div className="flex items-center border-2 border-black shadow-pixel bg-white">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="CODE"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickJoinClick();
                  }}
                  className="w-24 sm:w-28 py-2 px-3 font-pixel text-xs sm:text-sm text-center uppercase text-ink outline-none bg-transparent placeholder:text-ink/30"
                />
                <button
                  type="button"
                  onClick={handleQuickJoinClick}
                  className="px-4 py-2 bg-[#3E80ED] hover:bg-[#2563EB] text-white border-l-2 border-black font-pixel text-xs sm:text-sm tracking-wider uppercase transition-colors"
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Stage: 2D Pixel Platformer Landscape Spanning Full Width */}
        <PixelRetroWorld theme={theme} />
      </div>

      {/* ================= FULL-WIDTH BOTTOM LIVE TICKER ================= */}
      <footer className="w-full bg-[#0D1322] border-t-2 border-[#FCD34D] py-2 px-4 flex items-center gap-3 select-none overflow-hidden flex-shrink-0 z-30">
        <div className="bg-[#E84040] text-white font-pixel text-[10px] px-2.5 py-0.5 uppercase tracking-wider flex-shrink-0 shadow-sm">
          LIVE
        </div>
        <div className="overflow-hidden flex-1 relative">
          <div className="ticker-track text-[10px] sm:text-[11px] font-pixel text-white tracking-widest uppercase flex items-center whitespace-nowrap">
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>14 ROOMS PLAYING</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>BRO_AJ 7 - 5 KUNAL</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>RAHUL 3 - 3 DEV</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>SHRUTI 9 - 2 MANU</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>ARJUN 4 - 2 KABIR</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>VIKRAM 5 - 4 ROHAN</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>SAM 3 - 1 ALEX</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>14 ROOMS PLAYING</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>BRO_AJ 7 - 5 KUNAL</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>RAHUL 3 - 3 DEV</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>SHRUTI 9 - 2 MANU</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>ARJUN 4 - 2 KABIR</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>VIKRAM 5 - 4 ROHAN</span>
            <span className="mx-3 text-[#FCD34D]">◆</span>
            <span>SAM 3 - 1 ALEX</span>
          </div>
        </div>
      </footer>

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
                  {isLoading ? 'STARTING...' : 'START ROOM'}
                </PixelButton>
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
                  {isLoading ? 'JOINING...' : 'JOIN BATTLE'}
                </PixelButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
