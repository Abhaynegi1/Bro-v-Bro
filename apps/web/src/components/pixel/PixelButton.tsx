import React, { useState } from 'react';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'red' | 'paper' | 'navy' | 'cyan' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  showHoverArrow?: boolean;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'paper',
  size = 'md',
  children,
  showHoverArrow = true,
  className = '',
  disabled,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles = {
    paper: 'bg-paper text-ink border-ink shadow-pixel hover:bg-cream',
    red: 'bg-arcadeRed text-cream border-ink shadow-pixel hover:brightness-110',
    navy: 'bg-[#151C30] text-paper border-paper shadow-pixel-light hover:bg-[#11182A]',
    cyan: 'bg-crtCyan text-ink border-ink shadow-pixel hover:brightness-105',
    yellow: 'bg-cartridgeYellow text-ink border-ink shadow-pixel hover:brightness-105',
  };

  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-xs sm:text-sm py-2.5 px-5',
    lg: 'text-sm sm:text-base py-3.5 px-7',
  };

  return (
    <button
      {...props}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`btn-retro tracking-wider ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {showHoverArrow && (
        <span
          className={`font-arcade mr-1 transition-opacity ${
            isHovered && !disabled ? 'opacity-100' : 'opacity-0'
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
