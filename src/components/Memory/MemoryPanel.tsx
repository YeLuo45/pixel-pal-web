/**
 * Memory Panel - Advanced Memory Management UI
 * 
 * Provides a dedicated UI for:
 * - Memory statistics and overview
 * - Memory search and retrieval
 * - Entity graph visualization
 * - Pin/Forget specific memories
 * - Memory export
 * - Memory type filtering
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Button,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  Memory as MemoryIcon,
  Hub as HubIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  PushPin as PinIcon,
  PushPin as UnpinIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as CollapseIcon,
  Lightbulb as InsightIcon,
  AccountTree as GraphIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  getMemoryStats,
  queryMemories,
  getMemory,
  deleteMemory,
} from '../../services/memory/memoryStorage';
import { type MemoryEntry, type MemoryType, type MemoryStats } from '../../services/memory/memoryTypes';
import {
  getEntityStats,
  getEntitiesByType,
  searchEntities,
  type Entity,
  type EntityType,
} from '../../services/memory/entityGraph';
import {
  smartRetrieve,
  retrieveRecentImportant,
  retrieveFrequent,
  getMemoryClusters,
  type ScoredMemory,
} from '../../services/memory/smartRetrieval';
import { generateMemoryInsights } from '../../services/memory/summarization';

const MEMORY_TYPE_COLORS: Record<MemoryType, string> = {
  conversation_summary: '#9B7FD4',
  user_preference: '#FF6B9D',
  pet_milestone: '#4CAF50',
  interaction_log: '#2196F3',
  fact: '#FF9800',
  preference: '#E91E63',
  routine: '#00BCD4',
  custom: '#9E9E9E',
};

const MEMORY_TYPE_LABELS: Record<MemoryType, string> = {
  conversation_summary: 'Chat Summary',
  user_preference: 'Preference',
  pet_milestone: 'Milestone',
  interaction_log: 'Interaction',
  fact: 'Fact',
  preference: 'Preference',
  routine: 'Routine',
  custom: 'Custom',
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export const MemoryPanel: React.FC = () => {
  // Tab state
  const [tab, setTab] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ScoredMemory[]>([]);
  const [, setIsSearching] = useState(false);

  // Memory list state
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats state
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [entityStats, setEntityStats] = useState<{
    totalEntities: number;
    byType: Record<EntityType, number>;
    totalRelationships: number;
    mostConnected: Entity[];
  } | null>(null);

  // Insights state
  const [insights, setInsights] = useState<string[]>([]);

  // Filter state
  const [typeFilter, setTypeFilter] = useState<MemoryType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'importance' | 'frequency'>('recent');

  // Selected memory for detail view
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Pinned memories
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  // Clusters
  const [clusters, setClusters] = useState<Array<{
    id: string;
    memories: MemoryEntry[];
    commonTags: string[];
    description: string;
  }>>([]);

  // Export dialog
  const [exportOpen, setExportOpen] = useState(false);

  // Load memories
  const loadMemories = useCallback(async () => {
    setLoading(true);
    try {
      const results = await queryMemories({
        type: typeFilter === 'all' ? undefined : typeFilter,
        limit: 100,
      });
      setMemories(results);
    } catch (err) {
      console.error('Failed to load memories:', err);
    }
    setLoading(false);
  }, [typeFilter]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const [memoryStats, entStats] = await Promise.all([
        getMemoryStats(),
        getEntityStats(),
      ]);
      setStats(memoryStats);
      setEntityStats(entStats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Load insights
  const loadInsights = useCallback(async () => {
    try {
      const allMemories = await queryMemories({ limit: 100 });
      const memoryInsights = await generateMemoryInsights(allMemories);
      setInsights(memoryInsights);
      const memoryClusters = await getMemoryClusters();
      setClusters(memoryClusters);
    } catch (err) {
      console.error('Failed to load insights:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMemories();
    loadStats();
    loadInsights();
  }, [loadMemories, loadStats, loadInsights]);

  // Sort memories
  const sortedMemories = [...memories].sort((a, b) => {
    if (pinnedIds.has(a.id) && !pinnedIds.has(b.id)) return -1;
    if (!pinnedIds.has(a.id) && pinnedIds.has(b.id)) return 1;

    switch (sortBy) {
      case 'importance':
        return b.importance - a.importance;
      case 'frequency':
        return b.accessCount - a.accessCount;
      default:
        return b.createdAt - a.createdAt;
    }
  });

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await smartRetrieve({ query: searchQuery, limit: 30 });
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    }
    setIsSearching(false);
  };

  // Quick filters
  const handleQuickFilter = async (filter: 'important' | 'frequent' | 'recent') => {
    setIsSearching(true);
    try {
      let results: ScoredMemory[];
      switch (filter) {
        case 'important':
          results = await retrieveRecentImportant(7, 20);
          break;
        case 'frequent':
          results = await retrieveFrequent(20);
          break;
        default:
          results = await smartRetrieve({ limit: 20 });
      }
      setSearchResults(results);
    } catch (err) {
      console.error('Quick filter failed:', err);
    }
    setIsSearching(false);
  };

  // Pin/unpin memory
  const togglePin = (id: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Delete memory
  const handleDelete = async (id: string) => {
    await deleteMemory(id);
    await loadMemories();
    await loadStats();
  };

  // Export memories
  const handleExport = () => {
    const data = JSON.stringify(memories, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelpal-memories-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  // Memory detail view
  const openDetail = async (id: string) => {
    const memory = await getMemory(id);
    if (memory) {
      setSelectedMemory(memory);
      setDetailOpen(true);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 600, mb: 1.5 }}>
          🧠 Memory Center
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        {/* Quick filters */}
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
          <Button size="small" variant="outlined" onClick={() => handleQuickFilter('recent')} sx={{ fontSize: 10, py: 0.25, px: 1 }}>
            Recent
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleQuickFilter('important')} sx={{ fontSize: 10, py: 0.25, px: 1 }}>
            <StarIcon sx={{ fontSize: 12, mr: 0.5 }} /> Important
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleQuickFilter('frequent')} sx={{ fontSize: 10, py: 0.25, px: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 12, mr: 0.5 }} /> Frequent
          </Button>
          <Button size="small" variant="outlined" onClick={() => setExportOpen(true)} sx={{ fontSize: 10, py: 0.25, px: 1 }}>
            <DownloadIcon sx={{ fontSize: 12, mr: 0.5 }} /> Export
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<MemoryIcon sx={{ fontSize: 16 }} />} label="All" iconPosition="start" sx={{ minHeight: 48, fontSize: 12 }} />
          <Tab icon={<GraphIcon sx={{ fontSize: 16 }} />} label="Entities" iconPosition="start" sx={{ minHeight: 48, fontSize: 12 }} />
          <Tab icon={<TimelineIcon sx={{ fontSize: 16 }} />} label="Timeline" iconPosition="start" sx={{ minHeight: 48, fontSize: 12 }} />
          <Tab icon={<InsightIcon sx={{ fontSize: 16 }} />} label="Insights" iconPosition="start" sx={{ minHeight: 48, fontSize: 12 }} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {tab === 0 && (
          <AllMemoriesTab
            memories={sortedMemories}
            loading={loading}
            pinnedIds={pinnedIds}
            stats={stats}
            onPin={togglePin}
            onDelete={handleDelete}
            onOpen={openDetail}
            sortBy={sortBy}
            onSortChange={setSortBy}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
          />
        )}

        {tab === 1 && (
          <EntitiesTab
            entityStats={entityStats}
            onRefresh={loadStats}
          />
        )}

        {tab === 2 && (
          <TimelineTab
            clusters={clusters}
          />
        )}

        {tab === 3 && (
          <InsightsTab
            insights={insights}
            stats={stats}
            entityStats={entityStats}
          />
        )}
      </Box>

      {/* Search Results Overlay */}
      {searchResults.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: 60,
            left: 16,
            right: 16,
            maxHeight: '60%',
            overflow: 'auto',
            zIndex: 100,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontSize: 12 }}>
              Search Results ({searchResults.length})
            </Typography>
            <IconButton size="small" onClick={() => setSearchResults([])}>
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <List dense>
            {searchResults.map(({ memory, score }) => (
              <ListItem
                key={memory.id}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                onClick={() => { openDetail(memory.id); setSearchResults([]); }}
              >
                <ListItemText
                  primary={memory.content.slice(0, 80) + (memory.content.length > 80 ? '...' : '')}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={MEMORY_TYPE_LABELS[memory.type]}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 9,
                          bgcolor: MEMORY_TYPE_COLORS[memory.type] + '33',
                          color: MEMORY_TYPE_COLORS[memory.type],
                        }}
                      />
                      <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled' }}>
                        Score: {score.toFixed(2)}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 14 }}>
          Memory Detail
        </DialogTitle>
        <DialogContent>
          {selectedMemory && (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={MEMORY_TYPE_LABELS[selectedMemory.type]}
                  size="small"
                  sx={{ bgcolor: MEMORY_TYPE_COLORS[selectedMemory.type] + '33', color: MEMORY_TYPE_COLORS[selectedMemory.type] }}
                />
                <Chip label={`Importance: ${selectedMemory.importance}`} size="small" variant="outlined" />
                <Chip label={`Accessed: ${selectedMemory.accessCount}x`} size="small" variant="outlined" />
              </Box>

              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
                {selectedMemory.content}
              </Typography>

              <Divider />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedMemory.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" sx={{ fontSize: 10 }} />
                ))}
              </Box>

              <Stack direction="row" spacing={1}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                  Created: {new Date(selectedMemory.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                  Updated: {new Date(selectedMemory.updatedAt).toLocaleString()}
                </Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)} size="small">Close</Button>
          {selectedMemory && (
            <Button
              color="error"
              onClick={() => { handleDelete(selectedMemory.id); setDetailOpen(false); }}
              size="small"
            >
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onClose={() => setExportOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontSize: 14 }}>Export Memories</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ fontSize: 12 }}>
            Export {memories.length} memories as JSON?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleExport} size="small" variant="contained">Export</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// All Memories Tab
