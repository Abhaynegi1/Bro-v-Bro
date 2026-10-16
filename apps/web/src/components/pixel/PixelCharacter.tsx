import React from 'react';

export type CharacterType =
  | 'bro1'
  | 'bro2'
  | 'ninja'
  | 'cyborg'
  | 'wizard'
  | 'punk'
  | 'detective'
  | 'golden';

export type CharacterPose = 'idle' | 'waiting' | 'ready' | 'celebrating' | 'defeated';

export interface AvatarOption {
  id: CharacterType;
  name: string;
  tagline: string;
  themeColor: string;
  badge: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'bro1', name: 'RED BRAWLER', tagline: 'Arcade street fighter', themeColor: '#E84A4A', badge: '1P' },
  { id: 'bro2', name: 'GREEN SKATER', tagline: 'Retro platformer pro', themeColor: '#67B85A', badge: '2P' },
  { id: 'ninja', name: 'SHADOW NINJA', tagline: 'Stealth shinobi warrior', themeColor: '#DC2626', badge: 'NIN' },
  { id: 'cyborg', name: 'CYBER MECH', tagline: 'Neon-eyed android', themeColor: '#06B6D4', badge: 'BOT' },
  { id: 'wizard', name: '8-BIT MAGE', tagline: 'Mystic arcane spellcaster', themeColor: '#7C3AED', badge: 'MAG' },
  { id: 'punk', name: 'PIXEL PUNK', tagline: 'Neon mohawk rocker', themeColor: '#EC4899', badge: 'PNK' },
  { id: 'detective', name: 'NOIR SLEUTH', tagline: 'Vintage sleuth with fedora', themeColor: '#92400E', badge: 'DET' },
  { id: 'golden', name: 'GOLDEN CHAMP', tagline: 'Regal arcade champion', themeColor: '#F59E0B', badge: 'PRO' },
];

interface PixelCharacterProps {
  type?: CharacterType | string;
  pose?: CharacterPose;
  size?: number; // width in pixels
  className?: string;
  name?: string;
}

