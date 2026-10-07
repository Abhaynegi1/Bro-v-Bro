import React, { useState, useEffect, useCallback } from 'react';
import type { RoomState, WordleState, WordleMove, WordleLetterState } from '@bvb/shared';
import { isValidWord } from '@bvb/shared';
import confetti from 'canvas-confetti';
import { PixelCharacter } from '../pixel/PixelCharacter';
import { GamePixelIcon } from '../game-icons/GamePixelIcon';
import { soundFx } from '../../utils/audio';

interface WordleGameProps {
  roomState: RoomState;
  gameState: WordleState;
  myPlayerId: string;
  onSendMove: (move: WordleMove) => void;
  theme?: 'day' | 'night';
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

export const WordleGame: React.FC<WordleGameProps> = ({
  roomState,
  gameState,
  myPlayerId,
  onSendMove,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const [currentInput, setCurrentInput] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { playerA, playerB } = roomState.players;
  const myPlayer = playerA?.id === myPlayerId ? playerA : playerB;
  const opponentPlayer = playerA?.id === myPlayerId ? playerB : playerA;
  const opponentId = opponentPlayer?.id || '';

  const myState = gameState.playerStates[myPlayerId] || {
    guesses: [],
    isCompleted: false,
    hasWon: false,
  };

  const opponentState = opponentId ? gameState.playerStates[opponentId] : null;

  const isFinished = gameState.status === 'FINISHED';
  const iWon = isFinished && gameState.winnerPlayerId === myPlayerId;
  const iLost = isFinished && gameState.winnerPlayerId && gameState.winnerPlayerId !== myPlayerId;
  const isDraw = isFinished && !gameState.winnerPlayerId;
  const canType = !isFinished && !myState.isCompleted;

  const revealedWord = (
    gameState.targetWord ||
    (gameState.summary || '').match(/"([A-Za-z]{5})"/)?.[1] ||
    ''
  ).toUpperCase();

  // Trigger victory confetti
  useEffect(() => {
    if (iWon) {
      confetti({
        particleCount: 100,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#F59E0B', '#3B82F6', '#EF4444'],
      });
    }
  }, [iWon]);

  // Trigger shake animation with a toast message
  const triggerError = useCallback((msg: string) => {
    soundFx.play('buzzer');
    setIsShaking(true);
    setErrorMessage(msg);
    setTimeout(() => setIsShaking(false), 380);
    setTimeout(() => setErrorMessage(null), 1500);
  }, []);

  // Handle letter typing
  const handleKeyInput = useCallback(
    (char: string) => {
      if (!canType) return;

      if (char === 'BACK' || char === 'BACKSPACE') {
        soundFx.play('click');
        setCurrentInput((prev) => prev.slice(0, -1));
        return;
      }

      if (char === 'ENTER') {
        if (currentInput.length < 5) {
          triggerError('NEED 5 LETTERS');
          return;
        }

        const upperGuess = currentInput.toUpperCase();
        if (!isValidWord(upperGuess)) {
          triggerError('NOT IN WORD LIST');
          return;
        }

        soundFx.play('move');
        onSendMove({ action: 'GUESS', guess: upperGuess });
        setCurrentInput('');
        return;
      }

      if (/^[A-Z]$/.test(char) && currentInput.length < 5) {
        soundFx.play('click');
        setCurrentInput((prev) => prev + char);
      }
    },
    [canType, currentInput, onSendMove, triggerError]
  );

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeyInput('BACK');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleKeyInput('ENTER');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyInput(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput]);

  // Compute key statuses for the virtual keyboard
  const keyStatusMap = React.useMemo(() => {
    const map: Record<string, WordleLetterState> = {};
    for (const guess of myState.guesses) {
      const letters = guess.word.split('');
      guess.evaluation.forEach((evalState, idx) => {
        const letter = letters[idx];
        if (!letter || letter === '?') return;

        const currentBest = map[letter];
        if (evalState === 'CORRECT') {
          map[letter] = 'CORRECT';
        } else if (evalState === 'PRESENT' && currentBest !== 'CORRECT') {
          map[letter] = 'PRESENT';
        } else if (evalState === 'ABSENT' && !currentBest) {
          map[letter] = 'ABSENT';
        }
      });
    }
    return map;
  }, [myState.guesses]);

  // Get tile background & styling based on state
  const getTileStyle = (letterState?: WordleLetterState) => {
    switch (letterState) {
      case 'CORRECT':
        return 'bg-[#22C55E] text-white border-ink shadow-pixel-sm';
      case 'PRESENT':
        return 'bg-[#F59E0B] text-white border-ink shadow-pixel-sm';
      case 'ABSENT':
        return isNight
          ? 'bg-slate-700 text-slate-300 border-slate-900'
          : 'bg-stone-500 text-white border-ink shadow-pixel-sm';
      default:
        return isNight
          ? 'bg-[#18243A] text-paper border-slate-600'
          : 'bg-[#FFFDF5] text-ink border-ink';
    }
  };

  const getKeyStyle = (key: string) => {
    const status = keyStatusMap[key];
    if (status === 'CORRECT') {
      return 'bg-[#22C55E] text-white border-ink shadow-pixel-sm';
    }
    if (status === 'PRESENT') {
      return 'bg-[#F59E0B] text-white border-ink shadow-pixel-sm';
    }
    if (status === 'ABSENT') {
      return isNight ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-stone-400 text-stone-200 border-ink';
    }
    return isNight
      ? 'bg-[#1E293B] text-paper border-slate-600 hover:bg-slate-700'
      : 'bg-paper text-ink border-ink hover:bg-amber-100';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 w-full max-w-5xl mx-auto select-none h-full min-h-0">
      {/* Game Status Banner */}
      <div
        className={`w-full max-w-4xl p-2.5 sm:p-3 mb-2.5 border-4 border-ink shadow-pixel text-center transition-colors relative ${
          isNight ? 'bg-[#18243A] text-paper' : 'bg-paper text-ink'
        }`}
      >
        {/* Error / Shake Notification Pill */}
        {errorMessage && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-arcadeRed text-white font-arcade text-xs px-3 py-1 border-2 border-ink shadow-pixel animate-bounce z-20 font-bold tracking-wider">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-between px-3 mb-1">
          <span className={`font-arcade text-xs sm:text-sm font-bold flex items-center gap-2 ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
            <GamePixelIcon gameId="wordle" size={22} className="flex-shrink-0" />
            <span>WORDLE RACE 1v1</span>
          </span>
          <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs font-bold">
            <span className="px-2 py-0.5 border border-ink bg-ink text-white">
              YOU: {myState.guesses.length}/6
            </span>
            <span className="px-2 py-0.5 border border-ink/40 bg-darkNavy text-paper">
              {opponentPlayer?.name?.toUpperCase() || 'OPP'}: {opponentState?.guesses.length || 0}/6
            </span>
          </div>
        </div>

        {/* Dynamic Status Headline */}
        {iWon ? (
          <div>
            <h2 className="font-arcade text-base sm:text-xl text-[#22C55E] font-bold tracking-wide animate-pulse">
              🎉 CIPHER CRACKED! YOU WON THIS BATTLE!
            </h2>
            {revealedWord && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="font-mono text-xs font-bold text-stone-700 dark:text-stone-300">SECRET WORD WAS:</span>
                <span className="font-bold font-arcade text-sm sm:text-base tracking-widest px-3 py-0.5 bg-gameBoyGreen text-ink border-2 border-ink shadow-pixel uppercase">
                  {revealedWord}
                </span>
              </div>
            )}
          </div>
        ) : iLost ? (
          <div>
            <h2 className="font-arcade text-base sm:text-xl text-arcadeRed font-bold tracking-wide">
              💀 {opponentPlayer?.name?.toUpperCase() || 'OPPONENT'} CRACKED IT FIRST!
            </h2>
            {revealedWord && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="font-mono text-xs font-bold text-stone-700 dark:text-stone-300">SECRET WORD WAS:</span>
                <span className="font-bold font-arcade text-sm sm:text-base tracking-widest px-3 py-0.5 bg-gameBoyGreen text-ink border-2 border-ink shadow-pixel uppercase">
                  {revealedWord}
                </span>
              </div>
            )}
          </div>
        ) : isDraw ? (
          <div>
            <h2 className={`font-arcade text-base sm:text-xl font-bold tracking-wide ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
              🤝 NEITHER BRO CRACKED THE CIPHER!
            </h2>
            {revealedWord && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="font-mono text-xs font-bold text-stone-700 dark:text-stone-300">SECRET WORD WAS:</span>
                <span className="font-bold font-arcade text-sm sm:text-base tracking-widest px-3 py-0.5 bg-gameBoyGreen text-ink border-2 border-ink shadow-pixel uppercase">
                  {revealedWord}
                </span>
              </div>
            )}
          </div>
        ) : myState.isCompleted ? (
          <div>
            <h2 className={`font-arcade text-xs sm:text-sm font-bold ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
              OUT OF GUESSES! SPECTATING {opponentPlayer?.name?.toUpperCase() || 'OPPONENT'}...
            </h2>
            <p className="font-mono text-[11px] opacity-80 mt-0.5">
              Hoping they fail too so you escape with a draw!
            </p>
          </div>
        ) : (
          <div>
            <p className={`font-mono text-xs sm:text-sm font-bold ${isNight ? 'text-cartridgeYellow' : 'text-stone-800'}`}>
              Type 5 letters & press Enter. Both bros race for the same secret word!
            </p>
          </div>
        )}
      </div>

      {/* Duel Arena: Split Grids */}
      <div className="w-full max-w-4xl flex items-center justify-center gap-4 sm:gap-8 md:gap-12 mb-3">
        {/* PLAYER'S BOARD (Primary Focus) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1.5">
            <PixelCharacter type={myPlayer?.isHost ? 'bro1' : 'bro2'} size={24} />
            <span className={`font-arcade text-xs sm:text-sm font-bold tracking-wide ${isNight ? 'text-white' : 'text-ink'}`}>
              {myPlayer?.name || 'YOU'} (YOU)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-gameBoyGreen text-ink font-bold border border-ink">
              ACTIVE
            </span>
          </div>

          <div
            className={`flex flex-col gap-1.5 p-3 sm:p-4 border-4 border-ink shadow-pixel transition-transform ${
              isShaking ? 'animate-wordle-shake' : ''
            } ${isNight ? 'bg-[#18243A]' : 'bg-[#FBF6E9]'}`}
          >
            {Array.from({ length: 6 }).map((_, rowIndex) => {
              const guess = myState.guesses[rowIndex];
              const isCurrentRow = rowIndex === myState.guesses.length && canType;

              return (
                <div key={rowIndex} className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, colIndex) => {
                    let letter = '';
                    let tileState: WordleLetterState | undefined = undefined;
                    let isPop = false;

                    if (guess) {
                      letter = guess.word[colIndex] || '';
                      tileState = guess.evaluation[colIndex];
                    } else if (isCurrentRow) {
                      letter = currentInput[colIndex] || '';
                      isPop = Boolean(letter);
                    }

                    return (
                      <div
                        key={colIndex}
                        className={`w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 border-2 flex items-center justify-center font-arcade text-base sm:text-xl font-bold uppercase transition-all ${
                          isPop ? 'animate-wordle-pop' : ''
                        } ${getTileStyle(tileState)}`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER VS ENERGY COLUMN */}
        <div className="hidden sm:flex flex-col items-center justify-center opacity-80 px-1">
          <span className="text-xl animate-bounce">⚡</span>
          <span className="font-arcade text-arcadeRed text-base sm:text-lg font-bold my-2 tracking-wider">
            VS
          </span>
          <span className="text-xl animate-bounce">⚡</span>
        </div>

        {/* OPPONENT'S LIVE GHOST BOARD (Live progress spectator) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1.5">
            <PixelCharacter type={opponentPlayer?.isHost ? 'bro1' : 'bro2'} size={24} />
            <span className="font-arcade text-xs sm:text-sm font-bold tracking-wide opacity-80">
              {opponentPlayer?.name || 'OPPONENT'}
            </span>
            {opponentState?.hasWon ? (
              <span className="text-[10px] bg-[#22C55E] text-white px-1.5 py-0.2 font-arcade font-bold border border-ink">
                WINNER
              </span>
            ) : (
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-700 text-slate-200 border border-ink/40">
                RADAR
              </span>
            )}
          </div>

          <div
            className={`flex flex-col gap-1.5 p-3 sm:p-4 border-4 border-dashed border-ink/40 shadow-pixel-sm ${
              isNight ? 'bg-[#18243A]/70' : 'bg-[#EAE4D2]'
            }`}
          >
            {Array.from({ length: 6 }).map((_, rowIndex) => {
              const oppGuess = opponentState?.guesses[rowIndex];

              return (
                <div key={rowIndex} className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, colIndex) => {
                    let letter = '';
                    let tileState: WordleLetterState | undefined = undefined;

                    if (oppGuess) {
                      letter = isFinished ? oppGuess.word[colIndex] || '' : '?';
                      tileState = oppGuess.evaluation[colIndex];
                    }

                    return (
                      <div
                        key={colIndex}
                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 border-2 flex items-center justify-center font-arcade text-xs sm:text-sm font-bold uppercase transition-all ${getTileStyle(
                          tileState
                        )} ${!oppGuess ? 'opacity-35' : ''}`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <span className="font-mono text-[10px] text-stone-500 mt-1 font-bold">
            Live Spectator Radar
          </span>
        </div>
      </div>

      {/* On-Screen Pixel Keyboard */}
      <div className="w-full max-w-xl flex flex-col gap-1.5 px-2">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((key) => {
              const isActionKey = key === 'ENTER' || key === 'BACK';

              return (
                <button
                  key={key}
                  onClick={() => handleKeyInput(key)}
                  disabled={!canType}
                  className={`border-2 font-arcade font-bold text-xs sm:text-sm h-8 sm:h-9 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isActionKey ? 'px-2.5 sm:px-4 text-[10px] sm:text-xs' : 'flex-1 max-w-[42px]'
                  } ${getKeyStyle(key)}`}
                >
                  {key === 'BACK' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
