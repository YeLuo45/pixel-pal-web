// PluginHub — landing page listing all registered plugin panels
import React from 'react';
import { Box, Typography, Card, CardActionArea, CardContent, Divider } from '@mui/material';
import { PluginService } from '../../services/plugin/PluginService';
import { useStore } from '../../store';

export const PluginHub: React.FC = () => {
  const setActivePluginId = useStore((s) => s.setActivePluginId);

  const panelPlugins = PluginService.listPlugins().filter((p) =>
    p.capabilities.some((c) => c.type === 'panel')
  );

  const aiToolPlugins = PluginService.listPlugins().filter((p) =>
    p.capabilities.some((c) => c.type === 'ai_tool')
  );

  const allPlugins = PluginService.listPlugins();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(155,127,212,0.2)', bgcolor: 'rgba(155,127,212,0.04)' }}>
        <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 600 }}>
          🧩 Plugin Center
        </Typography>
        <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary' }}>
          {allPlugins.length} plugin{allPlugins.length !== 1 ? 's' : ''} registered · Click to open
        </Typography>
      </Box>

      {/* Panel plugins */}
      {panelPlugins.length > 0 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1, display: 'block' }}>
            App Panels
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5 }}>
            {panelPlugins.map((plugin) => (
              <Card
                key={plugin.id}
                sx={{ bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                onClick={() => setActivePluginId(plugin.id)}
              >
                <CardActionArea sx={{ p: 1.5 }}>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    {plugin.icon && (
                      <Typography variant="h6" sx={{ fontSize: 24, mb: 0.5 }}>
                        {plugin.icon}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600 }}>
                      {plugin.name}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>
                      v{plugin.version}
                    </Typography>
                    <Divider sx={{ my: 0.75 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {plugin.capabilities.map((cap, i) => (
                        <Box
                          key={i}
                          sx={{
                            px: 0.5,
                            py: 0.1,
                            borderRadius: 0.5,
                            bgcolor: cap.type === 'panel'
                              ? 'rgba(155,127,212,0.15)'
                              : cap.type === 'ai_tool'
                              ? 'rgba(76,175,80,0.15)'
                              : 'rgba(255,152,0,0.15)',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary' }}>
                            {cap.type === 'ai_tool' ? `🤖 ${cap.name}` : cap.type === 'panel' ? '📱 panel' : `⚡ ${cap.event}`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* AI-only plugins */}
      {aiToolPlugins.length > panelPlugins.length && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1, display: 'block' }}>
            AI Tools
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {aiToolPlugins
              .filter((p) => !p.capabilities.some((c) => c.type === 'panel'))
              .map((plugin) => (
                <Card
                  key={plugin.id}
                  sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {plugin.icon && <Typography variant="body2" sx={{ fontSize: 14 }}>{plugin.icon}</Typography>}
                      <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600, flex: 1 }}>
                        {plugin.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>
                        v{plugin.version}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Box>
        </Box>
      )}

      {allPlugins.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 6, opacity: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: 13 }}>
            No plugins registered
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PluginHub;
