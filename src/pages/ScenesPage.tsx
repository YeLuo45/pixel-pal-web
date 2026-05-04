import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSceneStore } from '../stores/sceneStore';
import { SceneCard } from '../components/scene/SceneCard';
import { SceneEditorDialog } from '../components/scene/SceneEditorDialog';
import { executeScene, scheduleScene, unscheduleScene } from '../utils/sceneScheduler';
import type { Scene } from '../types/scene';

export const ScenesPage: React.FC = () => {
  const { scenes, loaded, loadScenes, addScene, updateScene, removeScene, toggleScene } = useSceneStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) {
      loadScenes();
    }
  }, [loaded, loadScenes]);

  // Register/unregister timers when scenes change
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
    executeScene(scene);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingScene(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          场景
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          新建场景
        </Button>
      </Box>

      {scenes.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            还没有场景，创建一个吧
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            创建第一个场景
          </Button>
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

      {/* Delete confirmation */}
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

      {/* Editor dialog */}
      <SceneEditorDialog open={dialogOpen} onClose={handleCloseDialog} onSave={handleSave} editingScene={editingScene} />
    </Box>
  );
};
