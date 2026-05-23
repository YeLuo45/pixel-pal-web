/**
 * V133 Skill Marketplace - SkillCard Component
 * Displays a marketplace skill with tags, rating, install/publish buttons.
 */

import React from 'react';
import { Box, Typography, Button, Chip, Tooltip } from '@mui/material';
import { Star as StarIcon, Download as DownloadIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import type { MarketplaceSkill } from '../../data/sampleMarketplaceSkills';

interface SkillCardProps {
  skill: MarketplaceSkill;
  isInstalled?: boolean;
  hasUpdate?: boolean;
  onInstall?: (skill: MarketplaceSkill) => void;
  onUpdate?: (skill: MarketplaceSkill) => void;
  onUninstall?: (skillId: string) => void;
  onPublish?: (skill: MarketplaceSkill) => void;
  showPublishButton?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} sx={{ fontSize: 12, color: i <= Math.round(rating) ? '#FFB400' : '#555' }} />
      ))}
      <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', ml: 0.5 }}>
        ({rating.toFixed(1)})
      </Typography>
    </Box>
  );
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isInstalled = false,
  hasUpdate = false,
  onInstall,
  onUpdate,
  onUninstall,
  onPublish,
  showPublishButton = false,
}) => {
  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 1,
        bgcolor: 'rgba(255,255,255,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: 'rgba(255,255,255,0.15)' },
      }}
    >
      {/* Header row: icon + name + version */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 18 }}>{skill.icon}</Typography>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 700 }}>
            {skill.name}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
            v{skill.version}
          </Typography>
        </Box>
        {hasUpdate && <Chip label="Update" size="small" color="info" sx={{ fontSize: 9, height: 16 }} />}
      </Box>

      {/* Rating + stats */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StarRating rating={skill.avgRating} />
        <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled' }}>
          ({skill.installCount} installs)
        </Typography>
      </Box>

      {/* Tags */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {skill.tags.slice(0, 4).map((tag) => (
          <Chip key={tag} label={tag} size="small" sx={{ fontSize: 9, height: 16, bgcolor: 'rgba(255,255,255,0.06)' }} />
        ))}
      </Box>

      {/* Author + date */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled' }}>
          by {skill.author}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled' }}>
          {skill.category}
        </Typography>
      </Box>

      {/* Description */}
      <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.4 }} noWrap>
        {skill.description}
      </Typography>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
        {isInstalled ? (
          <>
            <Button size="small" variant="outlined" sx={{ fontSize: 9, py: 0.25, px: 1, flex: 1 }} onClick={() => onUninstall?.(skill.id)}>
              Uninstall
            </Button>
            {hasUpdate && (
              <Button size="small" variant="contained" sx={{ fontSize: 9, py: 0.25, px: 1, flex: 1 }} onClick={() => onUpdate?.(skill)}>
                Update
              </Button>
            )}
          </>
        ) : (
          <Button size="small" variant="contained" startIcon={<DownloadIcon />} sx={{ fontSize: 9, py: 0.25, px: 1, flex: 1 }} onClick={() => onInstall?.(skill)}>
            Install
          </Button>
        )}
        {showPublishButton && (
          <Button size="small" variant="outlined" startIcon={<UploadIcon />} sx={{ fontSize: 9, py: 0.25, px: 1 }} onClick={() => onPublish?.(skill)}>
            Publish
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SkillCard;
