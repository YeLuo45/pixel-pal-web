/**
 * V141: useMigration hook
 */
import { useState, useCallback } from 'react';
import { buildPixelPack, exportAsFile } from '../services/migration/PixelPackBuilder';
import { parsePixelPack, verifyPackSignature, checkPlatformCompatibility } from '../services/migration/PixelPackParser';
import { logMigration, getMigrationHistory } from '../services/migration/MigrationStore';
import type { PixelPack } from '../services/migration/PixelPackBuilder';
import type { MigrationRecord } from '../services/migration/MigrationStore';

export function useMigration() {
  const [history, setHistory] = useState<MigrationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const exportSkill = useCallback(async (opts: {
    skillId: string;
    manifest: Record<string, unknown>;
    genome: Record<string, unknown>;
    memorySnapshot: Array<{ layer: string; data: Record<string, unknown>; encrypted: boolean }>;
    provenanceChain: Array<Record<string, unknown>>;
    encrypted?: boolean;
  }) => {
    setLoading(true);
    try {
      const pack = await buildPixelPack({
        skillId: opts.skillId,
        manifest: opts.manifest as any,
        genome: opts.genome as any,
        memorySnapshot: opts.memorySnapshot as any,
        provenanceChain: opts.provenanceChain as any,
        encrypted: opts.encrypted,
      });
      await exportAsFile(pack, `${opts.skillId}.pixelpack`);
      await logMigration({ type: 'export', skillId: opts.skillId, skillVersion: '1.0', platform: 'web', timestamp: new Date().toISOString(), packSizeBytes: JSON.stringify(pack).length, success: true });
      setHistory(await getMigrationHistory());
    } finally {
      setLoading(false);
    }
  }, []);

  const importSkill = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const pack = await parsePixelPack(buffer);
      const { valid, error } = await verifyPackSignature(pack);
      if (!valid) throw new Error(`Invalid signature: ${error}`);
      const { compatible, issues } = checkPlatformCompatibility(pack, 'web');
      await logMigration({ type: 'import', skillId: pack.skillId, skillVersion: pack.manifest.version, platform: pack.platformSource, timestamp: new Date().toISOString(), packSizeBytes: buffer.byteLength, success: true });
      setHistory(await getMigrationHistory());
      return { pack, compatible, issues };
    } catch (e) {
      const msg = (e as Error).message;
      await logMigration({ type: 'import', skillId: 'unknown', skillVersion: '?', platform: 'web', timestamp: new Date().toISOString(), packSizeBytes: 0, success: false, errorMessage: msg });
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistory(await getMigrationHistory());
  }, []);

  return { history, loading, exportSkill, importSkill, loadHistory };
}