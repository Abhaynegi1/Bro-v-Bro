import React from 'react';

interface HeaderProps {
  roomCode?: string | null;
  isConnected?: boolean;
  onLeave?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ roomCode, isConnected, onLeave }) => {
  return (
    <header className="w-full border-b-2 border-paper/20 bg-ink px-4 py-3 select-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Typographic Pixel Logo */}
        <div
          onClick={onLeave}
          className="flex items-center gap-2 cursor-pointer group"
          title="Return to title screen"
        >
          <div className="w-6 h-6 bg-arcadeRed border border-paper flex items-center justify-center font-pixel text-[9px] text-cream shadow-pixel-sm group-hover:-translate-y-0.5 transition-transform">
            B
          </div>
          <div className="flex items-center gap-1.5 font-pixel text-xs sm:text-sm text-paper tracking-wider">
            <span>BRO</span>
            <span className="text-arcadeRed font-bold text-[10px]">v</span>
            <span>BRO</span>
          </div>
        </div>

        {/* Center / Right arcade stats */}
        <div className="flex items-center gap-3">
          {roomCode && (
            <div className="flex items-center gap-1.5 bg-[#151C30] border border-paper px-2.5 py-1 shadow-pixel-sm">
              <span className="font-arcade text-[9px] text-paper/70">ROOM:</span>
              <span className="font-pixel text-[11px] text-cartridgeYellow tracking-widest">{roomCode}</span>
            </div>
          )}

          {isConnected !== undefined && (
            <div className="flex items-center gap-1.5 border border-paper/40 bg-ink px-2 py-1 text-[9px] font-mono">
              <span
                className={`w-2 h-2 ${
                  isConnected ? 'bg-gameboyGreen animate-pulse' : 'bg-arcadeRed'
                }`}
                style={{ imageRendering: 'pixelated' }}
              />
              <span className="hidden sm:inline text-paper/80 font-arcade">
                {isConnected ? 'NET OK' : 'LINKING...'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
