import React from 'react';
import { Box, Card, CardContent, Typography, Switch, IconButton, Chip, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Bolt as BoltIcon } from '@mui/icons-material';
import type { Scene } from '../../types/scene';

interface SceneCardProps {
  scene: Scene;
  onEdit: (scene: Scene) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onQuickTrigger?: (scene: Scene) => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, onEdit, onDelete, onToggle, onQuickTrigger }) => {
  const triggerLabels = scene.triggers.map((t) => {
    switch (t.type) {
      case 'time':
        return `⏰ ${(t as any).time}`;
      case 'click':
        return '🖱️ 点击';
      case 'keyword':
        return `🔑 ${(t as any).pattern}`;
      default:
        return '?';
    }
  });

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
        transition: 'opacity 0.2s',
        opacity: scene.enabled ? 1 : 0.5,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 14 }}>
            {scene.name}
          </Typography>
          <Switch
            size="small"
            checked={scene.enabled}
            onChange={() => onToggle(scene.id)}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
          {triggerLabels.map((label, i) => (
            <Chip key={i} label={label} size="small" sx={{ fontSize: 10, height: 20 }} />
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {scene.isQuick && onQuickTrigger && (
            <Tooltip title="快速触发">
              <IconButton size="small" onClick={() => onQuickTrigger(scene)} sx={{ color: 'primary.main' }}>
                <BoltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Box sx={{ flex: 1 }} />
          <IconButton size="small" onClick={() => onEdit(scene)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(scene.id)} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};
