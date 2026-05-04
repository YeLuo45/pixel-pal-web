import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControlLabel, Switch, useMediaQuery,
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
  const isMobile = useMediaQuery('(max-width: 600px)');
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? '100%' : undefined,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, fontSize: isMobile ? 18 : undefined }}>
        {editingScene ? '编辑场景' : '新建场景'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: isMobile ? 'auto' : undefined }}>
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
      <DialogActions sx={{ px: 3, pb: 2, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
        <Button onClick={onClose} fullWidth={isMobile} variant="outlined">
          取消
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!isValid} fullWidth={isMobile}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};
