import type {
  GameDefinition,
  TypingRaceState,
  TypingRaceMove,
  MoveContext,
  GameResult,
} from '@bvb/shared';
import { TYPING_TEXT_SAMPLES } from '@bvb/shared';

export class TypingRaceEngine implements GameDefinition<TypingRaceState, TypingRaceMove> {
  public readonly id = 'typing-race';
  public readonly name = 'Type Racer';
  public readonly description =
    'High-octane 1v1 drag race! Hammer your keyboard to accelerate your turbo pixel racer to the finish line.';
  public readonly minPlayers = 2 as const;
  public readonly maxPlayers = 2 as const;

  public createInitialState(playerIds: [string, string], sampleIndex?: number): TypingRaceState {
    const idx =
      typeof sampleIndex === 'number' && sampleIndex >= 0 && sampleIndex < TYPING_TEXT_SAMPLES.length
        ? sampleIndex
        : Math.floor(Math.random() * TYPING_TEXT_SAMPLES.length);

    const sample = TYPING_TEXT_SAMPLES[idx] || TYPING_TEXT_SAMPLES[0];
    const countdownDurationMs = 3500;
    const startTime = Date.now() + countdownDurationMs;

    return {
      playerIds,
      text: sample.text,
      title: sample.title,
      author: sample.author,
      startTime,
      countdownDurationMs,
      playerStates: {
        [playerIds[0]]: {
          charIndex: 0,
          wpm: 0,
          accuracy: 100,
          progress: 0,
          completed: false,
          finishTimeMs: null,
          mistakesCount: 0,
        },
        [playerIds[1]]: {
          charIndex: 0,
          wpm: 0,
          accuracy: 100,
          progress: 0,
          completed: false,
          finishTimeMs: null,
          mistakesCount: 0,
        },
      },
      status: 'COUNTDOWN',
      winnerPlayerId: null,
      loserPlayerId: null,
      summary: undefined,
    };
  }

  public validateMove(
    state: TypingRaceState,
    move: TypingRaceMove,
    context: MoveContext
  ): boolean {
    if (state.status === 'FINISHED') return false;
    if (!state.playerIds.includes(context.playerId)) return false;
    if (move.action !== 'PROGRESS') return false;

    const pState = state.playerStates[context.playerId];
    if (!pState || pState.completed) return false;

    if (typeof move.charIndex !== 'number' || move.charIndex < 0 || move.charIndex > state.text.length) {
      return false;
    }

    return true;
  }

  public applyMove(
    state: TypingRaceState,
    move: TypingRaceMove,
    context: MoveContext
  ): TypingRaceState {
    const nextState: TypingRaceState = {
      ...state,
      playerStates: {
        [state.playerIds[0]]: { ...state.playerStates[state.playerIds[0]] },
        [state.playerIds[1]]: { ...state.playerStates[state.playerIds[1]] },
      },
    };

    const playerId = context.playerId;
    const otherPlayerId = state.playerIds.find((id) => id !== playerId)!;
    const pState = nextState.playerStates[playerId];

    const targetLength = state.text.length;
    const charIndex = Math.min(targetLength, Math.max(pState.charIndex, move.charIndex));
    const progress = Math.min(100, Math.round((charIndex / targetLength) * 100));
    const isCompleted = charIndex >= targetLength;

    const now = context.timestamp || Date.now();
    const finishTimeMs = isCompleted
      ? pState.finishTimeMs ?? Math.max(500, now - state.startTime)
      : null;

    pState.charIndex = charIndex;
    pState.wpm = Math.max(0, Math.round(move.wpm));
    pState.accuracy = Math.min(100, Math.max(0, Math.round(move.accuracy)));
    pState.mistakesCount = Math.max(0, move.mistakesCount);
    pState.progress = progress;
    pState.completed = isCompleted;
    pState.finishTimeMs = finishTimeMs;

    if (now >= state.startTime && nextState.status === 'COUNTDOWN') {
      nextState.status = 'RACING';
    }

    if (isCompleted && !nextState.winnerPlayerId) {
      nextState.status = 'FINISHED';
      nextState.winnerPlayerId = playerId;
      nextState.loserPlayerId = otherPlayerId;
      nextState.summary = `Victory at ${pState.wpm} WPM with ${pState.accuracy}% accuracy!`;
    }

    return nextState;
  }

  public isFinished(state: TypingRaceState): boolean {
    return state.status === 'FINISHED' || state.winnerPlayerId !== null;
  }

  public getResult(state: TypingRaceState): GameResult {
    if (state.winnerPlayerId) {
      return {
        winnerPlayerId: state.winnerPlayerId,
        loserPlayerId: state.loserPlayerId || null,
        result: 'WIN',
        reason: 'COMPLETED',
        summary: state.summary || 'Decided by typing speed!',
      };
    }

    return {
      winnerPlayerId: null,
      loserPlayerId: null,
      result: 'DRAW',
      reason: 'COMPLETED',
      summary: 'Race ended in a tie.',
    };
  }
}

export const typingRaceEngine = new TypingRaceEngine();
