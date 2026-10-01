import React, { useEffect } from 'react';
import type { RoomState } from '@bvb/shared';
import confetti from 'canvas-confetti';
import { PixelCharacter } from './pixel/PixelCharacter';

interface MatchCompleteViewProps {
  roomState: RoomState;
  myPlayerId: string;
  onRematch: () => void;
  onLeaveRoom: () => void;
  theme?: 'day' | 'night';
}

export const MatchCompleteView: React.FC<MatchCompleteViewProps> = ({
  roomState,
  myPlayerId,
  onRematch,
  onLeaveRoom,
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

  const scoreA = match?.scores.playerA ?? 0;
  const scoreB = match?.scores.playerB ?? 0;
  const rounds = match?.rounds ?? [];

  // Victory Confetti
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#EF4444', '#FBBF24', '#3B82F6', '#10B981'],
    });
  }, []);

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
      default:
        return gameId;
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
        <div className="inline-block px-3 py-1 bg-ink text-cartridgeYellow font-arcade text-xs tracking-wider border-2 border-ink mb-3 font-bold">
          ★ SERIES CONCLUDED ★
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
            <span className="font-arcade text-xs text-cartridgeYellow font-bold mt-2 truncate max-w-[120px]">
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
        <p className="font-mono text-xs sm:text-sm max-w-xl mx-auto mt-2 font-bold text-cartridgeYellow">
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

      {/* Complete Match Breakdown Table */}
      <div
        className={`w-full p-5 border-4 border-ink shadow-pixel transition-colors mb-6 ${
          isNight ? 'bg-[#1E293B] text-paper' : 'bg-[#FFFDF5] text-ink'
        }`}
      >
        <h3 className="font-arcade text-xs sm:text-sm text-cartridgeYellow font-bold tracking-wider mb-3">
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
                      <td className="p-2.5 font-arcade text-[10px] text-cartridgeYellow">
                        #{round.roundNumber}
                      </td>
                      <td className="p-2.5 font-bold">{getGameTitle(round.gameId)}</td>
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
          onClick={onRematch}
          className="flex-1 sm:flex-initial sm:px-8 py-3.5 bg-gameBoyGreen text-ink font-arcade text-xs sm:text-sm tracking-wider border-2 border-ink shadow-pixel hover:bg-emerald-400 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold"
        >
          🔄 RUN IT BACK (REMATCH)
        </button>

        <button
          onClick={onLeaveRoom}
          className="flex-1 sm:flex-initial sm:px-8 py-3.5 bg-arcadeRed text-white font-arcade text-xs sm:text-sm tracking-wider border-2 border-ink shadow-pixel hover:bg-red-600 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold"
        >
          🚪 EXIT TO LOBBY
        </button>
      </div>
    </div>
  );
};
