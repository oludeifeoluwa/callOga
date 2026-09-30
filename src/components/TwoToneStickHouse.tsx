import React from 'react';

interface TwoToneStickHouseProps {
  size?: number;
  className?: string;
  roofColor?: string;
  wallColor?: string;
}

export const TwoToneStickHouse: React.FC<TwoToneStickHouseProps> = ({
  size = 24,
  className = '',
  roofColor = '#FF6B4A', // Tone 1: Sunset Coral
  wallColor = '#2563EB'  // Tone 2: Electric Cobalt Blue
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`two-tone-stick-house ${className}`}
      aria-hidden="true"
    >
      {/* Chimney stick */}
      <path
        d="M20 8.5V4.5H23V11"
        stroke={roofColor}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tone 1: Pitched Roof Stick Frame */}
      <path
        d="M2.5 13L14 3.5L25.5 13"
        stroke={roofColor}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tone 2: House Frame Walls & Foundation Sticks */}
      <path
        d="M5.5 12V23C5.5 23.55 5.95 24 6.5 24H21.5C22.05 24 22.5 23.55 22.5 23V12"
        stroke={wallColor}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Door Frame Stick */}
      <path
        d="M10.5 24V15.5C10.5 15.22 10.72 15 11 15H17C17.28 15 17.5 15.22 17.5 15.5V24"
        stroke={wallColor}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Roof Accent Beam */}
      <line
        x1="9"
        y1="9.5"
        x2="19"
        y2="9.5"
        stroke={roofColor}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Accent doorknob in Tone 1 */}
      <circle cx="15.8" cy="19.5" r="1.2" fill={roofColor} />
    </svg>
  );
};