interface AllMemoriesTabProps {
  memories: MemoryEntry[];
  loading: boolean;
  pinnedIds: Set<string>;
  stats: MemoryStats | null;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
  sortBy: 'recent' | 'importance' | 'frequency';
  onSortChange: (sort: 'recent' | 'importance' | 'frequency') => void;
  typeFilter: MemoryType | 'all';
  onTypeFilterChange: (filter: MemoryType | 'all') => void;
}

function AllMemoriesTab({
  memories,
  loading,
  pinnedIds,
  stats,
  onPin,
  onDelete,
  onOpen,
  sortBy,
  onSortChange,
  typeFilter,
  onTypeFilterChange,
}: AllMemoriesTabProps) {
  return (
    <Stack spacing={2}>
      {/* Stats summary */}
      {stats && (
        <Paper sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700 }}>
                {stats.totalEntries}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                Total Memories
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700 }}>
                {stats.averageImportance.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                Avg Importance
              </Typography>
            </Box>
            {stats.oldestEntry && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700 }}>
                  {Math.floor((Date.now() - stats.oldestEntry) / (86400000 * 30))}m
                </Typography>
                <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                  Oldest Memory
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>
      )}

      {/* Type filter */}
      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
        <Chip
          label="All"
          size="small"
          onClick={() => onTypeFilterChange('all')}
          sx={{
            fontSize: 10,
            height: 22,
            bgcolor: typeFilter === 'all' ? 'primary.main' : 'rgba(255,255,255,0.08)',
          }}
        />
        {(Object.keys(MEMORY_TYPE_LABELS) as MemoryType[]).map(type => (
          <Chip
            key={type}
            label={MEMORY_TYPE_LABELS[type]}
            size="small"
            onClick={() => onTypeFilterChange(type)}
            sx={{
              fontSize: 10,
              height: 22,
              bgcolor: typeFilter === type ? MEMORY_TYPE_COLORS[type] : 'rgba(255,255,255,0.08)',
              color: typeFilter === type ? 'white' : 'inherit',
            }}
          />
        ))}
      </Stack>

      {/* Sort controls */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
          Sort by:
        </Typography>
        {(['recent', 'importance', 'frequency'] as const).map(sort => (
          <Chip
            key={sort}
            label={sort.charAt(0).toUpperCase() + sort.slice(1)}
            size="small"
            onClick={() => onSortChange(sort)}
            sx={{
              fontSize: 10,
              height: 20,
              bgcolor: sortBy === sort ? 'primary.main' : 'transparent',
              border: sortBy === sort ? 'none' : '1px solid rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </Stack>

      {/* Memory list */}
      {loading ? (
        <LinearProgress />
      ) : memories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <MemoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No memories yet
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11 }}>
            Start chatting to build your memory!
          </Typography>
        </Box>
      ) : (
        <List dense sx={{ p: 0 }}>
          {memories.map(memory => (
            <ListItem
              key={memory.id}
              sx={{
                px: 1.5,
                py: 1,
                mb: 0.5,
                borderRadius: 1,
                bgcolor: pinnedIds.has(memory.id) ? 'rgba(155,127,212,0.1)' : 'transparent',
                border: '1px solid',
                borderColor: pinnedIds.has(memory.id) ? 'primary.main' : 'transparent',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              }}
              onClick={() => onOpen(memory.id)}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <Chip
                    label={MEMORY_TYPE_LABELS[memory.type]}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: 8,
                      bgcolor: MEMORY_TYPE_COLORS[memory.type] + '33',
                      color: MEMORY_TYPE_COLORS[memory.type],
                    }}
                  />
                  {memory.importance >= 7 && <StarIcon sx={{ fontSize: 12, color: 'warning.main' }} />}
                  <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled', ml: 'auto' }}>
                    {formatRelativeTime(memory.createdAt)}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 12,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {memory.content}
                </Typography>
                {memory.tags.length > 0 && (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    {memory.tags.slice(0, 3).map(tag => (
                      <Typography key={tag} variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>
                        #{tag}
                      </Typography>
                    ))}
                  </Stack>
                )}
              </Box>
              <ListItemSecondaryAction sx={{ right: 0 }}>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); onPin(memory.id); }}>
                    {pinnedIds.has(memory.id) ? <PinIcon sx={{ fontSize: 14, color: 'primary.main' }} /> : <UnpinIcon sx={{ fontSize: 14 }} />}
                  </IconButton>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(memory.id); }}>
                    <DeleteIcon sx={{ fontSize: 14, color: 'error.main' }} />
                  </IconButton>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Stack>
  );
}

