import React, { useEffect, useState } from 'react';
import type { RoomState, FlagDuelState, FlagDuelMove } from '@bvb/shared';
import confetti from 'canvas-confetti';
import { PixelCharacter } from '../pixel/PixelCharacter';
import { GamePixelIcon } from '../game-icons/GamePixelIcon';
import { soundFx } from '../../utils/audio';

interface FlagDuelGameProps {
  roomState: RoomState;
  gameState: FlagDuelState;
  myPlayerId: string;
  onSendMove: (move: FlagDuelMove) => void;
  theme?: 'day' | 'night';
}

export const FlagDuelGame: React.FC<FlagDuelGameProps> = ({
  roomState,
  gameState,
  myPlayerId,
  onSendMove,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const playerA = roomState.players.playerA;
  const playerB = roomState.players.playerB;

  const isPlayerA = myPlayerId === playerA?.id;
  const myState = gameState.playerStates[myPlayerId] || {
    lives: 3,
    score: 0,
    lastSelected: null,
    lastAnswerCorrect: null,
    isEliminated: false,
  };

  const opponentId = gameState.playerIds.find((id) => id !== myPlayerId) || '';
  const opponent = isPlayerA ? playerB : playerA;
  const opponentState = gameState.playerStates[opponentId] || {
    lives: 3,
    score: 0,
    lastSelected: null,
    lastAnswerCorrect: null,
    isEliminated: false,
  };

  const [hasImageError, setHasImageError] = useState(false);
  const [feedbackEffect, setFeedbackEffect] = useState<'correct' | 'wrong' | null>(null);

  const iWon = gameState.status === 'FINISHED' && gameState.winnerPlayerId === myPlayerId;

  // Victory Confetti
  useEffect(() => {
    if (iWon) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EF4444', '#10B981', '#F59E0B', '#3B82F6'],
      });
    }
  }, [iWon]);

  // Trigger brief feedback flash when answer changes
  useEffect(() => {
    if (myState.lastAnswerCorrect === true) {
      soundFx.play('move');
      setFeedbackEffect('correct');
      const timer = setTimeout(() => setFeedbackEffect(null), 1200);
      return () => clearTimeout(timer);
    } else if (myState.lastAnswerCorrect === false) {
      soundFx.play('buzzer');
      setFeedbackEffect('wrong');
      const timer = setTimeout(() => setFeedbackEffect(null), 1200);
      return () => clearTimeout(timer);
    } else {
      setFeedbackEffect(null);
    }
  }, [myState.lastSelected, myState.lastAnswerCorrect, gameState.currentQuestionIndex]);

  // Keyboard shortcut listener: numbers 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status === 'FINISHED' || myState.isEliminated || myState.lastSelected !== null) {
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= gameState.currentFlag.options.length) {
        const selected = gameState.currentFlag.options[num - 1];
        if (selected) {
          handleSelect(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.currentFlag.options, gameState.status, myState.lastSelected, myState.isEliminated]);

  const handleSelect = (country: string) => {
    if (gameState.status === 'FINISHED' || myState.isEliminated || myState.lastSelected !== null) {
      return;
    }
    soundFx.play('click');
    onSendMove({
      action: 'GUESS',
      country,
    });
  };

  const hasAnsweredCurrent = myState.lastSelected !== null;
  const opponentHasAnswered = opponentState.lastSelected !== null;
  const flagCode = gameState.currentFlag.countryCode.toLowerCase();
  const flagUrl = `https://flagcdn.com/w320/${flagCode}.png`;

  return (
    <div className="w-full h-full flex flex-col justify-between items-center p-2 sm:p-4 select-none relative z-10 max-w-4xl mx-auto">
      {/* ================= TOP SCORE & LIVES HUD ================= */}
      <div
        className={`w-full p-1.5 xs:p-2.5 sm:p-3.5 border-2 sm:border-4 border-ink shadow-pixel flex items-center justify-between transition-colors ${
          isNight ? 'bg-[#18243A] text-paper' : 'bg-paper text-ink'
        }`}
      >
        {/* Player 1 (Left) */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <PixelCharacter
            type={playerA?.avatar || 'bro1'}
            pose={myState.isEliminated ? 'defeated' : myState.score >= 3 ? 'celebrating' : 'idle'}
            size={28}
            className="drop-shadow-pixel hidden xs:block flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] xs:text-xs font-arcade font-bold">
              <span className="text-arcadeRed font-bold">1P</span>
              <span className="truncate max-w-[55px] xs:max-w-[80px] sm:max-w-[110px]">{playerA?.name || '1P'}</span>
              {playerA?.id === myPlayerId && (
                <span className="text-[8px] bg-arcadeRed text-white px-1 font-mono rounded">YOU</span>
              )}
            </div>

            {/* Lives and Stars */}
            <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
              {/* Hearts */}
              <div className="flex items-center gap-0.5 text-[10px] sm:text-xs">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={`transition-transform duration-200 ${
                      i < (gameState.playerStates[playerA?.id || '']?.lives ?? 3)
                        ? 'text-arcadeRed scale-110'
                        : 'text-slate-500 opacity-30 grayscale'
                    }`}
                  >
                    ♥
                  </span>
                ))}
              </div>

              {/* Score Stars */}
              <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-arcade font-bold">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < (gameState.playerStates[playerA?.id || '']?.score ?? 0)
                        ? isNight ? 'text-cartridgeYellow' : 'text-amber-700'
                        : 'text-slate-600 opacity-40'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Arena Banner */}
        <div className="flex flex-col items-center text-center px-1 sm:px-2">
          <span className="px-1.5 sm:px-2.5 py-0.5 bg-ink text-cartridgeYellow font-arcade text-[9px] sm:text-xs tracking-wider border border-ink font-bold shadow-pixel-sm uppercase flex items-center gap-1 sm:gap-1.5">
            <GamePixelIcon gameId="flag-duel" size={16} className="flex-shrink-0" />
            <span>FLAG DUEL</span>
          </span>
          <span className={`text-[8px] xs:text-[10px] font-mono mt-0.5 sm:mt-1 font-bold ${isNight ? 'text-slate-300' : 'text-stone-700'}`}>
            ROUND #{gameState.currentQuestionIndex}
          </span>
        </div>

        {/* Player 2 (Right) */}
        <div className="flex items-center gap-1.5 sm:gap-3 justify-end text-right min-w-0">
          <div className="min-w-0">
            <div className="flex items-center justify-end gap-1 text-[10px] xs:text-xs font-arcade font-bold">
              {playerB?.id === myPlayerId && (
                <span className="text-[8px] bg-crtCyan text-ink px-1 font-mono rounded font-bold">YOU</span>
              )}
              <span className="truncate max-w-[55px] xs:max-w-[80px] sm:max-w-[110px]">{playerB?.name || '2P'}</span>
              <span className="text-crtCyan font-bold">2P</span>
            </div>

            {/* Lives and Stars */}
            <div className="flex items-center justify-end gap-1.5 mt-0.5 sm:mt-1">
              {/* Score Stars */}
              <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-arcade font-bold">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < (gameState.playerStates[playerB?.id || '']?.score ?? 0)
                        ? isNight ? 'text-cartridgeYellow' : 'text-amber-700'
                        : 'text-slate-600 opacity-40'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Hearts */}
              <div className="flex items-center gap-0.5 text-[10px] sm:text-xs">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={`transition-transform duration-200 ${
                      i < (gameState.playerStates[playerB?.id || '']?.lives ?? 3)
                        ? 'text-crtCyan scale-110'
                        : 'text-slate-500 opacity-30 grayscale'
                    }`}
                  >
                    ♥
                  </span>
                ))}
              </div>
            </div>
          </div>

          <PixelCharacter
            type={playerB?.avatar || 'bro2'}
            pose={opponentState.isEliminated ? 'defeated' : opponentState.score >= 3 ? 'celebrating' : 'idle'}
            size={28}
            className="drop-shadow-pixel hidden xs:block flex-shrink-0"
          />
        </div>
      </div>

      {/* ================= CENTER ARENA: FLAG DISPLAY ================= */}
      <div className="flex-1 flex flex-col items-center justify-center my-1.5 sm:my-3 w-full max-w-lg min-h-0">
        <div
          className={`w-full p-2.5 xs:p-3 sm:p-5 border-2 sm:border-4 border-ink shadow-pixel-lg relative flex flex-col items-center transition-all ${
            feedbackEffect === 'correct'
              ? 'bg-emerald-50 border-gameBoyGreen ring-2 sm:ring-4 ring-gameBoyGreen/50'
              : feedbackEffect === 'wrong'
              ? 'bg-red-50 border-arcadeRed ring-2 sm:ring-4 ring-arcadeRed/50 animate-shake'
              : isNight
              ? 'bg-[#18243A]'
              : 'bg-[#FFFDF5]'
          }`}
        >
          {/* CRT Screen Flag Container */}
          <div className="relative w-40 h-24 xs:w-48 xs:h-32 sm:w-60 sm:h-40 bg-slate-900 border-2 sm:border-4 border-ink shadow-pixel flex items-center justify-center overflow-hidden">
            {!hasImageError ? (
              <img
                src={flagUrl}
                alt="National Flag to guess"
                onError={() => setHasImageError(true)}
                className="w-full h-full object-cover select-none"
              />
            ) : (
              <div className="text-center p-2 sm:p-3 font-arcade text-xs text-cartridgeYellow">
                <span className="text-2xl sm:text-3xl block mb-1">🚩</span>
                <span>FLAG [{flagCode.toUpperCase()}]</span>
              </div>
            )}

            {/* Subtle retro CRT scanlines overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
              }}
            />
          </div>

          {/* Feedback & Status Alert Banner */}
          <div className="mt-2 sm:mt-3 text-center min-h-[26px] sm:min-h-[32px] flex items-center justify-center">
            {myState.isEliminated ? (
              <span className="font-arcade text-[10px] sm:text-xs text-arcadeRed font-bold animate-pulse">
                💀 ELIMINATED! OUT OF LIVES
              </span>
            ) : myState.lastAnswerCorrect === true ? (
              <span className="font-arcade text-[10px] sm:text-xs text-gameBoyGreen font-bold flex items-center gap-1 sm:gap-1.5 animate-bounce">
                <span>⭐</span> CORRECT! +1 POINT! NEXT...
              </span>
            ) : myState.lastAnswerCorrect === false ? (
              <span className="font-arcade text-[10px] sm:text-xs text-arcadeRed font-bold flex items-center gap-1 sm:gap-1.5">
                <span>❌</span> WRONG GUESS! -1 LIFE!
              </span>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-arcade text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300">
                  WHICH COUNTRY?
                </span>
                {opponentHasAnswered && (
                  <span className="text-[8px] sm:text-[9px] font-mono px-1 sm:px-1.5 py-0.5 bg-darkNavy text-crtCyan rounded border border-crtCyan font-bold animate-pulse">
                    OPPONENT ANSWERED!
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= 4 MULTIPLE CHOICE OPTIONS GRID ================= */}
      <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3">
        {gameState.currentFlag.options.map((country, idx) => {
          const isSelectedByMe = myState.lastSelected === country;
          const isSelectedByOpponent = opponentState.lastSelected === country;
          const isCorrectAnswer =
            gameState.status === 'FINISHED' || myState.lastAnswerCorrect !== null
              ? gameState.targetCountryName === country
              : false;

          let btnColor = isNight
            ? 'bg-[#1E293B] text-paper border-ink hover:bg-slate-700'
            : 'bg-[#FFFDF5] text-ink border-ink hover:bg-amber-50';

          if (isSelectedByMe) {
            if (myState.lastAnswerCorrect === true) {
              btnColor = 'bg-gameBoyGreen text-ink border-ink font-bold';
            } else if (myState.lastAnswerCorrect === false) {
              btnColor = 'bg-arcadeRed text-white border-ink font-bold';
            } else {
              btnColor = 'bg-cartridgeYellow text-ink border-ink font-bold';
            }
          } else if (isCorrectAnswer) {
            btnColor = 'bg-emerald-100 border-gameBoyGreen text-emerald-800 font-bold';
          }

          return (
            <button
              key={country}
              disabled={hasAnsweredCurrent || myState.isEliminated || gameState.status === 'FINISHED'}
              onClick={() => handleSelect(country)}
              className={`p-2 xs:p-2.5 sm:p-3.5 border-2 sm:border-4 shadow-pixel font-arcade text-[11px] sm:text-sm tracking-wide text-left flex items-center justify-between transition-all duration-150 relative ${btnColor} ${
                hasAnsweredCurrent || myState.isEliminated || gameState.status === 'FINISHED'
                  ? 'cursor-not-allowed opacity-85'
                  : 'hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-pixel-lg active:translate-y-0 active:shadow-pixel active:bg-amber-100 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center bg-ink text-cartridgeYellow font-arcade text-[9px] sm:text-[10px] font-bold rounded shadow-pixel-sm flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate font-bold">{country}</span>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isSelectedByMe && (
                  <span className="text-[10px] font-bold">
                    {myState.lastAnswerCorrect ? '✓' : '✗'}
                  </span>
                )}
                {isSelectedByOpponent && !isSelectedByMe && (
                  <span className="text-[8px] px-1 py-0.5 bg-darkNavy text-crtCyan border border-ink font-mono font-bold">
                    2P
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="hidden sm:block mt-2 text-center text-[10px] font-mono opacity-70">
        Tip: Press numbers <kbd className="px-1 py-0.5 bg-ink text-white font-bold rounded">1</kbd> -{' '}
        <kbd className="px-1 py-0.5 bg-ink text-white font-bold rounded">4</kbd> on keyboard for quick answers
      </div>
    </div>
  );
};
