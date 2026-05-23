import React from 'react';
import { useMemoryCompression } from '../../hooks/useMemoryCompression';

/**
 * V138: CompressionDashboard — shows L0 usage + compression log + controls
 */
interface Props {
  currentBytes?: number;
  capacityBytes?: number;
  entries?: Array<{ key: string; value: unknown; accessCount: number; lastAccessed: string }>;
}

export function CompressionDashboard({ currentBytes = 0, capacityBytes = 512 * 1024 * 1024, entries = [] }: Props) {
  const { logs, running, lastResult, runCompression } = useMemoryCompression();
  const usagePct = capacityBytes > 0 ? (currentBytes / capacityBytes) * 100 : 0;
  const compressible = entries.filter(e => {
    const imp = (Math.log(1 + e.accessCount) * 0.4 + 0.3 + 0.3);
    return imp < 0.2;
  }).length;

  const handleRun = async () => {
    await runCompression(entries);
  };

  return (
    <div className="compression-dashboard">
      <div className="dashboard-header">
        <h4>Memory Compression</h4>
        <button onClick={handleRun} disabled={running}>
          {running ? 'Compressing...' : 'Run Now'}
        </button>
      </div>
      <div className="usage-bar">
        <label>L0 Usage</label>
        <div className="bar-track">
          <div className={`bar-fill ${usagePct > 80 ? 'danger' : usagePct > 60 ? 'warn' : ''}`} style={{ width: `${Math.min(100, usagePct)}%` }} />
        </div>
        <span>{usagePct.toFixed(0)}% / {(capacityBytes / 1024 / 1024).toFixed(0)} MB</span>
      </div>
      <p className="compressible-info">Compressible: {compressible} items</p>
      {lastResult && <p className="last-result">{lastResult}</p>}
      <div className="compression-log">
        <h5>Compression Log</h5>
        {logs.length === 0 && <p className="muted">No compression runs yet</p>}
        {logs.map((l, i) => (
          <div key={i} className="log-entry">
            {l.timestamp.slice(0, 16)} · {l.triggeredBy} · {(l.reductionRatio * 100).toFixed(0)}% reduced · {l.notes}
          </div>
        ))}
      </div>
    </div>
  );
}