import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { RoomState, ChessState, ChessMove, ChessPieceColor, ChessPieceType } from '@bvb/shared';
import { Chess } from 'chess.js';
import confetti from 'canvas-confetti';
import { ChessPieceIcon } from './ChessPieceIcon';
import { Flag, Clock, Crown, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { GamePixelIcon } from '../game-icons/GamePixelIcon';
import { soundFx } from '../../utils/audio';

interface ChessGameProps {
  roomState: RoomState;
  gameState: ChessState;
  myPlayerId: string;
  onSendMove: (move: ChessMove) => void;
  theme?: 'day' | 'night';
}

const PIECE_VALUES: Record<ChessPieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const STARTING_PIECES: Record<ChessPieceColor, Record<ChessPieceType, number>> = {
  w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
  b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
};

export const ChessGame: React.FC<ChessGameProps> = ({
  roomState,
  gameState,
  myPlayerId,
  onSendMove,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const { playerA, playerB } = roomState.players;

  const isWhite = myPlayerId === gameState.playerWhiteId;
  const myColor: ChessPieceColor = isWhite ? 'w' : 'b';
  const opponentColor: ChessPieceColor = isWhite ? 'b' : 'w';

  const opponentPlayerId = isWhite
    ? gameState.playerBlackId
    : gameState.playerWhiteId;

  const mySlot = playerA?.id === myPlayerId ? playerA : playerB;
  const opponentSlot = playerA?.id === opponentPlayerId ? playerA : playerB;

  const isMyTurn =
    gameState.status === 'IN_PROGRESS' &&
    gameState.currentTurnPlayerId === myPlayerId;

  const isFinished = gameState.status !== 'IN_PROGRESS';
  const iWon = gameState.status === 'WIN' && gameState.winnerPlayerId === myPlayerId;
  const iLost =
    gameState.status === 'WIN' &&
    gameState.winnerPlayerId &&
    gameState.winnerPlayerId !== myPlayerId;

  // Chess.js instance for client-side move validation & legal squares
  const chess = useMemo(() => new Chess(gameState.fen), [gameState.fen]);

  // Selected square & legal move highlights
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [showResignModal, setShowResignModal] = useState(false);

  // Live countdown timer state (ms)
  const [clocks, setClocks] = useState(gameState.clocks);
  const timeoutClaimedRef = useRef(false);

  // Reset timeout claim flag when turn or game changes
  useEffect(() => {
    timeoutClaimedRef.current = false;
  }, [gameState.currentTurnPlayerId, gameState.status]);

  // Real-time smooth clock tick
  useEffect(() => {
    if (gameState.status !== 'IN_PROGRESS') {
      setClocks(gameState.clocks);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(0, now - gameState.lastMoveTimestamp);
      const activeId = gameState.currentTurnPlayerId;
      const currentRemaining = Math.max(0, (gameState.clocks[activeId] ?? 0) - elapsed);

      setClocks({
        ...gameState.clocks,
        [activeId]: currentRemaining,
      });

      // If active opponent's clock has run down to 0, claim victory on timeout
      if (
        currentRemaining <= 0 &&
        activeId !== myPlayerId &&
        !timeoutClaimedRef.current
      ) {
        timeoutClaimedRef.current = true;
        onSendMove({ action: 'CLAIM_TIMEOUT' });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    gameState.status,
    gameState.clocks,
    gameState.lastMoveTimestamp,
    gameState.currentTurnPlayerId,
    myPlayerId,
    onSendMove,
  ]);

  // Victory Confetti
  useEffect(() => {
    if (iWon) {
      confetti({
        particleCount: 100,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#F4D35E', '#42B8C7', '#E84B4B', '#69B85A'],
      });
    }
  }, [iWon]);

  // Format time mm:ss
  const formatTime = (ms: number) => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get current board piece grid (8x8)
  const boardMatrix = useMemo(() => chess.board(), [chess]);

  // Compute legal moves for selected square
  const legalMoves = useMemo(() => {
    if (!selectedSquare || !isMyTurn) return [];
    return chess.moves({ square: selectedSquare as any, verbose: true });
  }, [chess, selectedSquare, isMyTurn]);

  const legalTargetSquares = useMemo(() => {
    return new Set<string>(legalMoves.map((m) => m.to));
  }, [legalMoves]);

  // King in check square
  const checkKingSquare = useMemo(() => {
    if (!gameState.isCheck) return null;
    const turnColor = chess.turn();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardMatrix[r][c];
        if (piece && piece.type === 'k' && piece.color === turnColor) {
          return piece.square;
        }
      }
    }
    return null;
  }, [gameState.isCheck, chess, boardMatrix]);

  // Compute captured pieces and material advantage
  const { whiteCaptured, blackCaptured, whiteAdvantage, blackAdvantage } =
    useMemo(() => {
      const remaining: Record<ChessPieceColor, Record<ChessPieceType, number>> = {
        w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
        b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      };

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = boardMatrix[r][c];
          if (piece) {
            remaining[piece.color][piece.type]++;
          }
        }
      }

      const whiteLost: ChessPieceType[] = [];
      const blackLost: ChessPieceType[] = [];
      let whiteScore = 0;
      let blackScore = 0;

      (['q', 'r', 'b', 'n', 'p'] as ChessPieceType[]).forEach((type) => {
        const wDiff = STARTING_PIECES.w[type] - remaining.w[type];
        for (let i = 0; i < wDiff; i++) whiteLost.push(type);

        const bDiff = STARTING_PIECES.b[type] - remaining.b[type];
        for (let i = 0; i < bDiff; i++) blackLost.push(type);

        whiteScore += remaining.w[type] * PIECE_VALUES[type];
        blackScore += remaining.b[type] * PIECE_VALUES[type];
      });

      return {
        whiteCaptured: blackLost, // pieces White captured from Black
        blackCaptured: whiteLost, // pieces Black captured from White
        whiteAdvantage: Math.max(0, whiteScore - blackScore),
        blackAdvantage: Math.max(0, blackScore - whiteScore),
      };
    }, [boardMatrix]);

  // Board coordinates based on orientation
  const ranks = isWhite ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const files = isWhite
    ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

  const handleSquareClick = (square: string) => {
    if (!isMyTurn || isFinished) return;

    // If already selected, check if clicked square is a legal destination
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        soundFx.play('click');
        return;
      }

      const targetMove = legalMoves.find((m) => m.to === square);
      if (targetMove) {
        // Check for promotion (Pawn moving to rank 8 or rank 1)
        if (targetMove.piece === 'p' && (square.endsWith('8') || square.endsWith('1'))) {
          setPendingPromotion({ from: selectedSquare, to: square });
          soundFx.play('click');
          return;
        }

        // Send normal move
        soundFx.play('move');
        onSendMove({ action: 'MOVE', from: selectedSquare, to: square });
        setSelectedSquare(null);
        return;
      }
    }

    // Try selecting piece on clicked square
    const piece = chess.get(square as any);
    if (piece && piece.color === myColor) {
      soundFx.play('click');
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const handleSelectPromotion = (promoPiece: 'q' | 'r' | 'b' | 'n') => {
    if (!pendingPromotion) return;
    onSendMove({
      action: 'MOVE',
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: promoPiece,
    });
    setPendingPromotion(null);
    setSelectedSquare(null);
  };

  const handleResign = () => {
    setShowResignModal(false);
    onSendMove({ action: 'RESIGN' });
  };

  const myClockMs = clocks[myPlayerId] ?? gameState.clocks[myPlayerId] ?? 0;
  const oppClockMs = clocks[opponentPlayerId] ?? gameState.clocks[opponentPlayerId] ?? 0;

  const isMyClockLow = myClockMs < 20_000 && gameState.status === 'IN_PROGRESS';
  const isOppClockLow = oppClockMs < 20_000 && gameState.status === 'IN_PROGRESS';

  return (
    <div className="flex-1 flex flex-col items-center justify-start sm:justify-center px-2 sm:px-4 py-3 sm:py-5 max-w-5xl mx-auto w-full select-none">
      {/* Top Banner Status */}
      <div
        className={`w-full max-w-3xl py-2 px-4 mb-3 border-2 transition-all text-center shadow-pixel flex items-center justify-between ${
          isFinished
            ? iWon
              ? 'bg-gameboyGreen text-ink border-ink font-bold'
              : iLost
              ? 'bg-arcadeRed text-white border-ink font-bold'
              : 'bg-cartridgeYellow text-ink border-ink font-bold'
            : isMyTurn
            ? 'bg-cartridgeYellow text-darkNavy border-ink animate-pulse font-bold'
            : isNight
            ? 'bg-[#18243A] text-paper border-ink'
            : 'bg-paper text-ink border-ink'
        }`}
      >
        <div className="flex items-center justify-center gap-2 mx-auto">
          <GamePixelIcon gameId="chess" size={20} className="flex-shrink-0" />
          <span className="font-arcade text-xs sm:text-sm tracking-wider uppercase font-bold flex items-center gap-2">
          {isFinished ? (
            iWon ? (
              <>
                <Crown className="w-4 h-4 text-cartridgeYellow animate-bounce" />
                <span>★ CHECKMATE! YOU WON THE CHESS DUEL! ★</span>
              </>
            ) : iLost ? (
              <>
                <ShieldAlert className="w-4 h-4 text-white" />
                <span>💀 DEFEAT! {gameState.summary || 'OPPONENT WON THE CHESS DUEL'} 💀</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-ink" />
                <span>⚔️ STALEMATE / DRAW! PEACE ON THE BOARD ⚔️</span>
              </>
            )
          ) : isMyTurn ? (
            gameState.isCheck ? (
              <span className="text-arcadeRed font-bold animate-bounce">
                ⚠️ CHECK! YOUR KING IS UNDER ATTACK! MAKE A MOVE!
              </span>
            ) : (
              `★ YOUR TURN (${isWhite ? 'WHITE' : 'BLACK'}) — CHOOSE YOUR MOVE ★`
            )
          ) : (
            `⏳ OPPONENT'S TURN (${isWhite ? 'BLACK' : 'WHITE'})... AWAITING MOVE`
          )}
          </span>
        </div>
      </div>

      <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4">
        {/* Main Chess Arena */}
        <div className="flex flex-col items-center">
          {/* Opponent Player Card & Digital Clock */}
          <div
            className={`w-full max-w-[460px] mb-2 px-3 py-2 border-2 border-ink flex items-center justify-between shadow-pixel-sm ${
              isNight ? 'bg-[#121E38] text-white' : 'bg-paper text-ink'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base sm:text-lg">
                {opponentColor === 'w' ? '♔' : '♚'}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-arcade text-xs uppercase truncate max-w-[150px] font-bold">
                  {opponentSlot?.name || 'OPPONENT'}
                </span>
                {/* Captured pieces */}
                <div className="flex items-center gap-0.5 text-xs text-muted-foreground flex-wrap">
                  {(opponentColor === 'w' ? whiteCaptured : blackCaptured).map((type, i) => (
                    <span key={i} className="text-xs">
                      {type === 'q' ? '♛' : type === 'r' ? '♜' : type === 'b' ? '♝' : type === 'n' ? '♞' : '♟'}
                    </span>
                  ))}
                  {(opponentColor === 'w' ? whiteAdvantage : blackAdvantage) > 0 && (
                    <span className={`font-pixel text-[10px] font-bold ml-1 ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
                      +{(opponentColor === 'w' ? whiteAdvantage : blackAdvantage)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Opponent Digital Retro Clock */}
            <div
              className={`px-3 py-1 border-2 border-ink font-mono text-sm sm:text-base font-bold flex items-center gap-1.5 shadow-pixel-sm transition-all ${
                !isMyTurn && gameState.status === 'IN_PROGRESS'
                  ? isOppClockLow
                    ? 'bg-arcadeRed text-white animate-pulse'
                    : 'bg-darkNavy text-gameboyGreen'
                  : 'bg-mutedNavy text-white/70'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(oppClockMs)}</span>
            </div>
          </div>

          {/* Chess Board Container */}
          <div className="relative p-2 sm:p-3 bg-[#2D3748] border-4 border-ink shadow-pixel-lg rounded-none">
            <div className="grid grid-cols-8 grid-rows-8 w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] border-2 border-ink">
              {ranks.map((rank, rIdx) =>
                files.map((file, fIdx) => {
                  const square = `${file}${rank}`;
                  const piece = chess.get(square as any);

                  // Standard square dark/light parity
                  const fileNum = file.charCodeAt(0) - 96; // 1..8
                  const isDarkSquare = (fileNum + rank) % 2 === 0;

                  // Highlighting conditions
                  const isSelected = selectedSquare === square;
                  const isLegalTarget = legalTargetSquares.has(square);
                  const isLastMoveSquare =
                    gameState.lastMove &&
                    (gameState.lastMove.from === square || gameState.lastMove.to === square);
                  const isKingInCheck = checkKingSquare === square;

                  return (
                    <button
                      key={square}
                      type="button"
                      onClick={() => handleSquareClick(square)}
                      className={`relative flex items-center justify-center transition-colors focus:outline-none ${
                        isDarkSquare ? 'bg-[#769656]' : 'bg-[#EEEED2]'
                      } ${
                        isLastMoveSquare ? 'ring-2 ring-inset ring-cartridgeYellow/80 bg-cartridgeYellow/40' : ''
                      } ${
                        isSelected ? 'bg-amber-300 ring-2 ring-ink ring-inset z-10' : ''
                      } ${
                        isKingInCheck ? 'bg-arcadeRed/80 ring-4 ring-arcadeRed ring-inset animate-pulse z-10' : ''
                      }`}
                    >
                      {/* Rank & File coordinate markers on borders */}
                      {fIdx === 0 && (
                        <span
                          className={`absolute top-0.5 left-1 text-[9px] font-pixel pointer-events-none select-none ${
                            isDarkSquare ? 'text-[#EEEED2]' : 'text-[#769656]'
                          }`}
                        >
                          {rank}
                        </span>
                      )}
                      {rIdx === 7 && (
                        <span
                          className={`absolute bottom-0.5 right-1 text-[9px] font-pixel pointer-events-none select-none ${
                            isDarkSquare ? 'text-[#EEEED2]' : 'text-[#769656]'
                          }`}
                        >
                          {file}
                        </span>
                      )}

                      {/* Chess Piece SVG */}
                      {piece && (
                        <div className="w-[82%] h-[82%] flex items-center justify-center transition-transform hover:scale-105 pointer-events-none">
                          <ChessPieceIcon type={piece.type} color={piece.color} />
                        </div>
                      )}

                      {/* Legal Move Target Marker */}
                      {isLegalTarget && (
                        <div
                          className={`absolute pointer-events-none ${
                            piece
                              ? 'w-[90%] h-[90%] border-4 border-amber-400 rounded-full animate-pulse'
                              : 'w-3.5 h-3.5 bg-ink/35 rounded-full ring-2 ring-ink/20'
                          }`}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Pawn Promotion Modal Overlay */}
            {pendingPromotion && (
              <div className="absolute inset-0 bg-darkNavy/85 flex flex-col items-center justify-center p-4 z-30">
                <span className="font-pixel text-xs text-cartridgeYellow mb-3 tracking-wider text-center">
                  PROMOTION! CHOOSE PIECE:
                </span>
                <div className="flex gap-2 bg-paper p-3 border-2 border-ink shadow-pixel">
                  {(['q', 'r', 'b', 'n'] as const).map((promo) => (
                    <button
                      key={promo}
                      type="button"
                      onClick={() => handleSelectPromotion(promo)}
                      className="w-12 h-12 p-1.5 bg-white hover:bg-cartridgeYellow border-2 border-ink transition-transform hover:scale-110 flex items-center justify-center"
                    >
                      <ChessPieceIcon type={promo} color={myColor} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* My Player Card & Digital Clock */}
          <div
            className={`w-full max-w-[460px] mt-2 px-3 py-2 border-2 border-ink flex items-center justify-between shadow-pixel-sm ${
              isNight ? 'bg-[#121E38] text-white' : 'bg-paper text-ink'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base sm:text-lg">
                {myColor === 'w' ? '♔' : '♚'}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-arcade text-xs uppercase truncate max-w-[150px] font-bold">
                  {mySlot?.name || 'YOU'} (YOU)
                </span>
                {/* Captured pieces */}
                <div className="flex items-center gap-0.5 text-xs text-muted-foreground flex-wrap">
                  {(myColor === 'w' ? whiteCaptured : blackCaptured).map((type, i) => (
                    <span key={i} className="text-xs">
                      {type === 'q' ? '♛' : type === 'r' ? '♜' : type === 'b' ? '♝' : type === 'n' ? '♞' : '♟'}
                    </span>
                  ))}
                  {(myColor === 'w' ? whiteAdvantage : blackAdvantage) > 0 && (
                    <span className={`font-pixel text-[10px] font-bold ml-1 ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
                      +{(myColor === 'w' ? whiteAdvantage : blackAdvantage)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* My Digital Retro Clock */}
            <div
              className={`px-3 py-1 border-2 border-ink font-mono text-sm sm:text-base font-bold flex items-center gap-1.5 shadow-pixel-sm transition-all ${
                isMyTurn && gameState.status === 'IN_PROGRESS'
                  ? isMyClockLow
                    ? 'bg-arcadeRed text-white animate-pulse'
                    : 'bg-darkNavy text-cartridgeYellow'
                  : 'bg-mutedNavy text-white/70'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(myClockMs)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Move Transcript & Quick Actions */}
        <div className="w-full lg:w-64 flex flex-col gap-3">
          {/* Move History / SAN Notation Box */}
          <div
            className={`border-2 border-ink p-3 shadow-pixel flex flex-col h-48 lg:h-[380px] ${
              isNight ? 'bg-[#142247] text-white' : 'bg-paper text-ink'
            }`}
          >
            <div className="flex items-center justify-between border-b-2 border-ink pb-1.5 mb-2">
              <span className={`font-pixel text-[10px] tracking-wider uppercase font-bold ${isNight ? 'text-cartridgeYellow' : 'text-amber-800'}`}>
                MOVE LOG
              </span>
              <span className="font-mono text-xs opacity-75">
                {gameState.history.length} MOVES
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs pr-1">
              {gameState.history.length === 0 ? (
                <div className="text-center opacity-60 text-xs py-8">
                  Game in progress... Waiting for opening move.
                </div>
              ) : (
                Array.from({ length: Math.ceil(gameState.history.length / 2) }).map(
                  (_, pairIdx) => {
                    const moveNum = pairIdx + 1;
                    const whiteMove = gameState.history[pairIdx * 2];
                    const blackMove = gameState.history[pairIdx * 2 + 1];

                    return (
                      <div
                        key={moveNum}
                        className="grid grid-cols-5 gap-1 py-0.5 px-1 hover:bg-black/10 transition-colors"
                      >
                        <span className="col-span-1 text-muted-foreground opacity-60">
                          {moveNum}.
                        </span>
                        <span className="col-span-2 font-bold font-mono">
                          {whiteMove ? whiteMove.san : ''}
                        </span>
                        <span className="col-span-2 font-bold font-mono">
                          {blackMove ? blackMove.san : ''}
                        </span>
                      </div>
                    );
                  }
                )
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isFinished}
              onClick={() => setShowResignModal(true)}
              className="flex-1 py-2 px-3 bg-arcadeRed hover:bg-red-600 disabled:opacity-40 text-white font-pixel text-[10px] uppercase border-2 border-ink shadow-pixel hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>RESIGN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resign Confirmation Modal */}
      {showResignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-paper text-ink border-3 border-ink p-5 max-w-sm w-full shadow-pixel-lg text-center">
            <Flag className="w-8 h-8 text-arcadeRed mx-auto mb-2" />
            <h3 className="font-pixel text-xs sm:text-sm text-darkNavy mb-2">
              SURRENDER MATCH?
            </h3>
            <p className="font-mono text-xs text-muted-foreground mb-4">
              Are you sure you want to resign? Victory will immediately be awarded to your opponent.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowResignModal(false)}
                className="py-1.5 px-4 bg-gray-200 hover:bg-gray-300 font-pixel text-[10px] border-2 border-ink shadow-pixel"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleResign}
                className="py-1.5 px-4 bg-arcadeRed hover:bg-red-600 text-white font-pixel text-[10px] border-2 border-ink shadow-pixel"
              >
                YES, RESIGN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
