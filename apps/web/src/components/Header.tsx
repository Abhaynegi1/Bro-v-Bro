import React from 'react';

interface HeaderProps {
  roomCode?: string | null;
  isConnected?: boolean;
  onLeave?: () => void;
  currentView?: 'landing' | 'how-to-play';
  onNavigateHowToPlay?: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  isConnected,
  onLeave,
  currentView = 'landing',
  onNavigateHowToPlay,
  onNavigateHome,
}) => {
  return (
    <header className="w-full bg-darkNavy text-paper border-b-2 border-ink px-4 py-2.5 select-none shadow-sm z-30 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand with 1:1 Pixel Icon */}
        <div
          onClick={onLeave || onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          title="Return to title screen"
        >
          <img
            src="/favicon.png"
            alt="BvB"
            className="w-8 h-8 object-contain drop-shadow-sm group-hover:-translate-y-0.5 transition-transform"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="flex items-center gap-1.5 font-pixel text-sm sm:text-base text-paper tracking-wider">
            <span>BRO</span>
            <span className="text-arcadeRed font-bold text-xs">[v]</span>
            <span>BRO</span>
          </div>
          <span className="hidden md:inline-block ml-2 px-1.5 py-0.5 bg-ink text-cartridgeYellow text-[9px] font-arcade tracking-widest border border-ink/40">
            1v1 GAUNTLET
          </span>
        </div>

        {/* Center / Right arcade stats & nav */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* How To Play Navigation Link (Only when outside active room) */}
          {!roomCode && (
            <button
              onClick={currentView === 'how-to-play' ? onNavigateHome : onNavigateHowToPlay}
              className="px-2.5 py-1 text-xs font-mono font-bold border-2 border-paper/30 hover:border-cartridgeYellow text-paper hover:text-cartridgeYellow bg-mutedNavy/60 hover:bg-mutedNavy transition-all flex items-center gap-1.5 shadow-pixel-sm active:translate-y-0.5"
            >
              <span className="text-arcadeRed font-pixel text-[10px]">
                {currentView === 'how-to-play' ? '◄' : '?'}
              </span>
              <span className="font-arcade text-[10px] sm:text-xs tracking-wider">
                {currentView === 'how-to-play' ? 'ARENA' : 'HOW TO PLAY'}
              </span>
            </button>
          )}

          {roomCode && (
            <div className="flex items-center gap-2 bg-[#11182A] border-2 border-ink px-3 py-1 shadow-pixel-sm">
              <span className="font-arcade text-[10px] text-paper/70 tracking-wider">ROOM:</span>
              <span className="font-pixel text-xs text-cartridgeYellow tracking-widest">{roomCode}</span>
            </div>
          )}

          {isConnected !== undefined && (
            <div className="flex items-center gap-2 bg-[#11182A] border-2 border-ink px-2.5 py-1 text-[10px] font-mono shadow-pixel-sm">
              <span
                className={`w-2 h-2 ${
                  isConnected ? 'bg-gameboyGreen animate-pulse' : 'bg-arcadeRed'
                }`}
                style={{ imageRendering: 'pixelated' }}
              />
              <span className="hidden sm:inline text-paper font-arcade tracking-wider">
                {isConnected ? 'ONLINE' : 'CONNECTING...'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

