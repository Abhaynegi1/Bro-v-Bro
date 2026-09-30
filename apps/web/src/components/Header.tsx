import React from 'react';

interface HeaderProps {
  roomCode?: string | null;
  isConnected?: boolean;
  onLeave?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ roomCode, isConnected, onLeave }) => {
  return (
    <header className="w-full bg-darkNavy text-paper border-b-2 border-ink px-4 py-2.5 select-none shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand with 1:1 Pixel Icon */}
        <div
          onClick={onLeave}
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
        </div>

        {/* Center / Right arcade stats */}
        <div className="flex items-center gap-3">
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
