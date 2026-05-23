/**
 * V140: SandboxConfig — CRUD + localStorage persistence for SandboxConfig
 */
import type { SandboxConfig } from './SandboxExecutor';

const STORAGE_KEY = 'pixelpal_sandbox_configs';

const DEFAULT_CONFIGS: SandboxConfig[] = [
  { id: 'default_full', skillId: 'default', maxMemoryMB: 512, maxCPUPercent: 80, maxExecutionTimeMs: 10000, allowedAPIs: ['localStorage', 'crypto'], blockedAPIs: ['eval', 'Function'], networkPolicy: 'same-origin', isolationLevel: 'full' },
  { id: 'default_relaxed', skillId: 'default_relaxed', maxMemoryMB: 256, maxCPUPercent: 50, maxExecutionTimeMs: 5000, allowedAPIs: [], blockedAPIs: [], networkPolicy: 'all', isolationLevel: 'relaxed' },
];

function loadFromStorage(): SandboxConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CONFIGS;
  } catch { return DEFAULT_CONFIGS; }
}

function saveToStorage(configs: SandboxConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export function getConfig(skillId: string): SandboxConfig {
  const configs = loadFromStorage();
  return configs.find(c => c.skillId === skillId) ?? DEFAULT_CONFIGS[0];
}

export function saveConfig(config: SandboxConfig) {
  const configs = loadFromStorage();
  const idx = configs.findIndex(c => c.skillId === config.skillId);
  if (idx >= 0) configs[idx] = config;
  else configs.push(config);
  saveToStorage(configs);
}

export function listConfigs(): SandboxConfig[] {
  return loadFromStorage();
}

export function deleteConfig(skillId: string) {
  const configs = loadFromStorage().filter(c => c.skillId !== skillId);
  saveToStorage(configs);
}