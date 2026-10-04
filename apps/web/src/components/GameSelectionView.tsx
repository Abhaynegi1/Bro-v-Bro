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
    isAvailable: true,
    accentColor: 'border-crtCyan text-crtCyan',
  },
  {
    id: 'wordle',
    title: 'WORDLE RACE',
    category: 'SECRET CIPHER',
    description: 'Guess the hidden 5-letter word first using server-sanitized clues.',
    duration: '~2 MIN',
    icon: '🟩🟨',
    isAvailable: true,
    accentColor: 'border-cartridgeYellow text-cartridgeYellow',
  },
  {
    id: 'minesweeper',
    title: 'MINEFIELD BATTLE',
    category: 'HAZARD RACE',
    description: 'Race to clear identical 9x9 minefields without detonating. First click guaranteed safe!',
    duration: '~2 MIN',
    icon: '💣🚩',
    isAvailable: true,
    accentColor: 'border-pixelPink text-pixelPink',
  },
  {
    id: 'chess',
    title: 'SPEED CHESS',
    category: 'GRANDMASTER SHOWDOWN',
    description: 'Fast-paced 1v1 blitz chess with server-authoritative move verification & digital clocks.',
    duration: '~2 MIN',
    icon: '♟️👑',
    isAvailable: true,
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

  const match = roomState.currentMatch;
  const targetWins =
    match?.seriesCondition.type === 'FIRST_TO_N'
      ? match.seriesCondition.targetPoints
      : 3;
  const totalGamesNeeded =
    match?.totalGamesNeeded || Math.min(6, 2 * targetWins - 1);
  const playlist = match?.gamePlaylist || [];
  const currentDraftSlot = playlist.length + 1;

  const getGameById = (id: string) => GAMES_CATALOG.find((g) => g.id === id);

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 w-full max-w-5xl mx-auto select-none">
      {/* ================= TOP DRAFT STATUS BANNER ================= */}
      <div
        className={`w-full p-5 mb-6 border-4 border-ink shadow-pixel text-center transition-colors ${
          isNight ? 'bg-[#18243A] text-paper' : 'bg-paper text-ink'
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-3 py-1 bg-ink text-cartridgeYellow font-arcade text-xs tracking-wider border border-ink font-bold">
            ★ MATCH LINEUP DRAFT ({playlist.length}/{totalGamesNeeded} PICKED) ★
          </span>
          <span className="px-2.5 py-1 bg-darkNavy text-white font-mono text-[11px] border border-ink/40">
            FIRST TO {targetWins} WINS
          </span>
        </div>

        {isMyTurn ? (
          <div>
            <h2 className="font-arcade text-lg sm:text-2xl text-arcadeRed tracking-wider font-bold animate-pulse">
              CHOOSE GAME FOR ROUND {currentDraftSlot}, {pickerName.toUpperCase()}!
            </h2>
            <p className={`font-mono text-xs sm:text-sm mt-1.5 font-bold ${isNight ? 'text-cartridgeYellow' : 'text-stone-800'}`}>
              ⚔️ Your turn to draft! Pick any available game below to lock into the series playlist.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 animate-ping rounded-full ${isNight ? 'bg-cartridgeYellow' : 'bg-amber-600'}`} />
              <h2 className={`font-arcade text-base sm:text-xl tracking-wider font-bold ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
                WAITING FOR {pickerName.toUpperCase()} TO DRAFT ROUND {currentDraftSlot}...
              </h2>
            </div>
            <p className={`font-mono text-xs sm:text-sm mt-1.5 ${isNight ? 'text-slate-300' : 'text-stone-700'}`}>
              Opponent is drafting Round {currentDraftSlot}. Stand by for your turn!
            </p>
          </div>
        )}

        {/* ================= ORDERED SERIES PLAYLIST SLOTS ================= */}
        <div className="mt-5 pt-4 border-t-2 border-dashed border-ink/20">
          <h4 className={`font-arcade text-[10px] sm:text-xs font-bold tracking-wider mb-3 uppercase ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
            PLANNED BATTLE SEQUENCE:
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 w-full">
            {Array.from({ length: totalGamesNeeded }).map((_, idx) => {
              const draftedGameId = playlist[idx];
              const draftedGame = draftedGameId ? getGameById(draftedGameId) : null;
              const isCurrent = idx === playlist.length;
              const slotPickerIsHost = idx % 2 === 0;
              const slotPickerName = slotPickerIsHost
                ? playerA?.name || 'HOST'
                : playerB?.name || 'CHALLENGER';

              return (
                <div
                  key={idx}
                  className={`p-2.5 border-2 text-left font-mono transition-all relative ${
                    draftedGame
                      ? isNight
                        ? 'bg-slate-800/90 border-gameBoyGreen text-white'
                        : 'bg-emerald-50 border-gameBoyGreen text-ink'
                      : isCurrent
                      ? 'border-arcadeRed bg-arcadeRed/10 animate-pulse'
                      : isNight
                      ? 'bg-slate-900/40 border-slate-700 text-slate-500'
                      : 'bg-stone-100 border-stone-300 text-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-arcade mb-1">
                    <span className={`font-bold ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>RND #{idx + 1}</span>
                    <span
                      title={slotPickerName}
                      className={`text-[9px] font-mono font-bold tracking-wide truncate max-w-[80px] ${
                        isNight ? 'text-slate-200' : 'text-stone-800'
                      }`}
                    >
                      {slotPickerName}
                    </span>
                  </div>

                  {draftedGame ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-base">{draftedGame.icon.split('')[0]}</span>
                      <span className="font-arcade text-[10px] font-bold truncate">
                        {draftedGame.title}
                      </span>
                    </div>
                  ) : isCurrent ? (
                    <div className="text-[10px] font-arcade text-arcadeRed font-bold flex items-center gap-1 mt-1">
                      <span className="animate-spin inline-block">⏳</span>
                      <span>DRAFTING...</span>
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono italic opacity-60 mt-1">
                      Empty Slot
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= GAME SELECTION CATALOG ================= */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {GAMES_CATALOG.map((game) => {
          const isAlreadyDrafted = playlist.includes(game.id);
          const draftedRoundIndex = isAlreadyDrafted ? playlist.indexOf(game.id) + 1 : null;
          const canPick = isMyTurn && !isAlreadyDrafted && game.isAvailable;

          return (
            <div
              key={game.id}
              className={`flex flex-col justify-between p-5 border-4 border-ink shadow-pixel transition-all duration-200 relative ${
                isAlreadyDrafted
                  ? isNight
                    ? 'bg-slate-900/60 text-slate-400 border-slate-700 opacity-60'
                    : 'bg-stone-200/80 text-stone-500 border-stone-400 opacity-70'
                  : game.isAvailable
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
                    isAlreadyDrafted
                      ? 'bg-gameBoyGreen text-ink border-gameBoyGreen font-arcade'
                      : game.isAvailable
                      ? isNight
                        ? 'bg-ink text-cartridgeYellow border-cartridgeYellow'
                        : 'bg-paper text-ink border-ink'
                      : 'bg-stone-400 text-white border-transparent'
                  }`}
                >
                  {isAlreadyDrafted ? `DRAFTED RND #${draftedRoundIndex}` : game.duration}
                </span>
              </div>

              {/* Title & Category */}
              <div className="mb-4">
                <span className={`text-[10px] font-mono uppercase tracking-widest font-bold block mb-0.5 ${
                  isNight ? 'text-cartridgeYellow' : 'text-amber-800'
                }`}>
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
                {isAlreadyDrafted ? (
                  <div
                    className={`w-full py-2.5 text-center font-arcade text-xs tracking-wider border-2 border-gameBoyGreen text-gameBoyGreen font-bold ${
                      isNight ? 'bg-slate-800' : 'bg-emerald-50'
                    }`}
                  >
                    ✓ LOCKED IN (ROUND #{draftedRoundIndex})
                  </div>
                ) : game.isAvailable ? (
                  canPick ? (
                    <button
                      onClick={() => onSelectGame(game.id)}
                      className="w-full py-2.5 px-4 bg-arcadeRed text-white font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel hover:bg-red-600 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold flex items-center justify-center gap-1.5"
                    >
                      <span>▶</span>
                      <span>DRAFT FOR ROUND #{currentDraftSlot}</span>
                    </button>
                  ) : (
                    <div
                      className={`w-full py-2.5 text-center font-arcade text-[10px] tracking-wider border-2 border-dashed border-ink/30 ${
                        isNight ? 'bg-slate-800 text-slate-400' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {isMyTurn ? 'AVAILABLE TO PICK' : `WAITING FOR ${pickerName.toUpperCase()}...`}
                    </div>
                  )
                ) : (
                  <div className="w-full py-2.5 text-center font-arcade text-[10px] tracking-wider bg-stone-300 text-stone-600 border border-stone-400 font-bold">
                    🔒 UNAVAILABLE
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
