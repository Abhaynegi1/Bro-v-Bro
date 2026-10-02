import React, { useState, useEffect, useCallback } from 'react';
import type { RoomState } from '@bvb/shared';
import { useSocket } from './hooks/useSocket';
import { Header } from './components/Header';
import { UniversalMatchHeader } from './components/UniversalMatchHeader';
import { LandingView } from './components/LandingView';
import { HowToPlayView } from './components/HowToPlayView';
import { WaitingRoomView } from './components/WaitingRoomView';
import { GameSelectionView } from './components/GameSelectionView';
import { TicTacToeGame } from './components/games/TicTacToeGame';
import { ReactionTestGame } from './components/games/ReactionTestGame';
import { ConnectFourGame } from './components/games/ConnectFourGame';
import { WordleGame } from './components/games/WordleGame';
import { MinesweeperGame } from './components/games/MinesweeperGame';
import { ChessGame } from './components/games/ChessGame';
import { RoundResultModal } from './components/RoundResultModal';
import { MatchCompleteView } from './components/MatchCompleteView';
import { MatchPermalinkView } from './components/MatchPermalinkView';

const STORAGE_KEYS = {
  ROOM_CODE: 'bvb_room_code',
  PLAYER_ID: 'bvb_player_id',
  SESSION_TOKEN: 'bvb_session_token',
};

const getInitialPermalinkMatchId = (): string | null => {
  const path = window.location.pathname;
  if (path.startsWith('/match/')) {
    const id = path.replace('/match/', '').trim();
    if (id) return id;
  }
  const params = new URLSearchParams(window.location.search);
  const matchParam = params.get('match');
  if (matchParam) return matchParam;
  return null;
};

