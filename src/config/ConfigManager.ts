/**
 * Config Manager
 * nanobot-design Config Manager - Load + Validate + Hot Update + Version
 */

export type ConfigType = 'string' | 'number' | 'boolean' | 'json';

export interface Config {
  key: string;
  value: string;
  type: ConfigType;
  version: number;
  updated: number;
}

export class ConfigManager {
  private configs: Map<string, Config> = new Map();
  private history: Map<string, Config[]> = new Map();
  private validators: Map<ConfigType, (value: string) => boolean> = new Map([
    ['string', () => true],
    ['number', v => !isNaN(Number(v)) && v.trim() !== ''],
    ['boolean', v => v === 'true' || v === 'false'],
    ['json', v => { try { JSON.parse(v); return true; } catch { return false; } }],
  ]);

  set(key: string, value: string, type: ConfigType = 'string'): boolean {
    if (!this.validateType(value, type)) return false;

    const existing = this.configs.get(key);
    if (existing) {
      if (!this.history.has(key)) this.history.set(key, []);
      this.history.get(key)!.push({ ...existing });
    }

    this.configs.set(key, {
      key,
      value,
      type,
      version: (existing?.version ?? 0) + 1,
      updated: Date.now(),
    });
    return true;
  }

  get(key: string): string | undefined {
    return this.configs.get(key)?.value;
  }

  getConfig(key: string): Config | undefined {
    return this.configs.get(key);
  }

  validate(config: Config): boolean {
    return this.validateType(config.value, config.type);
  }

  validateType(value: string, type: ConfigType): boolean {
    return this.validators.get(type)?.(value) ?? false;
  }

  getHistory(key: string): Config[] {
    return [...(this.history.get(key) ?? [])];
  }

  getAll(): Config[] {
    return Array.from(this.configs.values());
  }

  has(key: string): boolean {
    return this.configs.has(key);
  }

  remove(key: string): boolean {
    return this.configs.delete(key);
  }

  getCount(): number {
    return this.configs.size;
  }

  getVersion(key: string): number {
    return this.configs.get(key)?.version ?? 0;
  }

  rollback(key: string, version: number): boolean {
    const history = this.history.get(key) ?? [];
    const target = history.find(c => c.version === version);
    if (!target) return false;

    const current = this.configs.get(key);
    if (current) {
      if (!this.history.has(key)) this.history.set(key, []);
      this.history.get(key)!.push({ ...current });
    }

    this.configs.set(key, { ...target });
    return true;
  }

  getKeysByType(type: ConfigType): string[] {
    return Array.from(this.configs.values())
      .filter(c => c.type === type)
      .map(c => c.key);
  }

  getHistoryCount(key: string): number {
    return this.history.get(key)?.length ?? 0;
  }

  clearHistory(): void {
    this.history.clear();
  }

  clearAll(): void {
    this.configs.clear();
    this.history.clear();
  }

  exportJson(): string {
    return JSON.stringify(Array.from(this.configs.values()));
  }

  importJson(json: string): number {
    try {
      const data = JSON.parse(json) as Config[];
      let count = 0;
      for (const c of data) {
        if (this.set(c.key, c.value, c.type)) count++;
      }
      return count;
    } catch {
      return 0;
    }
  }

  getRecent(count: number): Config[] {
    return Array.from(this.configs.values())
      .sort((a, b) => b.updated - a.updated)
      .slice(0, count);
  }
}

export default ConfigManager;