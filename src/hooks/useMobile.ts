import { useMediaQuery } from '@mui/material';

// Responsive breakpoints matching PRD:
// Mobile: < 640px
// Tablet: 640-1024px
// Desktop: > 1024px

export const useMobile = () => {
  const isMobile = useMediaQuery('(max-width: 639px)');
  return isMobile;
};

export const useTablet = () => {
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1024px)');
  return isTablet;
};

export const useDesktop = () => {
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  return isDesktop;
};

export const useResponsive = () => {
  const isMobile = useMobile();
  const isTablet = useTablet();
  const isDesktop = useDesktop();

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet: isMobile || isTablet,
  };
};

export default useMobile;
