import React from 'react';

export type CharacterType = 'bro1' | 'bro2';
export type CharacterPose = 'idle' | 'waiting' | 'ready' | 'celebrating' | 'defeated';

interface PixelCharacterProps {
  type: CharacterType;
  pose?: CharacterPose;
  size?: number; // width in pixels
  className?: string;
  name?: string;
}

export const PixelCharacter: React.FC<PixelCharacterProps> = ({
  type,
  pose = 'idle',
  size = 64,
  className = '',
  name,
}) => {
  const isBro1 = type === 'bro1';

  // Bro 1: Red headband, Cyan jersey (#E84A4A, #49B8D1)
  // Bro 2: Yellow cap, Green jersey (#F4D35E, #67B85A)
  const skinColor = '#FAD6A5';
  const hairColor = isBro1 ? '#4A3728' : '#2C221E';
  const headbandColor = isBro1 ? '#E84A4A' : '#F4D35E';
  const shirtColor = isBro1 ? '#49B8D1' : '#67B85A';
  const pantsColor = isBro1 ? '#151C30' : '#43566B';
  const shoesColor = '#111522';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className={pose === 'idle' ? 'animate-pixel-idle' : ''}>
        <svg
          width={size}
          height={size * 1.25}
          viewBox="0 0 16 20"
          style={{ shapeRendering: 'crispEdges' }}
          className="drop-shadow-sm"
        >
          {/* Hair / Headband */}
          <rect x="5" y="1" width="6" height="2" fill={hairColor} />
          <rect x="4" y="2" width="8" height="2" fill={hairColor} />
          <rect x="4" y="4" width="8" height="2" fill={headbandColor} />
          {/* Headband tail */}
          {isBro1 ? (
            <rect x="12" y="5" width="2" height="2" fill={headbandColor} />
          ) : (
            <rect x="3" y="3" width="2" height="2" fill={headbandColor} />
          )}

          {/* Face */}
          <rect x="5" y="6" width="6" height="4" fill={skinColor} />
          <rect x="4" y="7" width="1" height="2" fill={skinColor} />
          <rect x="11" y="7" width="1" height="2" fill={skinColor} />

          {/* Eyes - Blinking */}
          {pose === 'defeated' ? (
            <>
              {/* X eyes */}
              <rect x="6" y="7" width="1" height="1" fill="#111522" />
              <rect x="9" y="7" width="1" height="1" fill="#111522" />
            </>
          ) : (
            <g className="animate-pixel-blink">
              <rect x="6" y="7" width="1" height="2" fill="#111522" />
              <rect x="9" y="7" width="1" height="2" fill="#111522" />
            </g>
          )}

          {/* Mouth */}
          {pose === 'celebrating' ? (
            <rect x="7" y="9" width="2" height="1" fill="#E84A4A" />
          ) : (
            <rect x="7" y="9" width="2" height="1" fill="#8B4513" />
          )}

          {/* Torso / Shirt */}
          <rect x="5" y="10" width="6" height="5" fill={shirtColor} />
          <rect x="7" y="11" width="2" height="3" fill="#FFF7DC" />

          {/* Arms according to pose */}
          {pose === 'celebrating' ? (
            <>
              {/* Hands raised in triumph */}
              <rect x="3" y="8" width="2" height="3" fill={shirtColor} />
              <rect x="3" y="6" width="2" height="2" fill={skinColor} />
              <rect x="11" y="8" width="2" height="3" fill={shirtColor} />
              <rect x="11" y="6" width="2" height="2" fill={skinColor} />
            </>
          ) : pose === 'ready' ? (
            <>
              {/* Ready fist pose */}
              <rect x="3" y="11" width="2" height="3" fill={shirtColor} />
              <rect x="2" y="12" width="2" height="2" fill={skinColor} />
              <rect x="11" y="11" width="2" height="3" fill={shirtColor} />
              <rect x="12" y="12" width="2" height="2" fill={skinColor} />
            </>
          ) : (
            <>
              {/* Standard idle arms */}
              <rect x="3" y="11" width="2" height="4" fill={shirtColor} />
              <rect x="3" y="14" width="2" height="1" fill={skinColor} />
              <rect x="11" y="11" width="2" height="4" fill={shirtColor} />
              <rect x="11" y="14" width="2" height="1" fill={skinColor} />
            </>
          )}

          {/* Pants */}
          <rect x="5" y="15" width="6" height="2" fill={pantsColor} />
          <rect x="5" y="17" width="2" height="2" fill={pantsColor} />
          <rect x="9" y="17" width="2" height="2" fill={pantsColor} />

          {/* Shoes */}
          <rect x="4" y="19" width="3" height="1" fill={shoesColor} />
          <rect x="9" y="19" width="3" height="1" fill={shoesColor} />
        </svg>
      </div>

      {name && (
        <span className="font-arcade text-[10px] text-paper mt-1 uppercase tracking-wider bg-ink px-1.5 py-0.5 border border-paper/40">
          {name}
        </span>
      )}
    </div>
  );
};
