import React, { useState, useCallback } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import { Menu as MenuIcon, ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';
import { Sidebar } from './Sidebar';
import { useTranslation } from 'react-i18next';

export const ResponsiveSidebar: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Mobile: < 768px (theme.breakpoints.down('md'))
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Tablet: 768px - 1024px (theme.breakpoints.between('md', 'lg'))
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // Desktop: >= 1024px (theme.breakpoints.up('lg'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tablet collapsed state (sidebar can be collapsed to icons-only)
  const [tabletCollapsed, setTabletCollapsed] = useState(false);

  const handleMobileToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleMobileNavigate = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleTabletToggle = useCallback(() => {
    setTabletCollapsed((prev) => !prev);
  }, []);

  // Desktop: always visible expanded sidebar
  if (isDesktop) {
    return <Sidebar collapsed={false} />;
  }

  // Tablet: collapsible sidebar (overlay mode)
  if (isTablet) {
    const sidebarWidth = tabletCollapsed ? 52 : 160;

    return (
      <>
        {/* Toggle button for tablet */}
        <Tooltip title={tabletCollapsed ? t('sidebar.expand') : t('sidebar.collapse')} placement="right">
          <IconButton
            onClick={handleTabletToggle}
            sx={{
              position: 'fixed',
              top: 8,
              left: 8,
              zIndex: 1200,
              bgcolor: 'rgba(15, 10, 30, 0.9)',
              color: 'text.secondary',
              border: '1px solid rgba(255,255,255,0.08)',
              width: 36,
              height: 36,
              '&:hover': {
                bgcolor: 'rgba(155, 127, 212, 0.2)',
                color: 'primary.main',
              },
            }}
          >
            {tabletCollapsed ? <MenuIcon sx={{ fontSize: 18 }} /> : <ChevronLeftIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Tooltip>

        {/* Overlay sidebar */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: 1100,
            transition: 'width 0.2s ease',
            width: sidebarWidth,
            flexShrink: 0,
          }}
        >
          <Sidebar
            collapsed={tabletCollapsed}
            onNavigate={handleTabletToggle}
          />
        </Box>

        {/* Overlay scrim when tablet sidebar is open */}
        {!tabletCollapsed && (
          <Box
            onClick={handleTabletToggle}
            sx={{
              position: 'fixed',
              top: 0,
              left: sidebarWidth,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.4)',
              zIndex: 1050,
            }}
          />
        )}
      </>
    );
  }

  // Mobile: hamburger + drawer
  return (
    <>
      <Tooltip title={t('nav.menu')} placement="right">
        <IconButton
          onClick={handleMobileToggle}
          sx={{
            position: 'fixed',
            top: 8,
            left: 8,
            zIndex: 1300,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            width: 40,
            height: 40,
            '&:hover': {
              bgcolor: 'rgba(155, 127, 212, 0.3)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>

      <Drawer
        open={mobileOpen}
        onClose={handleMobileNavigate}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(15, 10, 30, 0.98)',
            width: 240,
            borderRight: '1px solid rgba(255,255,255,0.08)',
          },
        }}
        ModalProps={{
          BackdropProps: {
            sx: { bgcolor: 'rgba(0,0,0,0.5)' },
          },
        }}
      >
        <Sidebar onNavigate={handleMobileNavigate} />
      </Drawer>
    </>
  );
};

export default ResponsiveSidebar;
