import React from 'react';
import { useSandbox } from '../../hooks/useSandbox';

/**
 * V140: SandboxMonitor — shows per-skill sandbox status and config
 */
export function SandboxMonitor() {
  const { configs, results } = useSandbox();

  return (
    <div className="sandbox-monitor">
      <h4>Skill Sandbox</h4>
      <table className="sandbox-table">
        <thead>
          <tr><th>Skill</th><th>Isolation</th><th>Memory</th><th>Timeout</th><th>Status</th></tr>
        </thead>
        <tbody>
          {configs.map(cfg => (
            <tr key={cfg.id}>
              <td>{cfg.skillId}</td>
              <td>{cfg.isolationLevel}</td>
              <td>{cfg.maxMemoryMB}MB</td>
              <td>{cfg.maxExecutionTimeMs}ms</td>
              <td>
                {(() => {
                  const r = results.get(cfg.skillId);
                  if (!r) return 'Idle';
                  if (r.success) return '✅';
                  if (r.reason === 'timeout') return '⏱️ timeout';
                  if (r.reason === 'memory-exceeded') return '💾 memory';
                  return `❌ ${r.error?.slice(0, 20)}`;
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}