/**
 * Plugin Registry
 * chatdev-design Plugin Registry - Register + Query + Enable + Version
 */

export interface Plugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  dependencies: string[];
  created: number;
  updated: number;
}

export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private nameIndex: Map<string, Set<string>> = new Map();

  register(plugin: Omit<Plugin, 'enabled' | 'created' | 'updated'>): boolean {
    if (this.plugins.has(plugin.id)) return false;
    const now = Date.now();
    this.plugins.set(plugin.id, {
      ...plugin,
      dependencies: [...plugin.dependencies],
      enabled: false,
      created: now,
      updated: now,
    });
    if (!this.nameIndex.has(plugin.name)) this.nameIndex.set(plugin.name, new Set());
    this.nameIndex.get(plugin.name)!.add(plugin.id);
    return true;
  }

  enable(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    plugin.enabled = true;
    plugin.updated = Date.now();
    return true;
  }

  disable(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    plugin.enabled = false;
    plugin.updated = Date.now();
    return true;
  }

  find(id: string): Plugin | null {
    return this.plugins.get(id) ?? null;
  }

  getByName(name: string): Plugin | null {
    const ids = this.nameIndex.get(name);
    if (!ids || ids.size === 0) return null;
    return this.plugins.get([...ids][0]) ?? null;
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  removePlugin(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    this.nameIndex.get(plugin.name)?.delete(id);
    return this.plugins.delete(id);
  }

  hasPlugin(id: string): boolean {
    return this.plugins.has(id);
  }

  getCount(): number {
    return this.plugins.size;
  }

  updateVersion(id: string, version: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    plugin.version = version;
    plugin.updated = Date.now();
    return true;
  }

  getVersion(id: string): string | undefined {
    return this.plugins.get(id)?.version;
  }

  addDependency(id: string, dependency: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    if (!plugin.dependencies.includes(dependency)) {
      plugin.dependencies.push(dependency);
      plugin.updated = Date.now();
    }
    return true;
  }

  removeDependency(id: string, dependency: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    const idx = plugin.dependencies.indexOf(dependency);
    if (idx === -1) return false;
    plugin.dependencies.splice(idx, 1);
    plugin.updated = Date.now();
    return true;
  }

  getDependencies(id: string): string[] {
    return [...(this.plugins.get(id)?.dependencies ?? [])];
  }

  hasDependency(id: string, dependency: string): boolean {
    return this.plugins.get(id)?.dependencies.includes(dependency) ?? false;
  }

  getEnabled(): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.enabled);
  }

  getDisabled(): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => !p.enabled);
  }

  isEnabled(id: string): boolean {
    return this.plugins.get(id)?.enabled ?? false;
  }

  isDisabled(id: string): boolean {
    const p = this.plugins.get(id);
    return p ? !p.enabled : false;
  }

  getByVersion(version: string): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.version === version);
  }

  getAllVersions(): string[] {
    return [...new Set(Array.from(this.plugins.values()).map(p => p.version))];
  }

  getCreatedAt(id: string): number {
    return this.plugins.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.plugins.get(id)?.updated ?? 0;
  }

  getAllNames(): string[] {
    return [...this.nameIndex.keys()];
  }

  hasName(name: string): boolean {
    return this.nameIndex.has(name);
  }

  getByDependency(dep: string): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.dependencies.includes(dep));
  }

  getEnableRate(): number {
    const all = Array.from(this.plugins.values());
    if (all.length === 0) return 0;
    return Math.round((all.filter(p => p.enabled).length / all.length) * 100) / 100;
  }

  toggle(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    return plugin.enabled ? this.disable(id) : this.enable(id);
  }

  enableAll(): number {
    let count = 0;
    for (const plugin of this.plugins.values()) {
      if (!plugin.enabled) {
        plugin.enabled = true;
        plugin.updated = Date.now();
        count++;
      }
    }
    return count;
  }

  disableAll(): number {
    let count = 0;
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled) {
        plugin.enabled = false;
        plugin.updated = Date.now();
        count++;
      }
    }
    return count;
  }

  getByNameList(name: string): Plugin[] {
    const ids = this.nameIndex.get(name) ?? new Set();
    return Array.from(ids).map(id => this.plugins.get(id)!).filter(Boolean);
  }

  getNameCount(): number {
    return this.nameIndex.size;
  }

  clearAll(): void {
    this.plugins.clear();
    this.nameIndex.clear();
  }
}

export default PluginRegistry;