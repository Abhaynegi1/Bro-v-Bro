import React from 'react';
import type { RoomState } from '@bvb/shared';
import { PixelCharacter } from './pixel/PixelCharacter';

interface GameSelectionViewProps {
  roomState: RoomState;
  myPlayerId: string;
  onSelectGame: (gameId: string) => void;
  theme?: 'day' | 'night';
}

interface GameCard {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  icon: string;
  isAvailable: boolean;
  accentColor: string;
}

const GAMES_CATALOG: GameCard[] = [
  {
    id: 'tic-tac-toe',
    title: 'TIC TAC TOE',
    category: 'TACTICAL GRID',
    description: '3-in-a-row classic territorial combat. Fast, simple, and unforgiving.',
    duration: '~1 MIN',
    icon: '❌⭕',
    isAvailable: true,
    accentColor: 'border-arcadeRed text-arcadeRed',
  },
  {
    id: 'reaction-test',
    title: 'REFLEX DUEL',
    category: 'QUICKDRAW REFLEX',
    description: 'Wait for the signal to turn GREEN and strike! False start equals instant defeat.',
    duration: '~15 SEC',
    icon: '⚡🎯',
    isAvailable: true,
    accentColor: 'border-gameBoyGreen text-gameBoyGreen',
  },
  {
    id: 'connect-four',
    title: 'CONNECT FOUR',
    category: 'GRAVITY PUZZLE',
    description: 'Drop colored tokens into a 7x6 vertical grid to align four in a row.',
    duration: '~2 MIN',
    icon: '🔴🟡',
    isAvailable: false,
    accentColor: 'border-crtCyan text-crtCyan',
  },
  {
    id: 'wordle',
    title: 'WORDLE RACE',
    category: 'SECRET CIPHER',
    description: 'Guess the hidden 5-letter word first using server-sanitized clues.',
    duration: '~2 MIN',
    icon: '🟩🟨',
    isAvailable: false,
    accentColor: 'border-cartridgeYellow text-cartridgeYellow',
  },
  {
    id: 'minesweeper',
    title: 'MINEFIELD BATTLE',
    category: 'HAZARD RACE',
    description: 'Sweep the shared minefield or race to clear safe tiles without detonating.',
    duration: '~3 MIN',
    icon: '💣🚩',
    isAvailable: false,
    accentColor: 'border-pixelPink text-pixelPink',
  },
  {
    id: 'chess',
    title: 'BULLET CHESS',
    category: 'GRANDMASTER SHOWDOWN',
    description: 'Fast-paced 1v1 blitz chess with server-authoritative move verification.',
    duration: '~3 MIN',
    icon: '♟️👑',
    isAvailable: false,
    accentColor: 'border-purple-400 text-purple-400',
  },
];

export const GameSelectionView: React.FC<GameSelectionViewProps> = ({
  roomState,
  myPlayerId,
  onSelectGame,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const selectingPlayerId = roomState.selectingPlayerId;
  const isMyTurn = selectingPlayerId === myPlayerId;

  const playerA = roomState.players.playerA;
  const playerB = roomState.players.playerB;
  const pickerSlot = playerA?.id === selectingPlayerId ? playerA : playerB;
  const pickerName = pickerSlot?.name || 'OPPONENT';

  const roundNum = roomState.currentMatch?.currentRoundNumber ?? 1;
  const isRoundOne = roundNum === 1;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-5xl mx-auto">
      {/* Top Banner & Status */}
      <div
        className={`w-full max-w-3xl p-5 mb-6 border-4 border-ink shadow-pixel text-center transition-colors ${
          isNight ? 'bg-[#18243A] text-paper' : 'bg-paper text-ink'
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="font-arcade text-xs text-cartridgeYellow">★ ROUND {roundNum} BATTLE SELECTION ★</span>
        </div>

        {isMyTurn ? (
          <div>
            <h2 className="font-arcade text-lg sm:text-2xl text-arcadeRed tracking-wider font-bold animate-pulse">
              CHOOSE YOUR WEAPON, {pickerName.toUpperCase()}!
            </h2>
            <p className={`font-mono text-xs sm:text-sm mt-1.5 ${isNight ? 'text-slate-300' : 'text-stone-700'}`}>
              {isRoundOne
                ? '👑 As the Host, you choose the opening battle for Round 1!'
                : "🔥 Loser's Revenge! You have tactical advantage to pick the next battle."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-cartridgeYellow animate-ping rounded-full" />
              <h2 className="font-arcade text-base sm:text-xl text-cartridgeYellow tracking-wider font-bold">
                WAITING FOR {pickerName.toUpperCase()} TO PICK...
              </h2>
            </div>
            <p className={`font-mono text-xs sm:text-sm mt-1.5 ${isNight ? 'text-slate-300' : 'text-stone-700'}`}>
              {isRoundOne
                ? 'Host is currently choosing the opening game...'
                : `${pickerName} earned the right to pick the next battle. Stand by!`}
            </p>
          </div>
        )}
      </div>

      {/* Game Selection Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {GAMES_CATALOG.map((game) => {
          const canPick = isMyTurn && game.isAvailable;

          return (
            <div
              key={game.id}
              className={`flex flex-col justify-between p-5 border-4 border-ink shadow-pixel transition-all duration-200 relative ${
                game.isAvailable
                  ? isNight
                    ? 'bg-[#1E293B] text-paper hover:translate-x-[-2px] hover:translate-y-[-2px]'
                    : 'bg-[#FFFDF5] text-ink hover:translate-x-[-2px] hover:translate-y-[-2px]'
                  : isNight
                  ? 'bg-slate-900/60 text-slate-500 opacity-60 border-slate-700'
                  : 'bg-stone-200/70 text-stone-500 opacity-70 border-stone-400'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{game.icon}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 border font-bold uppercase ${
                    game.isAvailable
                      ? isNight
                        ? 'bg-ink text-cartridgeYellow border-cartridgeYellow'
                        : 'bg-paper text-ink border-ink'
                      : 'bg-stone-400 text-white border-transparent'
                  }`}
                >
                  {game.duration}
                </span>
              </div>

              {/* Title & Category */}
              <div className="mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cartridgeYellow font-bold block mb-0.5">
                  {game.category}
                </span>
                <h3 className="font-arcade text-sm sm:text-base font-bold tracking-wide">
                  {game.title}
                </h3>
                <p className="font-mono text-xs mt-2 leading-relaxed opacity-90">
                  {game.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-auto pt-3 border-t-2 border-dashed border-ink/20">
                {game.isAvailable ? (
                  canPick ? (
                    <button
                      onClick={() => onSelectGame(game.id)}
                      className="w-full py-2.5 px-4 bg-arcadeRed text-white font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel hover:bg-red-600 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold flex items-center justify-center gap-1.5"
                    >
                      <span>▶</span>
                      <span>SELECT THIS BATTLE</span>
                    </button>
                  ) : (
                    <div
                      className={`w-full py-2 text-center font-arcade text-[10px] tracking-wider border-2 border-dashed border-ink/30 ${
                        isNight ? 'bg-slate-800 text-slate-400' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {isMyTurn ? 'AVAILABLE' : 'WAITING FOR PICKER...'}
                    </div>
                  )
                ) : (
                  <div className="w-full py-2 text-center font-arcade text-[10px] tracking-wider bg-stone-300 text-stone-600 border border-stone-400 font-bold">
                    🔒 COMING IN PHASE 4
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
