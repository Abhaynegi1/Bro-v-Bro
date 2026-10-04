import type {
  GameDefinition,
  FlagDuelState,
  FlagDuelMove,
  MoveContext,
  GameResult,
} from '@bvb/shared';
import { generateFlagQuestion } from '@bvb/shared';

export class FlagDuelEngine implements GameDefinition<FlagDuelState, FlagDuelMove> {
  public readonly id = 'flag-duel';
  public readonly name = 'Flag Duel';
  public readonly description = 'Rapid 1v1 flag identification! First to 3 correct wins, but 3 wrong answers eliminate you.';
  public readonly minPlayers = 2 as const;
  public readonly maxPlayers = 2 as const;

  public createInitialState(playerIds: [string, string]): FlagDuelState {
    const q1 = generateFlagQuestion([]);

    return {
      playerIds,
      currentQuestionIndex: 1,
      currentFlag: {
        questionIndex: 1,
        countryCode: q1.countryCode,
        options: q1.options,
      },
      targetCountryName: q1.countryName,
      playerStates: {
        [playerIds[0]]: {
          lives: 3,
          score: 0,
          lastSelected: null,
          lastAnswerCorrect: null,
          isEliminated: false,
        },
        [playerIds[1]]: {
          lives: 3,
          score: 0,
          lastSelected: null,
          lastAnswerCorrect: null,
          isEliminated: false,
        },
      },
      status: 'IN_PROGRESS',
      winnerPlayerId: null,
      loserPlayerId: null,
      summary: undefined,
      roundWinnerId: null,
    };
  }

  public validateMove(
    state: FlagDuelState,
    move: FlagDuelMove,
    context: MoveContext
  ): boolean {
    if (state.status === 'FINISHED') return false;
    if (!state.playerIds.includes(context.playerId)) return false;

    const pState = state.playerStates[context.playerId];
    if (!pState || pState.isEliminated || pState.lives <= 0) return false;

    // Player already answered the current question
    if (pState.lastSelected !== null) return false;

    if (move.action !== 'GUESS') return false;
    if (!state.currentFlag.options.includes(move.country)) return false;

    return true;
  }

  public applyMove(
    state: FlagDuelState,
    move: FlagDuelMove,
    context: MoveContext
  ): FlagDuelState {
    const nextState: FlagDuelState = {
      ...state,
      playerStates: {
        [state.playerIds[0]]: { ...state.playerStates[state.playerIds[0]] },
        [state.playerIds[1]]: { ...state.playerStates[state.playerIds[1]] },
      },
    };

    const playerId = context.playerId;
    const otherPlayerId = state.playerIds.find((id) => id !== playerId)!;
    const pState = nextState.playerStates[playerId];
    const otherPState = nextState.playerStates[otherPlayerId];

    const isCorrect = move.country.trim().toLowerCase() === (state.targetCountryName || '').trim().toLowerCase();

    pState.lastSelected = move.country;
    pState.lastAnswerCorrect = isCorrect;

    if (isCorrect) {
      // Correct guess awards a point
      pState.score += 1;
      nextState.roundWinnerId = playerId;

      // Check if winning condition met (3 points)
      if (pState.score >= 3) {
        nextState.status = 'FINISHED';
        nextState.winnerPlayerId = playerId;
        nextState.loserPlayerId = otherPlayerId;
        nextState.summary = 'Flag Master! Correctly identified 3 flags first!';
        return nextState;
      }

      // Advance to next question immediately
      this.advanceToNextQuestion(nextState);
      return nextState;
    } else {
      // Wrong guess costs a life
      pState.lives = Math.max(0, pState.lives - 1);

      // Check if player eliminated (0 lives)
      if (pState.lives <= 0) {
        pState.isEliminated = true;
        nextState.status = 'FINISHED';
        nextState.winnerPlayerId = otherPlayerId;
        nextState.loserPlayerId = playerId;
        nextState.summary = 'Elimination! Lost all 3 lives on incorrect guesses.';
        return nextState;
      }

      // If both players have now answered incorrectly on this question, advance to next question
      if (otherPState.lastSelected !== null && !otherPState.lastAnswerCorrect) {
        this.advanceToNextQuestion(nextState);
      }

      return nextState;
    }
  }

  private advanceToNextQuestion(state: FlagDuelState): void {
    const nextQ = generateFlagQuestion([state.currentFlag.countryCode]);
    const nextIdx = state.currentQuestionIndex + 1;

    state.currentQuestionIndex = nextIdx;
    state.currentFlag = {
      questionIndex: nextIdx,
      countryCode: nextQ.countryCode,
      options: nextQ.options,
    };
    state.targetCountryName = nextQ.countryName;
    state.roundWinnerId = null;

    // Reset player selection state for new question
    for (const pid of state.playerIds) {
      if (state.playerStates[pid]) {
        state.playerStates[pid].lastSelected = null;
        state.playerStates[pid].lastAnswerCorrect = null;
      }
    }
  }

  public sanitizeStateForPlayer(
    state: FlagDuelState,
    _viewingPlayerId: string
  ): FlagDuelState {
    if (state.status === 'FINISHED') {
      return state;
    }

    // Mask target country name while in progress to prevent cheating via network inspection
    const sanitized = { ...state };
    delete sanitized.targetCountryName;
    return sanitized;
  }

  public isFinished(state: FlagDuelState): boolean {
    return state.status === 'FINISHED' || state.winnerPlayerId !== null;
  }

  public getResult(state: FlagDuelState): GameResult {
    if (state.winnerPlayerId) {
      return {
        winnerPlayerId: state.winnerPlayerId,
        loserPlayerId: state.loserPlayerId || null,
        result: 'WIN',
        reason: 'COMPLETED',
        summary: state.summary || 'Flag Duel concluded!',
      };
    }

    return {
      winnerPlayerId: null,
      loserPlayerId: null,
      result: 'DRAW',
      reason: 'COMPLETED',
      summary: 'Flag Duel ended in a tie.',
    };
  }
}

export const flagDuelEngine = new FlagDuelEngine();
