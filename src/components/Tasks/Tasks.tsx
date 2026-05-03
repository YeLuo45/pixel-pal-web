import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  List, ListItem, ListItemText,
  Checkbox, Chip,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Add as AddIcon } from '@mui/icons-material';
import { useStore } from '../../store';
import type { Task } from '../../types';
import { format, parseISO, isPast, isSameDay } from 'date-fns';
import { triggerTaskCelebrate } from '../../services/actions/ActionTrigger';
import { useTranslation } from 'react-i18next';

const PRIORITY_COLORS: Record<string, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};

export const Tasks: React.FC = () => {
  const { t } = useTranslation();
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const toggleTaskComplete = useStore((s) => s.toggleTaskComplete);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    priority: 'medium' as Task['priority'],
  });

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        priority: task.priority,
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', dueDate: '', priority: 'medium' });
    }
    setDialogOpen(true);
  };

  const handleToggleComplete = (taskId: string) => {
    // Find task before toggle to get its state
    const task = tasks.find((t) => t.id === taskId);
    const wasPending = task?.status === 'pending';
    toggleTaskComplete(taskId);
    // Celebrate when a pending task becomes completed
    if (wasPending && task) {
      // Use setTimeout to let the state update first
      setTimeout(() => {
        const updatedTask = useStore.getState().tasks.find((t) => t.id === taskId);
        if (updatedTask && updatedTask.status === 'completed') {
          triggerTaskCelebrate(task);
        }
      }, 0);
    }
  };

  const handleSave = () => {
    if (!formData.title) return;
    const taskData: Task = {
      id: editingTask?.id || crypto.randomUUID(),
      title: formData.title,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      priority: formData.priority,
      status: editingTask?.status || 'pending',
      createdAt: editingTask?.createdAt || new Date().toISOString(),
      completedAt: editingTask?.completedAt,
    };
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setDialogOpen(false);
  };

  const filteredTasks = tasks
    .filter((t) => {
      if (filter === 'pending') return t.status === 'pending';
      if (filter === 'completed') return t.status === 'completed';
      return true;
    })
    .sort((a, b) => {
      // Sort: pending first, then by priority, then by date
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 600, flex: 1 }}>
          ✅ {t('tasks.title')}
        </Typography>
        <Chip label={`${pendingCount} ${t('tasks.pending')}`} size="small" sx={{ fontSize: 10, height: 20 }} />
        <Chip label={`${completedCount} ${t('tasks.done')}`} size="small" sx={{ fontSize: 10, height: 20, bgcolor: 'rgba(76,175,80,0.2)', color: '#4CAF50' }} />
        <IconButton size="small" color="primary" onClick={() => handleOpenDialog()}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Filter tabs */}
      <Box sx={{ display: 'flex', gap: 1, px: 2, py: 1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <Typography
            key={f}
            component="button"
            onClick={() => setFilter(f)}
            sx={{
              fontSize: 11,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: filter === f ? 'primary.main' : 'text.secondary',
              textTransform: 'capitalize',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: filter === f ? 'rgba(255,255,255,0.08)' : 'transparent',
            }}
          >
            {f === 'all' ? t('tasks.filterAll') : f === 'pending' ? t('tasks.filterPending') : t('tasks.filterCompleted')}
          </Typography>
        ))}
      </Box>

      {/* Task list */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {filteredTasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: 13 }}>
              {t('tasks.noTasks')}
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {filteredTasks.map((task) => {
              const isOverdue = task.status === 'pending' && task.dueDate && isPast(parseISO(task.dueDate)) && !isSameDay(parseISO(task.dueDate), new Date());
              return (
              <ListItem
                key={task.id}
                disablePadding
                sx={{
                  mb: 0.5,
                  borderRadius: 1,
                  bgcolor: isOverdue ? 'rgba(244, 67, 54, 0.08)' : 'rgba(255,255,255,0.03)',
                  borderLeft: isOverdue ? '2px solid #F44336' : '2px solid transparent',
                  '&:hover': { bgcolor: isOverdue ? 'rgba(244, 67, 54, 0.13)' : 'rgba(255,255,255,0.07)' },
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton edge="end" size="small" onClick={() => handleOpenDialog(task)}>
                      <DeleteIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                    </IconButton>
                    <IconButton edge="end" size="small" onClick={() => deleteTask(task.id)}>
                      <DeleteIcon sx={{ fontSize: 14 }} color="error" />
                    </IconButton>
                  </Box>
                }
              >
                <Checkbox
                  checked={task.status === 'completed'}
                  onChange={() => handleToggleComplete(task.id)}
                  size="small"
                  sx={{ mr: 0.5, '& .MuiSvgIcon-root': { fontSize: 18 } }}
                />
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 13,
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                          opacity: task.status === 'completed' ? 0.5 : 1,
                          color: isOverdue ? '#F44336' : 'inherit',
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: PRIORITY_COLORS[task.priority],
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    task.dueDate
                      ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: 10, color: isOverdue ? '#F44336' : 'inherit' }}>
                            {isOverdue ? '⚠️ ' : ''}{format(parseISO(task.dueDate), 'MMM d, yyyy')}
                          </Typography>
                          {isOverdue && (
                            <Chip label={t('tasks.overdue')} size="small" sx={{ height: 14, fontSize: 8, bgcolor: 'rgba(244,67,54,0.2)', color: '#F44336', '& .MuiChip-label': { px: 0.5 } }} />
                          )}
                        </Box>
                      )
                      : undefined
                  }
                />
              </ListItem>
            );
            })}
          </List>
        )}
      </Box>

      {/* Add/Edit Task Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 15 }}>{editingTask ? t('tasks.editTask') : t('tasks.addTask')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('tasks.taskTitle')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              size="small"
              fullWidth
              autoFocus
            />
            <TextField
              label={t('tasks.dueDate')}
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>{t('tasks.priority')}</InputLabel>
              <Select
                value={formData.priority}
                label={t('tasks.priority')}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
              >
                <MenuItem value="low">{t('tasks.priorityLow')}</MenuItem>
                <MenuItem value="medium">{t('tasks.priorityMedium')}</MenuItem>
                <MenuItem value="high">{t('tasks.priorityHigh')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} size="small">{t('tasks.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" size="small" disabled={!formData.title}>
            {t('tasks.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
