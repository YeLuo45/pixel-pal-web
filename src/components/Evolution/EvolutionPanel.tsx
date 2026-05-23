/**
 * V132 EvolutionPanel — 3-column layout (Skill List | Genome View | Version Timeline)
 * 
 * Entry: AgentPanel → Memory Layers tab → "Evolution Center" sub-panel
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MyBox, MyTypography, MyPaper, MyList, MyListItem, MyListItemText, MyDivider, MyTabs, MyTab, MyChip, MyButton } from '../MUI替代';
import { Evolution as EvolutionIcon } from '@mui/icons-material';
import { skillRegistry } from '../../services/skills/skillRegistry';
import { useSkillEvolution } from '../../hooks/useSkillEvolution';
import { GenomeView } from './GenomeView';
import { VersionTimeline } from './VersionTimeline';
import type { SkillDefinition } from '../../services/skills/types';

export const EvolutionPanel: React.FC = () => {
  const { t } = useTranslation();
  const {
    state,
    activeGenome,
    activeVersions,
    setActiveSkill,
  } = useSkillEvolution();

  const [skills, setSkills] = useState<SkillDefinition[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  // Load skills from registry
  useEffect(() => {
    const allSkills = skillRegistry.getAllSkills();
    setSkills(allSkills);
  }, []);

  const handleSkillSelect = (skillId: string) => {
    setSelectedSkillId(skillId);
    setActiveSkill(skillId);
  };

  const handleRollback = (version: string) => {
    console.log(`[EvolutionPanel] Rollback to version: ${version}`);
    // In a full implementation, this would call skillRegistry.forceVersion()
    // For now, just log
  };

  return (
    <MyBox sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <MyBox
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <EvolutionIcon color="primary" />
        <MyTypography variant="h6">
          Evolution Center
        </MyTypography>
        <MyChip
          size="small"
          label={`${skills.length} skills`}
          sx={{ ml: 1 }}
        />
      </MyBox>

      {/* Tabs */}
      <MyTabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <MyTab label="Skills" />
        <MyTab label="Genome" />
        <MyTab label="Timeline" />
      </MyTabs>

      {/* 3-Column Layout */}
      <MyBox sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Column 1: Skill List */}
        <MyBox
          sx={{
            width: '30%',
            minWidth: 200,
            borderRight: '1px solid rgba(255,255,255,0.08)',
            overflow: 'auto',
          }}
        >
          <MyList dense>
            {skills.map((skill) => {
              const isSelected = skill.id === selectedSkillId;
              return (
                <MyListItem
                  key={skill.id}
                  selected={isSelected}
                  onClick={() => handleSkillSelect(skill.id)}
                  sx={{
                    cursor: 'pointer',
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <MyListItemText
                    primary={skill.name}
                    secondary={
                      <MyBox sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                        <MyChip
                          label={skill.version}
                          size="small"
                          sx={{ height: 16, fontSize: '0.65rem' }}
                        />
                        <MyChip
                          label={skill.category}
                          size="small"
                          variant="outlined"
                          sx={{ height: 16, fontSize: '0.65rem' }}
                        />
                      </MyBox>
                    }
                  />
                </MyListItem>
              );
            })}
          </MyList>
        </MyBox>

        {/* Column 2: Genome View */}
        <MyBox
          sx={{
            width: '35%',
            overflow: 'auto',
            borderRight: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <GenomeView genome={activeGenome} />
        </MyBox>

        {/* Column 3: Version Timeline */}
        <MyBox sx={{ width: '35%', overflow: 'auto' }}>
          <VersionTimeline
            genome={activeGenome}
            versions={activeVersions}
            onRollback={handleRollback}
          />
        </MyBox>
      </MyBox>

      {/* Status Bar */}
      <MyBox
        sx={{
          px: 2,
          py: 1,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <MyTypography variant="caption" color="text.secondary">
          Last scan: {state.lastScanTimestamp
            ? new Date(state.lastScanTimestamp).toLocaleTimeString()
            : 'Never'}
        </MyTypography>
        <MyButton size="small" variant="outlined">
          Force Scan
        </MyButton>
      </MyBox>
    </MyBox>
  );
};