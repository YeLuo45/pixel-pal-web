import React from 'react';
import { Box, IconButton, Tooltip, Chip } from '@mui/material';
import { Bolt as BoltIcon, Close as CloseIcon } from '@mui/icons-material';
import { useSceneStore } from '../../stores/sceneStore';
import { executeScene } from '../../utils/sceneScheduler';

interface QuickSceneBarProps {
  onClose?: () => void;
}

export const QuickSceneBar: React.FC<QuickSceneBarProps> = ({ onClose }) => {
  const scenes = useSceneStore((s) => s.scenes);
  const quickScenes = scenes.filter((s) => s.enabled && s.isQuick);

  if (quickScenes.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
        zIndex: 1200,
      }}
    >
      {onClose && (
        <Tooltip title="关闭快捷栏">
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              bgcolor: 'rgba(0,0,0,0.4)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {quickScenes.map((scene) => (
        <Tooltip key={scene.id} title={scene.name} arrow>
          <Chip
            icon={<BoltIcon sx={{ fontSize: 16 }} />}
            label={scene.name}
            onClick={() => executeScene(scene)}
            sx={{
              bgcolor: 'rgba(155, 127, 212, 0.2)',
              border: '1px solid rgba(155, 127, 212, 0.4)',
              color: 'primary.light',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(155, 127, 212, 0.35)',
              },
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};
