import React, { useState, useEffect } from 'react';
import type {
  RoomState,
  MinesweeperState,
  MinesweeperMove,
  MinesweeperCell,
} from '@bvb/shared';
import confetti from 'canvas-confetti';
import { PixelCharacter } from '../pixel/PixelCharacter';
import { GamePixelIcon } from '../game-icons/GamePixelIcon';
import { soundFx } from '../../utils/audio';

interface MinesweeperGameProps {
  roomState: RoomState;
  gameState: MinesweeperState;
  myPlayerId: string;
  onSendMove: (move: MinesweeperMove) => void;
  theme?: 'day' | 'night';
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-500 font-extrabold',
  2: 'text-emerald-500 font-extrabold',
  3: 'text-red-500 font-extrabold',
  4: 'text-indigo-600 font-extrabold',
  5: 'text-amber-700 font-extrabold',
  6: 'text-cyan-600 font-extrabold',
  7: 'text-black dark:text-white font-extrabold',
  8: 'text-stone-500 font-extrabold',
};

export const MinesweeperGame: React.FC<MinesweeperGameProps> = ({
  roomState,
  gameState,
  myPlayerId,
  onSendMove,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const [clickMode, setClickMode] = useState<'DIG' | 'FLAG'>('DIG');

  const { playerA, playerB } = roomState.players;
  const myPlayer = playerA?.id === myPlayerId ? playerA : playerB;
  const opponentPlayer = playerA?.id === myPlayerId ? playerB : playerA;
  const opponentId = opponentPlayer?.id || '';

  const myState = gameState.playerStates[myPlayerId] || {
    board: [],
    flagCount: 0,
    revealedCount: 0,
    isDead: false,
    hasWon: false,
    isCompleted: false,
  };

  const opponentState = opponentId ? gameState.playerStates[opponentId] : null;

  const isFinished = gameState.status === 'FINISHED';
  const iWon = isFinished && gameState.winnerPlayerId === myPlayerId;
  const iLost = isFinished && gameState.winnerPlayerId && gameState.winnerPlayerId !== myPlayerId;
  const isDraw = isFinished && !gameState.winnerPlayerId;
  const canPlay = !isFinished && !myState.isCompleted && !myState.isDead;

  // Victory confetti
  useEffect(() => {
    if (iWon) {
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'],
      });
    }
  }, [iWon]);

  const handleCellClick = (row: number, col: number) => {
    if (!canPlay) return;

    soundFx.play('move');
    if (clickMode === 'FLAG') {
      onSendMove({ action: 'FLAG', row, col });
    } else {
      onSendMove({ action: 'REVEAL', row, col });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (!canPlay) return;
    soundFx.play('move');
    onSendMove({ action: 'FLAG', row, col });
  };

  const renderCellContent = (cell: MinesweeperCell, isOpponent = false) => {
    if (cell.status === 'EXPLODED') {
      return <span className="animate-ping text-base">💥</span>;
    }

    if (cell.status === 'FLAGGED') {
      return <span className="text-sm select-none">🚩</span>;
    }

    if (cell.status === 'REVEALED') {
      if (isOpponent) {
        return <span className="text-[10px] text-stone-400">✓</span>;
      }
      if (cell.adjacentMines > 0) {
        return (
          <span className={`font-arcade text-xs sm:text-sm ${NUMBER_COLORS[cell.adjacentMines] || ''}`}>
            {cell.adjacentMines}
          </span>
        );
      }
      return null;
    }

    // Finished game reveal unexploded mines
    if (isFinished && cell.hasMine) {
      return <span className="text-xs">💣</span>;
    }

    return null;
  };

  const remainingMines = Math.max(0, gameState.totalMines - myState.flagCount);
  const myProgressPercent = Math.min(100, Math.round((myState.revealedCount / gameState.totalSafeCells) * 100));
  const oppProgressPercent = Math.min(100, Math.round(((opponentState?.revealedCount || 0) / gameState.totalSafeCells) * 100));

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 w-full max-w-5xl mx-auto select-none my-auto">
      {/* Top Arcade Control & Status HUD */}
      <div
        className={`w-full max-w-4xl p-2.5 sm:p-3.5 mb-3 sm:mb-4 border-2 sm:border-4 border-ink shadow-pixel flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 transition-colors relative ${
          isNight ? 'bg-[#18243A] text-paper' : 'bg-paper text-ink'
        }`}
      >
        {/* Left: Game Title + Live Counters */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <GamePixelIcon gameId="minesweeper" size={24} className="flex-shrink-0" />
          <div>
            <div className={`font-arcade text-xs sm:text-sm font-bold tracking-wide ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
              MINEFIELD DUEL
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 border border-ink bg-ink text-cartridgeYellow">
                🚩 {remainingMines} MINES
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 border border-ink bg-ink text-white">
                ⛏️ {myState.revealedCount}/{gameState.totalSafeCells}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Dynamic Match Status Headline */}
        <div className="text-center min-w-0">
          {iWon ? (
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-[#22C55E] font-bold tracking-wide animate-pulse">
                🏆 FLAWLESS SWEEP! YOU WON!
              </h2>
              <p className="font-mono text-[9px] sm:text-[10px] mt-0.5 opacity-90">{gameState.summary}</p>
            </div>
          ) : iLost ? (
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-arcadeRed font-bold tracking-wide">
                💀 BOOM! DEFEAT! {opponentPlayer?.name?.toUpperCase() || 'OPPONENT'} WINS!
              </h2>
              <p className="font-mono text-[9px] sm:text-[10px] mt-0.5 opacity-90">{gameState.summary}</p>
            </div>
          ) : isDraw ? (
            <div>
              <h2 className={`font-arcade text-xs sm:text-sm font-bold tracking-wide ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
                🤝 DUEL ENDED IN A DRAW!
              </h2>
              <p className="font-mono text-[9px] sm:text-[10px] mt-0.5 opacity-90">{gameState.summary}</p>
            </div>
          ) : (
            <div>
              <h2 className={`font-arcade text-xs sm:text-sm font-bold tracking-wide ${isNight ? 'text-paper' : 'text-ink'}`}>
                CLEAR 71 SAFE SECTORS!
              </h2>
              <p className={`font-mono text-[9px] sm:text-[10px] mt-0.5 ${isNight ? 'text-slate-300' : 'text-stone-600'}`}>
                Left-Click / Tap to DIG • Right-Click / Toggle for 🚩 FLAGS
              </p>
            </div>
          )}
        </div>

        {/* Right: Quick Action DIG / FLAG Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setClickMode('DIG')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 font-arcade text-[10px] sm:text-xs tracking-wider border-2 border-ink shadow-pixel transition-all font-bold flex items-center justify-center gap-1.5 ${
              clickMode === 'DIG'
                ? 'bg-arcadeRed text-white translate-x-[-1px] translate-y-[-1px]'
                : isNight
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-stone-700 hover:bg-amber-100'
            }`}
          >
            <span>⛏️</span>
            <span>DIG</span>
          </button>

          <button
            onClick={() => setClickMode('FLAG')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 font-arcade text-[10px] sm:text-xs tracking-wider border-2 border-ink shadow-pixel transition-all font-bold flex items-center justify-center gap-1.5 ${
              clickMode === 'FLAG'
                ? 'bg-cartridgeYellow text-ink translate-x-[-1px] translate-y-[-1px]'
                : isNight
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-stone-700 hover:bg-amber-100'
            }`}
          >
            <span>🚩</span>
            <span>FLAG</span>
          </button>
        </div>
      </div>

      {/* Duel Arena: Split Battlefields */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center md:items-start justify-center gap-4 sm:gap-6 lg:gap-8">
        {/* PLAYER'S BOARD (Primary Battle Stage) */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="flex items-center justify-between w-full px-1 mb-1.5">
            <div className="flex items-center gap-1.5">
              <PixelCharacter type={myPlayer?.avatar || (myPlayer?.isHost ? 'bro1' : 'bro2')} size={24} />
              <span className={`font-arcade text-xs sm:text-sm font-bold tracking-wide truncate max-w-[150px] ${isNight ? 'text-white' : 'text-ink'}`}>
                {myPlayer?.name || 'YOU'} (YOU)
              </span>
            </div>
            <span className="font-mono text-xs sm:text-sm font-bold text-arcadeRed">
              {myProgressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 sm:h-2.5 bg-stone-300 border-2 border-ink mb-2 overflow-hidden shadow-inner">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${myProgressPercent}%` }}
            />
          </div>

          {/* 9x9 Minefield Grid (Responsive Arcade Sizing) */}
          <div
            className={`grid grid-cols-9 gap-1 sm:gap-1.5 p-2 sm:p-3 border-3 sm:border-4 border-ink shadow-pixel ${
              isNight ? 'bg-[#121B2A]' : 'bg-[#E5DDC3]'
            }`}
          >
            {myState.board.map((row, r) =>
              row.map((cell, c) => {
                const isRevealed = cell.status === 'REVEALED';
                const isExploded = cell.status === 'EXPLODED';

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => handleContextMenu(e, r, c)}
                    disabled={!canPlay || isRevealed}
                    className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 border-2 flex items-center justify-center text-xs sm:text-base lg:text-lg font-bold transition-all ${
                      isExploded
                        ? 'bg-red-600 text-white border-ink animate-pulse shadow-inner'
                        : isRevealed
                        ? isNight
                          ? 'bg-[#1E293B] border-slate-700 shadow-inner'
                          : 'bg-[#F2EDDC] border-stone-400 shadow-inner'
                        : isNight
                        ? 'bg-slate-700 hover:bg-slate-600 border-slate-900 shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px]'
                        : 'bg-[#FFFDF5] hover:bg-amber-100 border-ink shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px]'
                    }`}
                  >
                    {renderCellContent(cell)}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center VS Energy Divider (Visible on md+) */}
        <div className="hidden md:flex flex-col items-center justify-center self-center px-1 opacity-80">
          <span className="text-lg animate-bounce">⚡</span>
          <span className="font-arcade text-arcadeRed text-base font-bold my-2 tracking-widest">
            VS
          </span>
          <span className="text-lg animate-bounce">⚡</span>
        </div>

        {/* OPPONENT'S LIVE RADAR (Ghost Board) */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="flex items-center justify-between w-full px-1 mb-1.5">
            <div className="flex items-center gap-1.5">
              <PixelCharacter type={opponentPlayer?.avatar || (opponentPlayer?.isHost ? 'bro1' : 'bro2')} size={20} />
              <span className="font-arcade text-[11px] sm:text-xs font-bold tracking-wide text-stone-500 truncate max-w-[110px]">
                {opponentPlayer?.name || 'OPPONENT'}
              </span>
            </div>
            <span className="font-mono text-xs sm:text-sm font-bold text-stone-500">
              {oppProgressPercent}%
            </span>
          </div>

          {/* Opponent Progress Bar */}
          <div className="w-full h-2 sm:h-2.5 bg-stone-300 border-2 border-ink mb-2 overflow-hidden shadow-inner">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${oppProgressPercent}%` }}
            />
          </div>

          {/* Opponent's Mini 9x9 Radar */}
          <div
            className={`grid grid-cols-9 gap-0.5 sm:gap-1 p-1.5 sm:p-2 border-2 sm:border-4 border-dashed border-ink/40 shadow-pixel-sm ${
              isNight ? 'bg-[#18243A]/60' : 'bg-[#DCD5BD]'
            }`}
          >
            {opponentState?.board.map((row, r) =>
              row.map((cell, c) => {
                const isRevealed = cell.status === 'REVEALED';
                const isExploded = cell.status === 'EXPLODED';

                return (
                  <div
                    key={`opp-${r}-${c}`}
                    className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 border flex items-center justify-center text-[8px] xs:text-[10px] sm:text-xs ${
                      isExploded
                        ? 'bg-red-500 text-white'
                        : isRevealed
                        ? isNight
                          ? 'bg-emerald-950/70 border-emerald-800'
                          : 'bg-emerald-200 border-emerald-400'
                        : cell.status === 'FLAGGED'
                        ? 'bg-amber-300'
                        : isNight
                        ? 'bg-slate-800 border-slate-900 opacity-60'
                        : 'bg-stone-300 border-stone-400 opacity-60'
                    }`}
                  >
                    {renderCellContent(cell, true)}
                  </div>
                );
              })
            )}
          </div>
          <span className="font-mono text-[9px] sm:text-[10px] text-stone-500 mt-1.5">
            👁️ Rival live mine radar feed
          </span>
        </div>
      </div>
    </div>
  );
};
