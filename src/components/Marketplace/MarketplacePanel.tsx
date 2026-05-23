/**
 * V133 Skill Marketplace - MarketplacePanel Component
 * Tabbed panel (Local Skills | Marketplace | My Published)
 * Entry point: AgentPanel → Memory Layers tab → Marketplace sub-panel
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, TextField, Button,
  Chip, Grid, CircularProgress, Alert,
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useMarketplace } from '../../hooks/useMarketplace';
import { SkillCard } from './SkillCard';
import { PublishDialog } from './PublishDialog';
import { skillRegistry } from '../../services/skills/skillRegistry';
import type { SkillDefinition } from '../../services/skills/types';
import type { MarketplaceSkill } from '../../data/sampleMarketplaceSkills';

type TabValue = 'local' | 'marketplace' | 'published';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ flex: 1, overflow: 'auto' }}>{children}</Box> : null;
}

// Re-export SkillCard and PublishDialog
export { SkillCard, PublishDialog };

export const MarketplacePanel: React.FC = () => {
  const [tab, setTab] = useState<TabValue>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedSkillForPublish, setSelectedSkillForPublish] = useState<SkillDefinition | null>(null);
  const [localSkills, setLocalSkills] = useState<SkillDefinition[]>([]);

  const {
    marketplaceSkills,
    searchResults,
    search,
    clearSearch,
    installSkill,
    uninstallSkill,
    publishSkill,
    rateSkill,
    installedSkillIds,
    isLoading,
  } = useMarketplace();

  // Load local skills
  useEffect(() => {
    const skills = skillRegistry.getAllSkills();
    setLocalSkills(skills);
  }, [marketplaceSkills]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() && activeTags.length === 0) {
      clearSearch();
      return;
    }
    search({ query: searchQuery, tags: activeTags, sortBy: 'relevance' });
  }, [searchQuery, activeTags, search, clearSearch]);

  const handleTagToggle = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleInstall = async (skill: MarketplaceSkill) => {
    await installSkill(skill);
  };

  const handleUninstall = async (skillId: string) => {
    await uninstallSkill(skillId);
  };

  const handlePublishClick = (skill: SkillDefinition) => {
    setSelectedSkillForPublish(skill);
    setPublishDialogOpen(true);
  };

  const handlePublish = async (skill: SkillDefinition, changelog: string) => {
    const result = await publishSkill(skill, changelog);
    return result;
  };

  const allTags = Array.from(new Set(marketplaceSkills.flatMap((s) => s.tags))).slice(0, 12);
  const displayedSkills = searchQuery.trim() || activeTags.length > 0
    ? searchResults.map((r) => r.skill)
    : tab === 'local' ? localSkills
    : tab === 'published' ? marketplaceSkills.filter((s) => s.author !== 'anon')
    : marketplaceSkills;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>
          Skill Marketplace
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v as TabValue)}
          sx={{
            minHeight: 28,
            '& .MuiTab-root': { minHeight: 28, fontSize: 11, px: 1.5 },
          }}
        >
          <Tab label="Local Skills" value="local" />
          <Tab label="Marketplace" value="marketplace" />
          <Tab label="My Published" value="published" />
        </Tabs>
      </Box>

      {/* Search bar */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 1 }}>
        <TextField
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          size="small"
          InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.disabled' }} /> }}
          sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: 12 } }}
        />
        <Button size="small" onClick={handleSearch} sx={{ fontSize: 11 }}>Search</Button>
      </Box>

      {/* Tag filters */}
      {tab === 'marketplace' && (
        <Box sx={{ px: 2, py: 0.75, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {allTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={() => handleTagToggle(tag)}
              sx={{
                fontSize: 9,
                height: 18,
                bgcolor: activeTags.includes(tag) ? 'primary.main' : 'rgba(255,255,255,0.06)',
                color: activeTags.includes(tag) ? '#fff' : 'text.secondary',
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : displayedSkills.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11 }}>
              No skills found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1}>
            {displayedSkills.map((skill) => {
              const isMarketplaceSkill = 'avgRating' in skill;
              const isInstalled = isMarketplaceSkill && installedSkillIds.has((skill as MarketplaceSkill).id);
              return (
                <Grid item xs={12} sm={6} key={skill.id}>
                  {isMarketplaceSkill ? (
                    <SkillCard
                      skill={skill as MarketplaceSkill}
                      isInstalled={isInstalled}
                      onInstall={handleInstall}
                      onUninstall={handleUninstall}
                      showPublishButton={false}
                    />
                  ) : (
                    <SkillCard
                      skill={{ ...skill, avgRating: 0, installCount: 0, uploadedAt: '', updatedAt: '' } as MarketplaceSkill}
                      showPublishButton
                      onPublish={() => handlePublishClick(skill as SkillDefinition)}
                    />
                  )}
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Publish dialog */}
      <PublishDialog
        open={publishDialogOpen}
        skill={selectedSkillForPublish}
        onClose={() => { setPublishDialogOpen(false); setSelectedSkillForPublish(null); }}
        onPublish={handlePublish}
      />
    </Box>
  );
};

export default MarketplacePanel;
