import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { RoomState, ActiveGameData, GameResult } from '@bvb/shared';
import { SOCKET_EVENTS } from '@bvb/shared';

interface UseSocketProps {
  roomCode: string | null;
  playerId: string | null;
  sessionToken: string | null;
  onPlayerJoined?: (data: { name: string; playerId: string }) => void;
}

export function useSocket({ roomCode, playerId, sessionToken, onPlayerJoined }: UseSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [activeGame, setActiveGame] = useState<ActiveGameData | null>(null);
  const [lastGameResult, setLastGameResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode || !playerId || !sessionToken) {
      return;
    }

    // Connect to backend (via Vite proxy or direct)
    const socket = io({
      auth: {
        roomCode,
        playerId,
        sessionToken,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (err) => {
      setError(err.message || 'Connection failed');
      setIsConnected(false);
    });

    socket.on(SOCKET_EVENTS.ROOM_STATE, (state: RoomState) => {
      setRoomState(state);
      if (state.activeGame) {
        setActiveGame(state.activeGame);
      }
      if (state.status === 'READY' || state.status === 'WAITING') {
        setLastGameResult(null);
      }
    });

    socket.on(SOCKET_EVENTS.ROOM_PLAYER_JOINED, (data: { name: string; playerId: string }) => {
      onPlayerJoined?.(data);
    });

    socket.on(SOCKET_EVENTS.GAME_START, (gameData: ActiveGameData) => {
      setActiveGame(gameData);
      setLastGameResult(null);
    });

    socket.on(SOCKET_EVENTS.GAME_STATE, (gameData: ActiveGameData) => {
      setActiveGame(gameData);
    });

    socket.on(SOCKET_EVENTS.GAME_COMPLETE, (data: { gameId: string; result: GameResult }) => {
      setLastGameResult(data.result);
    });

    socket.on(SOCKET_EVENTS.ERROR, (err: { code: string; message: string }) => {
      console.warn('Socket error from server:', err);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomCode, playerId, sessionToken, onPlayerJoined]);

  const toggleReady = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.ROOM_READY_TOGGLE);
    }
  }, [isConnected]);

  const startMatch = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.ROOM_START_MATCH);
    }
  }, [isConnected]);

  const selectGame = useCallback((gameId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.GAME_SELECT, { gameId });
    }
  }, [isConnected]);

  const startGame = useCallback((gameId: string = 'tic-tac-toe') => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.GAME_SELECT, { gameId });
    }
  }, [isConnected]);

  const sendMove = useCallback((move: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.GAME_MOVE, move);
    }
  }, [isConnected]);

  const nextRound = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.ROUND_NEXT);
    }
  }, [isConnected]);

  const requestRematch = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.REMATCH_REQUEST);
    }
  }, [isConnected]);

  const signSurrender = useCallback(
    (data: { signatureDataUrl: string; confessionClause?: string }) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit(SOCKET_EVENTS.SURRENDER_SIGN, data);
      }
    },
    [isConnected]
  );

  return {
    socket: socketRef.current,
    isConnected,
    roomState,
    setRoomState,
    activeGame,
    lastGameResult,
    error,
    toggleReady,
    startMatch,
    selectGame,
    startGame,
    sendMove,
    nextRound,
    requestRematch,
    signSurrender,
  };
}
