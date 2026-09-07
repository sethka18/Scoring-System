import React, { useState } from 'react';
import { useGradebook } from '../../context/GradebookContext';

export const OFFICIAL_SCHOOL_EMBLEM_URL = '/school-emblem.svg';
export const WIKIMEDIA_EMBLEM_FALLBACK_URL = 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Emblem_of_the_Ministry_of_Education%2C_Youth_and_Sport_%28Cambodia%29.svg';

interface SchoolLogoProps {
  className?: string;
  size?: number | string;
  customLogoUrl?: string;
  alt?: string;
  showBorder?: boolean;
}

/**
 * Universal School Logo Component
 * - Uses the official emblem from Wikipedia / Wikimedia Commons:
 *   https://en.wikipedia.org/wiki/File:Emblem_of_the_Ministry_of_Education,_Youth_and_Sport_%28Cambodia%29.svg
 * - If a custom school logo image is uploaded, displays that logo.
 * - Otherwise defaults to the official emblem (/school-emblem.svg).
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
  const [useRemoteFallback, setUseRemoteFallback] = useState(false);

  // Logo URL precedence: passed prop > schoolProfile.logoUrl > official emblem
  const userConfiguredLogo = customLogoUrl !== undefined ? customLogoUrl : schoolProfile?.logoUrl;
  const hasCustomLogo = Boolean(userConfiguredLogo && userConfiguredLogo.trim() !== '');

  const style = size ? { width: size, height: size } : undefined;

  const handleImageError = () => {
    if (hasCustomLogo && !imageError) {
      // User custom image failed, fall back to standard emblem
      setImageError(true);
    } else if (!useRemoteFallback) {
      // Local SVG failed, fall back to remote Wikimedia Commons URL
      setUseRemoteFallback(true);
    }
  };

  const currentSrc = !imageError && hasCustomLogo
    ? userConfiguredLogo!
    : (useRemoteFallback ? WIKIMEDIA_EMBLEM_FALLBACK_URL : OFFICIAL_SCHOOL_EMBLEM_URL);

  return (
    <div 
      className={`inline-flex items-center justify-center flex-shrink-0 select-none overflow-hidden rounded-2xl bg-white dark:bg-slate-800 ${showBorder ? 'border border-slate-200 dark:border-slate-700 shadow-xs p-1' : ''} ${className}`}
      style={style}
    >
      <img
        src={currentSrc}
        alt={alt}
        onError={handleImageError}
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
