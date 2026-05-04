import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab } from '@mui/material';
import { Add as AddIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { useSceneStore } from '../stores/sceneStore';
import { SceneCard } from '../components/scene/SceneCard';
import { SceneEditorDialog } from '../components/scene/SceneEditorDialog';
import { PresetScenesModal } from '../components/scene/PresetScenesModal';
import { SceneLogPanel } from '../components/scene/SceneLogPanel';
import { executeScene, scheduleScene, unscheduleScene } from '../utils/sceneScheduler';
import { createSceneFromPreset, type PresetScene } from '../data/presetScenes';
import type { Scene } from '../types/scene';

export const ScenesPage: React.FC = () => {
  const { scenes, loaded, loadScenes, addScene, updateScene, removeScene, toggleScene } = useSceneStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!loaded) {
      loadScenes();
    }
  }, [loaded, loadScenes]);

  useEffect(() => {
    if (!loaded) return;
    scenes.forEach((scene) => {
      if (scene.enabled && scene.triggers.some((t) => t.type === 'time')) {
        scheduleScene(scene);
      } else {
        unscheduleScene(scene.id);
      }
    });
  }, [scenes, loaded]);

  const handleEdit = (scene: Scene) => {
    unscheduleScene(scene.id);
    setEditingScene(scene);
    setDialogOpen(true);
  };

  const handleSave = async (scene: Scene) => {
    if (editingScene) {
      unscheduleScene(scene.id);
      await updateScene(scene);
    } else {
      await addScene(scene);
    }
    scheduleScene(scene);
  };

  const handleDelete = async (id: string) => {
    unscheduleScene(id);
    await removeScene(id);
    setDeleteConfirmId(null);
  };

  const handleToggle = async (id: string) => {
    const scene = scenes.find((s) => s.id === id);
    if (scene) {
      if (scene.enabled) {
        unscheduleScene(id);
      } else {
        scheduleScene(scene);
      }
    }
    await toggleScene(id);
  };

  const handleQuickTrigger = (scene: Scene) => {
    executeScene(scene, '手动触发');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingScene(null);
  };

  const handleAddPreset = async (preset: PresetScene) => {
    const scene = createSceneFromPreset(preset);
    await addScene(scene);
    scheduleScene(scene);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 44 }}>
          <Tab label="场景" sx={{ minHeight: 44, fontSize: 14 }} />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                执行日志
                <Typography
                  component="span"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: 5,
                    px: 0.8,
                    py: 0.1,
                    fontSize: 10,
                    lineHeight: 1.6,
                  }}
                >
                  {useSceneStore.getState().sceneLogs.length}
                </Typography>
              </Box>
            }
            sx={{ minHeight: 44, fontSize: 14 }}
          />
        </Tabs>
      </Box>

      {/* Tab content */}
      {tab === 0 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              场景
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={() => setPresetOpen(true)} size="small">
                预设
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                新建
              </Button>
            </Box>
          </Box>

          {scenes.length === 0 ? (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                还没有场景，创建一个吧
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={() => setPresetOpen(true)}>
                  添加预设场景
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                  创建自定义场景
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Grid container spacing={2}>
                {scenes.map((scene) => (
                  <Grid item xs={12} sm={6} md={4} key={scene.id}>
                    <SceneCard
                      scene={scene}
                      onEdit={handleEdit}
                      onDelete={(id) => setDeleteConfirmId(id)}
                      onToggle={handleToggle}
                      onQuickTrigger={handleQuickTrigger}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <SceneLogPanel />
        </Box>
      )}

      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这个场景吗？此操作不可撤销。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>取消</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
            删除
          </Button>
        </DialogActions>
      </Dialog>

      <SceneEditorDialog open={dialogOpen} onClose={handleCloseDialog} onSave={handleSave} editingScene={editingScene} />

      <PresetScenesModal open={presetOpen} onClose={() => setPresetOpen(false)} onAddPreset={handleAddPreset} />
    </Box>
  );
};
