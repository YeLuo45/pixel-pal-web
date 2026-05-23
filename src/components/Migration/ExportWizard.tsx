import React, { useState } from 'react';

/**
 * V141: ExportWizard — step-by-step skill export wizard
 */
interface Props {
  onExport: (opts: any) => Promise<void>;
}

export function ExportWizard({ onExport }: Props) {
  const [mode, setMode] = useState<'full' | 'lightweight' | 'memory_only' | 'skill_only'>('lightweight');
  const [includeProvenance, setIncludeProvenance] = useState(true);
  const [includeVerification, setIncludeVerification] = useState(true);
  const [encrypt, setEncrypt] = useState(false);
  const [password, setPassword] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport({ mode, includeProvenance, includeVerification, encrypt, password });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="migration-wizard export-wizard">
      <h4>Export Skill</h4>
      <div className="wizard-section">
        <label>Migration Mode</label>
        {(['full', 'lightweight', 'memory_only', 'skill_only'] as const).map(m => (
          <label key={m} className="radio-label">
            <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} />
            {m.replace('_', ' ')}
          </label>
        ))}
      </div>
      <div className="wizard-section">
        <label className="checkbox-label">
          <input type="checkbox" checked={includeProvenance} onChange={e => setIncludeProvenance(e.target.checked)} />
          Include provenance chain
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={includeVerification} onChange={e => setIncludeVerification(e.target.checked)} />
          Include verification report
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={encrypt} onChange={e => setEncrypt(e.target.checked)} />
          Encrypt memory snapshot
        </label>
        {encrypt && (
          <input type="password" placeholder="Encryption password" value={password} onChange={e => setPassword(e.target.value)} />
        )}
      </div>
      <button onClick={handleExport} disabled={exporting || (encrypt && !password)}>
        {exporting ? 'Exporting...' : 'Export .pixelpack'}
      </button>
    </div>
  );
}