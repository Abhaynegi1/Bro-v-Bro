import React, { useState, useEffect } from 'react';
import { PixelArcadeScene } from './pixel/PixelArcadeScene';
import { PixelButton } from './pixel/PixelButton';

interface LandingViewProps {
  onCreateRoom: (hostName: string, targetWins: number) => Promise<void>;
  onJoinRoom: (code: string, guestName: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  isLoading,
  errorMessage,
}) => {
  const [activeModal, setActiveModal] = useState<'create' | 'join' | null>(null);
  const [hostName, setHostName] = useState('');
  const [targetWins, setTargetWins] = useState<number>(3);
  const [joinCode, setJoinCode] = useState('');
  const [guestName, setGuestName] = useState('');

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

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full text-center select-none">
      {/* Tiny decorative header marks */}
      <div className="flex items-center gap-2 mb-3 text-cartridgeYellow text-xs font-pixel">
        <span>+</span>
        <span className="text-[9px] tracking-widest text-paper/70 font-arcade">1v1 RETRO GAUNTLET</span>
        <span>+</span>
      </div>

      {/* Main Pixel Title */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-pixel text-paper tracking-wider mb-3 drop-shadow-[3px_3px_0px_#111522]">
        BRO <span className="text-arcadeRed font-bold text-2xl sm:text-4xl">v</span> BRO
      </h1>

      {/* Tagline */}
      <p className="font-arcade text-xs sm:text-sm text-cartridgeYellow tracking-widest uppercase mb-1">
        YOUR BRO THINKS HE'S BETTER.
      </p>
      <p className="font-pixel text-[11px] sm:text-xs text-arcadeRed tracking-wider uppercase mb-6">
        PROVE HIM WRONG.
      </p>

      {/* Error alert banner if any */}
      {errorMessage && (
        <div className="w-full max-w-md mb-4 p-3 bg-ink border-2 border-arcadeRed text-arcadeRed text-xs font-mono shadow-pixel text-left flex items-center justify-between">
          <span>! {errorMessage}</span>
          <button onClick={() => window.location.reload()} className="underline text-[10px] ml-2">RETRY</button>
        </div>
      )}

      {/* Primary CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 z-10">
        <PixelButton
          variant="red"
          size="lg"
          onClick={() => setActiveModal('create')}
        >
          CREATE ROOM
        </PixelButton>

        <PixelButton
          variant="navy"
          size="lg"
          onClick={() => setActiveModal('join')}
        >
          JOIN ROOM
        </PixelButton>
      </div>

      {/* The Centerpiece Handcrafted Pixel Arcade Scene */}
      <PixelArcadeScene />

      {/* Supporting Retro Text */}
      <div className="w-full max-w-md mt-4 pt-4 border-t border-paper/20 text-center">
        <div className="font-arcade text-[10px] sm:text-[11px] text-paper/70 space-y-1 tracking-widest">
          <p>MAKE A ROOM.</p>
          <p>CALL YOUR BRO.</p>
          <p>PLAY SOME GAMES.</p>
          <p>KEEP SCORE.</p>
          <p className="text-cartridgeYellow font-bold pt-1">FIND OUT WHO'S BETTER.</p>
        </div>
      </div>

      {/* ================= MODAL: CREATE ROOM ================= */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-paper text-ink border-4 border-ink p-6 shadow-pixel-lg relative animate-pixel-idle">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-ink pb-2 mb-4">
              <span className="font-pixel text-xs text-arcadeRed tracking-wider">CREATE ROOM</span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="font-pixel text-xs text-ink hover:text-arcadeRed"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
              <div>
                <label className="block font-arcade text-xs uppercase mb-1 text-ink">
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
                  className="w-full bg-[#FFF7DC] border-2 border-ink px-3 py-2 text-ink font-mono font-bold focus:outline-none focus:border-arcadeRed"
                />
              </div>

              <div>
                <label className="block font-arcade text-xs uppercase mb-2 text-ink">
                  HOW MANY ROUNDS?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 5].map((wins) => (
                    <button
                      key={wins}
                      type="button"
                      onClick={() => setTargetWins(wins)}
                      className={`py-2 px-2 border-2 border-ink font-pixel text-xs transition-all ${
                        targetWins === wins
                          ? 'bg-arcadeRed text-cream shadow-pixel-sm -translate-y-0.5'
                          : 'bg-[#FFF7DC] text-ink hover:bg-cream'
                      }`}
                    >
                      {wins === 1 ? '1 WIN' : `FIRST TO ${wins}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <PixelButton
                  type="submit"
                  variant="red"
                  size="md"
                  disabled={isLoading || !hostName.trim()}
                  className="w-full justify-center"
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
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-paper text-ink border-4 border-ink p-6 shadow-pixel-lg relative animate-pixel-idle">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-ink pb-2 mb-4">
              <span className="font-pixel text-xs text-crtCyan tracking-wider">JOIN ROOM</span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="font-pixel text-xs text-ink hover:text-arcadeRed"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4 text-left">
              <div>
                <label className="block font-arcade text-xs uppercase mb-1 text-ink">
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
                  className="w-full bg-[#FFF7DC] border-2 border-ink px-3 py-2 text-ink font-pixel tracking-widest text-center text-lg uppercase focus:outline-none focus:border-crtCyan"
                />
              </div>

              <div>
                <label className="block font-arcade text-xs uppercase mb-1 text-ink">
                  YOUR BRO NAME:
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="CONNOR"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-[#FFF7DC] border-2 border-ink px-3 py-2 text-ink font-mono font-bold focus:outline-none focus:border-crtCyan"
                />
              </div>

              <div className="pt-2">
                <PixelButton
                  type="submit"
                  variant="cyan"
                  size="md"
                  disabled={isLoading || !joinCode.trim() || !guestName.trim()}
                  className="w-full justify-center"
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
