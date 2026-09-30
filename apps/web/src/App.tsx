import React, { useState, useEffect, useCallback } from 'react';
import type { RoomState } from '@bvb/shared';
import { useSocket } from './hooks/useSocket';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { WaitingRoomView } from './components/WaitingRoomView';

const STORAGE_KEYS = {
  ROOM_CODE: 'bvb_room_code',
  PLAYER_ID: 'bvb_player_id',
  SESSION_TOKEN: 'bvb_session_token',
};

export const App: React.FC = () => {
  const [roomCode, setRoomCode] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEYS.ROOM_CODE));
  const [playerId, setPlayerId] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEYS.PLAYER_ID));
  const [sessionToken, setSessionToken] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEYS.SESSION_TOKEN));

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handlePlayerJoined = useCallback((data: { name: string; playerId: string }) => {
    setNotification(`🔥 ${data.name} entered the room!`);
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const { isConnected, roomState, setRoomState, toggleReady } = useSocket({
    roomCode,
    playerId,
    sessionToken,
    onPlayerJoined: handlePlayerJoined,
  });

  // Keep state synchronized with storage
  useEffect(() => {
    if (roomCode) sessionStorage.setItem(STORAGE_KEYS.ROOM_CODE, roomCode);
    else sessionStorage.removeItem(STORAGE_KEYS.ROOM_CODE);

    if (playerId) sessionStorage.setItem(STORAGE_KEYS.PLAYER_ID, playerId);
    else sessionStorage.removeItem(STORAGE_KEYS.PLAYER_ID);

    if (sessionToken) sessionStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);
    else sessionStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
  }, [roomCode, playerId, sessionToken]);

  const handleCreateRoom = async (hostName: string, targetWins: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName, targetWins }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create room.');
      }

      setRoomCode(data.roomCode);
      setPlayerId(data.playerId);
      setSessionToken(data.sessionToken);
      setRoomState(data.room);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (code: string, guestName: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to join room.');
      }

      setRoomCode(data.roomCode);
      setPlayerId(data.playerId);
      setSessionToken(data.sessionToken);
      setRoomState(data.room);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to join room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    setRoomCode(null);
    setPlayerId(null);
    setSessionToken(null);
    setRoomState(null);
    setErrorMessage(null);
    sessionStorage.clear();
  };

  const handleStartMatch = () => {
    alert("🎉 Phase 1 Verified! In Phase 2, this launches the Tic Tac Toe multiplayer round.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink text-paper font-mono relative selection:bg-arcadeRed selection:text-white">
      {/* Delicate CRT scanline texture */}
      <div className="fixed inset-0 crt-overlay pointer-events-none z-40 opacity-40" />

      <Header
        roomCode={roomCode}
        isConnected={roomCode ? isConnected : undefined}
        onLeave={roomCode ? handleLeaveRoom : undefined}
      />

      {/* Floating Retro Notification Banner */}
      {notification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-paper text-ink border-2 border-ink shadow-pixel font-arcade text-xs tracking-wider animate-pixel-idle">
          {notification}
        </div>
      )}

      <main className="flex-1 flex flex-col relative z-10">
        {!roomCode || !roomState ? (
          <LandingView
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        ) : (
          <WaitingRoomView
            roomState={roomState}
            myPlayerId={playerId || ''}
            onToggleReady={toggleReady}
            onLeaveRoom={handleLeaveRoom}
            onStartMatch={handleStartMatch}
          />
        )}
      </main>
    </div>
  );
};

export default App;