export const App: React.FC = () => {
  const [roomCode, setRoomCode] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEYS.ROOM_CODE));
  const [playerId, setPlayerId] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEYS.PLAYER_ID));
  const [sessionToken, setSessionToken] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEYS.SESSION_TOKEN));

  const [theme, setTheme] = useState<'day' | 'night'>(() => (localStorage.getItem('bvb_theme') as 'day' | 'night') || 'day');
  const [currentView, setCurrentView] = useState<'landing' | 'how-to-play'>('landing');
  const [initialModal, setInitialModal] = useState<'create' | 'join' | null>(null);
  const [permalinkMatchId, setPermalinkMatchId] = useState<string | null>(getInitialPermalinkMatchId);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Listen to browser navigation back/forward for permalink URLs
  useEffect(() => {
    const onPopState = () => {
      setPermalinkMatchId(getInitialPermalinkMatchId());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleClosePermalink = () => {
    setPermalinkMatchId(null);
    window.history.pushState({}, '', '/');
  };

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

  const {
    isConnected,
    roomState,
    setRoomState,
    activeGame,
    lastGameResult,
    toggleReady,
    startMatch,
    selectGame,
    startGame,
    sendMove,
    nextRound,
    requestRematch,
  } = useSocket({
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
    startMatch();
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

  const isMatchPhase = Boolean(
    roomState &&
      ['SELECTING_GAME', 'IN_GAME', 'ROUND_COMPLETE', 'MATCH_COMPLETE'].includes(
        roomState.status
      )
  );

  return (
    <div
      className={`w-full text-ink font-mono relative selection:bg-arcadeRed selection:text-white transition-colors duration-700 ${
        currentView === 'how-to-play' || roomCode
          ? 'min-h-screen overflow-y-auto flex flex-col'
          : 'h-screen overflow-hidden flex flex-col'
      }`}
      style={{
        backgroundColor: theme === 'night' ? '#0D193A' : '#72B6F4',
      }}
    >
      {/* Show top Header: Universal Match Header during match series, Lobby Header otherwise */}
      {roomCode && roomState && (
        isMatchPhase ? (
          <UniversalMatchHeader
            roomState={roomState}
            myPlayerId={playerId || ''}
            onLeaveRoom={handleLeaveRoom}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        ) : (
          <Header
            roomCode={roomCode}
            isConnected={isConnected}
            onLeave={handleLeaveRoom}
            currentView={currentView}
            onNavigateHowToPlay={handleOpenHowToPlay}
            onNavigateHome={handleBackToLanding}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )
      )}

      {/* Floating Retro Notification Banner */}
      {notification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-darkNavy text-paper border-2 border-ink shadow-pixel font-arcade text-xs tracking-wider animate-pixel-idle">
          {notification}
        </div>
      )}

      <main
        className={`w-full relative z-10 ${
          currentView === 'how-to-play'
            ? 'min-h-screen flex flex-col w-full'
            : roomCode
            ? 'flex-1 flex flex-col w-full min-h-screen'
            : 'flex-1 flex flex-col w-full h-full overflow-hidden'
        }`}
      >
        {!roomCode || !roomState ? (
          permalinkMatchId ? (
            <MatchPermalinkView
              matchId={permalinkMatchId}
              onGoHome={handleClosePermalink}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          ) : currentView === 'how-to-play' ? (
            <HowToPlayView
              onBack={handleBackToLanding}
              onOpenCreate={handleOpenCreateFromHowToPlay}
              onOpenJoin={handleOpenJoinFromHowToPlay}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
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
        ) : roomState.status === 'MATCH_COMPLETE' ? (
          <MatchCompleteView
            roomState={roomState}
            myPlayerId={playerId || ''}
            onRematch={requestRematch}
            onLeaveRoom={handleLeaveRoom}
            theme={theme}
          />
        ) : roomState.status === 'SELECTING_GAME' ? (
          <GameSelectionView
            roomState={roomState}
            myPlayerId={playerId || ''}
            onSelectGame={selectGame}
            theme={theme}
          />
        ) : (roomState.status === 'IN_GAME' || roomState.status === 'ROUND_COMPLETE') && activeGame ? (
          <div className="flex-1 flex flex-col w-full relative">
            {activeGame.gameId === 'reaction-test' ? (
              <ReactionTestGame
                roomState={roomState}
                gameState={activeGame.state}
                myPlayerId={playerId || ''}
                onSendMove={sendMove}
                theme={theme}
              />
            ) : activeGame.gameId === 'connect-four' ? (
              <ConnectFourGame
                roomState={roomState}
                gameState={activeGame.state}
                myPlayerId={playerId || ''}
                onSendMove={sendMove}
                theme={theme}
              />
            ) : activeGame.gameId === 'wordle' ? (
              <WordleGame
                roomState={roomState}
                gameState={activeGame.state}
                myPlayerId={playerId || ''}
                onSendMove={sendMove}
                theme={theme}
              />
            ) : activeGame.gameId === 'minesweeper' ? (
              <MinesweeperGame
                roomState={roomState}
                gameState={activeGame.state}
                myPlayerId={playerId || ''}
                onSendMove={sendMove}
                theme={theme}
              />
            ) : activeGame.gameId === 'chess' ? (
              <ChessGame
                roomState={roomState}
                gameState={activeGame.state}
                myPlayerId={playerId || ''}
                onSendMove={sendMove}
                theme={theme}
              />
            ) : (
              <TicTacToeGame
                roomState={roomState}
                gameState={activeGame.state as any}
                myPlayerId={playerId || ''}
                onSendMove={sendMove}
                onNextRound={nextRound}
                onRematch={requestRematch}
                onLeaveRoom={handleLeaveRoom}
                lastResult={lastGameResult}
                theme={theme}
              />
            )}

            {roomState.status === 'ROUND_COMPLETE' && (
              <RoundResultModal
                roomState={roomState}
                myPlayerId={playerId || ''}
                onNextRound={nextRound}
                lastResult={lastGameResult}
                theme={theme}
              />
            )}
          </div>
        ) : (
          <WaitingRoomView
            roomState={roomState}
            myPlayerId={playerId || ''}
            onToggleReady={toggleReady}
            onLeaveRoom={handleLeaveRoom}
            onStartMatch={handleStartMatch}
            theme={theme}
          />
        )}
      </main>
    </div>
  );
};

export default App;


