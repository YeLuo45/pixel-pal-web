/**
 * MultiAgentStudio.tsx
 * 
 * Multi-Agent Studio Panel component for pixel-pal-web.
 * Displays task status and agent collaboration workflow.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Collapse,
  Divider,
  LinearProgress,
  Badge,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  alpha,
} from '@mui/material';
import {
  Pencil,
  Play,
  CheckCircle,
  Layers,
  ChevronDown,
  ChevronRight,
  Refresh,
  Add,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  RotateCcw,
} from 'lucide-react';
import {
  AgentRole,
  Task,
  TaskStatus,
  TaskType,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  ROLE_ICONS,
  createTask,
  type AgentHook,
  type AgentMessage,
} from './AgentRole';
import { HookDrivenTaskQueue, createTaskQueue, type QueueConfig } from './HookDrivenTaskQueue';

// Icon mapping for roles
const ROLE_ICON_COMPONENTS = {
  [AgentRole.DESIGNER]: Pencil,
  [AgentRole.EXECUTOR]: Play,
  [AgentRole.REVIEWER]: CheckCircle,
  [AgentRole.COORDINATOR]: Layers,
};

// Status color mapping
const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: '#9ca3af',
  running: '#3b82f6',
  completed: '#22c55e',
  failed: '#ef4444',
};

// Status icons
const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  pending: <Circle size={16} color="#9ca3af" />,
  running: <RotateCcw size={16} color="#3b82f6" />,
  completed: <CheckCircle2 size={16} color="#22c55e" />,
  failed: <AlertCircle size={16} color="#ef4444" />,
};

/**
 * Get icon component for a role
 */
function getRoleIconComponent(role: AgentRole) {
  return ROLE_ICON_COMPONENTS[role] || Layers;
}

/**
 * Task item component
 */
interface TaskItemProps {
  task: Task;
  onCancel?: (taskId: string) => void;
  expanded?: boolean;
}

function TaskItem({ task, onCancel, expanded }: TaskItemProps) {
  const statusColor = STATUS_COLORS[task.status];
  
  return (
    <ListItem
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        mb: 0.5,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      secondaryAction={
        onCancel && task.status === 'pending' ? (
          <IconButton
            size="small"
            onClick={() => onCancel(task.id)}
            sx={{ color: 'text.secondary' }}
          >
            <Trash2 size={16} />
          </IconButton>
        ) : null
      }
    >
      <ListItemIcon sx={{ minWidth: 32 }}>
        {STATUS_ICONS[task.status]}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" component="span">
              {task.id}
            </Typography>
            <Chip
              label={task.type}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: alpha(
                  task.type === 'design' ? '#6366f1' :
                  task.type === 'execute' ? '#22c55e' : '#f59e0b',
                  0.2
                ),
                color:
                  task.type === 'design' ? '#6366f1' :
                  task.type === 'execute' ? '#22c55e' : '#f59e0b',
              }}
            />
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {new Date(task.createdAt).toLocaleTimeString()}
            </Typography>
            {task.agentId && (
              <Typography variant="caption" color="text.secondary">
                Agent: {task.agentId}
              </Typography>
            )}
          </Box>
        }
      />
      {expanded && task.payload && (
        <Box
          sx={{
            mt: 1,
            p: 1,
            bgcolor: 'background.default',
            borderRadius: 1,
            maxWidth: 200,
          }}
        >
          <Typography variant="caption" color="text.secondary" component="pre">
            {JSON.stringify(task.payload, null, 2).slice(0, 100)}...
          </Typography>
        </Box>
      )}
    </ListItem>
  );
}

/**
 * Agent card component
 */
interface AgentCardProps {
  id: string;
  name: string;
  role: AgentRole;
  taskCount?: number;
  active?: boolean;
}

function AgentCard({ id, name, role, taskCount = 0, active }: AgentCardProps) {
  const IconComponent = getRoleIconComponent(role);
  const roleColor = ROLE_COLORS[role];
  
  return (
    <Card
      sx={{
        minWidth: 160,
        bgcolor: active ? alpha(roleColor, 0.1) : 'background.paper',
        border: '2px solid',
        borderColor: active ? roleColor : 'transparent',
        transition: 'all 0.2s',
      }}
    >
      <CardContent sx={{ pb: '16px !important', pt: 1.5, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: roleColor,
              fontSize: '0.875rem',
            }}
          >
            <IconComponent size={18} />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
              {name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {role}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Tasks
          </Typography>
          <Badge badgeContent={taskCount} color="primary" max={99} />
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Queue stats component
 */
interface QueueStatsProps {
  queueLength: number;
  runningCount: number;
  completedCount: number;
  totalTasks: number;
}

function QueueStats({ queueLength, runningCount, completedCount, totalTasks }: QueueStatsProps) {
  const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Queue: {queueLength}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Running: {runningCount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Completed: {completedCount}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 1,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            bgcolor: 'success.main',
          },
        }}
      />
    </Box>
  );
}

