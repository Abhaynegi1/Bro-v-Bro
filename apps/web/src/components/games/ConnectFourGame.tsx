import React, { useState, useEffect } from 'react';
import type { RoomState, ConnectFourState, ConnectFourMove } from '@bvb/shared';
import confetti from 'canvas-confetti';
import { GamePixelIcon } from '../game-icons/GamePixelIcon';

interface ConnectFourGameProps {
  roomState: RoomState;
  gameState: ConnectFourState;
  myPlayerId: string;
  onSendMove: (move: ConnectFourMove) => void;
  theme?: 'day' | 'night';
}

export const ConnectFourGame: React.FC<ConnectFourGameProps> = ({
  roomState,
  gameState,
  myPlayerId,
  onSendMove,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const { playerA, playerB } = roomState.players;
  const isRed = myPlayerId === gameState.playerRedId;
  const myColor = isRed ? 'RED' : 'YELLOW';
  const opponentColor = isRed ? 'YELLOW' : 'RED';

  const isMyTurn =
    gameState.status === 'IN_PROGRESS' && gameState.currentTurnPlayerId === myPlayerId;
  const isFinished = gameState.status === 'WIN' || gameState.status === 'DRAW';
  const iWon = gameState.status === 'WIN' && gameState.winnerPlayerId === myPlayerId;
  const iLost =
    gameState.status === 'WIN' &&
    gameState.winnerPlayerId &&
    gameState.winnerPlayerId !== myPlayerId;

  // Trigger victory confetti
  useEffect(() => {
    if (iWon) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#EF4444', '#FBBF24', '#3B82F6', '#10B981'],
      });
    }
  }, [iWon]);

  const handleColumnClick = (col: number) => {
    if (!isMyTurn || isFinished) return;
    // Check if column is full (top row is row 0)
    if (gameState.board[0][col] !== null) return;
    onSendMove({ column: col });
  };

  const isWinningCell = (row: number, col: number) => {
    if (!gameState.winningLine) return false;
    return gameState.winningLine.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-3 py-1.5 sm:py-2 max-w-3xl mx-auto w-full select-none h-full min-h-0">
      {/* Turn Announcement Banner */}
      <div
        className={`w-full max-w-xl py-1.5 px-3 mb-2 border-2 transition-all text-center shadow-pixel ${
          isFinished
            ? iWon
              ? 'bg-gameBoyGreen text-ink border-ink font-bold'
              : iLost
              ? 'bg-arcadeRed text-white border-ink font-bold'
              : 'bg-cartridgeYellow text-ink border-ink font-bold'
            : isMyTurn
            ? 'bg-cartridgeYellow text-darkNavy border-ink animate-pulse'
            : isNight
            ? 'bg-[#18243A] text-paper border-ink'
            : 'bg-paper text-ink border-ink'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <GamePixelIcon gameId="connect-four" size={20} className="flex-shrink-0" />
          <span className="font-arcade text-xs tracking-wider uppercase font-bold">
            {isFinished
              ? iWon
                ? '★ 4-IN-A-ROW! YOU WON THIS BATTLE! ★'
                : iLost
                ? '💀 BRO CONNECTED 4! YOU WERE DEFEATED! 💀'
                : "⚔️ GRIDLOCK! IT'S A DRAW! ⚔️"
              : isMyTurn
              ? `★ YOUR TURN! DROP YOUR ${myColor} TOKEN ★`
              : `⏳ OPPONENT'S TURN (${opponentColor})... WATCH THE GRID`}
          </span>
        </div>
      </div>

      {/* Players Color Strip */}
      <div className="w-full max-w-xl flex items-center justify-between px-2 mb-1.5 font-mono text-xs font-bold">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-arcadeRed border-2 border-ink inline-block shadow-sm" />
          <span className={isNight ? 'text-slate-200' : 'text-stone-800'}>
            {playerA?.name || 'HOST'}: <span className="text-arcadeRed">RED</span>
          </span>
          {isRed && (
            <span className="px-1.5 py-0.5 bg-arcadeRed text-white text-[9px] rounded font-arcade">
              YOU
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isRed && (
            <span className="px-1.5 py-0.5 bg-cartridgeYellow text-darkNavy text-[9px] rounded font-arcade font-bold border border-ink">
              YOU
            </span>
          )}
          <span className={isNight ? 'text-slate-200' : 'text-stone-800'}>
            {playerB?.name || 'GUEST'}: <span className={`font-bold ${isNight ? 'text-cartridgeYellow' : 'text-amber-700'}`}>YELLOW</span>
          </span>
          <span className="w-3.5 h-3.5 rounded-full bg-cartridgeYellow border-2 border-ink inline-block shadow-sm" />
        </div>
      </div>

      {/* Main Connect Four Cabinet */}
      <div
        className={`p-2.5 sm:p-3.5 border-4 border-ink shadow-pixel relative rounded-lg ${
          isNight ? 'bg-[#142A63]' : 'bg-[#1C4EAA]'
        }`}
      >
        {/* Column Drop Buttons Header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-1.5 px-1">
          {Array.from({ length: 7 }).map((_, col) => {
            const isFull = gameState.board[0][col] !== null;
            const canClick = isMyTurn && !isFull && !isFinished;
            const isHovered = hoveredCol === col;

            return (
              <button
                key={col}
                type="button"
                onClick={() => handleColumnClick(col)}
                onMouseEnter={() => setHoveredCol(col)}
                onMouseLeave={() => setHoveredCol(null)}
                disabled={!canClick}
                title={isFull ? 'Column Full' : `Drop in Column ${col + 1}`}
                className={`h-7 sm:h-8 flex items-center justify-center font-arcade text-xs border-2 border-ink transition-all rounded ${
                  isFull
                    ? 'bg-slate-700/60 text-slate-400 border-slate-600 cursor-not-allowed'
                    : canClick
                    ? isHovered
                      ? isRed
                        ? 'bg-arcadeRed text-white scale-105 shadow-pixel animate-bounce'
                        : 'bg-cartridgeYellow text-darkNavy scale-105 shadow-pixel animate-bounce'
                      : 'bg-paper text-ink hover:bg-stone-200 shadow-sm'
                    : 'bg-paper/40 text-stone-400 opacity-60 cursor-default'
                }`}
              >
                {isFull ? '✕' : '▼'}
              </button>
            );
          })}
        </div>

        {/* 7x6 Slots Grid */}
        <div
          className="grid grid-cols-7 gap-1.5 sm:gap-2.5 bg-[#0A1D4A] p-2 sm:p-3 rounded border-2 border-black/40 shadow-inner"
          onMouseLeave={() => setHoveredCol(null)}
        >
          {gameState.board.map((rowArr, rowIdx) =>
            rowArr.map((cell, colIdx) => {
              const isWinning = isWinningCell(rowIdx, colIdx);
              const isColHovered = hoveredCol === colIdx && isMyTurn && !isFinished;

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  onClick={() => handleColumnClick(colIdx)}
                  onMouseEnter={() => setHoveredCol(colIdx)}
                  className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border-2 border-black/60 flex items-center justify-center relative transition-transform ${
                    isMyTurn && !isFinished ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    cell === null
                      ? isColHovered && rowIdx === 5 // highlight target base slightly
                        ? 'bg-[#06102B]'
                        : 'bg-[#050C22] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]'
                      : cell === 'RED'
                      ? 'bg-gradient-to-br from-[#FF6B6B] to-[#D32F2F] shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),2px_2px_4px_rgba(0,0,0,0.3)]'
                      : 'bg-gradient-to-br from-[#FFE066] to-[#E6B800] shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),2px_2px_4px_rgba(0,0,0,0.3)]'
                  } ${
                    isWinning
                      ? 'ring-4 ring-cartridgeYellow animate-pulse scale-105 z-10'
                      : ''
                  }`}
                >
                  {/* Winning star emblem */}
                  {isWinning && (
                    <span className="font-arcade text-xs sm:text-base text-white drop-shadow-md animate-spin">
                      ★
                    </span>
                  )}
                  {/* Subtle token inner bevel */}
                  {cell !== null && !isWinning && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white/30 pointer-events-none" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
