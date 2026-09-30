import React, { useState } from 'react';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'navy' | 'cream' | 'red' | 'yellow' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  showHoverArrow?: boolean;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'navy',
  size = 'md',
  children,
  showHoverArrow = true,
  className = '',
  disabled,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles = {
    navy: 'bg-darkNavy text-paper border-ink shadow-pixel hover:bg-[#20304C]',
    cream: 'bg-[#FFFDF5] text-ink border-ink shadow-pixel hover:bg-white',
    red: 'bg-arcadeRed text-white border-ink shadow-pixel hover:brightness-105',
    yellow: 'bg-cartridgeYellow text-ink border-ink shadow-pixel hover:brightness-105',
    cyan: 'bg-crtCyan text-ink border-ink shadow-pixel hover:brightness-105',
  };

  const sizeStyles = {
    sm: 'text-xs py-2 px-4 font-bold',
    md: 'text-xs sm:text-sm py-2.5 px-6 font-bold',
    lg: 'text-sm sm:text-base py-3.5 px-8 font-bold tracking-wider',
  };

  return (
    <button
      {...props}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`btn-retro ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {showHoverArrow && (
        <span
          className={`font-arcade mr-1.5 transition-opacity ${
            isHovered && !disabled ? 'opacity-100 text-arcadeRed' : 'opacity-0'
          }`}
          style={{ width: isHovered && !disabled ? 'auto' : 0, overflow: 'hidden' }}
        >
          {'> '}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
};
