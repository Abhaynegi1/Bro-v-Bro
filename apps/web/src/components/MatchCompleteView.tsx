import React, { useEffect, useState } from 'react';
import type { RoomState, SurrenderDocument } from '@bvb/shared';
import confetti from 'canvas-confetti';
import { PixelCharacter } from './pixel/PixelCharacter';
import { SurrenderCertificateModal } from './SurrenderCertificateModal';
import { GamePixelIcon } from './game-icons/GamePixelIcon';
import {
  downloadCertificateAsPng,
  downloadCertificateAsPdf,
} from '../utils/certificateGenerator';

interface MatchCompleteViewProps {
  roomState: RoomState;
  myPlayerId: string;
  onRematch: () => void;
  onLeaveRoom: () => void;
  onSignSurrender?: (data: { signatureDataUrl: string; confessionClause?: string }) => void;
  theme?: 'day' | 'night';
}

export const MatchCompleteView: React.FC<MatchCompleteViewProps> = ({
  roomState,
  myPlayerId,
  onRematch,
  onLeaveRoom,
  onSignSurrender,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const match = roomState.currentMatch;
  const playerA = roomState.players.playerA;
  const playerB = roomState.players.playerB;

  const winnerPlayerId = match?.seriesWinnerId;
  const winner = playerA?.id === winnerPlayerId ? playerA : playerB?.id === winnerPlayerId ? playerB : null;
  const loser = playerA?.id === winnerPlayerId ? playerB : playerA;
  const iWon = myPlayerId === winnerPlayerId;
  const iAmLoser = myPlayerId === loser?.id;

  const scoreA = match?.scores.playerA ?? 0;
  const scoreB = match?.scores.playerB ?? 0;
  const rounds = match?.rounds ?? [];

  const [copied, setCopied] = useState(false);
  const [showSurrenderModal, setShowSurrenderModal] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Construct or retrieve surrender document data
  const surrenderDoc: SurrenderDocument = match?.surrenderDocument || {
    id: `DECREE-${match?.id ? match.id.replace('match_', '').substring(0, 6).toUpperCase() : 'BVB'}`,
    loserPlayerId: loser?.id || '',
    winnerPlayerId: winner?.id || '',
    loserName: loser?.name || 'Loser',
    winnerName: winner?.name || 'Winner',
    scoreWinner: Math.max(scoreA, scoreB),
    scoreLoser: Math.min(scoreA, scoreB),
    confessionClause: 'I hereby admit that my opponent is simply the superior gamer and diffed me fair and square.',
    isSigned: false,
  };

  // Victory Confetti
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#EF4444', '#FBBF24', '#3B82F6', '#10B981'],
    });
  }, []);

  const handleCopyShareLink = () => {
    if (!match?.id) return;
    const url = `${window.location.origin}/match/${match.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getGameTitle = (gameId: string) => {
    switch (gameId) {
      case 'tic-tac-toe':
        return 'Tic Tac Toe';
      case 'reaction-test':
        return 'Reflex Duel';
      case 'connect-four':
        return 'Connect Four';
      case 'wordle':
        return 'Wordle Race';
      case 'minesweeper':
        return 'Minefield Battle';
      default:
        return gameId;
    }
  };

  const handleQuickDownloadPng = async () => {
    try {
      setIsDownloadingPng(true);
      await downloadCertificateAsPng({
        id: surrenderDoc.id,
        loserName: surrenderDoc.loserName,
        winnerName: surrenderDoc.winnerName,
        scoreWinner: surrenderDoc.scoreWinner,
        scoreLoser: surrenderDoc.scoreLoser,
        signatureDataUrl: surrenderDoc.signatureDataUrl,
        signedAt: surrenderDoc.signedAt || Date.now(),
        roomCode: roomState.code,
      });
    } catch (err) {
      console.error('Failed to download PNG decree:', err);
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const handleQuickDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await downloadCertificateAsPdf({
        id: surrenderDoc.id,
        loserName: surrenderDoc.loserName,
        winnerName: surrenderDoc.winnerName,
        scoreWinner: surrenderDoc.scoreWinner,
        scoreLoser: surrenderDoc.scoreLoser,
        signatureDataUrl: surrenderDoc.signatureDataUrl,
        signedAt: surrenderDoc.signedAt || Date.now(),
        roomCode: roomState.code,
      });
    } catch (err) {
      console.error('Failed to download PDF decree:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-4xl mx-auto select-none">
      {/* Series Champion Hero Card */}
      <div
        className={`w-full p-6 sm:p-8 border-4 border-ink shadow-pixel text-center transition-colors mb-6 ${
          isNight ? 'bg-[#18243A] text-paper' : 'bg-paper text-ink'
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div className="inline-block px-3 py-1 bg-ink text-cartridgeYellow font-arcade text-xs tracking-wider border-2 border-ink font-bold">
            ★ SERIES CONCLUDED ★
          </div>
          {match?.id && (
            <span className="px-2.5 py-1 bg-darkNavy text-paper border border-ink/40 font-mono text-[10px] tracking-wide">
              ARCHIVE: {match.id}
            </span>
          )}
        </div>

        {/* Podium Characters */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 my-4">
          <div className="flex flex-col items-center">
            <span className="text-xl mb-1">👑</span>
            <PixelCharacter
              type={winner?.id === playerA?.id ? 'bro1' : 'bro2'}
              pose="celebrating"
              size={64}
              className="drop-shadow-pixel"
            />
            <span className={`font-arcade text-xs font-bold mt-2 truncate max-w-[120px] ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
              {winner?.name || 'CHAMPION'}
            </span>
            <span className="text-[10px] font-mono font-bold text-gameBoyGreen uppercase mt-0.5">
              WINNER
            </span>
          </div>

          <div className="text-2xl font-arcade text-arcadeRed font-bold">VS</div>

          <div className="flex flex-col items-center opacity-70">
            <span className="text-xl mb-1 invisible">💀</span>
            <PixelCharacter
              type={loser?.id === playerA?.id ? 'bro1' : 'bro2'}
              pose="defeated"
              size={56}
              className="drop-shadow-pixel grayscale"
            />
            <span className="font-arcade text-xs font-bold mt-2 truncate max-w-[120px]">
              {loser?.name || 'CHALLENGER'}
            </span>
            <span className="text-[10px] font-mono font-bold text-arcadeRed uppercase mt-0.5">
              DEFEATED
            </span>
          </div>
        </div>

        <h1 className="font-arcade text-xl sm:text-3xl text-arcadeRed tracking-wider font-bold mt-2">
          {iWon ? 'YOU ARE THE CHAMPION!' : `${winner?.name.toUpperCase()} CLAIMS THE CROWN!`}
        </h1>

        {/* Humorous Banter Tagline */}
        <p className={`font-mono text-xs sm:text-sm max-w-xl mx-auto mt-2 font-bold ${isNight ? 'text-cartridgeYellow' : 'text-amber-900'}`}>
          &ldquo;The winner becomes the better gamer for the next month, and the loser can&rsquo;t deny it.&rdquo;
        </p>

        {/* Final Series Score Banner */}
        <div
          className={`mt-5 p-3 max-w-md mx-auto border-2 border-ink shadow-pixel flex items-center justify-around font-arcade text-lg sm:text-2xl ${
            isNight ? 'bg-slate-900/90 text-cartridgeYellow' : 'bg-white text-ink'
          }`}
        >
          <span>{playerA?.name}: {scoreA}</span>
          <span className="text-arcadeRed text-base">FINAL</span>
          <span>{playerB?.name}: {scoreB}</span>
        </div>
      </div>

      {/* Surrender Accord & Inferiority Decree Showcase Card */}
      <div
        className={`w-full p-5 sm:p-6 border-4 border-ink shadow-pixel transition-colors mb-6 relative overflow-hidden ${
          isNight ? 'bg-[#152033] text-paper' : 'bg-[#FFFBEB] text-ink'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-ink">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-arcadeRed font-bold tracking-wider uppercase">
                DECLARATION OF SUPERIOR GAMER
              </h2>
              <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
                OFFICIAL MATCH SURRENDER PROTOCOL
              </span>
            </div>
          </div>

          <div>
            {surrenderDoc.isSigned ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gameBoyGreen/20 text-gameBoyGreen border-2 border-gameBoyGreen font-mono text-xs font-bold uppercase">
                <span>✅</span> SIGNED &amp; SEALED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-arcadeRed/20 text-arcadeRed border-2 border-arcadeRed font-mono text-xs font-bold uppercase animate-pulse">
                <span>⚠️</span> {iAmLoser ? 'YOUR SIGNATURE REQUIRED' : "AWAITING LOSER'S SIGNATURE"}
              </span>
            )}
          </div>
        </div>

        {/* 1 Clean Minimal Paragraph */}
        <div className="my-4 p-4 bg-amber-500/15 border-2 border-dashed border-amber-600 dark:border-cartridgeYellow text-xs sm:text-sm font-mono leading-relaxed">
          <p className={`italic font-medium ${isNight ? 'text-slate-100' : 'text-slate-900'}`}>
            &ldquo;I, <strong className="text-arcadeRed font-bold uppercase">[{surrenderDoc.loserName}]</strong>, hereby declare that{' '}
            <strong className="text-emerald-700 dark:text-gameBoyGreen font-bold uppercase">[{surrenderDoc.winnerName}]</strong> is the superior gamer than me. Having suffered a decisive defeat of {surrenderDoc.scoreWinner} to {surrenderDoc.scoreLoser} in Bro v Bro, I openly concede that I was fairly outplayed with zero excuses, zero lag, and full respect to the better player.&rdquo;
          </p>
          <div className={`mt-2 text-[11px] font-bold uppercase ${isNight ? 'text-cartridgeYellow' : 'text-amber-900'}`}>
            — {surrenderDoc.loserName}{surrenderDoc.isSigned ? ' (Signed & Sealed)' : ' (Awaiting Signature)'}
          </div>
        </div>

        {/* Interactive Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {surrenderDoc.isSigned ? (
            <>
              <button
                onClick={() => setShowSurrenderModal(true)}
                className="flex-1 sm:flex-initial px-5 py-3 bg-arcadeRed text-white font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel hover:bg-red-600 font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>📜</span>
                <span>VIEW &amp; PRINT DECLARATION</span>
              </button>

              <button
                onClick={handleQuickDownloadPng}
                disabled={isDownloadingPng}
                className="px-4 py-3 bg-cartridgeYellow text-ink font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel hover:bg-yellow-300 font-bold transition-all flex items-center justify-center gap-1.5"
                title="Download PNG image"
              >
                <span>📸</span>
                <span>{isDownloadingPng ? 'SAVING...' : 'PNG'}</span>
              </button>

              <button
                onClick={handleQuickDownloadPdf}
                disabled={isDownloadingPdf}
                className="px-4 py-3 bg-gameBoyGreen text-ink font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel hover:bg-emerald-400 font-bold transition-all flex items-center justify-center gap-1.5"
                title="Download PDF document"
              >
                <span>📄</span>
                <span>{isDownloadingPdf ? 'SAVING...' : 'PDF'}</span>
              </button>
            </>
          ) : iAmLoser ? (
            <button
              onClick={() => setShowSurrenderModal(true)}
              className="flex-1 sm:flex-initial px-6 py-3.5 bg-arcadeRed text-white font-arcade text-xs sm:text-sm tracking-wider border-2 border-ink shadow-pixel hover:bg-red-600 font-bold transition-all flex items-center justify-center gap-2 animate-bounce"
            >
              <span>✍️</span>
              <span>SIGN SURRENDER DECLARATION</span>
            </button>
          ) : (
            <>
              <div className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-200/60 dark:bg-slate-900 border-2 border-ink text-slate-900 dark:text-slate-100 font-mono text-xs font-bold flex items-center gap-2">
                <span className="animate-pulse">⏳</span>
                <span>Awaiting [{surrenderDoc.loserName}]&apos;s signature to unlock official download</span>
              </div>

              <button
                onClick={() => setShowSurrenderModal(true)}
                className="px-4 py-2.5 bg-paper text-ink font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel hover:bg-stone-200 font-bold transition-all flex items-center gap-1.5"
              >
                <span>👁️</span>
                <span>PREVIEW</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Complete Match Breakdown Table */}
      <div
        className={`w-full p-5 border-4 border-ink shadow-pixel transition-colors mb-6 ${
          isNight ? 'bg-[#1E293B] text-paper' : 'bg-[#FFFDF5] text-ink'
        }`}
      >
        <h3 className={`font-arcade text-xs sm:text-sm font-bold tracking-wider mb-3 ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
          ★ SERIES ROUND-BY-ROUND BREAKDOWN ★
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr
                className={`border-b-2 border-ink font-bold ${
                  isNight ? 'bg-slate-800 text-slate-200' : 'bg-stone-200 text-stone-800'
                }`}
              >
                <th className="p-2.5 font-arcade text-[10px]">RND</th>
                <th className="p-2.5">BATTLE</th>
                <th className="p-2.5">WINNER</th>
                <th className="p-2.5">RESULT SUMMARY</th>
              </tr>
            </thead>
            <tbody>
              {rounds.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center opacity-60">
                    No completed rounds recorded.
                  </td>
                </tr>
              ) : (
                rounds.map((round) => {
                  const roundWinner =
                    round.winnerPlayerId === playerA?.id
                      ? playerA
                      : round.winnerPlayerId === playerB?.id
                      ? playerB
                      : null;

                  return (
                    <tr
                      key={round.roundNumber}
                      className={`border-b border-ink/20 ${
                        isNight ? 'hover:bg-slate-800/40' : 'hover:bg-stone-100'
                      }`}
                    >
                      <td className={`p-2.5 font-arcade text-[10px] font-bold ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
                        #{round.roundNumber}
                      </td>
                      <td className="p-2.5 font-bold">
                        <div className="flex items-center gap-1.5">
                          <GamePixelIcon gameId={round.gameId} size={18} className="flex-shrink-0" />
                          <span>{getGameTitle(round.gameId)}</span>
                        </div>
                      </td>
                      <td className="p-2.5 font-bold">
                        {round.result === 'DRAW' ? (
                          <span className="text-amber-500">DRAW</span>
                        ) : roundWinner ? (
                          <span className="text-gameBoyGreen">★ {roundWinner.name}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-2.5 opacity-80">{round.summary || 'Round concluded.'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => setShowSurrenderModal(true)}
          className="flex-1 sm:flex-initial sm:px-7 py-3.5 bg-paper text-ink font-arcade text-xs sm:text-sm tracking-wider border-2 border-ink shadow-pixel hover:bg-stone-100 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold flex items-center justify-center gap-2"
        >
          <span>📜</span>
          <span>
            {surrenderDoc.isSigned
              ? 'SURRENDER DECREE (PDF/PNG)'
              : iAmLoser
              ? 'SIGN SURRENDER DECREE'
              : 'SURRENDER DECREE (PENDING)'}
          </span>
        </button>

        <button
          onClick={handleCopyShareLink}
          className="flex-1 sm:flex-initial sm:px-7 py-3.5 bg-cartridgeYellow text-ink font-arcade text-xs sm:text-sm tracking-wider border-2 border-ink shadow-pixel hover:bg-yellow-300 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold"
        >
          {copied ? '✅ LINK COPIED!' : '📋 SHARE PERMANENT RECAP'}
        </button>

        <button
          onClick={onRematch}
          className="flex-1 sm:flex-initial sm:px-7 py-3.5 bg-gameBoyGreen text-ink font-arcade text-xs sm:text-sm tracking-wider border-2 border-ink shadow-pixel hover:bg-emerald-400 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold"
        >
          🔄 RUN IT BACK (REMATCH)
        </button>

        <button
          onClick={onLeaveRoom}
          className="flex-1 sm:flex-initial sm:px-7 py-3.5 bg-arcadeRed text-white font-arcade text-xs sm:text-sm tracking-wider border-2 border-ink shadow-pixel hover:bg-red-600 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold"
        >
          🚪 EXIT TO LOBBY
        </button>
      </div>

      {/* Surrender Decree Modal */}
      {showSurrenderModal && (
        <SurrenderCertificateModal
          documentData={surrenderDoc}
          myPlayerId={myPlayerId}
          roomCode={roomState.code}
          onSignSurrender={(data) => {
            onSignSurrender?.(data);
          }}
          onClose={() => setShowSurrenderModal(false)}
          theme={theme}
        />
      )}
    </div>
  );
};
