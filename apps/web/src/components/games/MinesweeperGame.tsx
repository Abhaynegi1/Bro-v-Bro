import React, { useState, useEffect } from 'react';
import type {
  RoomState,
  MinesweeperState,
  MinesweeperMove,
  MinesweeperCell,
} from '@bvb/shared';
import confetti from 'canvas-confetti';
import { PixelCharacter } from '../pixel/PixelCharacter';

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

    if (clickMode === 'FLAG') {
      onSendMove({ action: 'FLAG', row, col });
    } else {
      onSendMove({ action: 'REVEAL', row, col });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (!canPlay) return;
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
    <div className="flex-1 flex flex-col items-center justify-between p-3 sm:p-5 w-full max-w-4xl mx-auto select-none">
      {/* Header Banner */}
      <div
        className={`w-full max-w-2xl p-3 sm:p-4 mb-3 border-4 border-ink shadow-pixel text-center transition-colors relative ${
          isNight ? 'bg-[#18243A] text-paper' : 'bg-paper text-ink'
        }`}
      >
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="font-arcade text-[10px] sm:text-xs text-cartridgeYellow font-bold flex items-center gap-1.5">
            <span className="animate-pulse">💣🚩</span> MINEFIELD SPEED RACE
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 border border-ink bg-ink text-cartridgeYellow">
              🚩 {remainingMines} MINES LEFT
            </span>
            <span className="font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 border border-ink bg-ink text-white">
              ⛏️ {myState.revealedCount}/{gameState.totalSafeCells} CLEARED
            </span>
          </div>
        </div>

        {/* Dynamic Status Headline */}
        {iWon ? (
          <div>
            <h2 className="font-arcade text-base sm:text-xl text-[#22C55E] font-bold tracking-wide animate-pulse">
              🏆 FLAWLESS SWEEP! YOU WON THE RACE!
            </h2>
            <p className="font-mono text-xs mt-0.5 opacity-90">{gameState.summary}</p>
          </div>
        ) : iLost ? (
          <div>
            <h2 className="font-arcade text-base sm:text-xl text-arcadeRed font-bold tracking-wide">
              💀 BOOM! DEFEAT! {opponentPlayer?.name?.toUpperCase() || 'OPPONENT'} WINS!
            </h2>
            <p className="font-mono text-xs mt-0.5 opacity-90">{gameState.summary}</p>
          </div>
        ) : isDraw ? (
          <div>
            <h2 className="font-arcade text-base sm:text-xl text-cartridgeYellow font-bold tracking-wide">
              🤝 MINEFIELD DUEL CONCLUDED IN A DRAW!
            </h2>
            <p className="font-mono text-xs mt-0.5 opacity-90">{gameState.summary}</p>
          </div>
        ) : (
          <div>
            <h2 className="font-arcade text-sm sm:text-base text-ink dark:text-paper font-bold tracking-wide">
              CLEAR 71 SAFE SECTORS WITHOUT STRIKING A MINE!
            </h2>
            <p className={`font-mono text-[11px] mt-0.5 ${isNight ? 'text-slate-300' : 'text-stone-600'}`}>
              Left-click to DIG • Right-click (or toggle mode below) to place 🚩 FLAGS
            </p>
          </div>
        )}
      </div>

      {/* Control Toggle Bar */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setClickMode('DIG')}
          className={`px-3 py-1.5 font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel transition-all font-bold flex items-center gap-1.5 ${
            clickMode === 'DIG'
              ? 'bg-arcadeRed text-white translate-x-[-1px] translate-y-[-1px]'
              : isNight
              ? 'bg-slate-800 text-slate-300'
              : 'bg-white text-stone-700'
          }`}
        >
          <span>⛏️</span>
          <span>DIG MODE</span>
        </button>

        <button
          onClick={() => setClickMode('FLAG')}
          className={`px-3 py-1.5 font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel transition-all font-bold flex items-center gap-1.5 ${
            clickMode === 'FLAG'
              ? 'bg-cartridgeYellow text-ink translate-x-[-1px] translate-y-[-1px]'
              : isNight
              ? 'bg-slate-800 text-slate-300'
              : 'bg-white text-stone-700'
          }`}
        >
          <span>🚩</span>
          <span>FLAG MODE</span>
        </button>
      </div>

      {/* Duel Arena: Split Boards */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row items-center md:items-start justify-center gap-6 sm:gap-10">
        {/* PLAYER'S BOARD (Primary Focus) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full max-w-[340px] px-1 mb-2">
            <div className="flex items-center gap-2">
              <PixelCharacter type={myPlayer?.isHost ? 'bro1' : 'bro2'} size={24} />
              <span className="font-arcade text-xs font-bold tracking-wide">
                {myPlayer?.name || 'YOU'} (YOU)
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-arcadeRed">
              {myProgressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-[340px] h-2 bg-stone-300 border border-ink mb-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${myProgressPercent}%` }}
            />
          </div>

          {/* 9x9 Minefield Grid */}
          <div
            className={`grid grid-cols-9 gap-1 p-2 border-4 border-ink shadow-pixel ${
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
                    className={`w-8 h-8 sm:w-9 sm:h-9 border flex items-center justify-center transition-all ${
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

        {/* OPPONENT'S LIVE RADAR (Ghost Board) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full max-w-[200px] px-1 mb-2">
            <div className="flex items-center gap-1.5">
              <PixelCharacter type={opponentPlayer?.isHost ? 'bro1' : 'bro2'} size={20} />
              <span className="font-arcade text-xs font-bold tracking-wide text-stone-500">
                {opponentPlayer?.name || 'OPPONENT'}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-stone-500">
              {oppProgressPercent}%
            </span>
          </div>

          {/* Opponent Progress Bar */}
          <div className="w-full max-w-[200px] h-2 bg-stone-300 border border-ink mb-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${oppProgressPercent}%` }}
            />
          </div>

          {/* Opponent's Mini 9x9 Radar */}
          <div
            className={`grid grid-cols-9 gap-0.5 p-1.5 border-4 border-dashed border-ink/40 shadow-pixel-sm ${
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
                    className={`w-5 h-5 border flex items-center justify-center text-[10px] ${
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
          <span className="font-mono text-[10px] text-stone-500 mt-1">
            Opponent's live mine sweeper radar
          </span>
        </div>
      </div>
    </div>
  );
};
