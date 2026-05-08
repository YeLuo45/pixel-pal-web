// PluginStore — V59 Plugin Market UI
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Switch, Stack, Chip, Collapse, Button, Divider } from '@mui/material';
import { ExpandMore as ExpandIcon, ExpandLess as CollapseIcon, Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { pluginRegistry } from '../../services/plugins/pluginRegistry';
import type { Plugin } from '../../types/plugin';

interface PluginCardProps {
  plugin: Plugin;
  onToggle: (id: string, enabled: boolean) => void;
}

const PluginCard: React.FC<PluginCardProps> = ({ plugin, onToggle }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      sx={{
        bgcolor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: 'rgba(255,255,255,0.15)' },
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Icon */}
        <Typography variant="h6" sx={{ fontSize: 20, flexShrink: 0 }}>
          {plugin.icon}
        </Typography>

        {/* Name + version */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
            {plugin.name}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
            v{plugin.version} · by {plugin.author}
          </Typography>
        </Box>

        {/* Switch */}
        <Switch
          size="small"
          checked={plugin.enabled}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onToggle(plugin.id, e.target.checked)}
        />

        {/* Expand icon */}
        {expanded ? (
          <CollapseIcon sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
        ) : (
          <ExpandIcon sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
        )}
      </Box>

      {/* Expanded content */}
      <Collapse in={expanded}>
        <Divider sx={{ opacity: 0.1 }} />
        <Box sx={{ px: 2, py: 1.5 }}>
          {/* Description */}
          <Typography variant="body2" sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>
            {plugin.description}
          </Typography>

          {/* Permissions */}
          {plugin.permissions.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
              {plugin.permissions.map((perm) => (
                <Chip
                  key={perm}
                  label={perm}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 9,
                    bgcolor: 'rgba(255,152,0,0.15)',
                    color: 'text.secondary',
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Actions */}
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Actions
          </Typography>
          <Stack gap={0.5} sx={{ mt: 0.75 }}>
            {plugin.actions.map((action) => (
              <Box
                key={action.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.03)',
                }}
              >
                <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 500, color: 'primary.main' }}>
                  {action.name}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled' }}>
                  ({action.params.join(', ')})
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export const PluginStore: React.FC = () => {
  const { t } = useTranslation();
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  const loadPlugins = () => {
    setPlugins(pluginRegistry.getAllPlugins());
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      if (enabled) {
        await pluginRegistry.enablePlugin(id);
      } else {
        await pluginRegistry.disablePlugin(id);
      }
      loadPlugins();
    } catch (err) {
      console.error('[PluginStore] Toggle failed:', err);
    }
  };

  const preset = plugins.filter((p) =>
    ['weather-plugin', 'calc-plugin', 'translate-plugin'].includes(p.id)
  );
  const userPlugins = plugins.filter(
    (p) => !['weather-plugin', 'calc-plugin', 'translate-plugin'].includes(p.id)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 600 }}>
          🧩 {t('plugin.store', 'Plugin Store')}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary' }}>
          {plugins.length} {t('plugin.installed', 'installed')} ·{' '}
          {t('plugin.clickToToggle', 'click to expand, switch to enable/disable')}
        </Typography>
      </Box>

      {/* Plugin list */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Preset plugins section */}
        {preset.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontSize: 10,
                color: 'text.disabled',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                mb: 1,
                display: 'block',
              }}
            >
              {t('plugin.builtIn', 'Built-in')}
            </Typography>
            <Stack gap={1}>
              {preset.map((plugin) => (
                <PluginCard key={plugin.id} plugin={plugin} onToggle={handleToggle} />
              ))}
            </Stack>
          </Box>
        )}

        {/* User-installed plugins */}
        {userPlugins.length > 0 && (
          <Box sx={{ mt: preset.length > 0 ? 1 : 0 }}>
            {preset.length > 0 && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  mb: 1,
                  display: 'block',
                }}
              >
                {t('plugin.userInstalled', 'User Installed')}
              </Typography>
            )}
            <Stack gap={1}>
              {userPlugins.map((plugin) => (
                <PluginCard key={plugin.id} plugin={plugin} onToggle={handleToggle} />
              ))}
            </Stack>
          </Box>
        )}

        {plugins.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: 13 }}>
              {t('plugin.noPlugins', 'No plugins available')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer: Install button (future) */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          disabled
          fullWidth
          sx={{ fontSize: 12 }}
        >
          {t('plugin.installPlugin', 'Install Plugin')} — Coming Soon
        </Button>
      </Box>
    </Box>
  );
};

export default PluginStore;
