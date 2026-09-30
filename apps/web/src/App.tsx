import React, { useState, useEffect, useCallback } from 'react';
import type { RoomState } from '@bvb/shared';
import { useSocket } from './hooks/useSocket';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { HowToPlayView } from './components/HowToPlayView';
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

  const [theme, setTheme] = useState<'day' | 'night'>(() => (localStorage.getItem('bvb_theme') as 'day' | 'night') || 'day');
  const [currentView, setCurrentView] = useState<'landing' | 'how-to-play'>('landing');
  const [initialModal, setInitialModal] = useState<'create' | 'join' | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'day' ? 'night' : 'day';
      localStorage.setItem('bvb_theme', next);
      return next;
    });
  };

  const handlePlayerJoined = useCallback((data: { name: string; playerId: string }) => {
    setNotification(`🔥 ${data.name.toUpperCase()} ENTERED THE ROOM!`);
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
    setCurrentView('landing');
    setInitialModal(null);
    sessionStorage.clear();
  };

  const handleStartMatch = () => {
    alert("🎉 Phase 1 Verified! In Phase 2, this launches the Tic Tac Toe multiplayer round.");
  };

  const handleOpenHowToPlay = () => {
    setCurrentView('how-to-play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setInitialModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCreateFromHowToPlay = () => {
    setCurrentView('landing');
    setInitialModal('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenJoinFromHowToPlay = () => {
    setCurrentView('landing');
    setInitialModal('join');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#0A0F1D] text-ink font-mono relative selection:bg-arcadeRed selection:text-white">
      {/* Show top Header only inside active room */}
      {roomCode && (
        <Header
          roomCode={roomCode}
          isConnected={isConnected}
          onLeave={handleLeaveRoom}
          currentView={currentView}
          onNavigateHowToPlay={handleOpenHowToPlay}
          onNavigateHome={handleBackToLanding}
        />
      )}

      {/* Floating Retro Notification Banner */}
      {notification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-darkNavy text-paper border-2 border-ink shadow-pixel font-arcade text-xs tracking-wider animate-pixel-idle">
          {notification}
        </div>
      )}

      <main className="flex-1 flex flex-col relative z-10 w-full h-full overflow-hidden">

        {!roomCode || !roomState ? (
          currentView === 'how-to-play' ? (
            <div className="w-full max-w-4xl bg-paper my-6 border-3 border-ink shadow-2xl">
              <HowToPlayView
                onBack={handleBackToLanding}
                onOpenCreate={handleOpenCreateFromHowToPlay}
                onOpenJoin={handleOpenJoinFromHowToPlay}
              />
            </div>
          ) : (
            <LandingView
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onOpenHowToPlay={handleOpenHowToPlay}
              initialModal={initialModal}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )
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


