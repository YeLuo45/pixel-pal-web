import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon, WifiOff as WifiOffIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-show banner when offline
  useEffect(() => {
    if (!navigator.onLine) {
      setIsOffline(true);
      setDismissed(false);
    }
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1400,
        bgcolor: 'rgba(255, 152, 0, 0.95)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        py: 0.75,
        px: 2,
        borderBottom: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <WifiOffIcon sx={{ fontSize: 16, color: 'white' }} />
      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: 12 }}>
        {t('offline.banner')}
      </Typography>
      <IconButton
        size="small"
        onClick={() => setDismissed(true)}
        sx={{ ml: 1, p: 0.25, color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white' } }}
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
};

export default OfflineBanner;
