import React, { useState } from 'react';
import type { RoomState } from '@bvb/shared';
import { PixelCharacter } from './pixel/PixelCharacter';
import { PixelButton } from './pixel/PixelButton';
import confetti from 'canvas-confetti';

interface WaitingRoomViewProps {
  roomState: RoomState;
  myPlayerId: string;
  onToggleReady: () => void;
  onLeaveRoom: () => void;
  onStartMatch: () => void;
  theme?: 'day' | 'night';
}

export const WaitingRoomView: React.FC<WaitingRoomViewProps> = ({
  roomState,
  myPlayerId,
  onToggleReady,
  onLeaveRoom,
  onStartMatch,
  theme = 'day',
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isNight = theme === 'night';
  const { playerA, playerB } = roomState.players;
  const isHost = playerA?.id === myPlayerId;
  const myPlayer = isHost ? playerA : playerB;
  const bothConnected = !!(playerA?.isConnected && playerB?.isConnected);
  const bothReady = !!(playerA?.isReady && playerB?.isReady);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomState.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?code=${roomState.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStart = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#E84B4B', '#42B8C7', '#F4D35E', '#69B85A'],
    });
    onStartMatch();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 max-w-2xl mx-auto w-full text-center select-none relative z-10">
      {/* Background Floating Clouds (Day Mode) */}
      {!isNight && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div
            className="absolute top-[8%] left-[-15%] opacity-85"
            style={{ animation: 'cloud-float 55s linear infinite' }}
          >
            <svg width="170" height="65" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
              <path
                d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z M 14 0 h 4 v 2 h -4 z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
          <div
            className="absolute top-[65%] right-[-10%] opacity-80"
            style={{ animation: 'cloud-float 65s linear infinite', animationDelay: '-25s' }}
          >
            <svg width="140" height="54" viewBox="0 0 28 11" style={{ shapeRendering: 'crispEdges' }}>
              <path
                d="M 6 4 h 16 v 1 h 4 v 1 h 2 v 4 h -26 v -4 h 2 v -1 h 2 v -1 z M 10 2 h 8 v 2 h -8 z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Background Twinkling Stars (Night Mode) */}
      {isNight && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {[
            { top: '10%', left: '8%', delay: '0s', size: 3 },
            { top: '22%', left: '88%', delay: '0.7s', size: 4 },
            { top: '70%', left: '5%', delay: '1.2s', size: 4 },
            { top: '80%', left: '92%', delay: '0.4s', size: 3 },
          ].map((star, i) => (
            <div
              key={i}
              className="absolute bg-white animate-pulse"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
                boxShadow: '0 0 3px #FFFFFF',
              }}
            />
          ))}
          <div className="absolute top-[15%] left-[90%] text-cartridgeYellow text-[14px] font-pixel animate-pulse">★</div>
          <div className="absolute top-[75%] left-[8%] text-white text-[12px] font-pixel animate-pulse">✦</div>
        </div>
      )}

      {/* Lobby Header & Room Cartridge */}
      <div
        className={`w-full ${
          isNight
            ? 'bg-[#142247] border-2 border-[#4A68B1] shadow-[8px_8px_0px_#050A18]'
            : 'bg-[#0A0F1D] border-3 border-black shadow-pixel-lg'
        } text-white p-5 sm:p-6 mb-6 relative`}
      >
        <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
          <span className="font-arcade text-xs text-cartridgeYellow tracking-widest uppercase font-bold">
            ARCADE LOBBY
          </span>
          <span className="font-mono font-bold text-xs text-white/90 tracking-wider">
            {roomState.currentMatch?.seriesCondition.type === 'FIRST_TO_N'
              ? `SERIES: FIRST TO ${roomState.currentMatch.seriesCondition.targetPoints}`
              : 'SERIES: MATCH PLAY'}
          </span>
        </div>

        {/* Large Retro Room Code */}
        <div className="my-2">
          <div className="font-arcade text-[10px] text-white/70 uppercase mb-1">
            ROOM CODE
          </div>
          <div className="font-pixel text-4xl sm:text-6xl text-white tracking-widest py-1 drop-shadow-[3px_3px_0px_#000000]">
            {roomState.code}
          </div>
        </div>

        {/* Quick Action Buttons for Code / Link */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
          <PixelButton
            variant="cream"
            size="sm"
            onClick={handleCopyCode}
          >
            {copiedCode ? '✓ CODE COPIED!' : 'COPY CODE'}
          </PixelButton>

          <PixelButton
            variant="cream"
            size="sm"
            onClick={handleCopyLink}
          >
            {copiedLink ? '✓ LINK COPIED!' : 'COPY INVITE LINK'}
          </PixelButton>
        </div>
      </div>

      {/* Head-to-Head Retro Stage (Cream cards with Dark Ink borders) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 relative">
        {/* VS Pixel Badge in Center */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-darkNavy border-2 border-arcadeRed items-center justify-center font-pixel text-xs text-arcadeRed shadow-pixel">
          VS
        </div>

        {/* ================= STAGE 1: BRO 01 (HOST) ================= */}
        <div className="bg-[#FFFDF5] border-3 border-ink p-5 shadow-pixel flex flex-col items-center justify-between min-h-[230px]">
          <div className="w-full flex items-center justify-between border-b-2 border-ink/10 pb-1.5 mb-2">
            <span className="font-arcade text-xs text-darkNavy tracking-wider font-bold">
              {playerA?.id === myPlayerId ? '★ YOU (HOST)' : 'HOST'}
            </span>
            <span className={`font-pixel text-[9px] px-2 py-0.5 border-2 ${
              playerA?.isReady
                ? 'bg-gameboyGreen text-ink border-ink font-bold'
                : 'bg-paper text-ink/60 border-ink/40'
            }`}>
              {playerA?.isReady ? 'READY' : 'WAITING'}
            </span>
          </div>

          <div className="my-2 flex flex-col items-center">
            <PixelCharacter
              type="bro1"
              size={85}
              pose={playerA?.isReady ? 'ready' : 'idle'}
            />
            <div className="font-mono font-bold text-lg text-ink mt-3 uppercase tracking-wide">
              {playerA?.name || 'BRO 01'}
            </div>
            <div className="text-xs font-mono font-bold text-ink/60 mt-0.5">
              {playerA?.isConnected ? '● CONNECTED' : '○ OFFLINE'}
            </div>
          </div>

          <div className="w-full text-center text-[10px] font-arcade text-ink/40 border-t border-ink/10 pt-1">
            PLAYER 01
          </div>
        </div>

        {/* ================= STAGE 2: BRO 02 (GUEST) ================= */}
        <div className="bg-[#FFFDF5] border-3 border-ink p-5 shadow-pixel flex flex-col items-center justify-between min-h-[230px]">
          <div className="w-full flex items-center justify-between border-b-2 border-ink/10 pb-1.5 mb-2">
            <span className="font-arcade text-xs text-arcadeRed tracking-wider font-bold">
              {playerB?.id === myPlayerId ? '★ YOU (CHALLENGER)' : 'CHALLENGER'}
            </span>
            {playerB && (
              <span className={`font-pixel text-[9px] px-2 py-0.5 border-2 ${
                playerB.isReady
                  ? 'bg-gameboyGreen text-ink border-ink font-bold'
                  : 'bg-paper text-ink/60 border-ink/40'
              }`}>
                {playerB.isReady ? 'READY' : 'WAITING'}
              </span>
            )}
          </div>

          {playerB ? (
            <div className="my-2 flex flex-col items-center">
              <PixelCharacter
                type="bro2"
                size={85}
                pose={playerB.isReady ? 'ready' : 'idle'}
              />
              <div className="font-mono font-bold text-lg text-ink mt-3 uppercase tracking-wide">
                {playerB.name}
              </div>
              <div className="text-xs font-mono font-bold text-ink/60 mt-0.5">
                {playerB.isConnected ? '● CONNECTED' : '○ OFFLINE'}
              </div>
            </div>
          ) : (
            /* Missing Bro State */
            <div className="my-4 flex flex-col items-center justify-center flex-1">
              <div className="w-12 h-16 border-2 border-dashed border-ink/40 flex items-center justify-center font-pixel text-xl text-ink/30 animate-pulse mb-3">
                ?
              </div>
              <div className="font-arcade text-xs text-arcadeRed tracking-wider font-bold">
                YOUR BRO IS MISSING.
              </div>
              <div className="font-mono text-xs font-bold text-ink/60 mt-1 max-w-[200px]">
                SHARE CODE {roomState.code} TO SUMMON HIM.
              </div>
            </div>
          )}

          <div className="w-full text-center text-[10px] font-arcade text-ink/40 border-t border-ink/10 pt-1">
            PLAYER 02
          </div>
        </div>
      </div>

      {/* Status Announcement Banner */}
      <div
        className={`w-full ${
          isNight
            ? 'bg-[#142247] text-white border-2 border-[#4A68B1] shadow-[4px_4px_0px_#050A18]'
            : 'bg-[#0A0F1D] text-white border-2 border-black shadow-pixel-sm'
        } px-4 py-3 mb-6 text-center`}
      >
        <span className="font-arcade text-xs tracking-wider font-bold">
          {!playerB
            ? 'WAITING FOR YOUR BRO...'
            : !bothReady
            ? 'WAITING FOR BOTH BROS TO READY UP...'
            : 'BOTH BROS READY. INSERT MATCH.'}
        </span>
      </div>

      {/* Action Controls */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Ready Toggle */}
        <PixelButton
          variant={myPlayer?.isReady ? 'yellow' : 'navy'}
          size="lg"
          onClick={onToggleReady}
          className="w-full sm:w-auto min-w-[200px]"
        >
          {myPlayer?.isReady ? '✓ READY!' : 'READY UP'}
        </PixelButton>

        {/* Start Game (Host only) */}
        {isHost ? (
          <PixelButton
            variant="red"
            size="lg"
            disabled={!bothConnected || !bothReady}
            onClick={handleStart}
            className="w-full sm:w-auto min-w-[200px]"
          >
            START MATCH
          </PixelButton>
        ) : (
          <div className="font-arcade text-xs text-ink/70 border-2 border-ink px-4 py-3 bg-[#FFFDF5] shadow-pixel-sm">
            WAITING FOR HOST TO START...
          </div>
        )}
      </div>

      {/* Prominent High-Visibility Leave Room Button */}
      <button
        type="button"
        onClick={onLeaveRoom}
        className="mt-6 px-6 py-2.5 bg-arcadeRed/90 hover:bg-arcadeRed text-white border-2 border-black font-pixel text-xs uppercase tracking-wider shadow-pixel transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        title="Leave Room & Return to Arena"
      >
        <span>✕</span>
        <span>LEAVE ROOM & RETURN TO ARENA</span>
      </button>
    </div>
  );
};
