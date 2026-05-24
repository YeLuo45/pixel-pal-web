/**
 * RoleMetricsDashboard - Role performance metrics dashboard
 * V144 Role Execution Engine
 */

import React, { useEffect, useState } from 'react';
import { MyBox, MyTypography, MyPaper, MyButton, MyDivider } from '../MUI替代';
import { useTranslation } from 'react-i18next';
import { roleMetrics } from '../../services/roles/RoleMetrics';
import type { RoleMetrics as RoleMetricsType } from '../../types/role-execution';

export const RoleMetricsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<RoleMetricsType[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMetrics(roleMetrics.getAllMetrics());
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  const handleReset = () => {
    roleMetrics.resetMetrics();
    setMetrics([]);
    setRefreshKey(k => k + 1);
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  const successRate = (m: RoleMetricsType): string => {
    if (m.totalExecutions === 0) return '-';
    return `${((m.successCount / m.totalExecutions) * 100).toFixed(1)}%`;
  };

  return (
    <MyBox sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      <MyBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <MyTypography variant="h6" sx={{ fontWeight: 600 }}>
          {t('nav.roleMetrics')}
        </MyTypography>
        <MyBox sx={{ display: 'flex', gap: 1 }}>
          <MyButton size="small" variant="outlined" onClick={handleRefresh}>
            Refresh
          </MyButton>
          <MyButton size="small" variant="outlined" color="error" onClick={handleReset}>
            Reset
          </MyButton>
        </MyBox>
      </MyBox>

      {/* Summary Stats */}
      <MyPaper sx={{ p: 2, mb: 2 }}>
        <MyTypography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Summary
        </MyTypography>
        <MyBox sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <MyBox>
            <MyTypography variant="caption" color="text.secondary">
              Total Roles
            </MyTypography>
            <MyTypography variant="h6">{metrics.length}</MyTypography>
          </MyBox>
          <MyBox>
            <MyTypography variant="caption" color="text.secondary">
              Total Executions
            </MyTypography>
            <MyTypography variant="h6">
              {metrics.reduce((sum, m) => sum + m.totalExecutions, 0)}
            </MyTypography>
          </MyBox>
          <MyBox>
            <MyTypography variant="caption" color="text.secondary">
              Total Successes
            </MyTypography>
            <MyTypography variant="h6" sx={{ color: '#4caf50' }}>
              {metrics.reduce((sum, m) => sum + m.successCount, 0)}
            </MyTypography>
          </MyBox>
          <MyBox>
            <MyTypography variant="caption" color="text.secondary">
              Total Failures
            </MyTypography>
            <MyTypography variant="h6" sx={{ color: '#f44336' }}>
              {metrics.reduce((sum, m) => sum + m.failureCount, 0)}
            </MyTypography>
          </MyBox>
        </MyBox>
      </MyPaper>

      {/* Metrics Table */}
      <MyPaper sx={{ p: 2 }}>
        <MyTypography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Role Metrics ({metrics.length} roles)
        </MyTypography>
        {metrics.length === 0 ? (
          <MyTypography variant="caption" color="text.secondary">
            No execution metrics recorded yet
          </MyTypography>
        ) : (
          <MyBox sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Role ID</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Executions</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Success</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Fail</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Avg Duration</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Peak Conc.</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Last Run</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m.roleId} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 4px', fontFamily: 'monospace', fontSize: 12 }}>{m.roleId}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: 12 }}>{m.totalExecutions}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: 12, color: '#4caf50' }}>{m.successCount}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: 12, color: m.failureCount > 0 ? '#f44336' : 'inherit' }}>{m.failureCount}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: 12 }}>{formatDuration(m.avgDuration)}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: 12 }}>{m.peakConcurrency}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{formatDate(m.lastExecutedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </MyBox>
        )}
      </MyPaper>

      <MyDivider sx={{ my: 2 }} />

      {/* Error Types */}
      <MyPaper sx={{ p: 2 }}>
        <MyTypography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Error Types Distribution
        </MyTypography>
        {metrics.filter(m => Object.keys(m.errorTypes).length > 0).length === 0 ? (
          <MyTypography variant="caption" color="text.secondary">
            No errors recorded
          </MyTypography>
        ) : (
          <MyBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {metrics
              .filter(m => Object.keys(m.errorTypes).length > 0)
              .map(m => (
                <MyBox key={m.roleId}>
                  <MyTypography
                    variant="caption"
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                  >
                    {m.roleId}
                  </MyTypography>
                  <MyBox sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                    {Object.entries(m.errorTypes).map(([errorType, count]) => (
                      <span
                        key={errorType}
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          backgroundColor: 'rgba(244,67,53,0.15)',
                          color: '#f44336',
                        }}
                      >
                        {errorType}: {count}
                      </span>
                    ))}
                  </MyBox>
                </MyBox>
              ))
            }
          </MyBox>
        )}
      </MyPaper>
    </MyBox>
  );
};