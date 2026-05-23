/**
 * V138: useMemoryCompression hook
 */
import { useState, useCallback } from 'react';
import { rankAndTag, selectForEviction, selectForPatternCompression, compressWithPattern } from '../services/compression/MemoryCompressor';
import { logCompression, getCompressionLogs } from '../services/compression/CompressionStore';
import type { CompressionLog } from '../services/compression/CompressionStore';

export function useMemoryCompression() {
  const [logs, setLogs] = useState<CompressionLog[]>([]);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  const runCompression = useCallback(async (entries: Array<{ key: string; value: unknown; accessCount: number; lastAccessed: string }>) => {
    setRunning(true);
    try {
      const ranked = rankAndTag(entries);
      const toEvict = selectForEviction(ranked);
      const toPattern = selectForPatternCompression(ranked);
      const patterns = toPattern.map(v => compressWithPattern(v));

      const originalBytes = ranked.reduce((s, v) => s + JSON.stringify(v.value).length, 0);
      const compressedBytes = patterns.reduce((s, p) => s + JSON.stringify(p.sample).length, originalBytes / ranked.length);

      const log: Omit<CompressionLog, 'id'> = {
        triggeredBy: 'manual',
        timestamp: new Date().toISOString(),
        entriesProcessed: ranked.length,
        originalBytes,
        compressedBytes,
        reductionRatio: originalBytes > 0 ? (originalBytes - compressedBytes) / originalBytes : 0,
        notes: `Evicted ${toEvict.length}, patterned ${toPattern.length}`,
      };
      await logCompression(log);
      setLogs(await getCompressionLogs());
      setLastResult(`${ranked.length} entries: ${toEvict.length} evicted, ${patterns.length} compressed`);
      return { toEvict, patterns, log };
    } finally {
      setRunning(false);
    }
  }, []);

  return { logs, running, lastResult, runCompression };
}