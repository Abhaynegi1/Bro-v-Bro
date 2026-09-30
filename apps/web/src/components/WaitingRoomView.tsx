import React, { useState } from 'react';
import type { RoomState } from '@bvb/shared';
import { Crown, Copy, Check, Users, Swords, Play, LogOut, CheckCircle2, Circle } from 'lucide-react';
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

  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
      {/* Top Banner: Room Code & Sharing */}
      <div className="w-full bg-[#121826] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl mb-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Match Lobby</span>
        </div>

        <div className="flex items-center gap-3 my-2">
          <span className="font-mono font-black text-4xl sm:text-5xl text-white tracking-widest drop-shadow-md">
            {roomState.code}
          </span>
          <button
            onClick={handleCopyCode}
            title="Copy Room Code"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700/60"
          >
            {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Share this code or direct invite link with your bro to start the battle.
        </p>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-200 hover:bg-slate-850 hover:border-slate-600 transition-all"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Invite Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Direct Invite Link</span>
            </>
          )}
        </button>
      </div>

      {/* Versus Head-to-Head Slots */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative">
        {/* VS Badge in center (for md screens) */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-800 items-center justify-center font-display font-black text-xs text-rose-500 z-10 shadow-lg">
          VS
        </div>

        {/* Player 1 Card (Host) */}
        <div className={`p-5 rounded-2xl border transition-all ${
          playerA
            ? 'bg-[#121826] border-blue-500/40 shadow-lg shadow-blue-500/5'
            : 'bg-slate-900/40 border-dashed border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
              <span>Host</span>
            </span>

            {playerA && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                playerA.isReady ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-800'
              }`}>
                {playerA.isReady ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                {playerA.isReady ? 'Ready' : 'Not Ready'}
              </span>
            )}
          </div>

          <div className="mb-2">
            <h3 className="font-display font-bold text-xl text-white truncate flex items-center gap-2">
              {playerA?.name || 'Empty'}
              {playerA?.id === myPlayerId && (
                <span className="text-[11px] font-sans font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                  You
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${playerA?.isConnected ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span>{playerA?.isConnected ? 'Online' : 'Offline'}</span>
            </p>
          </div>
        </div>

        {/* Player 2 Card (Guest) */}
        <div className={`p-5 rounded-2xl border transition-all ${
          playerB
            ? 'bg-[#121826] border-rose-500/40 shadow-lg shadow-rose-500/5'
            : 'bg-slate-900/40 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center py-8 text-center'
        }`}>
          {playerB ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400">
                  <Swords className="w-3.5 h-3.5 text-rose-400" />
                  <span>Challenger</span>
                </span>

                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  playerB.isReady ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-800'
                }`}>
                  {playerB.isReady ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                  {playerB.isReady ? 'Ready' : 'Not Ready'}
                </span>
              </div>

              <div className="mb-2">
                <h3 className="font-display font-bold text-xl text-white truncate flex items-center gap-2">
                  {playerB.name}
                  {playerB.id === myPlayerId && (
                    <span className="text-[11px] font-sans font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                      You
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${playerB.isConnected ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                  <span>{playerB.isConnected ? 'Online' : 'Offline'}</span>
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3 animate-pulse">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-sm text-slate-300 mb-1">Waiting for opponent...</h4>
              <p className="text-xs text-slate-500 max-w-[200px]">Send the room code to invite a bro</p>
            </div>
          )}
        </div>
      </div>

      {/* Series Settings Badge */}
      <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 mb-6">
        <span>Format:</span>
        <span className="font-bold text-slate-200">
          {roomState.currentMatch?.seriesCondition.type === 'FIRST_TO_N'
            ? `First to ${roomState.currentMatch.seriesCondition.targetPoints} Points`
            : 'Best of Series'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-3">
        {/* Ready Toggle */}
        <button
          onClick={onToggleReady}
          className={`w-full sm:w-1/2 py-3 px-4 rounded-xl font-display font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
            myPlayer?.isReady
              ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/20'
              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{myPlayer?.isReady ? 'You Are Ready!' : 'Click to Ready Up'}</span>
        </button>

        {/* Start Game / Launch (Host Only) */}
        {isHost ? (
          <button
            onClick={() => {
              triggerCelebration();
              onStartMatch();
            }}
            disabled={!bothConnected || !bothReady}
            className="w-full sm:w-1/2 arcade-button py-3 px-4 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-blue-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START MATCH</span>
          </button>
        ) : (
          <div className="w-full sm:w-1/2 py-3 px-4 rounded-xl font-display font-medium text-xs bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center gap-2 text-center">
            <span>Waiting for Host to start match...</span>
          </div>
        )}
      </div>

      {/* Leave Room Action */}
      <button
        onClick={onLeaveRoom}
        className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Leave Room</span>
      </button>
    </div>
  );
};
