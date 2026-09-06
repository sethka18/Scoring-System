import React, { useState } from 'react';
import { MoEYSLogo } from './MoEYSLogo';
import { useGradebook } from '../../context/GradebookContext';

interface SchoolLogoProps {
  className?: string;
  size?: number | string;
  customLogoUrl?: string;
  alt?: string;
  showBorder?: boolean;
}

/**
 * Universal School Logo Component
 * - If a custom logo image URL is configured for the school (or passed in props),
 *   it renders the custom image with clean aspect ratio, styling, and fallback.
 * - If no custom logo is set or if the image fails to load, it falls back to the
 *   official MoEYS Cambodia Emblem (សញ្ញាសម្គាល់ផ្លូវការ ក្រសួងអប់រំ យុវជន និងកីឡា).
 */
export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = 'w-10 h-10',
  size,
  customLogoUrl,
  alt = 'School Logo',
  showBorder = false,
}) => {
  const { schoolProfile } = useGradebook();
  const [imageError, setImageError] = useState(false);

  // Logo URL precedence: passed prop > schoolProfile.logoUrl
  const logoToDisplay = customLogoUrl !== undefined ? customLogoUrl : schoolProfile?.logoUrl;

  const style = size ? { width: size, height: size } : undefined;

  if (logoToDisplay && !imageError) {
    return (
      <div 
        className={`inline-flex items-center justify-center flex-shrink-0 select-none overflow-hidden rounded-2xl bg-white dark:bg-slate-800 ${showBorder ? 'border border-slate-200 dark:border-slate-700 shadow-xs p-1' : ''} ${className}`}
        style={style}
      >
        <img
          src={logoToDisplay}
          alt={alt}
          onError={() => setImageError(true)}
          className="w-full h-full object-contain rounded-xl"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Fallback to official MoEYS emblem
  return <MoEYSLogo size={size} className={className} />;
};
