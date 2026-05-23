import React, { useState, useRef } from 'react';
import type { PixelPack } from '../../services/migration/PixelPackBuilder';

/**
 * V141: ImportWizard — drag-and-drop .pixelpack import
 */
interface Props {
  onImport: (file: File) => Promise<{ pack: PixelPack; compatible: boolean; issues: string[] }>;
}

export function ImportWizard({ onImport }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [pack, setPack] = useState<PixelPack | null>(null);
  const [compatible, setCompatible] = useState(true);
  const [issues, setIssues] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.pixelpack')) { setResult('Invalid file type'); return; }
    setImporting(true);
    try {
      const r = await onImport(file);
      setPack(r.pack);
      setCompatible(r.compatible);
      setIssues(r.issues);
      setResult('Import successful ✅');
    } catch (e) {
      setResult(`Import failed: ${(e as Error).message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  };

  return (
    <div className={`migration-wizard import-wizard ${dragOver ? 'drag-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <h4>Import Skill</h4>
      <div
        className="drop-zone"
        onClick={() => fileRef.current?.click()}
      >
        <p>Drop .pixelpack file here or click to browse</p>
        <input ref={fileRef} type="file" accept=".pixelpack" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {pack && (
        <div className="pack-preview">
          <p><strong>{pack.skillId}</strong> v{pack.manifest?.version ?? '?'}</p>
          <p>from {pack.platformSource} · {new Date(pack.exportedAt).toLocaleDateString()}</p>
          <p>Provenance: {pack.provenanceChain?.length ?? 0} ancestors · {pack.verificationReport ? 'Certified ✅' : 'Unverified'}</p>
          {issues.length > 0 && <p className="warning">⚠️ {issues.join(', ')}</p>}
        </div>
      )}
      {result && <p className={result.includes('failed') ? 'error' : ''}>{result}</p>}
      {pack && <button disabled={importing}>{importing ? 'Importing...' : 'Import'}</button>}
    </div>
  );
}