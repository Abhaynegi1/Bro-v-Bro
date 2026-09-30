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
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-3xl mx-auto w-full text-center select-none">
      {/* Tiny decorative header marks */}
      <div className="flex items-center gap-2 mb-3 text-arcadeRed font-bold">
        <span>+</span>
        <span className="text-xs tracking-widest font-arcade uppercase text-ink">
          1V1 RETRO GAUNTLET
        </span>
        <span>+</span>
      </div>

      {/* Main Pixel Title (High Contrast Ink on Cream) */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-pixel text-ink tracking-wider mb-3">
        BRO <span className="text-arcadeRed font-black text-3xl sm:text-5xl">[v]</span> BRO
      </h1>

      {/* Tagline (Readable, bold, high contrast) */}
      <div className="space-y-1 mb-8 max-w-md mx-auto">
        <p className="font-mono text-sm sm:text-base font-bold text-ink tracking-wide uppercase">
          YOUR BRO THINKS HE'S BETTER.
        </p>
        <p className="font-arcade text-xs sm:text-sm text-arcadeRed font-bold tracking-widest uppercase">
          PROVE HIM WRONG.
        </p>
      </div>

      {/* Error alert banner if any */}
      {errorMessage && (
        <div className="w-full max-w-md mb-6 p-3.5 bg-[#FFF5F5] border-2 border-arcadeRed text-arcadeRed font-mono font-bold text-xs shadow-pixel text-left flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button
            onClick={() => window.location.reload()}
            className="underline text-[11px] font-arcade hover:text-ink ml-2"
          >
            RETRY
          </button>
        </div>
      )}

      {/* Primary Action Buttons (High contrast: Dark Navy vs Cream) */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-4 z-10">
        <PixelButton
          variant="navy"
          size="lg"
          onClick={() => setActiveModal('create')}
          className="min-w-[190px]"
        >
          CREATE ROOM
        </PixelButton>

        <PixelButton
          variant="cream"
          size="lg"
          onClick={() => setActiveModal('join')}
          className="min-w-[190px]"
        >
          JOIN ROOM
        </PixelButton>
      </div>

      {/* The Centerpiece Handcrafted Pixel Arcade Scene (Dark Navy inside Cream) */}
      <PixelArcadeScene />

      {/* Supporting Retro Text (70% Readable font, high contrast on cream) */}
      <div className="w-full max-w-md mt-4 pt-5 border-t-2 border-ink/20 text-center">
        <div className="font-mono text-xs sm:text-sm font-bold text-ink/80 space-y-1 tracking-wider uppercase">
          <p>MAKE A ROOM.</p>
          <p>CALL YOUR BRO.</p>
          <p>PLAY SOME GAMES.</p>
          <p>KEEP SCORE.</p>
          <p className="text-arcadeRed font-arcade text-xs pt-1 tracking-widest">
            FIND OUT WHO'S BETTER.
          </p>
        </div>
      </div>

      {/* ================= MODAL: CREATE ROOM ================= */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 bg-[#0A0F19]/65 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFDF5] text-ink border-3 border-ink p-6 sm:p-7 shadow-pixel-lg relative text-left">
            {/* Modal Header */}
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
        <div className="fixed inset-0 bg-[#0A0F19]/65 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFDF5] text-ink border-3 border-ink p-6 sm:p-7 shadow-pixel-lg relative text-left">
            {/* Modal Header */}
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
