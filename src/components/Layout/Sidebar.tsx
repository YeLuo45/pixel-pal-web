import React, { useState, useEffect } from 'react';
import { Box, Typography, Tooltip, Divider } from '@mui/material';
import { Chat as ChatIcon, CalendarMonth as CalendarIcon, CheckBox as TaskIcon, Description as DocIcon, Email as EmailIcon, Edit as WriteIcon, Settings as SettingsIcon, Group as GroupIcon, Psychology as KnowledgeIcon, Extension as PluginIcon, Memory as MemoryIcon, BarChart as AnalyticsIcon, AutoAwesome as ScenesIcon, Search as SearchIcon, ShoppingCart as MallIcon } from '@mui/icons-material';
import { useStore } from '../../store';
import { PluginService } from '../../services/plugin/PluginService';
import { useTranslation } from 'react-i18next';
import { useMemoryStore } from '../../stores/memoryStore';
import { getLatestEmotionLog, getTextEmotionEmoji } from '../../services/emotion';
import type { TextEmotion } from '../../services/emotion';
import { PersonaSelector } from '../Persona/PersonaSelector';

const NAV_ITEMS = [
  { id: 'chat', labelKey: 'nav.chat', icon: ChatIcon },
  { id: 'memory', labelKey: 'nav.memory', icon: MemoryIcon },
  { id: 'calendar', labelKey: 'nav.calendar', icon: CalendarIcon },
  { id: 'tasks', labelKey: 'nav.tasks', icon: TaskIcon },
  { id: 'document', labelKey: 'nav.document', icon: DocIcon },
  { id: 'knowledge', labelKey: 'nav.knowledge', icon: KnowledgeIcon },
  { id: 'writing', labelKey: 'nav.writing', icon: WriteIcon },
  { id: 'email', labelKey: 'nav.email', icon: EmailIcon },
  { id: 'mall', labelKey: 'nav.mall', icon: MallIcon },
  { id: 'team', labelKey: 'nav.team', icon: GroupIcon },
  { id: 'analytics', labelKey: 'nav.analytics', icon: AnalyticsIcon },
  { id: 'scenes', labelKey: 'nav.scenes', icon: ScenesIcon },
  { id: 'settings', labelKey: 'nav.settings', icon: SettingsIcon },
] as const;

const SEARCH_NAV = { id: 'search', labelKey: 'nav.search', icon: SearchIcon } as const;

interface SidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onNavigate }) => {
  const { t } = useTranslation();
  const activePanel = useStore((s) => s.activePanel);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const setActivePluginId = useStore((s) => s.setActivePluginId);
  const [currentEmotion, setCurrentEmotion] = useState<{ emotion: TextEmotion; emoji: string } | null>(null);

  // Load current emotion from storage
  useEffect(() => {
    const loadCurrentEmotion = () => {
      const latest = getLatestEmotionLog();
      if (latest) {
        setCurrentEmotion({
          emotion: latest.emotion,
          emoji: getTextEmotionEmoji(latest.emotion),
        });
      }
    };
    loadCurrentEmotion();
    
    // Listen for new emotion entries
    const handleEmotionUpdate = () => loadCurrentEmotion();
    window.addEventListener('emotion:logAdded', handleEmotionUpdate);
    return () => window.removeEventListener('emotion:logAdded', handleEmotionUpdate);
  }, []);

  const handleNavClick = (panelId: typeof activePanel) => {
    if (panelId === 'plugin') {
      // For plugin panel, just navigate to plugin hub
      setActivePanel(panelId);
      setActivePluginId(null);
    } else {
      setActivePanel(panelId);
    }
    onNavigate?.();
  };

  // Get registered plugin nav items with badges
  const pluginNavItems = PluginService.listPlugins()
    .filter((p) => p.capabilities.some((c) => c.type === 'panel'))
    .map((p) => ({ id: p.id, label: p.name, icon: p.icon }));

