import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControlLabel, Switch,
} from '@mui/material';
import type { Scene, Trigger, Action } from '../../types/scene';
import { TriggerConfig } from './TriggerConfig';
import { ActionConfig } from './ActionConfig';

interface SceneEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (scene: Scene) => void;
  editingScene?: Scene | null;
}

export const SceneEditorDialog: React.FC<SceneEditorDialogProps> = ({ open, onClose, onSave, editingScene }) => {
  const [name, setName] = useState('');
  const [isQuick, setIsQuick] = useState(false);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    if (editingScene) {
      setName(editingScene.name);
      setIsQuick(editingScene.isQuick);
      setTriggers([...editingScene.triggers]);
      setActions([...editingScene.actions]);
    } else {
      setName('');
      setIsQuick(false);
      setTriggers([]);
      setActions([]);
    }
  }, [editingScene, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    const scene: Scene = {
      id: editingScene?.id || `scene-${Date.now()}`,
      name: name.trim(),
      enabled: editingScene?.enabled ?? true,
      isQuick,
      triggers,
      actions,
      createdAt: editingScene?.createdAt ?? Date.now(),
    };
    onSave(scene);
    onClose();
  };

  const isValid = name.trim().length > 0 && triggers.length > 0 && actions.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>{editingScene ? '编辑场景' : '新建场景'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="场景名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          size="small"
          inputProps={{ maxLength: 20 }}
          helperText={`${name.length}/20 字符`}
        />

        <FormControlLabel
          control={<Switch checked={isQuick} onChange={(e) => setIsQuick(e.target.checked)} />}
          label="显示在快捷栏"
        />

        <TriggerConfig triggers={triggers} onChange={setTriggers} />

        <ActionConfig actions={actions} onChange={setActions} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" onClick={handleSave} disabled={!isValid}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};
