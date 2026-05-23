/**
 * V133 Skill Marketplace - PublishDialog Component
 * Confirm publish dialog with metadata edit.
 */

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Chip,
} from '@mui/material';
import type { SkillDefinition } from '../../services/skills/types';
import type { PublishResult } from '../../services/marketplace/SkillPublisher';

interface PublishDialogProps {
  open: boolean;
  skill: SkillDefinition | null;
  onClose: () => void;
  onPublish: (skill: SkillDefinition, changelog: string) => Promise<PublishResult>;
}

export const PublishDialog: React.FC<PublishDialogProps> = ({ open, skill, onClose, onPublish }) => {
  const [changelog, setChangelog] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);

  const handlePublish = async () => {
    if (!skill) return;
    setIsPublishing(true);
    try {
      const res = await onPublish(skill, changelog);
      setResult(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
          setResult(null);
          setChangelog('');
        }, 1500);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setChangelog('');
    onClose();
  };

  if (!skill) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>
        Publish Skill to Marketplace
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Skill preview */}
          <Box sx={{ p: 1.5, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 20 }}>{skill.icon}</Typography>
              <Box>
                <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 700 }}>{skill.name}</Typography>
                <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                  v{skill.version} · {skill.category}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary', display: 'block', mt: 1 }}>
              {skill.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              {skill.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" sx={{ fontSize: 9, height: 16 }} />
              ))}
            </Box>
          </Box>

          {/* Changelog */}
          <TextField
            label="Changelog (optional)"
            multiline
            rows={3}
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            placeholder="Describe what's new in this version..."
            size="small"
            sx={{ '& .MuiInputBase-input': { fontSize: 12 } }}
          />

          {/* Result feedback */}
          {result && (
            <Box sx={{ p: 1, borderRadius: 1, bgcolor: result.success ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)' }}>
              <Typography variant="caption" sx={{ fontSize: 11, color: result.success ? '#4CAF50' : '#F44336' }}>
                {result.success
                  ? `Published! Shareable URL: ${result.shareableUrl}`
                  : `Failed: ${result.error}`}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPublishing} sx={{ fontSize: 12 }}>
          Cancel
        </Button>
        <Button
          onClick={handlePublish}
          disabled={isPublishing || (result?.success ?? false)}
          variant="contained"
          sx={{ fontSize: 12 }}
        >
          {isPublishing ? 'Publishing...' : 'Publish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PublishDialog;