  return (
    <Box
      sx={{
        width: collapsed ? 52 : 160,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(15, 10, 30, 0.95)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Logo / Title */}
      {!collapsed && (
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 700, color: 'primary.main' }}>
            PixelPal
          </Typography>
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
            AI Companion
          </Typography>
          {/* Current Emotion Indicator */}
          {currentEmotion && (
            <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: 12 }}>
                {currentEmotion.emoji}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled' }}>
                {t('emotion.' + currentEmotion.emotion)}
              </Typography>
            </Box>
          )}
        </Box>
      )}
      {collapsed && (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          {currentEmotion ? <Typography variant="caption" sx={{ fontSize: 14 }}>{currentEmotion.emoji}</Typography> : '🛡️'}
        </Box>
      )}

      <Divider sx={{ opacity: 0.15, mx: 1, mb: 1 }} />

      {/* Search button - special placement at top of nav */}
      <Box sx={{ px: 1, mb: 0.5 }}>
        <Tooltip title={collapsed ? t('nav.search') : ''} placement="right">
          <Box
            component="button"
            onClick={() => {
              // Import and call openSearch directly
              import('../../stores/memoryStore').then(({ useMemoryStore }) => {
                useMemoryStore.getState().openSearch();
              });
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1,
              minHeight: 44,
              borderRadius: 1.5,
              border: 'none',
              cursor: 'pointer',
              bgcolor: 'transparent',
              color: 'text.secondary',
              transition: 'all 0.15s ease',
              width: '100%',
              textAlign: 'left',
              '&:hover': {
                bgcolor: 'rgba(155, 127, 212, 0.15)',
                color: 'primary.main',
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            <SearchIcon sx={{ fontSize: 18, flexShrink: 0 }} />
            {!collapsed && (
              <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 400 }}>
                {t('nav.search')}
              </Typography>
            )}
            {!collapsed && (
              <Typography variant="caption" sx={{ ml: 'auto', fontSize: 10, color: 'text.disabled' }}>
                ⌘K
              </Typography>
            )}
          </Box>
        </Tooltip>
      </Box>

      {/* Persona Selector */}
      <PersonaSelector collapsed={collapsed} />

      {/* Nav items */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, px: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <Tooltip key={item.id} title={collapsed ? t(item.labelKey) : ''} placement="right">
              <Box
                component="button"
                onClick={() => handleNavClick(item.id as typeof activePanel)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  minHeight: 44,
                  borderRadius: 1.5,
                  border: 'none',
                  cursor: 'pointer',
                  bgcolor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.15s ease',
                  width: '100%',
                  textAlign: 'left',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                    color: 'white',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                <Icon sx={{
                  fontSize: 18,
                  flexShrink: 0,
                  transition: 'transform 0.15s ease',
                }} />
                {!collapsed && (
                  <Typography variant="body2" sx={{ fontSize: 12, fontWeight: isActive ? 600 : 400 }}>
                    {t(item.labelKey)}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}

        {/* Plugin section divider */}
        {pluginNavItems.length > 0 && (
          <>
            <Divider sx={{ opacity: 0.1, my: 0.5 }} />
            {!collapsed && (
              <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary', px: 1.5, py: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t('nav.plugins')}
              </Typography>
            )}
            {collapsed && <Box sx={{ height: 8 }} />}
          </>
        )}

        {/* Plugin items */}
        {pluginNavItems.map((item) => {
          const isActive = activePanel === 'plugin';
          const Icon = PluginIcon;
          return (
            <Tooltip key={item.id} title={collapsed ? item.label : ''} placement="right">
              <Box
                component="button"
                onClick={() => {
                  setActivePanel('plugin');
                  setActivePluginId(item.id);
                  onNavigate?.();
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  minHeight: 44,
                  borderRadius: 1.5,
                  border: 'none',
                  cursor: 'pointer',
                  bgcolor: isActive ? 'rgba(155,127,212,0.15)' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.15s ease',
                  width: '100%',
                  textAlign: 'left',
                  '&:hover': {
                    bgcolor: 'rgba(155,127,212,0.1)',
                    color: 'white',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                {item.icon && !collapsed ? (
                  <Typography variant="body2" sx={{ fontSize: 14 }}>
                    {item.icon}
                  </Typography>
                ) : (
                  <Icon sx={{ fontSize: 18, flexShrink: 0 }} />
                )}
                {!collapsed && (
                  <Typography variant="body2" sx={{ fontSize: 12, fontWeight: isActive ? 600 : 400 }}>
                    {item.label}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default Sidebar;
