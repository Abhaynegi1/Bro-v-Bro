import React from 'react';
import type { ChessPieceType, ChessPieceColor } from '@bvb/shared';

interface ChessPieceIconProps {
  type: ChessPieceType;
  color: ChessPieceColor;
  className?: string;
}

export const ChessPieceIcon: React.FC<ChessPieceIconProps> = ({
  type,
  color,
  className = 'w-full h-full',
}) => {
  const isWhite = color === 'w';

  // Palette:
  // White: Bright pearl white body with charcoal stroke and subtle highlight
  // Black: Deep midnight charcoal body with gold/silver accents
  const fill = isWhite ? '#FFFFFF' : '#1E293B';
  const stroke = isWhite ? '#171A1F' : '#F1F5F9';
  const secondary = isWhite ? '#E2E8F0' : '#0F172A';

  switch (type) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M13 39.5h19"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M22 10c-3.5 0-6.5 2-8 5.5-1.5 3.5-.5 8.5 2 11.5-1 1-3 1.5-4 1.5-1 0-2-.5-2.5-1.5-.5 3 1.5 5 3.5 6 1.5.5 3.5.5 5.5 0 1-.5 2-1.5 2.5-2.5 1 2 3 3.5 5.5 4 4.5.5 8-1.5 10-6.5 1.5-4 1-9-1.5-12.5-2-3-5.5-5-13-5z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"
            fill={isWhite ? '#171A1F' : '#F4D35E'}
          />
          <path
            d="M14 15.5c2-1 5-1 7 .5"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M11 39.5h23"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
            <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
          </g>
          <path
            d="M17.5 26h10M22.5 10v4M20 12h5"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
            <path d="M14 14l1.5 18h14l1.5-18H14z" />
          </g>
          <path
            d="M14 17h17M14 29h17"
            fill="none"
            stroke={secondary}
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
            <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-8.5-14-8.5 14-7-11 2 12z" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 20.5 1 27 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4l-33 0z" />
          </g>
          <path
            d="M11 38.5h23"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M22.5 11.5V6M20 8.5h5"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <g fill={fill} stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 25c0-4 4.5-5.5 4.5-10.5 0-3-2-5-4.5-5-2.5 0-4.5 2-4.5 5 0 5 4.5 6.5 4.5 10.5z" />
            <path d="M11.5 37c5.5 2.5 16.5 2.5 22 0 0-3-2-4.5-4-5.5-3.5-1-10.5-1-14 0-2 1-4 2.5-4 5.5z" />
            <path d="M12.5 30c5.5-2 14.5-2 20 0l1.5-5c-5.5-2-17.5-2-23 0l1.5 5z" />
          </g>
          <path
            d="M10 39.5h25"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
};
