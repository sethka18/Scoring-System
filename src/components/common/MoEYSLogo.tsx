import React from 'react';
import { SchoolLogo } from './SchoolLogo';

interface MoEYSLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  customLogoUrl?: string;
  forceOfficialSvg?: boolean;
}

/**
 * MoEYS Logo has been deleted across the system in favor of the School Logo
 * using the official emblem: https://en.wikipedia.org/wiki/File:Emblem_of_the_Ministry_of_Education,_Youth_and_Sport_%28Cambodia%29.svg
 */
export const MoEYSLogo: React.FC<MoEYSLogoProps> = ({ 
  className = "w-10 h-10", 
  size,
  customLogoUrl,
}) => {
  return (
    <SchoolLogo
      className={className}
      size={size}
      customLogoUrl={customLogoUrl}
    />
  );
};
