/**
 * RoleDebugPanel - Real-time role execution debugger
 * V144 Role Execution Engine
 */

import React, { useEffect, useState } from 'react';
import { MyBox, MyTypography, MyPaper, MyChip, MyDivider } from '../MUI替代';
import { useTranslation } from 'react-i18next';
import { roleHookManager } from '../../services/roles/RoleHookManager';
import { RoleChainExecutor } from '../../services/roles/RoleChainExecutor';
import type { ChainExecutionState, HookEvent, ExecutionResult } from '../../types/role-execution';
import { RoleRegistry } from '../../services/agent/v120/roles/RoleRegistry';
import { RoleAssigner } from '../../services/agent/v120/roles/RoleAssigner';
import { roleMetrics } from '../../services/roles/RoleMetrics';

const EXECUTOR = new RoleChainExecutor(new RoleRegistry(), new RoleAssigner(), roleMetrics);

const STATUS_COLORS: Record<string, string> = {
  pending: '#9e9e9e',
  running: '#2196f3',
  completed: '#4caf50',
  failed: '#f44336',
  aborted: '#ff9800',
};

export const RoleDebugPanel: React.FC = () => {
  const { t } = useTranslation();
  const [executions, setExecutions] = useState<ChainExecutionState[]>([]);
  const [recentEvents, setRecentEvents] = useState<HookEvent[]>([]);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);

  useEffect(() => {
    // Poll running executions
    const interval = setInterval(() => {
      setExecutions(EXECUTOR.getRunningExecutions());
      setRecentEvents(roleHookManager.getEventLog().slice(-20));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const runningChains = executions.filter(e => e.status === 'running');

  return (
    <MyBox sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      <MyTypography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t('nav.roleDebug')}
      </MyTypography>

      {/* Running Chains */}
      <MyPaper sx={{ p: 2, mb: 2 }}>
        <MyTypography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Running Chains ({runningChains.length})
        </MyTypography>
        {runningChains.length === 0 ? (
          <MyTypography variant="caption" color="text.secondary">
            No chain execution in progress
          </MyTypography>
        ) : (
          runningChains.map(chain => (
            <MyBox
              key={chain.chainId}
              sx={{
                mb: 1,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}
            >
              <MyBox sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <MyTypography
                  variant="body2"
                  sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                >
                  {chain.chainId}
                </MyTypography>
                <MyChip
                  label={chain.status}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 10,
                    backgroundColor: STATUS_COLORS[chain.status] + '20',
                    color: STATUS_COLORS[chain.status],
                  }}
                />
              </MyBox>
              {chain.currentRoleId && (
                <MyTypography variant="caption" color="text.secondary">
                  Current: <span style={{ fontFamily: 'monospace' }}>{chain.currentRoleId}</span>
                </MyTypography>
              )}
              <MyBox sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                {Object.entries(chain.roleStates).map(([roleId, status]) => (
                  <MyChip
                    key={roleId}
                    label={roleId}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 10,
                      backgroundColor: STATUS_COLORS[status] + '20',
                      color: STATUS_COLORS[status],
                    }}
                  />
                ))}
              </MyBox>
            </MyBox>
          ))
        )}
      </MyPaper>

      <MyDivider sx={{ my: 2 }} />

      {/* Role States */}
      <MyPaper sx={{ p: 2, mb: 2 }}>
        <MyTypography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Role Execution States
        </MyTypography>
        {executions.map(chain => (
          <MyBox key={chain.chainId} sx={{ mb: 2 }}>
            <MyTypography
              variant="caption"
              sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
            >
              Chain: {chain.chainId}
            </MyTypography>
            {Object.entries(chain.roleStates).map(([roleId, status]) => (
              <MyBox
                key={roleId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.5,
                }}
              >
                <MyBox
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: STATUS_COLORS[status],
                  }}
                />
                <MyTypography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {roleId}
                </MyTypography>
                <MyChip
                  label={status}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: 9,
                    backgroundColor: STATUS_COLORS[status] + '20',
                    color: STATUS_COLORS[status],
                  }}
                />
              </MyBox>
            ))}
          </MyBox>
        ))}
      </MyPaper>

      <MyDivider sx={{ my: 2 }} />

      {/* Hook Event Log */}
      <MyPaper sx={{ p: 2 }}>
        <MyTypography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Hook Event Log ({recentEvents.length})
        </MyTypography>
        {recentEvents.length === 0 ? (
          <MyTypography variant="caption" color="text.secondary">
            No hook events recorded
          </MyTypography>
        ) : (
          recentEvents.slice().reverse().map((event, index) => (
            <MyBox
              key={index}
              sx={{
                py: 0.5,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <MyBox sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MyChip
                  label={event.hook}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: 9,
                    backgroundColor:
                      event.hook === 'onEnter'
                        ? '#4caf5020'
                        : event.hook === 'onExit'
                        ? '#2196f320'
                        : '#f4433620',
                    color:
                      event.hook === 'onEnter'
                        ? '#4caf50'
                        : event.hook === 'onExit'
                        ? '#2196f3'
                        : '#f44336',
                  }}
                />
                <MyTypography variant="caption" color="text.secondary">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </MyTypography>
              </MyBox>
              {event.error && (
                <MyTypography variant="caption" sx={{ color: '#f44336', pl: 5 }}>
                  Error: {event.error}
                </MyTypography>
              )}
            </MyBox>
          ))
        )}
      </MyPaper>
    </MyBox>
  );
};