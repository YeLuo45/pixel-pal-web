import React from 'react';
import { Box, Typography, Tooltip, Divider } from '@mui/material';
import { Chat as ChatIcon, CalendarMonth as CalendarIcon, CheckBox as TaskIcon, Description as DocIcon, Email as EmailIcon, Edit as WriteIcon, Settings as SettingsIcon, Group as GroupIcon } from '@mui/icons-material';
import { useStore } from '../../store';

const NAV_ITEMS = [
  { id: 'chat', label: 'Chat', icon: ChatIcon },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'tasks', label: 'Tasks', icon: TaskIcon },
  { id: 'document', label: 'Documents', icon: DocIcon },
  { id: 'writing', label: 'Writing', icon: WriteIcon },
  { id: 'email', label: 'Email', icon: EmailIcon },
  { id: 'team', label: 'Team', icon: GroupIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
] as const;

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const activePanel = useStore((s) => s.activePanel);
  const setActivePanel = useStore((s) => s.setActivePanel);

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
        </Box>
      )}
      {collapsed && <Box sx={{ py: 2, textAlign: 'center' }}>🛡️</Box>}

      <Divider sx={{ opacity: 0.15, mx: 1, mb: 1 }} />

      {/* Nav items */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, px: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <Tooltip key={item.id} title={collapsed ? item.label : ''} placement="right">
              <Box
                component="button"
                onClick={() => setActivePanel(item.id as typeof activePanel)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
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