// Entities Tab
interface EntitiesTabProps {
  entityStats: {
    totalEntities: number;
    byType: Record<EntityType, number>;
    totalRelationships: number;
    mostConnected: Entity[];
  } | null;
  onRefresh: () => void;
}

function EntitiesTab({ entityStats, onRefresh }: EntitiesTabProps) {
  const [selectedType, setSelectedType] = useState<EntityType | 'all'>('all');
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {
    loadEntities();
  }, [selectedType]);

  const loadEntities = async () => {
    try {
      if (selectedType === 'all') {
        const all = await searchEntities('');
        setEntities(all.slice(0, 50));
      } else {
        const byType = await getEntitiesByType(selectedType);
        setEntities(byType);
      }
    } catch (err) {
      console.error('Failed to load entities:', err);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle2" sx={{ fontSize: 12 }}>
          Entity Graph
        </Typography>
        <IconButton size="small" onClick={() => { onRefresh(); loadEntities(); }}>
          <RefreshIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Stack>

      {/* Stats */}
      {entityStats && (
        <Paper sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700 }}>
                {entityStats.totalEntities}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                Total Entities
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700 }}>
                {entityStats.totalRelationships}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                Relationships
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Type filter */}
      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
        <Chip
          label="All"
          size="small"
          onClick={() => setSelectedType('all')}
          sx={{ fontSize: 10, height: 22, bgcolor: selectedType === 'all' ? 'primary.main' : 'rgba(255,255,255,0.08)' }}
        />
        {Object.keys(entityStats?.byType || {}).map(type => (
          <Chip
            key={type}
            label={`${type} (${entityStats?.byType[type as EntityType] || 0})`}
            size="small"
            onClick={() => setSelectedType(type as EntityType)}
            sx={{ fontSize: 10, height: 22, bgcolor: selectedType === type ? 'primary.main' : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </Stack>

      {/* Entity list */}
      <List dense>
        {entities.map(entity => (
          <ListItem key={entity.id} sx={{ px: 1, py: 0.5 }}>
            <ListItemText
              primary={entity.name}
              secondary={`${entity.type} • ${entity.accessCount} accesses • ${entity.memoryIds.length} memories`}
              primaryTypographyProps={{ sx: { fontSize: 12 } }}
              secondaryTypographyProps={{ sx: { fontSize: 10 } }}
            />
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}

// Timeline Tab
interface TimelineTabProps {
  clusters: Array<{
    id: string;
    memories: MemoryEntry[];
    commonTags: string[];
    description: string;
  }>;
}

function TimelineTab({ clusters }: TimelineTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontSize: 12 }}>
        Memory Clusters
      </Typography>

      {clusters.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <HubIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
            No clusters yet
          </Typography>
        </Box>
      ) : (
        clusters.map(cluster => (
          <Paper key={cluster.id} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === cluster.id ? null : cluster.id)}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <HubIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600 }}>
                  {cluster.id}
                </Typography>
                <Chip label={`${cluster.memories.length} memories`} size="small" sx={{ height: 18, fontSize: 9 }} />
              </Stack>
              {expanded === cluster.id ? <CollapseIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
            </Box>

            <Collapse in={expanded === cluster.id}>
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                {cluster.memories.slice(0, 5).map((memory) => (
                  <Box key={memory.id} sx={{ pl: 4 }}>
                    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                      {formatRelativeTime(memory.createdAt)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: 11 }}>
                      {memory.content.slice(0, 100)}...
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Collapse>
          </Paper>
        ))
      )}
    </Stack>
  );
}

// Insights Tab
interface InsightsTabProps {
  insights: string[];
  stats: MemoryStats | null;
  entityStats: {
    totalEntities: number;
    byType: Record<EntityType, number>;
    totalRelationships: number;
    mostConnected: Entity[];
  } | null;
}

function InsightsTab({ insights, stats, entityStats }: InsightsTabProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontSize: 12 }}>
        Memory Insights
      </Typography>

      {/* Generated insights */}
      {insights.length > 0 ? (
        <Stack spacing={1}>
          {insights.map((insight, idx) => (
            <Paper
              key={idx}
              sx={{
                p: 1.5,
                bgcolor: 'rgba(155,127,212,0.1)',
                borderRadius: 1,
                borderLeft: '3px solid',
                borderColor: 'primary.main',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <InsightIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ fontSize: 12 }}>
                  {insight}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <InsightIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
            Chat more to generate insights!
          </Typography>
        </Box>
      )}

      {/* Memory distribution */}
      {stats && stats.totalEntries > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontSize: 12, mt: 1 }}>
            Memory Distribution
          </Typography>
          <Paper sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
            <Stack spacing={1}>
              {(Object.entries(stats.byType) as [MemoryType, number][]).map(([type, count]) => (
                <Box key={type}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                      {MEMORY_TYPE_LABELS[type]}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: 10 }}>
                      {count}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(count / stats.totalEntries) * 100}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: MEMORY_TYPE_COLORS[type],
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </>
      )}

      {/* Most connected entities */}
      {entityStats && entityStats.mostConnected.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontSize: 12, mt: 1 }}>
            Most Connected Entities
          </Typography>
          <Stack spacing={0.5}>
            {entityStats.mostConnected.slice(0, 5).map((entity, idx) => (
              <Paper
                key={entity.id}
                sx={{
                  p: 1,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled', width: 16 }}>
                  {idx + 1}.
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 11, flex: 1 }}>
                  {entity.name}
                </Typography>
                <Chip label={entity.type} size="small" sx={{ height: 16, fontSize: 8 }} />
              </Paper>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}

export default MemoryPanel;
