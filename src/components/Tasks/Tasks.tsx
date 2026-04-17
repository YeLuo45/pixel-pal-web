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

const PRIORITY_COLORS: Record<string, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};

export const Tasks: React.FC = () => {
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
          ✅ Tasks
        </Typography>
        <Chip label={`${pendingCount} pending`} size="small" sx={{ fontSize: 10, height: 20 }} />
        <Chip label={`${completedCount} done`} size="small" sx={{ fontSize: 10, height: 20, bgcolor: 'rgba(76,175,80,0.2)', color: '#4CAF50' }} />
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
            {f}
          </Typography>
        ))}
      </Box>

      {/* Task list */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {filteredTasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: 13 }}>
              No tasks yet. Click + to add one!
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
                  onChange={() => toggleTaskComplete(task.id)}
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
                            <Chip label="Overdue" size="small" sx={{ height: 14, fontSize: 8, bgcolor: 'rgba(244,67,54,0.2)', color: '#F44336', '& .MuiChip-label': { px: 0.5 } }} />
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
        <DialogTitle sx={{ fontSize: 15 }}>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              size="small"
              fullWidth
              autoFocus
            />
            <TextField
              label="Due Date (optional)"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleSave} variant="contained" size="small" disabled={!formData.title}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
