import React from 'react';
import type { RoomState, GameResult, ReactionTestState } from '@bvb/shared';
import { PixelCharacter } from './pixel/PixelCharacter';
import { GamePixelIcon } from './game-icons/GamePixelIcon';

const GAME_NAMES: Record<string, string> = {
  'tic-tac-toe': 'Tic-Tac-Toe',
  'reaction-test': 'Reflex Duel',
  'connect-four': 'Connect Four',
  'wordle': 'Wordle Battle',
  'minesweeper': 'Minefield Battle',
  'chess': 'Speed Chess',
  'flag-duel': 'Flag Duel',
};

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

  // Reaction Test detection and reaction time extraction
  const lastRound = match?.rounds && match.rounds.length > 0 ? match.rounds[match.rounds.length - 1] : null;
  const isReactionTest =
    roomState.activeGame?.gameId === 'reaction-test' ||
    lastRound?.gameId === 'reaction-test' ||
    /reaction|quickdraw|false start/i.test(lastResult?.summary || '') ||
    /reaction|quickdraw|false start/i.test(lastRound?.summary || '');

  const reactionState =
    roomState.activeGame?.gameId === 'reaction-test'
      ? (roomState.activeGame.state as ReactionTestState)
      : null;

  const playerAResult =
    playerA?.id && reactionState?.playerResults ? reactionState.playerResults[playerA.id] : null;
  const playerBResult =
    playerB?.id && reactionState?.playerResults ? reactionState.playerResults[playerB.id] : null;

  const summaryText = lastResult?.summary || lastRound?.summary || '';
  const summaryMsMatch = summaryText.match(/(\d+)\s*ms/i);
  const extractedMsFromSummary = summaryMsMatch ? parseInt(summaryMsMatch[1], 10) : null;

  const isFalseStart =
    /false start/i.test(summaryText) ||
    Boolean(playerAResult?.earlyClick || playerBResult?.earlyClick);

  // Wordle detection and target word extraction
  const isWordle =
    roomState.activeGame?.gameId === 'wordle' ||
    lastRound?.gameId === 'wordle' ||
    /wordle|cracked|cipher/i.test(lastResult?.summary || '') ||
    /wordle|cracked|cipher/i.test(lastRound?.summary || '');

  const wordleState =
    roomState.activeGame?.gameId === 'wordle'
      ? (roomState.activeGame.state as any)
      : null;

  const wordMatch = summaryText.match(/"([A-Za-z]{5})"/);
  const secretWord = (
    wordleState?.targetWord && wordleState.targetWord.length === 5
      ? wordleState.targetWord
      : wordMatch
      ? wordMatch[1]
      : ''
  ).toUpperCase();

  let winnerReactionMs: number | null = null;
  if (
    winnerPlayerId &&
    reactionState?.playerResults?.[winnerPlayerId]?.reactionMs &&
    reactionState.playerResults[winnerPlayerId].reactionMs! > 0
  ) {
    winnerReactionMs = reactionState.playerResults[winnerPlayerId].reactionMs;
  } else if (extractedMsFromSummary !== null) {
    winnerReactionMs = extractedMsFromSummary;
  }

  const getReactionSpeedBadge = (ms: number) => {
    if (ms < 200)
      return {
        label: 'GODLIKE REFLEXES!',
        badge: '⚡⚡⚡',
        textColor: 'text-amber-300',
        bg: 'bg-amber-500/20 border-amber-400/50',
      };
    if (ms < 275)
      return {
        label: 'INHUMAN SPEED!',
        badge: '⚡⚡',
        textColor: 'text-purple-300',
        bg: 'bg-purple-500/20 border-purple-400/50',
      };
    if (ms < 350)
      return {
        label: 'LIGHTNING QUICK!',
        badge: '⚡',
        textColor: 'text-cyan-300',
        bg: 'bg-cyan-500/20 border-cyan-400/50',
      };
    if (ms < 450)
      return {
        label: 'SOLID QUICKDRAW!',
        badge: '🎯',
        textColor: 'text-emerald-300',
        bg: 'bg-emerald-500/20 border-emerald-400/50',
      };
    return {
      label: 'STEADY DRAW',
      badge: '⏱️',
      textColor: 'text-yellow-200',
      bg: 'bg-yellow-500/20 border-yellow-400/50',
    };
  };

  const reactionBadge = winnerReactionMs !== null ? getReactionSpeedBadge(winnerReactionMs) : null;

  const formatPlayerReaction = (
    pId?: string,
    pResult?: { reactionMs: number | null; earlyClick: boolean } | null,
    isThisWinner?: boolean
  ) => {
    if (!pId) return '---';
    if (pResult?.earlyClick) {
      return <span className="text-arcadeRed font-bold">⚠️ FALSE START</span>;
    }
    if (pResult?.reactionMs && pResult.reactionMs > 0) {
      return (
        <span className={isThisWinner ? 'text-cartridgeYellow font-bold' : 'text-paper/90'}>
          {pResult.reactionMs} ms {isThisWinner && '🏆'}
        </span>
      );
    }
    if (isThisWinner && winnerReactionMs !== null) {
      return (
        <span className="text-cartridgeYellow font-bold">
          {winnerReactionMs} ms 🏆
        </span>
      );
    }
    if (isFalseStart && !isThisWinner) {
      return <span className="text-emerald-400 font-bold">DISQUALIFIED (EARLY)</span>;
    }
    return <span className="opacity-60 text-xs">OUTDRAWN</span>;
  };

  // Next game determination from pre-drafted series lineup
  const nextRoundIndex = currentRound;
  const nextGameId = match?.gamePlaylist?.[nextRoundIndex];
  const nextGameName = nextGameId ? GAME_NAMES[nextGameId] || nextGameId : null;
  const nextRoundNumber = currentRound + 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
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

        {/* ⚡ High-Visibility Reaction Time Stopwatch HUD (Reflex Duel) ⚡ */}
        {isReactionTest && (
          <div className="my-4 p-4 bg-slate-950 border-2 border-cartridgeYellow/80 rounded-lg shadow-pixel text-center relative overflow-hidden">
            {/* Top Tag */}
            <div className="text-[10px] font-arcade uppercase tracking-widest text-cartridgeYellow/90 mb-1 flex items-center justify-center gap-1.5 font-bold">
              <span>⚡</span>
              <span>OFFICIAL REACTION TIME</span>
              <span>⚡</span>
            </div>

            {winnerReactionMs !== null ? (
              <div className="flex flex-col items-center justify-center my-1.5">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="font-arcade text-4xl sm:text-5xl font-black text-cartridgeYellow tracking-wider drop-shadow-[0_0_14px_rgba(251,191,36,0.6)]">
                    {winnerReactionMs}
                  </span>
                  <span className="font-arcade text-lg sm:text-xl text-paper opacity-80">
                    MS
                  </span>
                </div>
                {reactionBadge && (
                  <div
                    className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded border text-xs font-arcade ${reactionBadge.bg} ${reactionBadge.textColor}`}
                  >
                    <span>{reactionBadge.badge}</span>
                    <span>{reactionBadge.label}</span>
                  </div>
                )}
              </div>
            ) : isFalseStart ? (
              <div className="my-2 py-2 px-3 bg-red-950/60 border border-arcadeRed/50 rounded text-arcadeRed font-arcade text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span>FALSE START! (CLICKED BEFORE GREEN)</span>
              </div>
            ) : null}

            {/* Duelists Reaction Comparison */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/15 text-xs font-mono">
              <div
                className={`p-2 rounded border ${
                  playerA?.id === winnerPlayerId
                    ? 'bg-emerald-950/60 border-emerald-500/60'
                    : 'bg-slate-900/60 border-white/10'
                }`}
              >
                <div className="text-[10px] opacity-75 truncate font-bold text-cartridgeYellow">
                  {playerA?.name || 'PLAYER 1'} {playerA?.id === myPlayerId ? '(YOU)' : ''}
                </div>
                <div className="font-arcade text-xs sm:text-sm mt-1 font-bold">
                  {formatPlayerReaction(playerA?.id, playerAResult, playerA?.id === winnerPlayerId)}
                </div>
              </div>

              <div
                className={`p-2 rounded border ${
                  playerB?.id === winnerPlayerId
                    ? 'bg-emerald-950/60 border-emerald-500/60'
                    : 'bg-slate-900/60 border-white/10'
                }`}
              >
                <div className="text-[10px] opacity-75 truncate font-bold text-crtCyan">
                  {playerB?.name || 'PLAYER 2'} {playerB?.id === myPlayerId ? '(YOU)' : ''}
                </div>
                <div className="font-arcade text-xs sm:text-sm mt-1 font-bold">
                  {formatPlayerReaction(playerB?.id, playerBResult, playerB?.id === winnerPlayerId)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🟩 High-Visibility Secret Word Reveal HUD (Wordle Battle) 🟩 */}
        {isWordle && secretWord && (
          <div className="my-4 p-4 bg-slate-950 border-3 border-ink shadow-pixel text-center relative overflow-hidden rounded">
            {/* Top Badge */}
            <div className="text-[10px] font-arcade uppercase tracking-widest text-gameBoyGreen mb-2 flex items-center justify-center gap-2 font-bold">
              <GamePixelIcon gameId="wordle" size={18} className="flex-shrink-0" />
              <span>THE SECRET WORD WAS</span>
              <GamePixelIcon gameId="wordle" size={18} className="flex-shrink-0" />
            </div>

            {/* 5 Big Retro Wordle Letter Tiles */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 my-2">
              {secretWord.split('').map((char: string, idx: number) => (
                <div
                  key={idx}
                  className="w-11 h-11 sm:w-14 sm:h-14 bg-gameBoyGreen text-ink font-arcade text-xl sm:text-2xl font-black border-3 border-ink shadow-pixel flex items-center justify-center animate-bounce select-none"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {char}
                </div>
              ))}
            </div>

            <p className="mt-2 text-xs font-mono font-bold text-white/90">
              {isDraw ? (
                <span className="text-cartridgeYellow">Neither bro cracked the cipher • It was &ldquo;{secretWord}&rdquo;!</span>
              ) : winner ? (
                <span>Cracked by <strong className="text-gameBoyGreen">{winner.name}</strong>!</span>
              ) : (
                <span>Round cipher concluded!</span>
              )}
            </p>
          </div>
        )}

        {/* Live Match Scoreboard Snapshot */}
        <div
          className={`my-4 p-4 border-2 border-ink shadow-pixel flex items-center justify-around ${
            isNight ? 'bg-slate-900/80' : 'bg-paper'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className={`font-arcade text-xs font-bold truncate max-w-[120px] ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
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

        {/* Next Battle Callout */}
        <div
          className={`p-3 border-2 border-dashed border-ink/40 text-xs font-mono mb-6 text-left ${
            isNight ? 'bg-slate-800/60 text-slate-300' : 'bg-amber-50 text-stone-700'
          }`}
        >
          {nextGameId && nextGameName ? (
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={`font-bold uppercase font-arcade ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>UPCOMING BATTLE:</span>
                <span className="font-mono text-[10px] opacity-75">
                  Round {nextRoundNumber} of {match?.gamePlaylist?.length || 5}
                </span>
              </div>
              <div className="flex items-center gap-2 font-arcade text-sm text-ink dark:text-paper font-bold">
                <GamePixelIcon gameId={nextGameId} size={22} className="flex-shrink-0" />
                <span className="text-arcadeRed dark:text-cartridgeYellow">{nextGameName}</span>
              </div>
            </div>
          ) : (
            <div>
              <span className={`font-bold ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>NEXT GAME SELECTION: </span>
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
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={onNextRound}
          className="w-full py-3.5 px-6 bg-arcadeRed text-white font-arcade text-xs sm:text-sm tracking-widest border-2 border-ink shadow-pixel hover:bg-red-600 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all font-bold"
        >
          {nextGameName
            ? `START ROUND ${nextRoundNumber}: ${nextGameName.toUpperCase()} ➔`
            : 'CONTINUE TO GAME SELECTION ➔'}
        </button>
      </div>
    </div>
  );
};
