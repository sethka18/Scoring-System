import React from 'react';

interface MoEYSLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

/**
 * Official Ministry of Education, Youth and Sport (MoEYS) Kingdom of Cambodia Emblem / Logo
 * Features:
 * - Sacred Garuda (គ្រុឌ) / Royal Swan and sacred lotus flame iconography
 * - Official MoEYS Navy and Gold Royal Palette (#0a2558, #c89524)
 * - Stylized rays of enlightenment, wisdom book and sacred floral frame
 */
export const MoEYSLogo: React.FC<MoEYSLogoProps> = ({ 
  className = "w-10 h-10", 
  size,
  showText = false 
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`} style={style}>
      <svg 
        viewBox="0 0 120 120" 
        className="w-full h-full drop-shadow-xs"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Ring with Royal Gold Accent */}
        <circle cx="60" cy="60" r="57" fill="#0A2558" stroke="#D4AF37" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="53" fill="#0F3470" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 2" />
        
        {/* Radiating Sun Rays (Wisdom & Knowledge) */}
        <g stroke="#FDE68A" strokeWidth="1" opacity="0.65">
          <line x1="60" y1="12" x2="60" y2="24" />
          <line x1="60" y1="96" x2="60" y2="108" />
          <line x1="12" y1="60" x2="24" y2="60" />
          <line x1="96" y1="60" x2="108" y2="60" />
          <line x1="26" y1="26" x2="35" y2="35" />
          <line x1="85" y1="85" x2="94" y2="94" />
          <line x1="26" y1="94" x2="35" y2="85" />
          <line x1="85" y1="35" x2="94" y2="26" />
        </g>

        {/* Inner Golden Lotus Sun Circle */}
        <circle cx="60" cy="60" r="44" fill="#0A2558" stroke="#EAB308" strokeWidth="1.5" />

        {/* Sacred Flame / Unalome / Royal Crown Aura */}
        <path 
          d="M60 18 C58 24 55 27 55 31 C55 34 57 36 60 36 C63 36 65 34 65 31 C65 27 62 24 60 18 Z" 
          fill="url(#goldGradientFlame)" 
        />
        <circle cx="60" cy="27" r="1.5" fill="#FFF" />

        {/* Khmer Garuda / Swan Wings (ស្លាបគ្រុឌ / ហង្ស) */}
        <path 
          d="M60 48 C48 38 32 40 24 50 C28 58 38 60 46 58 C38 63 32 70 30 78 C38 78 48 72 54 66 C50 74 48 82 50 88 C54 88 58 82 60 76 C62 82 66 88 70 88 C72 82 70 74 66 66 C72 72 82 78 90 78 C88 70 82 63 74 58 C82 60 92 58 96 50 C88 40 72 38 60 48 Z" 
          fill="url(#goldGradientWings)" 
          stroke="#78350F" 
          strokeWidth="0.75"
        />

        {/* Open Book of Education & Knowledge (សៀវភៅចំណេះដឹង) */}
        <path 
          d="M60 62 C53 58 45 58 38 61 L38 76 C45 73 53 73 60 77 C67 73 75 73 82 76 L82 61 C75 58 67 58 60 62 Z" 
          fill="#FFFFFF" 
          stroke="#D97706" 
          strokeWidth="1.2"
        />
        {/* Book spine & page lines */}
        <line x1="60" y1="62" x2="60" y2="77" stroke="#92400E" strokeWidth="1.5" />
        <path d="M42 66 C47 64 53 64 57 66" stroke="#94A3B8" strokeWidth="0.75" />
        <path d="M42 70 C47 68 53 68 57 70" stroke="#94A3B8" strokeWidth="0.75" />
        <path d="M63 66 C67 64 73 64 78 66" stroke="#94A3B8" strokeWidth="0.75" />
        <path d="M63 70 C67 68 73 68 78 70" stroke="#94A3B8" strokeWidth="0.75" />

        {/* Sacred Flame Torch Core */}
        <path 
          d="M58 44 C58 40 60 38 60 38 C60 38 62 40 62 44 C62 46 61 47 60 47 C59 47 58 46 58 44 Z" 
          fill="#F59E0B" 
        />

        {/* Lotus Petal Base (ត្របកផ្កាឈូក) */}
        <path 
          d="M44 91 C49 87 55 86 60 88 C65 86 71 87 76 91 C70 95 65 96 60 94 C55 96 50 95 44 91 Z" 
          fill="url(#goldGradientLotus)" 
          stroke="#B45309" 
          strokeWidth="0.8"
        />

        {/* Khmer Scripture arc text: ក្រសួងអប់រំ យុវជន និងកីឡា */}
        <path id="textArcMoEYS" d="M22 60 A38 38 0 0 1 98 60" fill="none" />
        <text fill="#FDE68A" fontSize="5" fontWeight="bold" letterSpacing="0.4">
          <textPath href="#textArcMoEYS" startOffset="50%" textAnchor="middle">
            ក្រសួងអប់រំ យុវជន និងកីឡា
          </textPath>
        </text>

        {/* Lower English Arc: MoEYS CAMBODIA */}
        <path id="textArcMoEYSEn" d="M98 60 A38 38 0 0 1 22 60" fill="none" />
        <text fill="#E2E8F0" fontSize="4.5" fontWeight="bold" letterSpacing="1">
          <textPath href="#textArcMoEYSEn" startOffset="50%" textAnchor="middle">
            MoEYS • CAMBODIA
          </textPath>
        </text>

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="goldGradientFlame" x1="55" y1="18" x2="65" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="goldGradientWings" x1="24" y1="40" x2="96" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE68A" />
            <stop offset="0.35" stopColor="#F59E0B" />
            <stop offset="0.75" stopColor="#D97706" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="goldGradientLotus" x1="44" y1="86" x2="76" y2="96" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="0.6" stopColor="#D97706" />
            <stop offset="1" stopColor="#92400E" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="leading-tight">
          <div className="font-heading font-black text-xs text-indigo-950 uppercase tracking-tight">
            ក្រសួងអប់រំ យុវជន និងកីឡា
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            MoEYS Gradebook
          </div>
        </div>
      )}
    </div>
  );
};
