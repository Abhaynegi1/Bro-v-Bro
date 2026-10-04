import React from 'react';

export interface GamePixelIconProps {
  gameId: string;
  size?: number;
  className?: string;
}

const GAME_ICON_MAP: Record<string, string> = {
  'tic-tac-toe': '/icons/tic-tac-toe.png',
  'reaction-test': '/icons/reaction-test.png',
  'connect-four': '/icons/connect-four.png',
  'wordle': '/icons/wordle.png',
  'minesweeper': '/icons/minesweeper.png',
  'chess': '/icons/chess.png',
};

export const GamePixelIcon: React.FC<GamePixelIconProps> = ({
  gameId,
  size = 32,
  className = '',
}) => {
  const src = GAME_ICON_MAP[gameId] || '/icons/tic-tac-toe.png';

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated' }}
      className={`select-none object-contain inline-block ${className}`}
    />
  );
};
