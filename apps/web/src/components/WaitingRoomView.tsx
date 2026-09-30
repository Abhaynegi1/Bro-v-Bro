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
}

export const WaitingRoomView: React.FC<WaitingRoomViewProps> = ({
  roomState,
  myPlayerId,
  onToggleReady,
  onLeaveRoom,
  onStartMatch,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
      particleCount: 60,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#E84A4A', '#49B8D1', '#F4D35E', '#67B85A'],
    });
    onStartMatch();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full text-center select-none">
      {/* Lobby Header & Room Cartridge */}
      <div className="w-full bg-[#151C30] border-2 border-paper p-5 shadow-pixel-light mb-6 relative">
        <div className="flex items-center justify-between border-b border-paper/30 pb-2 mb-3">
          <span className="font-arcade text-[10px] text-cartridgeYellow tracking-widest uppercase">
            ARCADE LOBBY
          </span>
          <span className="font-arcade text-[10px] text-paper/70 tracking-wider">
            {roomState.currentMatch?.seriesCondition.type === 'FIRST_TO_N'
              ? `SERIES: FIRST TO ${roomState.currentMatch.seriesCondition.targetPoints}`
              : 'SERIES: MATCH PLAY'}
          </span>
        </div>

        {/* Large Retro Room Code */}
        <div className="my-2">
          <div className="font-arcade text-[9px] text-paper/60 uppercase mb-1">
            BRO ROOM CODE
          </div>
          <div className="font-pixel text-3xl sm:text-5xl text-paper tracking-widest py-1 drop-shadow-[2px_2px_0px_#111522]">
            {roomState.code}
          </div>
        </div>

        {/* Quick Action Buttons for Code / Link */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
          <PixelButton
            variant="paper"
            size="sm"
            onClick={handleCopyCode}
          >
            {copiedCode ? '✓ CODE COPIED!' : 'COPY CODE'}
          </PixelButton>

          <PixelButton
            variant="navy"
            size="sm"
            onClick={handleCopyLink}
          >
            {copiedLink ? '✓ LINK COPIED!' : 'COPY INVITE LINK'}
          </PixelButton>
        </div>
      </div>

      {/* Head-to-Head Retro Stage */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative">
        {/* VS Pixel Badge in Center */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-ink border-2 border-arcadeRed items-center justify-center font-pixel text-xs text-arcadeRed shadow-pixel">
          VS
        </div>

        {/* ================= STAGE 1: BRO 01 (HOST) ================= */}
        <div className="bg-[#151C30] border-2 border-crtCyan p-5 shadow-pixel flex flex-col items-center justify-between min-h-[220px]">
          <div className="w-full flex items-center justify-between border-b border-paper/20 pb-1 mb-2">
            <span className="font-arcade text-[9px] text-crtCyan tracking-wider">
              {playerA?.id === myPlayerId ? '★ YOU (HOST)' : 'HOST'}
            </span>
            <span className={`font-pixel text-[9px] px-1.5 py-0.5 border ${
              playerA?.isReady
                ? 'bg-gameboyGreen text-ink border-ink font-bold'
                : 'bg-ink text-paper/50 border-paper/30'
            }`}>
              {playerA?.isReady ? 'READY' : 'WAITING'}
            </span>
          </div>

          <div className="my-2 flex flex-col items-center">
            <PixelCharacter
              type="bro1"
              size={80}
              pose={playerA?.isReady ? 'ready' : 'idle'}
            />
            <div className="font-pixel text-sm text-paper mt-3 uppercase tracking-wide">
              {playerA?.name || 'BRO 01'}
            </div>
            <div className="text-[10px] font-mono text-paper/60 mt-0.5">
              {playerA?.isConnected ? '● CONNECTED' : '○ OFFLINE'}
            </div>
          </div>

          <div className="w-full text-center text-[9px] font-arcade text-paper/40 border-t border-paper/10 pt-1">
            PLAYER 01
          </div>
        </div>

        {/* ================= STAGE 2: BRO 02 (GUEST) ================= */}
        <div className="bg-[#151C30] border-2 border-arcadeRed p-5 shadow-pixel flex flex-col items-center justify-between min-h-[220px]">
          <div className="w-full flex items-center justify-between border-b border-paper/20 pb-1 mb-2">
            <span className="font-arcade text-[9px] text-arcadeRed tracking-wider">
              {playerB?.id === myPlayerId ? '★ YOU (CHALLENGER)' : 'CHALLENGER'}
            </span>
            {playerB && (
              <span className={`font-pixel text-[9px] px-1.5 py-0.5 border ${
                playerB.isReady
                  ? 'bg-gameboyGreen text-ink border-ink font-bold'
                  : 'bg-ink text-paper/50 border-paper/30'
              }`}>
                {playerB.isReady ? 'READY' : 'WAITING'}
              </span>
            )}
          </div>

          {playerB ? (
            <div className="my-2 flex flex-col items-center">
              <PixelCharacter
                type="bro2"
                size={80}
                pose={playerB.isReady ? 'ready' : 'idle'}
              />
              <div className="font-pixel text-sm text-paper mt-3 uppercase tracking-wide">
                {playerB.name}
              </div>
              <div className="text-[10px] font-mono text-paper/60 mt-0.5">
                {playerB.isConnected ? '● CONNECTED' : '○ OFFLINE'}
              </div>
            </div>
          ) : (
            /* Missing Bro State */
            <div className="my-4 flex flex-col items-center justify-center flex-1">
              <div className="w-12 h-16 border-2 border-dashed border-paper/40 flex items-center justify-center font-pixel text-xl text-paper/30 animate-pulse mb-3">
                ?
              </div>
              <div className="font-arcade text-xs text-cartridgeYellow tracking-wider">
                YOUR BRO IS MISSING.
              </div>
              <div className="font-mono text-[10px] text-paper/60 mt-1 max-w-[180px]">
                SHARE CODE {roomState.code} TO SUMMON HIM.
              </div>
            </div>
          )}

          <div className="w-full text-center text-[9px] font-arcade text-paper/40 border-t border-paper/10 pt-1">
            PLAYER 02
          </div>
        </div>
      </div>

      {/* Retro Status Announcement Banner */}
      <div className="w-full bg-ink border-2 border-paper/30 px-4 py-2.5 mb-6 text-center">
        <span className="font-arcade text-xs tracking-wider text-paper">
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
          variant={myPlayer?.isReady ? 'yellow' : 'paper'}
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
          <div className="font-arcade text-xs text-paper/60 border border-paper/30 px-4 py-3 bg-[#151C30]">
            WAITING FOR HOST TO START...
          </div>
        )}
      </div>

      {/* Leave Room Action */}
      <button
        type="button"
        onClick={onLeaveRoom}
        className="mt-8 font-arcade text-[10px] text-paper/40 hover:text-arcadeRed transition-colors tracking-widest uppercase"
      >
        [ LEAVE ROOM ]
      </button>
    </div>
  );
};
