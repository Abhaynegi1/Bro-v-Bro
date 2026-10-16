import React, { useState, useEffect, useRef } from 'react';
import type { RoomState } from '@bvb/shared';
import { PixelCharacter } from './pixel/PixelCharacter';
import { useSound } from '../hooks/useSound';

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
  const { isMuted, toggleSound } = useSound();
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

  const [popScoreA, setPopScoreA] = useState(false);
  const [popScoreB, setPopScoreB] = useState(false);
  const prevScoreA = useRef(scoreA);
  const prevScoreB = useRef(scoreB);

  useEffect(() => {
    if (scoreA !== prevScoreA.current) {
      prevScoreA.current = scoreA;
      setPopScoreA(true);
      const timer = setTimeout(() => setPopScoreA(false), 700);
      return () => clearTimeout(timer);
    }
  }, [scoreA]);

  useEffect(() => {
    if (scoreB !== prevScoreB.current) {
      prevScoreB.current = scoreB;
      setPopScoreB(true);
      const timer = setTimeout(() => setPopScoreB(false), 700);
      return () => clearTimeout(timer);
    }
  }, [scoreB]);

  const isPlayerA = myPlayerId === playerA?.id;
  const isPlayerB = myPlayerId === playerB?.id;

  return (
    <header
      className={`w-full border-b-2 sm:border-b-4 border-ink px-2 sm:px-4 py-1.5 sm:py-2.5 transition-colors duration-500 shadow-md relative z-30 select-none ${
        isNight
          ? 'bg-[#18243A] text-paper'
          : 'bg-[#F4EBD0] text-ink'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Player A (Host) */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-shrink">
          <div className="relative hidden xs:block flex-shrink-0">
            <PixelCharacter
              type="bro1"
              pose="idle"
              size={28}
              className="drop-shadow-pixel sm:hidden"
            />
            <PixelCharacter
              type="bro1"
              pose="idle"
              size={36}
              className="drop-shadow-pixel hidden sm:block"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-arcade text-[10px] sm:text-xs text-cartridgeYellow">👑</span>
              <span className="font-arcade text-[10px] sm:text-xs tracking-wider truncate font-bold max-w-[65px] xs:max-w-[90px] sm:max-w-[140px]">
                {playerA?.name || 'P1'}
              </span>
              {isPlayerA && (
                <span className="text-[8px] sm:text-[9px] font-mono px-1 py-0.2 bg-arcadeRed text-white font-bold rounded">
                  YOU
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
              {Array.from({ length: targetWins }).map((_, i) => (
                <span
                  key={i}
                  className={`text-[10px] sm:text-xs ${
                    i < scoreA ? (isNight ? 'text-cartridgeYellow font-bold' : 'text-amber-700 font-bold') : isNight ? 'text-slate-600' : 'text-stone-400'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Live Arcade Scoreboard */}
        <div className="flex flex-col items-center flex-shrink-0 mx-1">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div
              className={`font-arcade text-base sm:text-2xl px-1.5 sm:px-2.5 py-0.5 border-2 border-ink shadow-pixel font-bold tracking-widest transition-all duration-300 ${
                popScoreA ? 'scale-125 bg-arcadeRed text-white ring-2 ring-cartridgeYellow' : isNight ? 'bg-ink text-cartridgeYellow' : 'bg-paper text-ink'
              }`}
            >
              {String(scoreA).padStart(2, '0')}
            </div>

            <div className="flex flex-col items-center px-0.5 sm:px-1">
              <span className="font-arcade text-[9px] sm:text-xs text-arcadeRed font-bold tracking-widest animate-pulse">
                VS
              </span>
              <span
                className={`font-mono text-[8px] sm:text-[9px] uppercase tracking-wider font-bold ${
                  isNight ? 'text-slate-300' : 'text-stone-600'
                }`}
              >
                RND {roundNum}
              </span>
            </div>

            <div
              className={`font-arcade text-base sm:text-2xl px-1.5 sm:px-2.5 py-0.5 border-2 border-ink shadow-pixel font-bold tracking-widest transition-all duration-300 ${
                popScoreB ? 'scale-125 bg-crtCyan text-white ring-2 ring-cartridgeYellow' : isNight ? 'bg-ink text-cartridgeYellow' : 'bg-paper text-ink'
              }`}
            >
              {String(scoreB).padStart(2, '0')}
            </div>
          </div>

          <div className="hidden xs:block mt-0.5 text-[8px] sm:text-[9px] font-mono tracking-widest uppercase font-bold opacity-80">
            FIRST TO {targetWins} PTS
          </div>
        </div>

        {/* Right: Player B (Guest) + Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 justify-end flex-shrink">
          <div className="min-w-0 text-right">
            <div className="flex items-center justify-end gap-1 sm:gap-1.5">
              {isPlayerB && (
                <span className="text-[8px] sm:text-[9px] font-mono px-1 py-0.2 bg-crtCyan text-darkNavy font-bold rounded">
                  YOU
                </span>
              )}
              <span className="font-arcade text-[10px] sm:text-xs tracking-wider truncate font-bold max-w-[65px] xs:max-w-[90px] sm:max-w-[140px]">
                {playerB?.name || 'P2'}
              </span>
            </div>
            <div className="flex items-center justify-end gap-0.5 sm:gap-1 mt-0.5">
              {Array.from({ length: targetWins }).map((_, i) => (
                <span
                  key={i}
                  className={`text-[10px] sm:text-xs transition-transform duration-300 ${
                    i < scoreB ? (isNight ? 'text-cartridgeYellow font-bold scale-110' : 'text-amber-700 font-bold scale-110') : isNight ? 'text-slate-600' : 'text-stone-400'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="relative hidden xs:block flex-shrink-0">
            <PixelCharacter
              type="bro2"
              pose="idle"
              size={28}
              className="drop-shadow-pixel sm:hidden"
            />
            <PixelCharacter
              type="bro2"
              pose="idle"
              size={36}
              className="drop-shadow-pixel hidden sm:block"
            />
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-1 sm:ml-2 border-l-2 border-ink pl-1.5 sm:pl-3 flex-shrink-0">
            <button
              onClick={toggleSound}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border-2 border-ink font-arcade text-[10px] sm:text-xs shadow-pixel hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform ${
                isNight ? 'bg-slate-700 text-white' : 'bg-amber-100 text-ink'
              }`}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            <button
              onClick={onToggleTheme}
              title={`Switch to ${isNight ? 'Day' : 'Night'} Mode`}
              className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border-2 border-ink font-arcade text-[10px] sm:text-xs shadow-pixel hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform ${
                isNight ? 'bg-slate-700 text-yellow-300' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isNight ? '🌙' : '☀️'}
            </button>

            <button
              onClick={onLeaveRoom}
              title="Leave Room"
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-arcadeRed text-white text-[9px] sm:text-[10px] font-arcade border-2 border-ink shadow-pixel hover:translate-x-[-1px] hover:translate-y-[-1px] hover:bg-red-600 transition-all font-bold"
            >
              EXIT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
