import type {
  GameDefinition,
  WordleState,
  WordleMove,
  WordleLetterState,
  MoveContext,
  GameResult,
} from '@bvb/shared';
import { getRandomTargetWord, isValidWord } from '@bvb/shared';

export function evaluateGuess(guess: string, target: string): WordleLetterState[] {
  const result: WordleLetterState[] = new Array(5).fill('ABSENT');
  const targetChars = target.toUpperCase().split('');
  const guessChars = guess.toUpperCase().split('');
  const targetLetterCounts: Record<string, number> = {};

  for (const char of targetChars) {
    targetLetterCounts[char] = (targetLetterCounts[char] || 0) + 1;
  }

  // First pass: identify CORRECT (green) matches
  for (let i = 0; i < 5; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = 'CORRECT';
      targetLetterCounts[guessChars[i]]--;
    }
  }

  // Second pass: identify PRESENT (yellow) matches
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 'CORRECT') {
      const char = guessChars[i];
      if (targetLetterCounts[char] && targetLetterCounts[char] > 0) {
        result[i] = 'PRESENT';
        targetLetterCounts[char]--;
      }
    }
  }

  return result;
}

export class WordleEngine implements GameDefinition<WordleState, WordleMove> {
  public readonly id = 'wordle';
  public readonly name = 'Wordle Race';
  public readonly description = '1v1 speed race! Guess the hidden 5-letter word first using server-sanitized clues.';
  public readonly minPlayers = 2 as const;
  public readonly maxPlayers = 2 as const;

  public createInitialState(playerIds: [string, string]): WordleState {
    const targetWord = getRandomTargetWord();

    return {
      playerIds,
      targetWord,
      maxAttempts: 6,
      playerStates: {
        [playerIds[0]]: {
          guesses: [],
          isCompleted: false,
          hasWon: false,
        },
        [playerIds[1]]: {
          guesses: [],
          isCompleted: false,
          hasWon: false,
        },
      },
      status: 'IN_PROGRESS',
      winnerPlayerId: null,
      loserPlayerId: null,
    };
  }

  public validateMove(
    state: WordleState,
    move: WordleMove,
    context: MoveContext
  ): boolean {
    if (state.status !== 'IN_PROGRESS') return false;
    if (move.action !== 'GUESS') return false;
    if (!state.playerIds.includes(context.playerId)) return false;

    const playerState = state.playerStates[context.playerId];
    if (!playerState || playerState.isCompleted) return false;
    if (playerState.guesses.length >= state.maxAttempts) return false;

    const cleanWord = move.guess?.trim().toUpperCase();
    if (!cleanWord || cleanWord.length !== 5) return false;
    if (!/^[A-Z]{5}$/.test(cleanWord)) return false;

    // Must be a recognized valid English 5-letter word
    if (!isValidWord(cleanWord)) return false;

    return true;
  }

  public applyMove(
    state: WordleState,
    move: WordleMove,
    context: MoveContext
  ): WordleState {
    const guessWord = move.guess.trim().toUpperCase();
    const evaluation = evaluateGuess(guessWord, state.targetWord);
    const hasWon = guessWord === state.targetWord;

    const currentPlayerState = state.playerStates[context.playerId];
    const newGuesses = [
      ...currentPlayerState.guesses,
      { word: guessWord, evaluation },
    ];
    const isCompleted = hasWon || newGuesses.length >= state.maxAttempts;

    const otherPlayerId = state.playerIds.find((id) => id !== context.playerId)!;
    const otherPlayerState = state.playerStates[otherPlayerId];

    const updatedPlayerStates = {
      ...state.playerStates,
      [context.playerId]: {
        guesses: newGuesses,
        isCompleted,
        hasWon,
        finishedAt: isCompleted ? context.timestamp : undefined,
      },
    };

    let status = state.status;
    let winnerPlayerId = state.winnerPlayerId;
    let loserPlayerId = state.loserPlayerId;
    let summary = state.summary;

    if (hasWon) {
      // Current player cracked the cipher first!
      status = 'FINISHED';
      winnerPlayerId = context.playerId;
      loserPlayerId = otherPlayerId;
      summary = `Cracked the secret word "${state.targetWord}" in ${newGuesses.length} guess${newGuesses.length === 1 ? '' : 'es'}!`;
    } else if (isCompleted) {
      // Current player ran out of attempts without winning
      if (otherPlayerState.isCompleted) {
        if (otherPlayerState.hasWon) {
          // Other player had already won
          status = 'FINISHED';
          winnerPlayerId = otherPlayerId;
          loserPlayerId = context.playerId;
        } else {
          // Both players ran out of guesses! Draw
          status = 'FINISHED';
          winnerPlayerId = null;
          loserPlayerId = null;
          summary = `Neither bro cracked "${state.targetWord}". It's a draw!`;
        }
      }
      // If other player is still guessing, game continues until they win or exhaust their attempts
    }

    return {
      ...state,
      playerStates: updatedPlayerStates,
      status,
      winnerPlayerId,
      loserPlayerId,
      summary,
    };
  }

  public isFinished(state: WordleState): boolean {
    return state.status === 'FINISHED';
  }

  public getResult(state: WordleState): GameResult {
    if (state.winnerPlayerId) {
      return {
        winnerPlayerId: state.winnerPlayerId,
        loserPlayerId: state.loserPlayerId,
        result: 'WIN',
        reason: 'COMPLETED',
        summary: state.summary,
      };
    }

    return {
      winnerPlayerId: null,
      loserPlayerId: null,
      result: 'DRAW',
      reason: 'COMPLETED',
      summary: state.summary || `Neither bro cracked "${state.targetWord}". Draw!`,
    };
  }

  public sanitizeStateForPlayer(
    state: WordleState,
    viewingPlayerId: string
  ): WordleState {
    // When finished, reveal everything including the target word and opponent's letters
    if (state.status === 'FINISHED') {
      return state;
    }

    // While in progress:
    // 1. Hide the target word completely
    // 2. Hide the opponent's guessed letters ('?????'), but show their tile evaluation colors!
    const sanitizedPlayerStates: Record<string, any> = {};

    for (const pid of state.playerIds) {
      const pState = state.playerStates[pid];
      if (!pState) continue;

      if (pid === viewingPlayerId) {
        // Viewing player sees their own words and evaluations
        sanitizedPlayerStates[pid] = pState;
      } else {
        // Opponent's words are masked to '?????'
        sanitizedPlayerStates[pid] = {
          ...pState,
          guesses: pState.guesses.map((g) => ({
            word: '?????',
            evaluation: g.evaluation,
          })),
        };
      }
    }

    return {
      ...state,
      targetWord: '', // Conceal secret word from network inspection
      playerStates: sanitizedPlayerStates,
    };
  }
}

export const wordleEngine = new WordleEngine();
