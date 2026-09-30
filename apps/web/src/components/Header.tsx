import React from 'react';
import { Wifi, WifiOff, Swords } from 'lucide-react';

interface HeaderProps {
  roomCode?: string | null;
  isConnected?: boolean;
  onLeave?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ roomCode, isConnected, onLeave }) => {
  return (
    <header className="w-full border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={onLeave}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-blue-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-black text-xl tracking-tight text-white">
              BRO <span className="text-rose-500 font-extrabold italic text-sm px-1">v</span> BRO
            </span>
          </div>
        </div>

        {/* Right side status / info */}
        <div className="flex items-center gap-3">
          {roomCode && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Room:</span>
              <span className="font-mono font-bold text-sm text-cyan-400 tracking-widest">{roomCode}</span>
            </div>
          )}

          {isConnected !== undefined && (
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-medium">
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 hidden sm:inline">Connected</span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 sm:hidden" />
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-rose-400 hidden sm:inline">Connecting...</span>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400 sm:hidden" />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
