import React from 'react';
import type { RoomState } from '@bvb/shared';
import { PixelCharacter } from './pixel/PixelCharacter';

interface UniversalMatchHeaderProps {
  roomState: RoomState;
  myPlayerId: string;
  onLeaveRoom: () => void;
  theme: 'day' | 'night';
  onToggleTheme: () => void;
}

export const UniversalMatchHeader: React.FC<UniversalMatchHeaderProps> = ({
  roomState,
  myPlayerId,
  onLeaveRoom,
  theme,
  onToggleTheme,
}) => {
  const isNight = theme === 'night';
  const match = roomState.currentMatch;
  const playerA = roomState.players.playerA;
  const playerB = roomState.players.playerB;

  const targetWins =
    match?.seriesCondition.type === 'FIRST_TO_N'
      ? match.seriesCondition.targetPoints
      : 3;

  const scoreA = match?.scores.playerA ?? 0;
  const scoreB = match?.scores.playerB ?? 0;
  const roundNum = match?.currentRoundNumber ?? 1;

  const isPlayerA = myPlayerId === playerA?.id;
  const isPlayerB = myPlayerId === playerB?.id;

  return (
    <header
      className={`w-full border-b-4 border-ink px-4 py-2.5 transition-colors duration-500 shadow-md relative z-30 select-none ${
        isNight
          ? 'bg-[#18243A] text-paper'
          : 'bg-[#F4EBD0] text-ink'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Player A (Host) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <PixelCharacter
              type="bro1"
              pose="idle"
              size={36}
              className="drop-shadow-pixel"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-arcade text-xs text-cartridgeYellow">👑</span>
              <span className="font-arcade text-xs tracking-wider truncate font-bold">
                {playerA?.name || 'PLAYER 1'}
              </span>
              {isPlayerA && (
                <span className="text-[9px] font-mono px-1 py-0.5 bg-arcadeRed text-white font-bold rounded">
                  YOU
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: targetWins }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${
                    i < scoreA ? 'text-cartridgeYellow' : isNight ? 'text-slate-600' : 'text-stone-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Live Arcade Scoreboard */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <div
              className={`font-arcade text-lg sm:text-2xl px-2.5 py-0.5 border-2 border-ink shadow-pixel font-bold tracking-widest ${
                isNight ? 'bg-ink text-cartridgeYellow' : 'bg-paper text-ink'
              }`}
            >
              {String(scoreA).padStart(2, '0')}
            </div>

            <div className="flex flex-col items-center px-1">
              <span className="font-arcade text-[10px] sm:text-xs text-arcadeRed font-bold tracking-widest animate-pulse">
                VS
              </span>
              <span
                className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
                  isNight ? 'text-slate-300' : 'text-stone-600'
                }`}
              >
                RND {roundNum}
              </span>
            </div>

            <div
              className={`font-arcade text-lg sm:text-2xl px-2.5 py-0.5 border-2 border-ink shadow-pixel font-bold tracking-widest ${
                isNight ? 'bg-ink text-cartridgeYellow' : 'bg-paper text-ink'
              }`}
            >
              {String(scoreB).padStart(2, '0')}
            </div>
          </div>

          <div className="mt-1 text-[9px] font-mono tracking-widest uppercase font-bold opacity-80">
            FIRST TO {targetWins} PTS
          </div>
        </div>

        {/* Right: Player B (Guest) + Controls */}
        <div className="flex items-center gap-4 min-w-0 justify-end">
          <div className="min-w-0 text-right">
            <div className="flex items-center justify-end gap-1.5">
              {isPlayerB && (
                <span className="text-[9px] font-mono px-1 py-0.5 bg-arcadeBlue text-white font-bold rounded">
                  YOU
                </span>
              )}
              <span className="font-arcade text-xs tracking-wider truncate font-bold">
                {playerB?.name || 'PLAYER 2'}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {Array.from({ length: targetWins }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${
                    i < scoreB ? 'text-cartridgeYellow' : isNight ? 'text-slate-600' : 'text-stone-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <PixelCharacter
              type="bro2"
              pose="idle"
              size={36}
              className="drop-shadow-pixel"
            />
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-1.5 ml-2 border-l-2 border-ink pl-3">
            <button
              onClick={onToggleTheme}
              title={`Switch to ${isNight ? 'Day' : 'Night'} Mode`}
              className={`w-7 h-7 flex items-center justify-center border-2 border-ink font-arcade text-xs shadow-pixel hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform ${
                isNight ? 'bg-slate-700 text-yellow-300' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isNight ? '🌙' : '☀️'}
            </button>

            <button
              onClick={onLeaveRoom}
              title="Leave Room"
              className="px-2 py-1 bg-arcadeRed text-white text-[10px] font-arcade border-2 border-ink shadow-pixel hover:translate-x-[-1px] hover:translate-y-[-1px] hover:bg-red-600 transition-all font-bold"
            >
              EXIT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
