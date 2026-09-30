import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { RoomState } from '@bvb/shared';
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
    });

    socket.on(SOCKET_EVENTS.ROOM_PLAYER_JOINED, (data: { name: string; playerId: string }) => {
      onPlayerJoined?.(data);
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

  return {
    socket: socketRef.current,
    isConnected,
    roomState,
    setRoomState,
    error,
    toggleReady,
  };
}
