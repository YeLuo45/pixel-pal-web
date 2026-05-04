import React from 'react';
import { Box, Button, TextField, FormControl, Select, MenuItem, IconButton, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Action, ActionType } from '../../types/scene';
import { createAction } from '../../types/scene';

interface ActionConfigProps {
  actions: Action[];
  onChange: (actions: Action[]) => void;
}

const ACTION_TYPE_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'sendMessage', label: '💬 发送消息' },
  { value: 'switchRole', label: '🎭 切换角色' },
  { value: 'speak', label: '🔊 朗读文本' },
  { value: 'notify', label: '🔔 桌面通知' },
];

export const ActionConfig: React.FC<ActionConfigProps> = ({ actions, onChange }) => {
  const addAction = () => {
    onChange([...actions, createAction('sendMessage')]);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const updateActionType = (index: number, type: ActionType) => {
    const newActions = [...actions];
    newActions[index] = createAction(type);
    onChange(newActions);
  };

  const updateActionParams = (index: number, params: Record<string, unknown>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], params: { ...newActions[index].params, ...params } } as Action;
    onChange(newActions);
  };

  const getActionParams = (action: Action): Record<string, unknown> => {
    return (action as { params: Record<string, unknown> }).params;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary' }}>
        执行动作
      </Typography>

      {actions.map((action, index) => (
        <Box key={index} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <Select
                value={action.type}
                onChange={(e: SelectChangeEvent<ActionType>) => updateActionType(index, e.target.value as ActionType)}
              >
                {ACTION_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton size="small" onClick={() => removeAction(index)} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          {action.type === 'sendMessage' && (
            <TextField
              fullWidth
              size="small"
              placeholder="输入要发送的消息内容"
              value={getActionParams(action).message || ''}
              onChange={(e) => updateActionParams(index, { message: e.target.value })}
            />
          )}
          {action.type === 'speak' && (
            <TextField
              fullWidth
              size="small"
              placeholder="输入要朗读的文本"
              value={getActionParams(action).text || ''}
              onChange={(e) => updateActionParams(index, { text: e.target.value })}
            />
          )}
          {action.type === 'notify' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="通知标题"
                value={getActionParams(action).title || ''}
                onChange={(e) => updateActionParams(index, { title: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                placeholder="通知内容"
                value={getActionParams(action).body || ''}
                onChange={(e) => updateActionParams(index, { body: e.target.value })}
              />
            </Box>
          )}
          {action.type === 'switchRole' && (
            <TextField
              fullWidth
              size="small"
              placeholder="角色 ID"
              value={getActionParams(action).roleId || ''}
              onChange={(e) => updateActionParams(index, { roleId: e.target.value })}
            />
          )}
        </Box>
      ))}

      <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addAction} sx={{ alignSelf: 'flex-start' }}>
        添加动作
      </Button>
    </Box>
  );
};
