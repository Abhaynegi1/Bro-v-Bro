import React, { useEffect } from 'react';
import type { RoomState, TicTacToeState, TicTacToeMove, GameResult } from '@bvb/shared';
import confetti from 'canvas-confetti';
import { PixelCharacter } from '../pixel/PixelCharacter';
import { GamePixelIcon } from '../game-icons/GamePixelIcon';
import { soundFx } from '../../utils/audio';

interface TicTacToeGameProps {
  roomState: RoomState;
  gameState: TicTacToeState;
  myPlayerId: string;
  onSendMove: (move: TicTacToeMove) => void;
  onNextRound: () => void;
  onRematch: () => void;
  onLeaveRoom: () => void;
  lastResult?: GameResult | null;
  theme?: 'day' | 'night';
}

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({
  roomState,
  gameState,
  myPlayerId,
  onSendMove,
  onNextRound,
  onRematch,
  onLeaveRoom,
  lastResult,
  theme = 'day',
}) => {
  const isNight = theme === 'night';

  const { playerA, playerB } = roomState.players;
  const isHost = playerA?.id === myPlayerId;
  const isPlayerX = myPlayerId === gameState.playerXId;
  const mySymbol = isPlayerX ? 'X' : 'O';
  const opponentSymbol = isPlayerX ? 'O' : 'X';

  const isMyTurn = gameState.status === 'IN_PROGRESS' && gameState.currentTurnPlayerId === myPlayerId;
  const isFinished = gameState.status === 'WIN' || gameState.status === 'DRAW';
  const isMatchComplete = roomState.status === 'MATCH_COMPLETE';

  const iWon = gameState.status === 'WIN' && gameState.winnerPlayerId === myPlayerId;
  const iLost = gameState.status === 'WIN' && gameState.winnerPlayerId && gameState.winnerPlayerId !== myPlayerId;
  const isDraw = gameState.status === 'DRAW';

  // Trigger victory confetti
  useEffect(() => {
    if (iWon) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EF4444', '#3B82F6', '#FBBF24', '#10B981'],
      });
    }
  }, [iWon]);

  const handleCellClick = (cellIndex: number) => {
    if (!isMyTurn || gameState.board[cellIndex] !== null) return;
    soundFx.play('move');
    onSendMove({ cellIndex });
  };

  const currentMatch = roomState.currentMatch;
  const scoreHost = currentMatch?.scores.playerA ?? 0;
  const scoreGuest = currentMatch?.scores.playerB ?? 0;
  const targetWins = currentMatch?.seriesCondition.type === 'FIRST_TO_N'
    ? currentMatch.seriesCondition.targetPoints
    : 3;

  // Visual card styling
  const arcadeBox = isNight
    ? 'bg-[#142247] text-white border-2 border-[#4A68B1] shadow-[8px_8px_0px_#050A18]'
    : 'bg-[#0A0F1D] text-white border-3 border-black shadow-pixel-lg';

  return (
    <div className="flex-1 flex flex-col items-center justify-start sm:justify-center px-4 py-4 sm:py-6 max-w-2xl mx-auto w-full text-center select-none relative z-10">
      
      {/* ================= 1. MATCH SERIES SCOREBOARD ================= */}
      <div className={`w-full ${arcadeBox} p-3 sm:p-4 mb-4 sm:mb-6 relative`}>
        {/* Top Header: Series target & Round */}
        <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-2">
          <span className="font-arcade text-[10px] sm:text-xs text-cartridgeYellow uppercase tracking-widest font-bold flex items-center gap-1.5">
            <GamePixelIcon gameId="tic-tac-toe" size={18} className="flex-shrink-0" />
            <span>ROUND {currentMatch?.currentRoundNumber || 1} • TIC-TAC-TOE</span>
          </span>
          <span className="font-mono font-bold text-[10px] sm:text-xs text-white/80 tracking-wider">
            FIRST TO {targetWins} WINS
          </span>
        </div>

        {/* Live Score Strip */}
        <div className="flex items-center justify-between px-2 sm:px-6 py-1">
          {/* Host Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PixelCharacter type="bro1" size={36} pose={isMyTurn && isPlayerX ? 'ready' : 'idle'} />
            <div className="text-left">
              <div className="font-pixel text-[11px] sm:text-xs text-white flex items-center gap-1.5">
                <span>{playerA?.name || 'HOST'}</span>
                <span className="px-1.5 py-0.2 bg-arcadeRed text-white font-pixel text-[9px] font-bold">X</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: targetWins }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-black ${
                      idx < scoreHost ? 'bg-gameboyGreen' : 'bg-black/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* VS Divider with Current Score */}
          <div className="flex flex-col items-center">
            <div className="font-pixel text-xl sm:text-3xl text-cartridgeYellow tracking-widest drop-shadow-[2px_2px_0px_#000]">
              {scoreHost} - {scoreGuest}
            </div>
            <span className="text-[9px] font-arcade text-white/50 tracking-widest uppercase">SCORE</span>
          </div>

          {/* Guest Side */}
          <div className="flex items-center gap-2 sm:gap-3 flex-row-reverse text-right">
            <PixelCharacter type="bro2" size={36} pose={isMyTurn && !isPlayerX ? 'ready' : 'idle'} />
            <div className="text-right">
              <div className="font-pixel text-[11px] sm:text-xs text-white flex items-center justify-end gap-1.5">
                <span className="px-1.5 py-0.2 bg-crtCyan text-darkNavy font-pixel text-[9px] font-bold">O</span>
                <span>{playerB?.name || 'GUEST'}</span>
              </div>
              <div className="flex items-center justify-end gap-1 mt-1">
                {Array.from({ length: targetWins }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-black ${
                      idx < scoreGuest ? 'bg-gameboyGreen' : 'bg-black/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. TURN ANNOUNCEMENT BANNER ================= */}
      <div
        className={`w-full py-2.5 px-4 mb-4 sm:mb-6 border-2 transition-all ${
          isFinished
            ? 'bg-[#10B981] text-white border-black shadow-pixel-sm'
            : isMyTurn
            ? 'bg-cartridgeYellow text-darkNavy border-black animate-pulse shadow-pixel-sm'
            : isNight
            ? 'bg-[#142247] text-white/80 border-[#4A68B1]'
            : 'bg-[#0A0F1D] text-white/80 border-black'
        }`}
      >
        <span className="font-pixel text-xs sm:text-sm tracking-wider uppercase font-bold">
          {isFinished
            ? iWon
              ? '★ YOU WON THIS ROUND! ★'
              : iLost
              ? '💀 BRO OUTPLAYED YOU! 💀'
              : "⚔️ IT'S A CAT'S GAME (DRAW)! ⚔️"
            : isMyTurn
            ? `★ YOUR TURN! DROP YOUR ${mySymbol} ★`
            : `⏳ BRO'S TURN (${opponentSymbol})... WATCH CLOSELY`}
        </span>
      </div>

      {/* ================= 3. RETRO 3x3 TIC TAC TOE BOARD ================= */}
      <div
        className={`p-4 sm:p-6 ${
          isNight
            ? 'bg-[#0C152E] border-3 border-[#4A68B1] shadow-[8px_8px_0px_#050A18]'
            : 'bg-[#0A0F1D] border-3 border-black shadow-pixel-lg'
        } relative inline-block`}
      >
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 bg-black p-2.5 sm:p-3.5 border-2 border-white/20">
          {gameState.board.map((cell, idx) => {
            const isWinningCell = gameState.winningLine?.includes(idx);
            const isHoverable = isMyTurn && cell === null && !isFinished;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCellClick(idx)}
                disabled={!isMyTurn || cell !== null || isFinished}
                className={`w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center font-pixel text-3xl sm:text-5xl transition-all relative ${
                  isWinningCell
                    ? 'bg-cartridgeYellow text-black border-2 border-black animate-bounce shadow-pixel'
                    : isNight
                    ? 'bg-[#15234A] text-white border-2 border-[#384E88]'
                    : 'bg-[#1E293B] text-white border-2 border-black'
                } ${
                  isHoverable
                    ? 'hover:bg-[#253966] hover:scale-105 active:scale-95 cursor-pointer shadow-pixel-sm'
                    : cell === null
                    ? 'cursor-default'
                    : 'cursor-not-allowed'
                }`}
              >
                {cell === 'X' && (
                  <span className="text-arcadeRed drop-shadow-[2px_2px_0px_#000000] scale-110">
                    X
                  </span>
                )}
                {cell === 'O' && (
                  <span className="text-crtCyan drop-shadow-[2px_2px_0px_#000000] scale-110">
                    O
                  </span>
                )}
                {cell === null && isHoverable && (
                  <span className="opacity-0 hover:opacity-25 text-white/50 text-2xl font-pixel">
                    {mySymbol}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 4. ROUND FINISHED OVERLAY / CONTROLS ================= */}
      {isFinished && (
        <div className={`w-full mt-5 p-4 sm:p-6 ${arcadeBox} animate-pixel-idle`}>
          <div className="font-arcade text-xs text-cartridgeYellow tracking-widest uppercase mb-1">
            {isMatchComplete ? '★ MATCH SERIES COMPLETE ★' : 'ROUND RESULT'}
          </div>

          <h3 className="font-pixel text-base sm:text-xl text-white uppercase mb-3">
            {isMatchComplete ? (
              roomState.currentMatch?.seriesWinnerId === myPlayerId ? (
                <span className="text-gameboyGreen font-bold">🏆 YOU ARE THE UNDISPUTED CHAMPION! 🏆</span>
              ) : (
                <span className="text-arcadeRed font-bold">💀 YOUR BRO WON THE 30-DAY TITLE! 💀</span>
              )
            ) : iWon ? (
              <span className="text-gameboyGreen">+1 POINT! ROUND WON!</span>
            ) : iLost ? (
              <span className="text-arcadeRed">ROUND LOST TO YOUR BRO!</span>
            ) : (
              <span className="text-cartridgeYellow">DRAW — NO POINTS AWARDED</span>
            )}
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4">
            {isMatchComplete ? (
              isHost ? (
                <button
                  type="button"
                  onClick={onRematch}
                  className="px-6 py-3 bg-gameboyGreen hover:bg-[#4E932E] text-darkNavy border-2 border-black font-pixel text-xs sm:text-sm uppercase tracking-wider shadow-pixel-sm hover:scale-105 active:scale-95 font-bold"
                >
                  START REMATCH SERIES
                </button>
              ) : (
                <div className="font-arcade text-xs text-white/80 py-2">
                  WAITING FOR HOST TO TRIGGER REMATCH...
                </div>
              )
            ) : isHost ? (
              <button
                type="button"
                onClick={onNextRound}
                className="px-6 py-3 bg-gameboyGreen hover:bg-[#4E932E] text-darkNavy border-2 border-black font-pixel text-xs sm:text-sm uppercase tracking-wider shadow-pixel-sm hover:scale-105 active:scale-95 font-bold"
              >
                NEXT ROUND ►
              </button>
            ) : (
              <div className="font-arcade text-xs text-white/80 py-2">
                WAITING FOR HOST TO START NEXT ROUND...
              </div>
            )}

            <button
              type="button"
              onClick={onLeaveRoom}
              className="px-5 py-3 bg-arcadeRed hover:bg-[#D32F2F] text-white border-2 border-black font-pixel text-xs sm:text-sm uppercase tracking-wider shadow-pixel-sm hover:scale-105 active:scale-95 font-bold"
            >
              ✕ EXIT ROOM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
