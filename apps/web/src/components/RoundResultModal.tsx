import React from 'react';
import type { RoomState, GameResult } from '@bvb/shared';
import { PixelCharacter } from './pixel/PixelCharacter';

interface RoundResultModalProps {
  roomState: RoomState;
  myPlayerId: string;
  onNextRound: () => void;
  lastResult?: GameResult | null;
  theme?: 'day' | 'night';
}

export const RoundResultModal: React.FC<RoundResultModalProps> = ({
  roomState,
  myPlayerId,
  onNextRound,
  lastResult,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const match = roomState.currentMatch;
  const playerA = roomState.players.playerA;
  const playerB = roomState.players.playerB;

  const currentRound = match?.currentRoundNumber ?? 1;
  const winnerPlayerId = lastResult?.winnerPlayerId;
  const isDraw = lastResult?.result === 'DRAW';

  const winner = playerA?.id === winnerPlayerId ? playerA : playerB?.id === winnerPlayerId ? playerB : null;
  const iWon = winnerPlayerId === myPlayerId;
  const nextPickerId = roomState.selectingPlayerId || match?.nextPickerPlayerId;
  const nextPicker = playerA?.id === nextPickerId ? playerA : playerB;

  const scoreA = match?.scores.playerA ?? 0;
  const scoreB = match?.scores.playerB ?? 0;
  const targetWins = match?.seriesCondition.type === 'FIRST_TO_N' ? match.seriesCondition.targetPoints : 3;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div
        className={`w-full max-w-lg p-6 sm:p-8 border-4 border-ink shadow-pixel text-center transition-colors ${
          isNight ? 'bg-[#18243A] text-paper' : 'bg-[#FFFDF5] text-ink'
        }`}
      >
        {/* Round Badge */}
        <div className="inline-block px-3 py-1 bg-ink text-cartridgeYellow font-arcade text-xs tracking-wider border-2 border-ink mb-4 font-bold">
          ★ ROUND {currentRound} CONCLUDED ★
        </div>

        {/* Winner Hero Display */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="relative mb-2">
            <PixelCharacter
              type={winner?.id === playerA?.id ? 'bro1' : 'bro2'}
              pose={isDraw ? 'idle' : 'celebrating'}
              size={64}
              className="drop-shadow-pixel"
            />
          </div>

          <h2 className="font-arcade text-xl sm:text-2xl font-bold tracking-wider mt-2">
            {isDraw
              ? 'STALEMATE! ROUND DRAWN!'
              : iWon
              ? 'YOU WON THIS ROUND!'
              : `${winner?.name.toUpperCase()} TOOK THE ROUND!`}
          </h2>

          <p className="font-mono text-xs sm:text-sm mt-1.5 opacity-80">
            {lastResult?.summary || (isDraw ? 'No points awarded.' : '1 point awarded to the winner.')}
          </p>
        </div>

        {/* Live Match Scoreboard Snapshot */}
        <div
          className={`my-5 p-4 border-2 border-ink shadow-pixel flex items-center justify-around ${
            isNight ? 'bg-slate-900/80' : 'bg-paper'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="font-arcade text-xs text-cartridgeYellow font-bold truncate max-w-[120px]">
              {playerA?.name || 'PLAYER 1'}
            </span>
            <span className="font-arcade text-2xl sm:text-3xl text-ink dark:text-paper font-bold mt-1">
              {scoreA}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-arcade text-xs text-arcadeRed font-bold">VS</span>
            <span className="font-mono text-[9px] uppercase font-bold tracking-wider opacity-60">
              FIRST TO {targetWins}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-arcade text-xs text-crtCyan font-bold truncate max-w-[120px]">
              {playerB?.name || 'PLAYER 2'}
            </span>
            <span className="font-arcade text-2xl sm:text-3xl text-ink dark:text-paper font-bold mt-1">
              {scoreB}
            </span>
          </div>
        </div>

        {/* Next Battle Picker Callout */}
        <div
          className={`p-3 border-2 border-dashed border-ink/40 text-xs font-mono mb-6 ${
            isNight ? 'bg-slate-800/60 text-slate-300' : 'bg-amber-50 text-stone-700'
          }`}
        >
          <span className="font-bold text-cartridgeYellow">NEXT GAME SELECTION: </span>
          {nextPicker ? (
            nextPicker.id === myPlayerId ? (
              <span className="font-bold text-arcadeRed">YOU get to pick the next battle!</span>
            ) : (
              <span>{nextPicker.name} will choose the next battle.</span>
            )
          ) : (
            <span>Players will select the next battle.</span>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={onNextRound}
          className="w-full py-3.5 px-6 bg-arcadeRed text-white font-arcade text-xs sm:text-sm tracking-widest border-2 border-ink shadow-pixel hover:bg-red-600 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold"
        >
          CONTINUE TO GAME SELECTION ➔
        </button>
      </div>
    </div>
  );
};
