import React from 'react';
import { useSound } from '../hooks/useSound';

interface HeaderProps {
  roomCode?: string | null;
  isConnected?: boolean;
  onLeave?: () => void;
  currentView?: 'landing' | 'how-to-play';
  onNavigateHowToPlay?: () => void;
  onNavigateHome?: () => void;
  theme?: 'day' | 'night';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  isConnected,
  onLeave,
  onNavigateHowToPlay,
  onNavigateHome,
  theme = 'day',
  onToggleTheme,
}) => {
  const isNight = theme === 'night';
  const { isMuted, toggleSound } = useSound();

  return (
    <header className="w-full bg-[#0A0F1D] text-white px-5 sm:px-10 py-3 flex items-center justify-between border-b-2 border-black z-30 flex-shrink-0 sticky top-0 shadow-md select-none">
      {/* Left: Pixel Logo (Returns to Arena / Exit on click) */}
      <div
        onClick={onLeave || onNavigateHome}
        className="flex items-center gap-1.5 font-pixel text-sm sm:text-base tracking-wider cursor-pointer group select-none"
        title="Leave Room & Return to Arena"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">BRO</span>
        <span className="text-arcadeRed font-bold text-xs sm:text-sm">[v]</span>
        <span className="group-hover:translate-x-0.5 transition-transform">BRO</span>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Room Code Badge */}
        {roomCode && (
          <div className="flex items-center gap-2 bg-[#121B35] border-2 border-white/30 px-3 py-1 text-xs shadow-pixel-sm">
            <span className="font-arcade text-[10px] text-white/70 tracking-wider">ROOM:</span>
            <span className="font-pixel text-xs text-cartridgeYellow tracking-widest font-bold">{roomCode}</span>
          </div>
        )}

        {/* Online status indicator */}
        {isConnected !== undefined && (
          <div className="hidden sm:flex items-center gap-2 bg-[#121B35] border-2 border-white/30 px-2.5 py-1 text-[10px] font-arcade shadow-pixel-sm">
            <span
              className={`w-2 h-2 ${
                isConnected ? 'bg-gameboyGreen animate-pulse' : 'bg-arcadeRed'
              }`}
            />
            <span className="text-white/90 tracking-wider font-bold">
              {isConnected ? 'ONLINE' : 'CONNECTING...'}
            </span>
          </div>
        )}

        {/* How To Play Navigation Link (hidden while in a room) */}
        {!roomCode && onNavigateHowToPlay && (
          <button
            type="button"
            onClick={onNavigateHowToPlay}
            className="hidden md:inline-block font-pixel text-xs sm:text-sm text-white/90 hover:text-white uppercase tracking-wider hover:underline transition-all"
          >
            HOW TO PLAY
          </button>
        )}

        {/* Sound FX Mute Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? 'Unmute Arcade Sound FX' : 'Mute Arcade Sound FX'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="flex items-center justify-center w-8 h-8 bg-[#121B35] hover:bg-[#1C2A52] text-white border-2 border-white/30 text-xs shadow-pixel-sm hover:scale-105 active:scale-95 transition-transform"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* Night / Day Toggle Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="bg-white hover:bg-cream text-black font-pixel text-xs sm:text-sm px-4 py-1.5 border-2 border-white rounded shadow-sm hover:scale-105 active:scale-95 transition-transform uppercase tracking-wider font-bold"
          >
            {isNight ? 'DAY' : 'NIGHT'}
          </button>
        )}
      </div>
    </header>
  );
};

