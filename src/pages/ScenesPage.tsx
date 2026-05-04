import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Button, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, Chip,
} from '@mui/material';
import {
  Add as AddIcon, AutoAwesome as AutoAwesomeIcon,
  FileDownload as ExportIcon, FileUpload as ImportIcon,
} from '@mui/icons-material';
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
  const [importConfirmData, setImportConfirmData] = useState<Scene[] | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loaded) loadScenes();
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
      scene.enabled ? unscheduleScene(id) : scheduleScene(scene);
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

  // Import / Export
  const handleExport = () => {
    const data = JSON.stringify({ version: 1, scenes }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelpal-scenes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => importInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming: Scene[] = Array.isArray(parsed) ? parsed : (parsed.scenes ?? []);
      if (incoming.length === 0) { window.alert('未找到有效的场景数据'); return; }
      setImportConfirmData(incoming);
    } catch { window.alert('文件格式无效'); }
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!importConfirmData) return;
    for (const scene of importConfirmData) {
      const newScene: Scene = { ...scene, id: `scene-${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: Date.now() };
      await addScene(newScene);
      scheduleScene(newScene);
    }
    setImportConfirmData(null);
  };

  // Derived
  const allTags = Array.from(new Set(scenes.flatMap((s) => s.tags))).sort();
  const filteredScenes = activeTag ? scenes.filter((s) => s.tags.includes(activeTag)) : scenes;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 44 }}>
          <Tab label="场景" sx={{ minHeight: 44, fontSize: 14 }} />
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              执行日志
              <Typography component="span" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 5, px: 0.8, py: 0.1, fontSize: 10, lineHeight: 1.6 }}>
                {useSceneStore.getState().sceneLogs.length}
              </Typography>
            </Box>
          } sx={{ minHeight: 44, fontSize: 14 }} />
        </Tabs>
      </Box>

      {/* Scenes Tab */}
      {tab === 0 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, overflow: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>场景</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={() => setPresetOpen(true)} size="small">预设</Button>
              <Button variant="outlined" startIcon={<ImportIcon />} onClick={handleImportClick} size="small">导入</Button>
              <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExport} size="small" disabled={scenes.length === 0}>导出</Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>新建</Button>
            </Box>
          </Box>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
              <Chip label="全部" size="small" variant={activeTag === null ? 'filled' : 'outlined'} onClick={() => setActiveTag(null)} sx={{ cursor: 'pointer' }} />
              {allTags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant={activeTag === tag ? 'filled' : 'outlined'} onClick={() => setActiveTag(activeTag === tag ? null : tag)} sx={{ cursor: 'pointer' }} />
              ))}
            </Box>
          )}

          {/* Empty state */}
          {scenes.length === 0 ? (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>还没有场景，创建一个吧</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={() => setPresetOpen(true)}>添加预设场景</Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>创建自定义场景</Button>
              </Box>
            </Box>
          ) : filteredScenes.length === 0 ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>该标签下没有场景</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredScenes.map((scene) => (
                <Grid item xs={12} sm={6} md={4} key={scene.id}>
                  <SceneCard scene={scene} onEdit={handleEdit} onDelete={(id) => setDeleteConfirmId(id)} onToggle={handleToggle} onQuickTrigger={handleQuickTrigger} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Log Tab */}
      {tab === 1 && <Box sx={{ flex: 1, overflow: 'auto' }}><SceneLogPanel /></Box>}

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent><Typography>确定要删除这个场景吗？此操作不可撤销。</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>取消</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>删除</Button>
        </DialogActions>
      </Dialog>

      <SceneEditorDialog open={dialogOpen} onClose={handleCloseDialog} onSave={handleSave} editingScene={editingScene} />
      <PresetScenesModal open={presetOpen} onClose={() => setPresetOpen(false)} onAddPreset={handleAddPreset} />

      <input ref={importInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />

      <Dialog open={!!importConfirmData} onClose={() => setImportConfirmData(null)} maxWidth="sm" fullWidth>
        <DialogTitle>确认导入</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>将导入以下 {importConfirmData?.length} 个场景：</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {importConfirmData?.map((s) => (
              <Box key={s.id} sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                <Typography variant="caption" color="text.secondary">{s.triggers.map((t) => t.type).join(', ')} · {s.actions.length} 个动作</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportConfirmData(null)}>取消</Button>
          <Button variant="contained" onClick={handleConfirmImport}>确认导入</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
