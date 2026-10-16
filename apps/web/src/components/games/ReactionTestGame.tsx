import React, { useState, useEffect, useRef } from 'react';
import type { RoomState, ReactionTestState, ReactionTestMove } from '@bvb/shared';
import confetti from 'canvas-confetti';
import { GamePixelIcon } from '../game-icons/GamePixelIcon';
import { soundFx } from '../../utils/audio';

interface ReactionTestGameProps {
  roomState: RoomState;
  gameState: ReactionTestState;
  myPlayerId: string;
  onSendMove: (move: ReactionTestMove) => void;
  theme?: 'day' | 'night';
}

export const ReactionTestGame: React.FC<ReactionTestGameProps> = ({
  roomState,
  gameState,
  myPlayerId,
  onSendMove,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const [isGreen, setIsGreen] = useState(false);
  const [localClicked, setLocalClicked] = useState(false);
  const timerRef = useRef<number | null>(null);

  const { playerA, playerB } = roomState.players;
  const isPlayerA = myPlayerId === playerA?.id;
  const opponent = isPlayerA ? playerB : playerA;

  const myResult = gameState.playerResults[myPlayerId];
  const opponentId = isPlayerA ? playerB?.id : playerA?.id;
  const opponentResult = opponentId ? gameState.playerResults[opponentId] : null;

  const isFinished = gameState.status === 'FINISHED' || Boolean(gameState.winnerPlayerId);
  const iWon = gameState.winnerPlayerId === myPlayerId;
  const iLost = isFinished && gameState.winnerPlayerId && gameState.winnerPlayerId !== myPlayerId;

  // Track green trigger time
  useEffect(() => {
    const checkTrigger = () => {
      const now = Date.now();
      if (now >= gameState.triggerAt) {
        setIsGreen(true);
        soundFx.play('countdownGo');
      } else {
        const remaining = gameState.triggerAt - now;
        timerRef.current = window.setTimeout(() => {
          setIsGreen(true);
          soundFx.play('countdownGo');
        }, remaining);
      }
    };

    checkTrigger();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState.triggerAt]);

  // Victory Confetti
  useEffect(() => {
    if (iWon) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#FBBF24', '#3B82F6', '#EF4444'],
      });
    }
  }, [iWon]);

  const handleClick = () => {
    if (isFinished || localClicked || (myResult && myResult.reactionMs !== null)) return;
    setLocalClicked(true);
    soundFx.play('click');
    onSendMove({ action: 'CLICK' });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-2.5 sm:p-4 max-w-4xl mx-auto w-full select-none">
      {/* Game Title & Rule */}
      <div className="text-center mb-2.5 sm:mb-4">
        <h2 className={`font-arcade text-base sm:text-2xl tracking-wider font-bold drop-shadow-pixel flex items-center justify-center gap-2 sm:gap-2.5 ${isNight ? 'text-cartridgeYellow' : 'text-ink'}`}>
          <GamePixelIcon gameId="reaction-test" size={22} className="flex-shrink-0" />
          <span>REFLEX DUEL</span>
          <GamePixelIcon gameId="reaction-test" size={22} className="flex-shrink-0" />
        </h2>
        <p className={`font-mono text-[11px] sm:text-sm mt-0.5 sm:mt-1 ${isNight ? 'text-slate-300' : 'text-stone-700'}`}>
          {isGreen
            ? '🔥 GREEN! TAP AS FAST AS YOU CAN!'
            : '⚠️ DO NOT TAP YET! Wait for the screen to turn GREEN...'}
        </p>
      </div>

      {/* Main Reflex Interactive Cabinet / Canvas */}
      <div
        onClick={handleClick}
        className={`w-full max-w-2xl h-64 xs:h-72 sm:h-96 rounded-lg border-3 sm:border-4 border-ink shadow-pixel flex flex-col items-center justify-center cursor-pointer transition-all duration-150 relative overflow-hidden ${
          isFinished
            ? iWon
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-900 text-white'
            : isGreen
            ? 'bg-emerald-500 text-white animate-pulse'
            : isNight
            ? 'bg-red-950 text-paper'
            : 'bg-red-100 text-ink'
        }`}
      >
        {/* Subtle Scanlines Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
            backgroundSize: '100% 4px',
          }}
        />

        {/* Center Display State */}
        <div className="relative z-10 flex flex-col items-center p-4 sm:p-6 text-center">
          {isFinished ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="text-4xl sm:text-6xl animate-bounce">
                {iWon ? '🏆' : '💀'}
              </div>
              <h3 className="font-arcade text-lg sm:text-3xl font-bold tracking-wider">
                {iWon ? 'QUICKDRAW VICTORY!' : 'YOU GOT OUTDRAWN!'}
              </h3>
              <p className="font-mono text-xs sm:text-base font-bold">
                {gameState.summary || (iWon ? 'Faster reflex time!' : 'Better luck next time!')}
              </p>

              {/* Stats Breakdown */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 p-2 sm:p-3 bg-black/40 border-2 border-white/20 rounded font-mono text-xs sm:text-sm">
                <div>
                  <span className="opacity-75 block text-[9px] sm:text-[10px] uppercase font-bold">YOU:</span>
                  <span className="font-arcade text-cartridgeYellow text-xs sm:text-sm">
                    {myResult?.earlyClick
                      ? 'FALSE START'
                      : myResult?.reactionMs !== null && myResult?.reactionMs !== undefined
                      ? `${myResult.reactionMs}ms`
                      : 'NO CLICK'}
                  </span>
                </div>
                <div className="border-l border-white/30 h-6 sm:h-8" />
                <div>
                  <span className="opacity-75 block text-[9px] sm:text-[10px] uppercase font-bold">
                    {opponent?.name || 'OPPONENT'}:
                  </span>
                  <span className="font-arcade text-cartridgeYellow text-xs sm:text-sm">
                    {opponentResult?.earlyClick
                      ? 'FALSE START'
                      : opponentResult?.reactionMs !== null && opponentResult?.reactionMs !== undefined
                      ? `${opponentResult.reactionMs}ms`
                      : 'NO CLICK'}
                  </span>
                </div>
              </div>
            </div>
          ) : isGreen ? (
            <div className="space-y-2 sm:space-y-4">
              <div className="text-5xl sm:text-7xl animate-ping">⚡</div>
              <h3 className="font-arcade text-xl sm:text-4xl font-bold tracking-widest text-white drop-shadow-md">
                TAP NOW!!
              </h3>
              <p className="font-arcade text-[10px] sm:text-xs tracking-wider text-yellow-200">
                HIT ANYWHERE ON THE SCREEN!
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-4">
              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full border-3 sm:border-4 border-ink shadow-pixel bg-arcadeRed mx-auto animate-pulse flex items-center justify-center">
                <span className="text-xl sm:text-2xl text-white">✋</span>
              </div>
              <h3 className="font-arcade text-base sm:text-3xl font-bold tracking-widest">
                WAIT FOR GREEN...
              </h3>
              <p className="font-mono text-[10px] sm:text-xs opacity-75">
                (Tapping before green triggers a False Start!)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
