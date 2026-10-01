import type {
  GameDefinition,
  ReactionTestState,
  ReactionTestMove,
  MoveContext,
  GameResult,
} from '@bvb/shared';

export class ReactionTestEngine
  implements GameDefinition<ReactionTestState, ReactionTestMove>
{
  public readonly id = 'reaction-test';
  public readonly name = 'Reflex Duel';
  public readonly description = 'Lightning reflex test — wait for green and click!';
  public readonly minPlayers = 2 as const;
  public readonly maxPlayers = 2 as const;

  public createInitialState(playerIds: [string, string]): ReactionTestState {
    const now = Date.now();
    // Random delay between 2.2s and 4.5s
    const randomDelay = Math.floor(Math.random() * 2300) + 2200;
    const triggerAt = now + randomDelay;

    return {
      playerIds,
      triggerAt,
      status: 'WAITING',
      playerResults: {
        [playerIds[0]]: { reactionMs: null, earlyClick: false },
        [playerIds[1]]: { reactionMs: null, earlyClick: false },
      },
      winnerPlayerId: null,
      loserPlayerId: null,
      summary: undefined,
    };
  }

  public validateMove(
    state: ReactionTestState,
    move: ReactionTestMove,
    context: MoveContext
  ): boolean {
    if (state.status === 'FINISHED') return false;
    if (!state.playerIds.includes(context.playerId)) return false;
    if (move.action !== 'CLICK') return false;

    const existingResult = state.playerResults[context.playerId];
    if (existingResult && existingResult.reactionMs !== null) {
      return false; // Already registered click
    }

    return true;
  }

  public applyMove(
    state: ReactionTestState,
    move: ReactionTestMove,
    context: MoveContext
  ): ReactionTestState {
    const nextState: ReactionTestState = {
      ...state,
      playerResults: {
        ...state.playerResults,
      },
    };

    const otherPlayerId = state.playerIds.find((id) => id !== context.playerId)!;
    const now = context.timestamp || Date.now();

    // Check if clicked BEFORE trigger time (False Start!)
    if (now < state.triggerAt) {
      nextState.playerResults[context.playerId] = {
        reactionMs: -1,
        earlyClick: true,
        clickedAt: now,
      };
      nextState.status = 'FINISHED';
      nextState.winnerPlayerId = otherPlayerId;
      nextState.loserPlayerId = context.playerId;
      nextState.summary = 'False start! Clicked too early.';
      return nextState;
    }

    // Valid reaction click!
    const reactionMs = now - state.triggerAt;
    nextState.playerResults[context.playerId] = {
      reactionMs,
      earlyClick: false,
      clickedAt: now,
    };

    // First valid click wins the quickdraw!
    nextState.status = 'FINISHED';
    nextState.winnerPlayerId = context.playerId;
    nextState.loserPlayerId = otherPlayerId;
    nextState.summary = `Quickdraw victory with ${reactionMs}ms reaction time!`;

    return nextState;
  }

  public isFinished(state: ReactionTestState): boolean {
    return state.status === 'FINISHED' || state.winnerPlayerId !== null;
  }

  public getResult(state: ReactionTestState): GameResult {
    if (state.winnerPlayerId) {
      return {
        winnerPlayerId: state.winnerPlayerId,
        loserPlayerId: state.loserPlayerId || null,
        result: 'WIN',
        reason: 'COMPLETED',
        summary: state.summary || 'Round decided by reflex speed!',
      };
    }

    return {
      winnerPlayerId: null,
      loserPlayerId: null,
      result: 'DRAW',
      reason: 'COMPLETED',
      summary: 'Round ended in a tie.',
    };
  }
}

export const reactionTestEngine = new ReactionTestEngine();
