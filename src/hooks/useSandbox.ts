/**
 * V140: useSandbox hook
 */
import { useState, useCallback } from 'react';
import { SandboxExecutor, type SandboxConfig, type SandboxResult } from '../services/sandbox/SandboxExecutor';
import { getConfig, saveConfig, listConfigs } from '../services/sandbox/SandboxConfig';
import { ResourceMonitor } from '../services/sandbox/ResourceMonitor';

export function useSandbox() {
  const [configs, setConfigs] = useState(() => listConfigs());
  const [results, setResults] = useState<Map<string, SandboxResult>>(new Map());
  const executor = new SandboxExecutor();
  const monitor = new ResourceMonitor();

  const runInSandbox = useCallback(async (
    skillId: string,
    skillCode: string,
    input: Record<string, unknown>
  ) => {
    const config = getConfig(skillId);
    monitor.startTracking(skillId);
    const result = await executor.executeInSandbox(skillId, skillCode, input, config);
    monitor.recordResult(skillId, result.duration_ms);
    setResults(prev => new Map(prev).set(skillId, result));
    return result;
  }, []);

  const updateConfig = useCallback((cfg: SandboxConfig) => {
    saveConfig(cfg);
    setConfigs(listConfigs());
  }, []);

  return { configs, results, runInSandbox, updateConfig };
}