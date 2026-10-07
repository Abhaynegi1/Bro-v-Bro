import React, { useState, useEffect, useRef } from 'react';
import type { DisconnectPauseState } from '@bvb/shared';
import { soundFx } from '../utils/audio';

interface DisconnectPauseOverlayProps {
  disconnectPause: DisconnectPauseState | null;
  myPlayerId: string;
  theme?: 'day' | 'night';
}

export const DisconnectPauseOverlay: React.FC<DisconnectPauseOverlayProps> = ({
  disconnectPause,
  myPlayerId,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const playedSoundRef = useRef<boolean>(false);

  useEffect(() => {
    if (disconnectPause) {
      if (!playedSoundRef.current) {
        soundFx.play('disconnect');
        playedSoundRef.current = true;
      }

      const updateRemaining = () => {
        const remainingMs = Math.max(0, disconnectPause.expiresAt - Date.now());
        setSecondsRemaining(Math.ceil(remainingMs / 1000));
      };

      updateRemaining();
      const interval = setInterval(updateRemaining, 250);
      return () => clearInterval(interval);
    } else {
      if (playedSoundRef.current) {
        soundFx.play('reconnect');
        playedSoundRef.current = false;
      }
    }
  }, [disconnectPause]);

  if (!disconnectPause) return null;

  const isMeDisconnected = disconnectPause.disconnectedPlayerId === myPlayerId;
  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / 30) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div
        className={`w-full max-w-md p-6 sm:p-8 border-4 border-ink shadow-pixel text-center transition-colors relative overflow-hidden ${
          isNight ? 'bg-[#18243A] text-paper' : 'bg-[#FFFDF5] text-ink'
        }`}
      >
        {/* Animated Warning Stripe Header */}
        <div className="h-3 w-full bg-repeating-linear-gradient -mx-8 -mt-8 mb-6 border-b-2 border-ink bg-amber-400" />

        {/* Warning Icon & Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-arcadeRed text-white font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel mb-4 font-bold animate-pulse">
          <span>⚠️</span>
          <span>MATCH PAUSED</span>
          <span>⚠️</span>
        </div>

        {/* Headline */}
        <h2 className="font-arcade text-lg sm:text-xl font-bold tracking-wider mb-2 text-arcadeRed">
          {isMeDisconnected
            ? 'YOU ARE DISCONNECTED!'
            : `${disconnectPause.disconnectedPlayerName.toUpperCase()} DISCONNECTED!`}
        </h2>

        {/* Explanatory Details */}
        <p className="font-mono text-xs sm:text-sm opacity-90 leading-relaxed mb-6">
          {isMeDisconnected
            ? 'We are attempting to reconnect you to the arena session. Please hold on!'
            : `Game state is frozen. Waiting for ${disconnectPause.disconnectedPlayerName} to restore connection.`}
        </p>

        {/* Big Countdown Timer */}
        <div className="my-4 flex flex-col items-center justify-center">
          <div
            className={`font-arcade text-4xl sm:text-5xl font-bold px-6 py-2 border-3 border-ink shadow-pixel tracking-widest ${
              secondsRemaining <= 10
                ? 'bg-arcadeRed text-white animate-bounce'
                : isNight
                ? 'bg-ink text-cartridgeYellow'
                : 'bg-paper text-ink'
            }`}
          >
            {secondsRemaining}s
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider font-bold mt-2 opacity-75">
            RECONNECT GRACE PERIOD
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-300 dark:bg-slate-700 h-3 border-2 border-ink overflow-hidden my-4 relative">
          <div
            className={`h-full transition-all duration-300 ${
              secondsRemaining <= 10 ? 'bg-arcadeRed' : 'bg-cartridgeYellow'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Forfeit notice */}
        <p className="font-mono text-[11px] opacity-80 italic mt-3">
          {isMeDisconnected
            ? 'If you do not reconnect before 0s, you will forfeit this match.'
            : 'If your opponent does not return within 30 seconds, you will be awarded the victory by forfeit.'}
        </p>
      </div>
    </div>
  );
};