export const PixelCharacter: React.FC<PixelCharacterProps> = ({
  type = 'bro1',
  pose = 'idle',
  size = 64,
  className = '',
  name,
}) => {
  const charId = (type as CharacterType) || 'bro1';

  // Palette & feature assignment by avatar type
  let skinColor = '#FAD6A5';
  let hairColor = '#4A3728';
  let headbandColor = '#E84A4A';
  let shirtColor = '#49B8D1';
  let accentColor = '#FFF7DC';
  let pantsColor = '#151C30';
  let shoesColor = '#111522';

  switch (charId) {
    case 'bro2':
      skinColor = '#FAD6A5';
      hairColor = '#2C221E';
      headbandColor = '#F4D35E'; // Yellow cap
      shirtColor = '#67B85A';    // GameBoy Green
      accentColor = '#FFF7DC';
      pantsColor = '#43566B';
      shoesColor = '#111522';
      break;

    case 'ninja':
      skinColor = '#FAD6A5';
      hairColor = '#09090B';
      headbandColor = '#DC2626'; // Red headband
      shirtColor = '#18181B';    // Black gi
      accentColor = '#F59E0B';   // Gold belt
      pantsColor = '#09090B';
      shoesColor = '#18181B';
      break;

    case 'cyborg':
      skinColor = '#CBD5E1';     // Titanium android skin
      hairColor = '#334155';     // Steel chrome head
      headbandColor = '#06B6D4'; // Cyan neon
      shirtColor = '#1E293B';    // Cyber plating
      accentColor = '#22D3EE';   // Cyan reactor core
      pantsColor = '#0F172A';
      shoesColor = '#06B6D4';
      break;

    case 'wizard':
      skinColor = '#FAD6A5';
      hairColor = '#E2E8F0';     // Silver wizard beard
      headbandColor = '#FBBF24'; // Gold hat buckle
      shirtColor = '#5B21B6';    // Deep violet robe
      accentColor = '#FDE047';   // Gold amulet
      pantsColor = '#2E1065';
      shoesColor = '#4C1D95';
      break;

    case 'punk':
      skinColor = '#FAD6A5';
      hairColor = '#EC4899';     // Neon pink mohawk
      headbandColor = '#1E293B';
      shirtColor = '#0F172A';    // Black leather vest
      accentColor = '#F43F5E';   // Hot pink skull logo
      pantsColor = '#1E293B';
      shoesColor = '#EC4899';
      break;

    case 'detective':
      skinColor = '#FAD6A5';
      hairColor = '#451A03';
      headbandColor = '#1F2937'; // Dark ribbon
      shirtColor = '#92400E';    // Trench coat
      accentColor = '#DC2626';   // Crimson tie
      pantsColor = '#451A03';
      shoesColor = '#1E293B';
      break;

    case 'golden':
      skinColor = '#FDE68A';     // Radiant skin
      hairColor = '#B45309';
      headbandColor = '#F59E0B'; // Golden crown
      shirtColor = '#7E22CE';    // Royal purple velvet
      accentColor = '#FBBF24';   // Gold star medal
      pantsColor = '#3B0764';
      shoesColor = '#F59E0B';
      break;

    case 'bro1':
    default:
      skinColor = '#FAD6A5';
      hairColor = '#4A3728';
      headbandColor = '#E84A4A';
      shirtColor = '#49B8D1';
      accentColor = '#FFF7DC';
      pantsColor = '#151C30';
      shoesColor = '#111522';
      break;
  }

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
          {/* ================= HEADWEAR / HAIR ================= */}
          {charId === 'wizard' ? (
            <>
              {/* Pointed Wizard Hat */}
              <rect x="7" y="0" width="2" height="1" fill="#7C3AED" />
              <rect x="6" y="1" width="4" height="1" fill="#7C3AED" />
              <rect x="5" y="2" width="6" height="2" fill="#7C3AED" />
              <rect x="4" y="4" width="8" height="2" fill={headbandColor} />
            </>
          ) : charId === 'punk' ? (
            <>
              {/* Neon Pink Spiked Mohawk */}
              <rect x="7" y="0" width="2" height="1" fill={hairColor} />
              <rect x="6" y="1" width="4" height="2" fill={hairColor} />
              <rect x="7" y="3" width="2" height="1" fill={hairColor} />
              <rect x="4" y="4" width="8" height="2" fill={headbandColor} />
            </>
          ) : charId === 'detective' ? (
            <>
              {/* Fedora Hat */}
              <rect x="6" y="1" width="4" height="2" fill="#78350F" />
              <rect x="5" y="3" width="6" height="1" fill="#1F2937" />
              <rect x="3" y="4" width="10" height="2" fill="#78350F" />
            </>
          ) : charId === 'golden' ? (
            <>
              {/* 3-Point Gold Crown */}
              <rect x="5" y="1" width="1" height="1" fill={headbandColor} />
              <rect x="7" y="0" width="2" height="2" fill={headbandColor} />
              <rect x="10" y="1" width="1" height="1" fill={headbandColor} />
              <rect x="5" y="2" width="6" height="2" fill={hairColor} />
              <rect x="4" y="4" width="8" height="2" fill={headbandColor} />
            </>
          ) : (
            <>
              {/* Standard Bro / Ninja / Cyborg Head */}
              <rect x="5" y="1" width="6" height="2" fill={hairColor} />
              <rect x="4" y="2" width="8" height="2" fill={hairColor} />
              <rect x="4" y="4" width="8" height="2" fill={headbandColor} />
            </>
          )}

          {/* Headband / Hair Tail Details */}
          {charId === 'bro1' && (
            <rect x="12" y="5" width="2" height="2" fill={headbandColor} />
          )}
          {charId === 'bro2' && (
            <rect x="3" y="3" width="2" height="2" fill={headbandColor} />
          )}
          {charId === 'ninja' && (
            <>
              <rect x="12" y="4" width="2" height="1" fill={headbandColor} />
              <rect x="13" y="5" width="2" height="2" fill={headbandColor} />
            </>
          )}

          {/* Face */}
          <rect x="5" y="6" width="6" height="4" fill={skinColor} />
          <rect x="4" y="7" width="1" height="2" fill={skinColor} />
          <rect x="11" y="7" width="1" height="2" fill={skinColor} />

          {/* Ninja Stealth Mask across lower face */}
          {charId === 'ninja' && (
            <rect x="5" y="8" width="6" height="2" fill="#18181B" />
          )}

          {/* Wizard Silver Beard */}
          {charId === 'wizard' && (
            <>
              <rect x="7" y="9" width="2" height="2" fill={hairColor} />
              <rect x="6" y="8" width="1" height="1" fill={hairColor} />
              <rect x="9" y="8" width="1" height="1" fill={hairColor} />
            </>
          )}

          {/* Eyes / Visor */}
          {charId === 'cyborg' ? (
            /* Glowing Neon Cyan Visor */
            <g className="animate-pulse">
              <rect x="5" y="7" width="6" height="2" fill="#06B6D4" />
              <rect x="6" y="7" width="3" height="1" fill="#A5F3FC" />
            </g>
          ) : pose === 'defeated' ? (
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
          {charId !== 'ninja' && (
            pose === 'celebrating' ? (
              <rect x="7" y="9" width="2" height="1" fill="#E84A4A" />
            ) : (
              <rect x="7" y="9" width="2" height="1" fill="#8B4513" />
            )
          )}

          {/* ================= TORSO & ACCESSORIES ================= */}
          <rect x="5" y="10" width="6" height="5" fill={shirtColor} />

          {/* Chest Insignia / Amulet / Tie */}
          {charId === 'detective' ? (
            /* Crimson Tie */
            <>
              <rect x="7" y="10" width="2" height="1" fill="#FFFFFF" />
              <rect x="7.5" y="11" width="1" height="3" fill={accentColor} />
            </>
          ) : charId === 'cyborg' ? (
            /* Glowing Reactor Core */
            <rect x="7" y="11" width="2" height="2" fill={accentColor} className="animate-pulse" />
          ) : (
            <rect x="7" y="11" width="2" height="3" fill={accentColor} />
          )}

          {/* ================= ARMS ACCORDING TO POSE ================= */}
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

          {/* ================= PANTS & LEGS ================= */}
          <rect x="5" y="15" width="6" height="2" fill={pantsColor} />
          <rect x="5" y="17" width="2" height="2" fill={pantsColor} />
          <rect x="9" y="17" width="2" height="2" fill={pantsColor} />

          {/* ================= SHOES ================= */}
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
