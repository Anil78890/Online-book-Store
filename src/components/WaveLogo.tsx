import React from 'react';

interface WaveLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const WaveLogo: React.FC<WaveLogoProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center rounded-2xl shadow-lg overflow-hidden`}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500"></div>
      
      {/* Animated waves */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Wave 1 - back */}
        <path fill="rgba(255,255,255,0.15)">
          <animate
            attributeName="d"
            dur="3s"
            repeatCount="indefinite"
            values="
              M0,70 C20,60 40,80 60,70 C80,60 100,75 100,70 L100,100 L0,100 Z;
              M0,75 C20,80 40,60 60,75 C80,80 100,65 100,75 L100,100 L0,100 Z;
              M0,70 C20,60 40,80 60,70 C80,60 100,75 100,70 L100,100 L0,100 Z
            "
          />
        </path>
        
        {/* Wave 2 - middle */}
        <path fill="rgba(255,255,255,0.25)">
          <animate
            attributeName="d"
            dur="2.5s"
            repeatCount="indefinite"
            values="
              M0,78 C25,70 50,85 75,78 C90,74 100,80 100,78 L100,100 L0,100 Z;
              M0,82 C25,88 50,72 75,82 C90,86 100,76 100,82 L100,100 L0,100 Z;
              M0,78 C25,70 50,85 75,78 C90,74 100,80 100,78 L100,100 L0,100 Z
            "
          />
        </path>
        
        {/* Wave 3 - front */}
        <path fill="rgba(255,255,255,0.4)">
          <animate
            attributeName="d"
            dur="2s"
            repeatCount="indefinite"
            values="
              M0,85 C30,80 60,90 90,85 C95,83 100,87 100,85 L100,100 L0,100 Z;
              M0,88 C30,92 60,82 90,88 C95,90 100,86 100,88 L100,100 L0,100 Z;
              M0,85 C30,80 60,90 90,85 C95,83 100,87 100,85 L100,100 L0,100 Z
            "
          />
        </path>
      </svg>
      
      {/* Logo text */}
      <span className={`relative z-10 font-bold text-white ${textSizes[size]} drop-shadow-lg`}>
        BL
      </span>
    </div>
  );
};

export default WaveLogo;