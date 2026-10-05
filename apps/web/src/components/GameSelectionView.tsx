import React from 'react';
import type { RoomState } from '@bvb/shared';
import { PixelCharacter } from './pixel/PixelCharacter';
import { GamePixelIcon } from './game-icons/GamePixelIcon';
import { PixelDraftAtmosphere } from './pixel/PixelDraftAtmosphere';

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
    isAvailable: true,
    accentColor: 'border-arcadeRed text-arcadeRed',
  },
  {
    id: 'reaction-test',
    title: 'REFLEX DUEL',
    category: 'QUICKDRAW REFLEX',
    description: 'Wait for the signal to turn GREEN and strike! False start equals instant defeat.',
    duration: '~15 SEC',
    isAvailable: true,
    accentColor: 'border-gameBoyGreen text-gameBoyGreen',
  },
  {
    id: 'connect-four',
    title: 'CONNECT FOUR',
    category: 'GRAVITY PUZZLE',
    description: 'Drop colored tokens into a 7x6 vertical grid to align four in a row.',
    duration: '~2 MIN',
    isAvailable: true,
    accentColor: 'border-crtCyan text-crtCyan',
  },
  {
    id: 'wordle',
    title: 'WORDLE RACE',
    category: 'SECRET CIPHER',
    description: 'Guess the hidden 5-letter word first using server-sanitized clues.',
    duration: '~2 MIN',
    isAvailable: true,
    accentColor: 'border-cartridgeYellow text-cartridgeYellow',
  },
  {
    id: 'minesweeper',
    title: 'MINEFIELD BATTLE',
    category: 'HAZARD RACE',
    description: 'Race to clear identical 9x9 minefields without detonating. First click guaranteed safe!',
    duration: '~2 MIN',
    isAvailable: true,
    accentColor: 'border-pixelPink text-pixelPink',
  },
  {
    id: 'chess',
    title: 'SPEED CHESS',
    category: 'GRANDMASTER SHOWDOWN',
    description: 'Fast-paced 1v1 blitz chess with server-authoritative move verification & digital clocks.',
    duration: '~2 MIN',
    isAvailable: true,
    accentColor: 'border-purple-400 text-purple-400',
  },
  {
    id: 'flag-duel',
    title: 'FLAG DUEL',
    category: 'GEOGRAPHY BLITZ',
    description: 'Rapid 1v1 flag identification! First to 3 correct wins, but 3 wrong answers eliminate you.',
    duration: '~1 MIN',
    isAvailable: true,
    accentColor: 'border-amber-500 text-amber-500',
  },
  {
    id: 'typing-race',
    title: 'TYPE RACER',
    category: 'KEYBOARD DRAG RACE',
    description: 'High-octane 1v1 drag race! Hammer your keyboard to accelerate your turbo pixel racer to the checkered flag.',
    duration: '~45 SEC',
    isAvailable: true,
    accentColor: 'border-cyan-400 text-cyan-400',
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
    <PixelDraftAtmosphere theme={theme} roomState={roomState}>
      <div className="flex-1 flex flex-col items-center justify-between p-2 sm:p-3 md:p-4 w-full max-w-6xl mx-auto select-none relative z-10 min-h-0">
        {/* Retro 1v1 Gauntlet Tag */}
        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-1.5">
          <span className="text-white/60 text-xs font-pixel">+</span>
          <span className={`font-arcade text-[11px] sm:text-xs font-bold tracking-widest uppercase ${isNight ? 'text-slate-300' : 'text-stone-800'}`}>
            1v1 RETRO GAUNTLET
          </span>
          <span className="text-white/60 text-xs font-pixel">+</span>
        </div>

        {/* ================= TOP DRAFT STATUS BANNER ================= */}
        <div
          className={`w-full p-2.5 sm:p-3 mb-2 sm:mb-2.5 border-2 sm:border-4 border-ink shadow-pixel text-center transition-colors ${
            isNight ? 'bg-[#18243A] text-paper' : 'bg-paper text-ink'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-ink text-cartridgeYellow font-arcade text-[10px] sm:text-xs tracking-wider border border-ink font-bold shadow-pixel-sm">
              ★ MATCH LINEUP DRAFT ({playlist.length}/{totalGamesNeeded} PICKED) ★
            </span>
            <span className="px-2 py-0.5 bg-darkNavy text-white font-mono text-[10px] sm:text-[11px] border border-ink/40 shadow-pixel-sm">
              FIRST TO {targetWins} WINS
            </span>
          </div>

          {isMyTurn ? (
            <div>
              <h2 className="font-arcade text-base sm:text-lg md:text-xl text-arcadeRed tracking-wider font-bold animate-pulse">
                CHOOSE GAME FOR ROUND {currentDraftSlot}, {pickerName.toUpperCase()}!
              </h2>
              <p className={`font-mono text-[11px] sm:text-xs mt-0.5 font-bold ${isNight ? 'text-cartridgeYellow' : 'text-stone-800'}`}>
                ⚔️ Your turn to draft! Pick any available game below to lock into the series playlist.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 animate-ping rounded-full ${isNight ? 'bg-cartridgeYellow' : 'bg-amber-600'}`} />
                <h2 className={`font-arcade text-sm sm:text-base md:text-lg tracking-wider font-bold ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
                  WAITING FOR {pickerName.toUpperCase()} TO DRAFT ROUND {currentDraftSlot}...
                </h2>
              </div>
              <p className={`font-mono text-[11px] sm:text-xs mt-0.5 ${isNight ? 'text-slate-300' : 'text-stone-700'}`}>
                Opponent is drafting Round {currentDraftSlot}. Stand by for your turn!
              </p>
            </div>
          )}

          {/* ================= ORDERED SERIES PLAYLIST SLOTS ================= */}
          <div className="mt-2 pt-1.5 border-t border-dashed border-ink/20">
            <h4 className={`font-arcade text-[9px] sm:text-[10px] font-bold tracking-wider mb-1 uppercase ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
              PLANNED BATTLE SEQUENCE:
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2 w-full">
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
                    className={`py-1 px-1.5 border-2 text-left font-mono transition-all relative ${
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
                    <div className="flex items-center justify-between text-[9px] font-arcade mb-0.5">
                      <span className={`font-bold ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>RND #{idx + 1}</span>
                      <span
                        title={slotPickerName}
                        className={`text-[8px] sm:text-[9px] font-mono font-bold tracking-wide truncate max-w-[70px] ${
                          isNight ? 'text-slate-200' : 'text-stone-800'
                        }`}
                      >
                        {slotPickerName}
                      </span>
                    </div>

                    {draftedGame ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <GamePixelIcon gameId={draftedGame.id} size={14} />
                        <span className="font-arcade text-[9px] font-bold truncate">
                          {draftedGame.title}
                        </span>
                      </div>
                    ) : isCurrent ? (
                      <div className="text-[9px] font-arcade text-arcadeRed font-bold flex items-center gap-1 mt-0.5">
                        <span className="animate-spin inline-block text-[8px]">⏳</span>
                        <span>DRAFTING...</span>
                      </div>
                    ) : (
                      <div className="text-[9px] font-mono italic opacity-60 mt-0.5">
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
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 flex-1 min-h-0">
          {GAMES_CATALOG.map((game) => {
            const isAlreadyDrafted = playlist.includes(game.id);
            const draftedRoundIndex = isAlreadyDrafted ? playlist.indexOf(game.id) + 1 : null;
            const canPick = isMyTurn && !isAlreadyDrafted && game.isAvailable;

            return (
              <div
                key={game.id}
                className={`group flex flex-col justify-between p-2 sm:p-2.5 border-2 sm:border-3 border-ink shadow-pixel transition-all duration-200 relative ${
                  isAlreadyDrafted
                    ? isNight
                      ? 'bg-slate-900/60 text-slate-400 border-slate-700 opacity-60'
                      : 'bg-stone-200/80 text-stone-500 border-stone-400 opacity-70'
                    : game.isAvailable
                    ? isNight
                      ? 'bg-[#1E293B] text-paper hover:-translate-y-1 hover:shadow-pixel-lg active:translate-y-0 active:shadow-pixel'
                      : 'bg-[#FFFDF5] text-ink hover:-translate-y-1 hover:shadow-pixel-lg active:translate-y-0 active:shadow-pixel'
                    : isNight
                    ? 'bg-slate-900/60 text-slate-500 opacity-60 border-slate-700'
                    : 'bg-stone-200/70 text-stone-500 opacity-70 border-stone-400'
                }`}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-1">
                  <div className="transform group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-200 origin-center">
                    <GamePixelIcon gameId={game.id} size={30} />
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 border border-ink shadow-pixel-sm font-bold uppercase ${
                      isAlreadyDrafted
                        ? 'bg-gameBoyGreen text-ink border-ink font-arcade'
                        : game.isAvailable
                        ? isNight
                          ? 'bg-ink text-cartridgeYellow border-ink'
                          : 'bg-paper text-ink border-ink'
                        : 'bg-stone-400 text-white border-transparent'
                    }`}
                  >
                    {isAlreadyDrafted ? `DRAFTED RND #${draftedRoundIndex}` : game.duration}
                  </span>
                </div>

                {/* Title & Category */}
                <div className="mb-1.5">
                  <span className={`text-[9px] font-mono uppercase tracking-widest font-bold block mb-0.5 ${
                    isNight ? 'text-cartridgeYellow' : 'text-amber-800'
                  }`}>
                    {game.category}
                  </span>
                  <h3 className="font-arcade text-xs sm:text-sm font-bold tracking-wide group-hover:text-arcadeRed transition-colors">
                    {game.title}
                  </h3>
                  <p className="font-mono text-[10px] sm:text-[11px] mt-1 leading-snug line-clamp-2 opacity-90">
                    {game.description}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-auto pt-2 border-t border-dashed border-ink/20">
                  {isAlreadyDrafted ? (
                    <div
                      className={`w-full py-1.5 text-center font-arcade text-[10px] tracking-wider border border-gameBoyGreen text-gameBoyGreen font-bold ${
                        isNight ? 'bg-slate-800' : 'bg-emerald-50'
                      }`}
                    >
                      ✓ LOCKED IN (ROUND #{draftedRoundIndex})
                    </div>
                  ) : game.isAvailable ? (
                    canPick ? (
                      <button
                        onClick={() => onSelectGame(game.id)}
                        className="w-full py-1.5 sm:py-2 px-3 bg-arcadeRed text-white font-arcade text-[10px] sm:text-xs tracking-wider border-2 border-ink shadow-pixel hover:bg-red-600 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold flex items-center justify-center gap-1.5"
                      >
                        <span>▶</span>
                        <span>DRAFT FOR ROUND #{currentDraftSlot}</span>
                      </button>
                    ) : (
                      <div
                        className={`w-full py-1.5 sm:py-2 text-center font-arcade text-[9px] sm:text-[10px] tracking-wider border border-dashed border-ink/30 ${
                          isNight ? 'bg-slate-800 text-slate-400' : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {isMyTurn ? 'AVAILABLE TO PICK' : `WAITING FOR ${pickerName.toUpperCase()}...`}
                      </div>
                    )
                  ) : (
                    <div className="w-full py-1.5 sm:py-2 text-center font-arcade text-[9px] sm:text-[10px] tracking-wider bg-stone-300 text-stone-600 border border-stone-400 font-bold">
                      🔒 UNAVAILABLE
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PixelDraftAtmosphere>
  );
};
