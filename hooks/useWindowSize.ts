import { useState, useEffect } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

export interface ResponsiveBreakpoint {
  isMobile: boolean;      // < 768px (< md)
  isTablet: boolean;       // 768px - 1024px (md to lg)
  isDesktop: boolean;      // >= 1024px (>= lg)
  isSmall: boolean;        // < 1280px
  isLarge: boolean;        // >= 1280px
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const useWindowSize = (): WindowSize & ResponsiveBreakpoint => {
  const [windowSize, setWindowSize] = useState<WindowSize & ResponsiveBreakpoint>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isSmall: false,
    isLarge: false,
    screenSize: 'md',
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Tailwind breakpoints
      // xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, 2xl: 1536
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const isSmall = width < 1280;
      const isLarge = width >= 1280;

      let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
      if (width < 640) screenSize = 'xs';
      else if (width < 768) screenSize = 'sm';
      else if (width < 1024) screenSize = 'md';
      else if (width < 1280) screenSize = 'lg';
      else if (width < 1536) screenSize = 'xl';
      else screenSize = '2xl';

      setWindowSize({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        isSmall,
        isLarge,
        screenSize,
      });
    };

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [matches, query]);

  return matches;
};

// Common media queries
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