/**
 * MultiAgentStudio component props
 */
export interface MultiAgentStudioProps {
  /** Initial queue configuration */
  config?: QueueConfig;
  /** Initial agents to display */
  initialAgents?: Array<{
    id: string;
    name: string;
    role: AgentRole;
  }>;
  /** Callback when a task is completed */
  onTaskComplete?: (task: Task, result: unknown) => void;
  /** Callback when an error occurs */
  onError?: (task: Task, error: Error) => void;
  /** Custom task executor function */
  taskExecutor?: (task: Task) => Promise<unknown>;
  /** Height of the panel */
  height?: number | string;
  /** Show/hide stats */
  showStats?: boolean;
  /** Show/hide agent cards */
  showAgents?: boolean;
}

/**
 * MultiAgentStudio - Main panel component for multi-agent collaboration
 */
export function MultiAgentStudio({
  config = {},
  initialAgents = [],
  onTaskComplete,
  onError,
  taskExecutor,
  height = 600,
  showStats = true,
  showAgents = true,
}: MultiAgentStudioProps) {
  // Queue state
  const [queue] = useState(() => createTaskQueue(config));
  
  // UI state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState(queue.getStats());
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AgentRole>(AgentRole.DESIGNER);
  const [taskType, setTaskType] = useState<TaskType>('design');
  const [payloadInput, setPayloadInput] = useState('');
  
  // Agents state
  const [agents] = useState(() => {
    const defaultAgents = [
      { id: 'designer-1', name: 'Designer', role: AgentRole.DESIGNER },
      { id: 'executor-1', name: 'Executor', role: AgentRole.EXECUTOR },
      { id: 'reviewer-1', name: 'Reviewer', role: AgentRole.REVIEWER },
      { id: 'coordinator-1', name: 'Coordinator', role: AgentRole.COORDINATOR },
    ];
    return initialAgents.length > 0 ? initialAgents : defaultAgents;
  });
  
  // Agent task counts
  const agentTaskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    agents.forEach(agent => {
      counts[agent.id] = tasks.filter(t => t.agentId === agent.id).length;
    });
    return counts;
  }, [agents, tasks]);
  
  // Sync tasks with queue
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(queue.getAllTasks());
      setStats(queue.getStats());
    }, 100);
    
    return () => clearInterval(interval);
  }, [queue]);
  
  // Register hooks for callbacks
  useEffect(() => {
    if (onTaskComplete || onError) {
      const hook: AgentHook = {
        name: 'studio-callbacks',
        after: (result, task) => {
          if (result.success && onTaskComplete) {
            onTaskComplete(task, result.data);
          }
          return result;
        },
        onError: (error, task) => {
          if (onError) {
            onError(task, error);
          }
        },
      };
      queue.registerHook(hook);
      return () => queue.unregisterHook('studio-callbacks');
    }
  }, [queue, onTaskComplete, onError]);
  
  // Custom executor override
  useEffect(() => {
    if (taskExecutor) {
      // This would require extending HookDrivenTaskQueue
      // For now, we use the built-in executor
    }
  }, [queue, taskExecutor]);
  
  // Add a new task
  const handleAddTask = useCallback(() => {
    const taskId = queue.generateTaskId();
    const task = createTask(taskId, taskType, payloadInput || undefined);
    task.agentId = agents.find(a => a.role === selectedRole)?.id;
    queue.enqueue(task);
    setPayloadInput('');
  }, [queue, taskType, payloadInput, selectedRole, agents]);
  
  // Cancel a task
  const handleCancelTask = useCallback((taskId: string) => {
    queue.cancel(taskId);
    setTasks(queue.getAllTasks());
  }, [queue]);
  
  // Clear completed tasks
  const handleClearCompleted = useCallback(() => {
    queue.clearCompleted();
    setTasks(queue.getAllTasks());
  }, [queue]);
  
  // Clear all tasks
  const handleClearAll = useCallback(() => {
    queue.clearAll();
    setTasks([]);
  }, [queue]);
  
  // Refresh tasks
  const handleRefresh = useCallback(() => {
    setTasks(queue.getAllTasks());
    setStats(queue.getStats());
  }, [queue]);
  
  // Toggle task expansion
  const handleToggleExpand = useCallback((taskId: string) => {
    setExpandedTaskId(prev => prev === taskId ? null : taskId);
  }, []);
  
  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    return {
      pending: tasks.filter(t => t.status === 'pending'),
      running: tasks.filter(t => t.status === 'running'),
      completed: tasks.filter(t => t.status === 'completed'),
      failed: tasks.filter(t => t.status === 'failed'),
    };
  }, [tasks]);
  
  return (
    <Paper
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h2">
            Multi-Agent Studio
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={handleRefresh}>
                <Refresh size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
      
      {/* Stats */}
      {showStats && (
        <Box sx={{ px: 2, pt: 2 }}>
          <QueueStats
            queueLength={stats.queueLength}
            runningCount={stats.runningCount}
            completedCount={stats.completedCount}
            totalTasks={stats.totalTasks}
          />
        </Box>
      )}
      
      {/* Agents */}
      {showAgents && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Agents
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
            {agents.map(agent => (
              <AgentCard
                key={agent.id}
                id={agent.id}
                name={agent.name}
                role={agent.role}
                taskCount={agentTaskCounts[agent.id]}
                active={tasks.some(t => t.agentId === agent.id && t.status === 'running')}
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Add Task Form */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              label="Role"
              onChange={(e) => setSelectedRole(e.target.value as AgentRole)}
            >
              {Object.values(AgentRole).map(role => (
                <MenuItem key={role} value={role}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {React.createElement(getRoleIconComponent(role), { size: 16 })}
                    <span>{role}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={taskType}
              label="Type"
              onChange={(e) => setTaskType(e.target.value as TaskType)}
            >
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="execute">Execute</MenuItem>
              <MenuItem value="review">Review</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Payload"
            value={payloadInput}
            onChange={(e) => setPayloadInput(e.target.value)}
            placeholder='{"key": "value"}'
            sx={{ flex: 1, minWidth: 150 }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<Add size={16} />}
            onClick={handleAddTask}
          >
            Add Task
          </Button>
        </Stack>
      </Box>
      
      <Divider />
      
      {/* Task Lists */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Running Tasks */}
        {tasksByStatus.running.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <RotateCcw size={16} className="animate-spin" />
              <Typography variant="subtitle2" color="text.secondary">
                Running ({tasksByStatus.running.length})
              </Typography>
            </Stack>
            <List dense disablePadding>
              {tasksByStatus.running.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  expanded={expandedTaskId === task.id}
                  onCancel={handleCancelTask}
                />
              ))}
            </List>
          </Box>
        )}
        
        {/* Pending Tasks */}
        {tasksByStatus.pending.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Pending ({tasksByStatus.pending.length})
            </Typography>
            <List dense disablePadding>
              {tasksByStatus.pending.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  expanded={expandedTaskId === task.id}
                  onCancel={handleCancelTask}
                />
              ))}
            </List>
          </Box>
        )}
        
        {/* Failed Tasks */}
        {tasksByStatus.failed.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="error.main" sx={{ mb: 1 }}>
              Failed ({tasksByStatus.failed.length})
            </Typography>
            <List dense disablePadding>
              {tasksByStatus.failed.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  expanded={expandedTaskId === task.id}
                />
              ))}
            </List>
          </Box>
        )}
        
        {/* Completed Tasks */}
        {tasksByStatus.completed.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
              Completed ({tasksByStatus.completed.length})
            </Typography>
            <List dense disablePadding>
              {tasksByStatus.completed.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  expanded={expandedTaskId === task.id}
                />
              ))}
            </List>
          </Box>
        )}
        
        {/* Empty State */}
        {tasks.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <Layers size={48} strokeWidth={1} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              No tasks yet
            </Typography>
            <Typography variant="caption">
              Add a task to get started
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Footer Actions */}
      <Box
        sx={{
          p: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            variant="outlined"
            onClick={handleClearCompleted}
            disabled={tasksByStatus.completed.length === 0}
          >
            Clear Completed
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={handleClearAll}
            disabled={tasks.length === 0}
          >
            Clear All
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

export default MultiAgentStudio;
