/**
 * V132 VersionTimeline — v1→v2→v3 version timeline with rollback
 */

import React from 'react';
import { MyBox, MyTypography, MyButton, MyChip, MyDivider } from '../MUI替代';
import type { SkillGenome, SkillVersion } from '../../services/evolution/SkillGenome';

interface VersionTimelineProps {
  genome: SkillGenome | null;
  versions: SkillVersion[];
  onRollback?: (version: string) => void;
  currentVersion?: string;
}

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  genome,
  versions,
  onRollback,
  currentVersion,
}) => {
  if (!genome) {
    return (
      <MyBox sx={{ p: 2 }}>
        <MyTypography color="text.secondary">
          Select a skill to view version history
        </MyTypography>
      </MyBox>
    );
  }

  const activeVersion = currentVersion || genome.currentVersion;

  return (
    <MyBox sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <MyBox>
        <MyTypography variant="h6" gutterBottom>
          Version Timeline
        </MyTypography>
        <MyTypography variant="body2" color="text.secondary">
          {genome.versionChain.length} version(s) in chain
        </MyTypography>
      </MyBox>

      <MyDivider />

      {/* Version Chain */}
      <MyBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {genome.versionChain.map((version, index) => {
          const isCurrent = version === activeVersion;
          const isLatest = index === genome.versionChain.length - 1;
          const versionData = versions.find(v => v.version === version);

          return (
            <MyBox
              key={version}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderRadius: 1,
                border: isCurrent ? '2px solid' : '1px solid',
                borderColor: isCurrent ? 'primary.main' : 'divider',
                bgcolor: isCurrent ? 'action.selected' : 'transparent',
                position: 'relative',
              }}
            >
              {/* Version badge */}
              <MyChip
                label={version}
                color={isCurrent ? 'primary' : 'default'}
                size="small"
              />

              {/* Version info */}
              <MyBox sx={{ flex: 1 }}>
                <MyBox sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MyTypography variant="body2" fontWeight={isCurrent ? 'bold' : 'normal'}>
                    {versionData?.description || `Version ${version}`}
                  </MyTypography>
                  {isLatest && (
                    <MyChip label="Latest" size="small" color="success" />
                  )}
                  {isCurrent && (
                    <MyChip label="Current" size="small" color="primary" />
                  )}
                </MyBox>
                {versionData && (
                  <MyTypography variant="caption" color="text.secondary">
                    Created: {new Date(versionData.createdAt).toLocaleDateString()}
                    {versionData.optimizedFrom && ` | Optimized from: ${versionData.optimizedFrom}`}
                  </MyTypography>
                )}
              </MyBox>

              {/* Rollback button */}
              {!isCurrent && onRollback && (
                <MyButton
                  size="small"
                  variant="outlined"
                  onClick={() => onRollback(version)}
                >
                  Rollback
                </MyButton>
              )}
            </MyBox>
          );
        })}
      </MyBox>

      {/* No rollback for current */}
      {genome.versionChain.length === 1 && (
        <MyTypography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Only one version in chain. Evolution will create new versions automatically.
        </MyTypography>
      )}

      <MyDivider />

      {/* Evolution Status */}
      <MyBox>
        <MyTypography variant="subtitle2" gutterBottom>Evolution Status</MyTypography>
        <MyBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {genome.callCount >= 10 ? (
            <MyChip label="🟡 Ready for evaluation" size="small" />
          ) : (
            <MyChip label="🟢 Below threshold" size="small" color="success" />
          )}
          {genome.failCount > genome.successCount && genome.callCount >= 5 && (
            <MyChip label="🔴 Needs optimization" size="small" color="error" />
          )}
        </MyBox>
      </MyBox>
    </MyBox>
  );
};