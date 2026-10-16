import React from 'react';
import { PixelCharacter, AVATAR_OPTIONS, CharacterType } from './PixelCharacter';
import { soundFx } from '../../utils/audio';

interface AvatarPickerProps {
  selectedAvatar: CharacterType;
  onSelectAvatar: (avatar: CharacterType) => void;
  label?: string;
  theme?: 'day' | 'night';
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatar,
  onSelectAvatar,
  label = 'CHOOSE YOUR AVATAR:',
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const currentIndex = AVATAR_OPTIONS.findIndex((a) => a.id === selectedAvatar);
  const currentOption = AVATAR_OPTIONS[currentIndex >= 0 ? currentIndex : 0];

  const handlePrev = () => {
    soundFx.play('click');
    const nextIdx = (currentIndex - 1 + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length;
    onSelectAvatar(AVATAR_OPTIONS[nextIdx].id);
  };

  const handleNext = () => {
    soundFx.play('click');
    const nextIdx = (currentIndex + 1) % AVATAR_OPTIONS.length;
    onSelectAvatar(AVATAR_OPTIONS[nextIdx].id);
  };

  const handlePick = (id: CharacterType) => {
    if (id !== selectedAvatar) {
      soundFx.play('click');
      onSelectAvatar(id);
    }
  };

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block font-mono text-xs font-bold uppercase text-ink">
          {label}
        </label>
        <span className="font-arcade text-[10px] text-arcadeRed font-bold">
          {currentIndex + 1}/{AVATAR_OPTIONS.length}
        </span>
      </div>

      {/* Featured Avatar Showcase Card with Carousel Arrows */}
      <div
        className={`p-2.5 sm:p-3 border-2 border-ink shadow-pixel flex items-center justify-between gap-2 mb-2.5 transition-colors ${
          isNight ? 'bg-slate-900/90 text-paper' : 'bg-[#FFFDF5] text-ink'
        }`}
      >
        {/* Left Arrow */}
        <button
          type="button"
          onClick={handlePrev}
          className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border-2 border-ink shadow-pixel-sm active:translate-y-0.5 transition-all flex-shrink-0 font-arcade text-xs font-bold ${
            isNight ? 'bg-slate-800 text-paper hover:bg-slate-700' : 'bg-white text-ink hover:bg-cream'
          }`}
          title="Previous Avatar"
        >
          ◀
        </button>

        {/* Center: Character sprite + Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex-shrink-0 p-1 border border-ink/20 ${isNight ? 'bg-white/5' : 'bg-ink/5'}`}>
            <PixelCharacter type={selectedAvatar} size={44} pose="ready" />
          </div>

          <div className="flex flex-col min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-arcade text-xs sm:text-sm font-bold tracking-wider text-arcadeRed truncate">
                {currentOption.name}
              </span>
              <span
                className="text-[9px] font-arcade font-bold px-1.5 py-0.2 text-white border border-ink flex-shrink-0"
                style={{ backgroundColor: currentOption.themeColor }}
              >
                {currentOption.badge}
              </span>
            </div>
            <p className="font-mono text-[10px] sm:text-[11px] opacity-75 truncate mt-0.5">
              {currentOption.tagline}
            </p>
          </div>
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={handleNext}
          className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border-2 border-ink shadow-pixel-sm active:translate-y-0.5 transition-all flex-shrink-0 font-arcade text-xs font-bold ${
            isNight ? 'bg-slate-800 text-paper hover:bg-slate-700' : 'bg-white text-ink hover:bg-cream'
          }`}
          title="Next Avatar"
        >
          ▶
        </button>
      </div>

      {/* Miniature Avatar Selectors Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {AVATAR_OPTIONS.map((opt) => {
          const isSelected = opt.id === selectedAvatar;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handlePick(opt.id)}
              className={`p-1 flex flex-col items-center justify-center border-2 transition-all cursor-pointer relative ${
                isSelected
                  ? isNight
                    ? 'bg-slate-800 border-arcadeRed shadow-pixel-sm -translate-y-0.5 ring-1 ring-arcadeRed text-paper'
                    : 'bg-amber-100 border-arcadeRed shadow-pixel-sm -translate-y-0.5 ring-1 ring-arcadeRed text-ink'
                  : isNight
                  ? 'bg-slate-900 border-ink hover:bg-slate-800 text-paper/80 hover:text-paper'
                  : 'bg-white border-ink hover:bg-cream text-ink/80 hover:text-ink'
              }`}
              title={opt.name}
            >
              <PixelCharacter type={opt.id} size={24} pose={isSelected ? 'ready' : 'idle'} />
              <span className="text-[8px] font-arcade font-bold truncate max-w-[38px] mt-0.5">
                {opt.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
