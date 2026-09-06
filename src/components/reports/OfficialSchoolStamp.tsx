import React from 'react';
import { useGradebook } from '../../context/GradebookContext';

interface OfficialSchoolStampProps {
  className?: string;
  size?: number; // default e.g. 100
  customStampUrl?: string;
  rotation?: number; // degrees, e.g. -4
  opacity?: number; // 0.5 to 1.0
  customText?: string;
  isWatermark?: boolean;
}

/**
 * Authentic Official Cambodian School Rubber Stamp (ត្រាមូលក្រហមរដ្ឋបាល)
 * - If customStampUrl is provided, renders the school's actual uploaded stamp PNG
 * - Otherwise, renders a vector-accurate circular MoEYS school administration stamp
 *   with concentric rings, official star, and Cambodian school administrative typography.
 */
export const OfficialSchoolStamp: React.FC<OfficialSchoolStampProps> = ({
  className = '',
  size = 100,
  customStampUrl,
  rotation = -4,
  opacity = 0.92,
  customText = 'បានពិនិត្យ និងយល់ព្រម',
  isWatermark = false,
}) => {
  const { schoolProfile, activeClass } = useGradebook();

  const schoolNameKm = schoolProfile?.schoolNameKm || activeClass?.schoolNameKm || 'សាលាបឋមសិក្សាហ៊ុនណេងប្រទង';
  const provinceKm = schoolProfile?.province || activeClass?.province || 'ខេត្តកំពង់ចាម';

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    transform: `rotate(${rotation}deg)`,
    opacity: isWatermark ? 0.08 : opacity,
    filter: isWatermark ? 'none' : 'contrast(1.08) drop-shadow(0 1px 1px rgba(185, 28, 28, 0.15))',
    pointerEvents: 'none',
  };

  // If user provided their own transparent stamp image
  if (customStampUrl) {
    return (
      <div 
        className={`inline-block select-none overflow-visible transition-transform duration-200 ${className}`}
        style={containerStyle}
      >
        <img
          src={customStampUrl}
          alt="Official School Stamp"
          className="w-full h-full object-contain pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Built-in authentic vector circular administrative stamp
  // Outer diameter 160x160 SVG
  return (
    <div 
      className={`inline-block select-none overflow-visible transition-transform duration-200 ${className}`}
      style={containerStyle}
    >
      <svg 
        viewBox="0 0 160 160" 
        className="w-full h-full select-none"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Top semi-circle path for upper text */}
          <path 
            id="stampTopArc" 
            d="M 22,80 A 58,58 0 1,1 138,80" 
            fill="none"
          />
          {/* Bottom semi-circle path for lower text */}
          <path 
            id="stampBottomArc" 
            d="M 138,80 A 58,58 0 0,1 22,80" 
            fill="none"
          />
          {/* Subtle distress texture / stamp grain filter */}
          <filter id="stampDistress" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        <g filter="url(#stampDistress)" stroke="#C5221F" fill="#C5221F">
          {/* Outer Heavy Circular Rim */}
          <circle cx="80" cy="80" r="74" strokeWidth="2.8" fill="none" strokeDasharray="300" />
          
          {/* Inner Thin Circular Ring */}
          <circle cx="80" cy="80" r="69" strokeWidth="1.2" fill="none" />
          
          {/* Center Circular Core Ring */}
          <circle cx="80" cy="80" r="42" strokeWidth="1.6" fill="none" strokeDasharray="2 1.5" />

          {/* Upper Circular Text: School Name */}
          <text 
            fontSize="10" 
            fontWeight="bold" 
            fill="#C5221F" 
            letterSpacing="0.08em"
            className="font-heading"
          >
            <textPath 
              href="#stampTopArc" 
              startOffset="50%" 
              textAnchor="middle"
            >
              {schoolNameKm}
            </textPath>
          </text>

          {/* Lower Circular Text: Province / District */}
          <text 
            fontSize="9" 
            fontWeight="bold" 
            fill="#C5221F" 
            letterSpacing="0.1em"
            className="font-heading"
          >
            <textPath 
              href="#stampBottomArc" 
              startOffset="50%" 
              textAnchor="middle"
            >
              ★ {provinceKm} ★
            </textPath>
          </text>

          {/* Central Five-Pointed Star / National Symbol */}
          <g transform="translate(80, 58)">
            <polygon 
              points="0,-8 2.5,-2.5 8,-2.5 3.5,1.5 5.5,7 0,3.5 -5.5,7 -3.5,1.5 -8,-2.5 -2.5,-2.5" 
              fill="#C5221F" 
            />
          </g>

          {/* Center Text: "បានពិនិត្យ និងយល់ព្រម" or "នាយកសាលា" */}
          <text 
            x="80" 
            y="76" 
            textAnchor="middle" 
            fontSize="8.5" 
            fontWeight="900" 
            fill="#C5221F"
            letterSpacing="0.05em"
            className="font-heading"
          >
            {customText || 'បានពិនិត្យ និងយល់ព្រម'}
          </text>

          <text 
            x="80" 
            y="90" 
            textAnchor="middle" 
            fontSize="8" 
            fontWeight="bold" 
            fill="#C5221F"
          >
            នាយកសាលា
          </text>

          {/* Small Decorative Stars at Side Dividing Nodes */}
          <circle cx="21" cy="80" r="2" fill="#C5221F" />
          <circle cx="139" cy="80" r="2" fill="#C5221F" />
        </g>
      </svg>
    </div>
  );
};
