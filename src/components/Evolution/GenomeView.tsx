/**
 * V132 GenomeView — Core genome visualization component
 * 
 * Displays: coreKeywords, successConditions, failurePatterns, growthLog
 */

import React from 'react';
import { MyBox, MyTypography, MyChip, MyDivider } from '../MUI替代';
import type { SkillGenome } from '../../services/evolution/SkillGenome';
import { getSuccessRate } from '../../services/evolution/SkillGenome';

interface GenomeViewProps {
  genome: SkillGenome | null;
  onKeywordClick?: (keyword: string) => void;
}

export const GenomeView: React.FC<GenomeViewProps> = ({ genome, onKeywordClick }) => {
  if (!genome) {
    return (
      <MyBox sx={{ p: 2 }}>
        <MyTypography color="text.secondary">
          Select a skill to view its genome
        </MyTypography>
      </MyBox>
    );
  }

  const successRate = getSuccessRate(genome);

  return (
    <MyBox sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <MyBox>
        <MyTypography variant="h6" gutterBottom>
          {genome.skillId} — Genome
        </MyTypography>
        <MyTypography variant="body2" color="text.secondary">
          Current: {genome.currentVersion} | Call count: {genome.callCount}
        </MyTypography>
      </MyBox>

      <MyDivider />

      {/* Stats */}
      <MyBox sx={{ display: 'flex', gap: 2 }}>
        <MyBox>
          <MyTypography variant="caption" color="text.secondary">Success Rate</MyTypography>
          <MyTypography variant="h5" sx={{ color: successRate >= 60 ? 'success.main' : 'error.main' }}>
            {successRate}%
          </MyTypography>
        </MyBox>
        <MyBox>
          <MyTypography variant="caption" color="text.secondary">Success</MyTypography>
          <MyTypography variant="h5" color="success.main">{genome.successCount}</MyTypography>
        </MyBox>
        <MyBox>
          <MyTypography variant="caption" color="text.secondary">Failed</MyTypography>
          <MyTypography variant="h5" color="error.main">{genome.failCount}</MyTypography>
        </MyBox>
      </MyBox>

      <MyDivider />

      {/* Core Keywords */}
      <MyBox>
        <MyTypography variant="subtitle2" gutterBottom>Core Keywords</MyTypography>
        <MyBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {genome.coreKeywords.length > 0 ? (
            genome.coreKeywords.map((kw, i) => (
              <MyChip
                key={i}
                label={kw}
                size="small"
                onClick={() => onKeywordClick?.(kw)}
                sx={{ cursor: onKeywordClick ? 'pointer' : 'default' }}
              />
            ))
          ) : (
            <MyTypography variant="body2" color="text.secondary">
              No keywords yet
            </MyTypography>
          )}
        </MyBox>
      </MyBox>

      {/* Applicable Emotions */}
      <MyBox>
        <MyTypography variant="subtitle2" gutterBottom>Applicable Emotions</MyTypography>
        <MyBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {genome.applicableEmotions.length > 0 ? (
            genome.applicableEmotions.map((emotion, i) => (
              <MyChip key={i} label={emotion} size="small" variant="outlined" />
            ))
          ) : (
            <MyTypography variant="body2" color="text.secondary">
              No emotion data yet
            </MyTypography>
          )}
        </MyBox>
      </MyBox>

      {/* Success Conditions */}
      <MyBox>
        <MyTypography variant="subtitle2" gutterBottom>Success Conditions</MyTypography>
        <MyBox component="ul" sx={{ pl: 2, m: 0 }}>
          {genome.successConditions.length > 0 ? (
            genome.successConditions.map((cond, i) => (
              <MyTypography key={i} component="li" variant="body2">
                {cond}
              </MyTypography>
            ))
          ) : (
            <MyTypography variant="body2" color="text.secondary">
              No success patterns recorded
            </MyTypography>
          )}
        </MyBox>
      </MyBox>

      {/* Failure Patterns */}
      <MyBox>
        <MyTypography variant="subtitle2" gutterBottom>Failure Patterns</MyTypography>
        <MyBox component="ul" sx={{ pl: 2, m: 0 }}>
          {genome.failurePatterns.length > 0 ? (
            genome.failurePatterns.map((pattern, i) => (
              <MyTypography key={i} component="li" variant="body2" color="error">
                {pattern}
              </MyTypography>
            ))
          ) : (
            <MyTypography variant="body2" color="text.secondary">
              No failure patterns recorded
            </MyTypography>
          )}
        </MyBox>
      </MyBox>

      <MyDivider />

      {/* Growth Log */}
      <MyBox>
        <MyTypography variant="subtitle2" gutterBottom>Growth Log</MyTypography>
        {genome.growthLog.length > 0 ? (
          <MyBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {genome.growthLog.map((event, i) => (
              <MyBox
                key={i}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  borderLeft: `3px solid ${
                    event.trigger === 'threshold' ? 'warning.main' :
                    event.trigger === 'user_correction' ? 'info.main' :
                    'primary.main'
                  }`,
                }}
              >
                <MyBox sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <MyTypography variant="body2" fontWeight="bold">
                    {event.version}
                  </MyTypography>
                  <MyTypography variant="caption" color="text.secondary">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </MyTypography>
                </MyBox>
                <MyTypography variant="caption" color="text.secondary">
                  Trigger: {event.trigger} | Calls: {event.callCountAtTrigger} | Success: {event.successRateAtTrigger}%
                </MyTypography>
              </MyBox>
            ))}
          </MyBox>
        ) : (
          <MyTypography variant="body2" color="text.secondary">
            No growth events yet
          </MyTypography>
        )}
      </MyBox>
    </MyBox>
  );
};