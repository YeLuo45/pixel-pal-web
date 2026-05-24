/**
 * V143: ExecutionLogPanel — shows skill execution history with replay button
 * Collapsible panel accessible from Sidebar nav
 */

import React, { useState, useEffect } from 'react';
import { MyBox, MyTypography, MyButton, MyPaper, MyIconButton, MyDivider } from '../MUI替代';
import { Play as PlayIcon, RefreshCw as RefreshIcon, X as CloseIcon, ChevronDown as ExpandIcon, ChevronUp as CollapseIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ExecutionLog, SkillResult } from '../../types/execution';
import { getExecutionLogs, deleteExecutionLog, clearExecutionLogs } from '../../services/storage/skillExecutionStorage';
import { useCompositionExecution } from '../../hooks/useCompositionExecution';

interface ExecutionLogPanelProps {
  onClose?: () => void;
}

export const ExecutionLogPanel: React.FC<ExecutionLogPanelProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const { runDSL } = useCompositionExecution();

  const loadLogs = async () => {
    setLoading(true);
    try {
      const fetchedLogs = await getExecutionLogs({ limit: 50 });
      setLogs(fetchedLogs);
    } catch (err) {
      console.error('[ExecutionLogPanel] Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleReplay = async (log: ExecutionLog) => {
    if (!log.pipelineId) {
      // Re-run as a simple skill
      await runDSL(`trigger(${log.skillId})`, log.inputs);
    }
    await loadLogs();
  };

  const handleDelete = async (id: string) => {
    await deleteExecutionLog(id);
    await loadLogs();
  };

  const handleClear = async () => {
    await clearExecutionLogs();
    setLogs([]);
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (ts: number): string => {
    const date = new Date(ts);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  const getStatusColor = (success: boolean): string => {
    return success ? '#4caf50' : '#f44336';
  };

  return (
    <MyPaper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'var(--color-bg-secondary, #1a1b1e)',
        borderRadius: 0,
        border: 'none',
      }}
    >
      {/* Header */}
      <MyBox
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <MyBox sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MyTypography variant="h6" sx={{ fontSize: 14, fontWeight: 600, color: '#f7f8f8' }}>
            {t('execution.title', 'Execution Logs')}
          </MyTypography>
          <MyIconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <CollapseIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} /> : <ExpandIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />}
          </MyIconButton>
        </MyBox>
        <MyBox sx={{ display: 'flex', gap: 1 }}>
          <MyIconButton size="small" onClick={loadLogs} disabled={loading}>
            <RefreshIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />
          </MyIconButton>
          {onClose && (
            <MyIconButton size="small" onClick={onClose}>
              <CloseIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />
            </MyIconButton>
          )}
        </MyBox>
      </MyBox>

      {/* Content */}
      {expanded && (
        <>
          {/* Actions */}
          <MyBox sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, gap: 1 }}>
            <MyButton size="small" variant="outlined" onClick={handleClear} sx={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.2)' }}>
              {t('execution.clearAll', 'Clear All')}
            </MyButton>
          </MyBox>

          {/* Log list */}
          <MyBox sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {loading ? (
              <MyBox sx={{ p: 2, textAlign: 'center' }}>
                <MyTypography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                  {t('common.loading', 'Loading...')}
                </MyTypography>
              </MyBox>
            ) : logs.length === 0 ? (
              <MyBox sx={{ p: 2, textAlign: 'center' }}>
                <MyTypography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                  {t('execution.noLogs', 'No execution logs yet')}
                </MyTypography>
              </MyBox>
            ) : (
              logs.map((log) => (
                <MyPaper
                  key={log.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 1,
                    borderLeft: `3px solid ${getStatusColor(log.success)}`,
                  }}
                >
                  <MyBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <MyBox sx={{ flex: 1 }}>
                      <MyBox sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <MyTypography sx={{ fontSize: 12, fontWeight: 600, color: '#f7f8f8' }}>
                          {log.skillId}
                        </MyTypography>
                        {log.cached && (
                          <MyTypography sx={{ fontSize: 9, color: '#9b7fd4', bgcolor: 'rgba(155,127,212,0.15)', px: 0.5, borderRadius: 0.5 }}>
                            CACHED
                          </MyTypography>
                        )}
                      </MyBox>
                      <MyTypography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                        {formatTimestamp(log.timestamp)} · {formatDuration(log.duration)}
                      </MyTypography>
                      {log.error && (
                        <MyTypography sx={{ fontSize: 11, color: '#f44336', mt: 0.5 }}>
                          {log.error}
                        </MyTypography>
                      )}
                    </MyBox>
                    <MyBox sx={{ display: 'flex', gap: 0.5 }}>
                      <MyIconButton size="small" onClick={() => handleReplay(log)} title={t('execution.replay', 'Replay')}>
                        <PlayIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                      </MyIconButton>
                      <MyIconButton size="small" onClick={() => handleDelete(log.id)} title={t('common.delete', 'Delete')}>
                        <CloseIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
                      </MyIconButton>
                    </MyBox>
                  </MyBox>
                </MyPaper>
              ))
            )}
          </MyBox>
        </>
      )}
    </MyPaper>
  );
};