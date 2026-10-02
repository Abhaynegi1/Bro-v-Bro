import React, { useEffect, useState } from 'react';
import type { RoundRecord } from '@bvb/shared';
import confetti from 'canvas-confetti';
import { PixelCharacter } from './pixel/PixelCharacter';

interface MatchDbData {
  id: string;
  roomCode: string;
  targetWins: number;
  playerAId: string;
  playerAName: string;
  playerBId: string;
  playerBName: string;
  winnerId: string | null;
  winnerName: string | null;
  scoreA: number;
  scoreB: number;
  totalRounds: number;
  rounds: RoundRecord[];
  createdAt: string;
  completedAt: string;
}

interface MatchPermalinkViewProps {
  matchId: string;
  onGoHome: () => void;
  theme?: 'day' | 'night';
  onToggleTheme?: () => void;
}

export const MatchPermalinkView: React.FC<MatchPermalinkViewProps> = ({
  matchId,
  onGoHome,
  theme = 'day',
  onToggleTheme,
}) => {
  const [match, setMatch] = useState<MatchDbData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isNight = theme === 'night';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/matches/${encodeURIComponent(matchId)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? 'Match record could not be found in archive.'
              : 'Failed to fetch match details.'
          );
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setMatch(data.match);
          setIsLoading(false);

          // Confetti celebration
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#EF4444', '#FBBF24', '#3B82F6', '#10B981'],
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [matchId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
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
      case 'chess':
        return 'Speed Chess';
      default:
        return gameId;
    }
  };

  const formattedDate = match?.completedAt
    ? new Date(match.completedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  return (
    <div
      className={`min-h-screen flex flex-col font-mono text-ink transition-colors duration-500 ${
        isNight ? 'bg-[#0D193A]' : 'bg-[#72B6F4]'
      }`}
    >
      {/* Top Header Bar */}
      <header className="w-full bg-[#0A0F1D] text-white px-5 sm:px-10 py-3 flex items-center justify-between border-b-2 border-black z-30 flex-shrink-0">
        <div
          onClick={onGoHome}
          className="flex items-center gap-1.5 font-pixel text-sm sm:text-base tracking-wider cursor-pointer hover:opacity-90"
        >
          <span>BRO</span>
          <span className="text-arcadeRed font-bold text-xs sm:text-sm">[v]</span>
          <span>BRO</span>
          <span className="ml-2 px-2 py-0.5 bg-gameBoyGreen text-ink text-[10px] font-bold rounded-sm border border-black uppercase font-arcade">
            ARCHIVE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onGoHome}
            className="font-pixel text-xs sm:text-sm text-white/90 hover:text-white uppercase tracking-wider hover:underline"
          >
            ← HOME
          </button>

          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="bg-white hover:bg-cream text-black font-pixel text-xs sm:text-sm px-3 py-1 border-2 border-white rounded shadow-sm hover:scale-105 active:scale-95 transition-transform uppercase font-bold"
            >
              {isNight ? 'DAY' : 'NIGHT'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-4xl mx-auto">
        {isLoading ? (
          <div className="p-8 border-4 border-ink bg-paper text-ink shadow-pixel text-center font-arcade">
            <div className="text-2xl animate-spin inline-block mb-3">⏳</div>
            <p className="text-sm tracking-wider">RETRIEVING MATCH ARCHIVE FROM NEON DB...</p>
          </div>
        ) : error || !match ? (
          <div className="p-8 border-4 border-ink bg-paper text-ink shadow-pixel text-center max-w-md w-full">
            <span className="text-4xl">💀</span>
            <h2 className="font-arcade text-lg sm:text-xl text-arcadeRed mt-2 mb-2 font-bold">
              RECORD NOT FOUND
            </h2>
            <p className="font-mono text-xs opacity-80 mb-5">
              {error || 'This match record does not exist or may have been pruned.'}
            </p>
            <button
              onClick={onGoHome}
              className="w-full py-3 bg-arcadeRed text-white font-arcade text-xs border-2 border-ink shadow-pixel hover:bg-red-600 transition-all font-bold"
            >
              ← RETURN TO LOBBY
            </button>
          </div>
        ) : (
          <div className="w-full select-none">
            {/* Permalink Header Card */}
            <div
              className={`w-full p-6 sm:p-8 border-4 border-ink shadow-pixel text-center transition-colors mb-6 ${
                isNight ? 'bg-[#18243A] text-paper' : 'bg-paper text-ink'
              }`}
            >
              {/* Permanent Record Tag */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-ink text-cartridgeYellow font-arcade text-[10px] tracking-wider border-2 border-ink font-bold">
                  ★ VERIFIED NEON DB RECORD ★
                </span>
                <span className="px-2.5 py-1 bg-darkNavy text-white font-mono text-[10px] border border-ink/40">
                  {match.id}
                </span>
                {formattedDate && (
                  <span className="px-2 py-1 text-[10px] opacity-75 font-mono">
                    {formattedDate}
                  </span>
                )}
              </div>

              {/* Characters Visual Podium */}
              <div className="flex items-center justify-center gap-8 sm:gap-14 my-4">
                {/* Winner side */}
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-1">👑</span>
                  <PixelCharacter
                    type={match.winnerId === match.playerAId ? 'bro1' : 'bro2'}
                    pose="celebrating"
                    size={64}
                    className="drop-shadow-pixel"
                  />
                  <span className="font-arcade text-xs text-cartridgeYellow font-bold mt-2 truncate max-w-[130px]">
                    {match.winnerName || 'CHAMPION'}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-gameBoyGreen uppercase mt-0.5">
                    SERIES WINNER
                  </span>
                </div>

                <div className="text-2xl font-arcade text-arcadeRed font-bold">VS</div>

                {/* Defeated side */}
                <div className="flex flex-col items-center opacity-70">
                  <span className="text-2xl mb-1 invisible">💀</span>
                  <PixelCharacter
                    type={match.winnerId === match.playerAId ? 'bro2' : 'bro1'}
                    pose="defeated"
                    size={56}
                    className="drop-shadow-pixel grayscale"
                  />
                  <span className="font-arcade text-xs font-bold mt-2 truncate max-w-[130px]">
                    {match.winnerId === match.playerAId ? match.playerBName : match.playerAName}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-arcadeRed uppercase mt-0.5">
                    DEFEATED
                  </span>
                </div>
              </div>

              <h1 className="font-arcade text-xl sm:text-3xl text-arcadeRed tracking-wider font-bold mt-2">
                {match.winnerName ? `${match.winnerName.toUpperCase()} CLAIMED THE CROWN!` : 'SERIES CONCLUDED'}
              </h1>

              <p className="font-mono text-xs sm:text-sm max-w-xl mx-auto mt-2 font-bold text-cartridgeYellow">
                &ldquo;History is written by the victors. The loser must carry this record forever.&rdquo;
              </p>

              {/* Score Banner */}
              <div
                className={`mt-5 p-3 max-w-md mx-auto border-2 border-ink shadow-pixel flex items-center justify-around font-arcade text-lg sm:text-2xl ${
                  isNight ? 'bg-slate-900/90 text-cartridgeYellow' : 'bg-white text-ink'
                }`}
              >
                <span>
                  {match.playerAName}: {match.scoreA}
                </span>
                <span className="text-arcadeRed text-base">FINAL</span>
                <span>
                  {match.playerBName}: {match.scoreB}
                </span>
              </div>

              <p className="text-[11px] font-mono opacity-70 mt-2">
                Format: First to {match.targetWins} points • Total Rounds: {match.totalRounds}
              </p>
            </div>

            {/* Round by Round Breakdown */}
            <div
              className={`w-full p-5 border-4 border-ink shadow-pixel transition-colors mb-6 ${
                isNight ? 'bg-[#1E293B] text-paper' : 'bg-[#FFFDF5] text-ink'
              }`}
            >
              <h3 className="font-arcade text-xs sm:text-sm text-cartridgeYellow font-bold tracking-wider mb-3">
                ★ ARCHIVED ROUND-BY-ROUND BREAKDOWN ★
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
                    {match.rounds.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center opacity-60">
                          No round summaries recorded.
                        </td>
                      </tr>
                    ) : (
                      match.rounds.map((round) => {
                        const roundWinnerName =
                          round.winnerPlayerId === match.playerAId
                            ? match.playerAName
                            : round.winnerPlayerId === match.playerBId
                            ? match.playerBName
                            : null;

                        return (
                          <tr
                            key={round.roundNumber}
                            className={`border-b border-ink/20 ${
                              isNight ? 'hover:bg-slate-800/40' : 'hover:bg-stone-100'
                            }`}
                          >
                            <td className="p-2.5 font-arcade text-[10px] text-cartridgeYellow">
                              #{round.roundNumber}
                            </td>
                            <td className="p-2.5 font-bold">{getGameTitle(round.gameId)}</td>
                            <td className="p-2.5 font-bold">
                              {round.result === 'DRAW' ? (
                                <span className="text-amber-500">DRAW</span>
                              ) : roundWinnerName ? (
                                <span className="text-gameBoyGreen">★ {roundWinnerName}</span>
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
                onClick={handleCopyLink}
                className="flex-1 sm:flex-initial sm:px-7 py-3.5 bg-cartridgeYellow text-ink font-arcade text-xs sm:text-sm tracking-wider border-2 border-ink shadow-pixel hover:bg-yellow-300 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold"
              >
                {copied ? '✅ LINK COPIED TO CLIPBOARD!' : '📋 SHARE PERMANENT RECAP LINK'}
              </button>

              <button
                onClick={onGoHome}
                className="flex-1 sm:flex-initial sm:px-7 py-3.5 bg-gameBoyGreen text-ink font-arcade text-xs sm:text-sm tracking-wider border-2 border-ink shadow-pixel hover:bg-emerald-400 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold"
              >
                ⚔️ CHALLENGE A BRO (NEW MATCH)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
