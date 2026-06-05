/**
 * Service Discovery
 * chatdev-design Service Discovery - Register + Discover + Pick + Stats
 */

export interface DiscoveryEntry {
  id: string;
  name: string;
  url: string;
  healthy: boolean;
  load: number;
  picks: number;
  created: number;
  lastChecked: number;
}

export interface DiscoveryStats {
  entries: number;
  healthy: number;
  unhealthy: number;
  totalPicks: number;
}

export class ServiceDiscovery {
  private entries: Map<string, DiscoveryEntry> = new Map();

  register(entry: Omit<DiscoveryEntry, 'healthy' | 'load' | 'picks' | 'created' | 'lastChecked'>): boolean {
    if (this.entries.has(entry.id)) return false;
    this.entries.set(entry.id, {
      ...entry,
      healthy: true,
      load: 0,
      picks: 0,
      created: Date.now(),
      lastChecked: Date.now(),
    });
    return true;
  }

  discover(name: string): DiscoveryEntry[] {
    return Array.from(this.entries.values()).filter(e => e.name === name && e.healthy);
  }

  pick(name: string): DiscoveryEntry | null {
    const candidates = this.discover(name);
    if (candidates.length === 0) return null;
    // Pick least loaded
    const sorted = [...candidates].sort((a, b) => a.load - b.load);
    const picked = sorted[0];
    picked.picks++;
    picked.load++;
    return picked;
  }

  getStats(): DiscoveryStats {
    const all = Array.from(this.entries.values());
    return {
      entries: all.length,
      healthy: all.filter(e => e.healthy).length,
      unhealthy: all.filter(e => !e.healthy).length,
      totalPicks: all.reduce((s, e) => s + e.picks, 0),
    };
  }

  getEntry(id: string): DiscoveryEntry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): DiscoveryEntry[] {
    return Array.from(this.entries.values());
  }

  removeEntry(id: string): boolean {
    return this.entries.delete(id);
  }

  hasEntry(id: string): boolean {
    return this.entries.has(id);
  }

  getCount(): number {
    return this.entries.size;
  }

  getName(id: string): string | undefined {
    return this.entries.get(id)?.name;
  }

  getUrl(id: string): string | undefined {
    return this.entries.get(id)?.url;
  }

  isHealthy(id: string): boolean {
    return this.entries.get(id)?.healthy ?? false;
  }

  setHealthy(id: string, healthy: boolean): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.healthy = healthy;
    e.lastChecked = Date.now();
    return true;
  }

  getLoad(id: string): number {
    return this.entries.get(id)?.load ?? 0;
  }

  setLoad(id: string, load: number): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.load = load;
    return true;
  }

  incrementLoad(id: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.load++;
    return true;
  }

  decrementLoad(id: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.load = Math.max(0, e.load - 1);
    return true;
  }

  getPicks(id: string): number {
    return this.entries.get(id)?.picks ?? 0;
  }

  getLastChecked(id: string): number {
    return this.entries.get(id)?.lastChecked ?? 0;
  }

  getByName(name: string): DiscoveryEntry[] {
    return Array.from(this.entries.values()).filter(e => e.name === name);
  }

  getHealthy(): DiscoveryEntry[] {
    return Array.from(this.entries.values()).filter(e => e.healthy);
  }

  getUnhealthy(): DiscoveryEntry[] {
    return Array.from(this.entries.values()).filter(e => !e.healthy);
  }

  getByHealth(healthy: boolean): DiscoveryEntry[] {
    return Array.from(this.entries.values()).filter(e => e.healthy === healthy);
  }

  getCreatedAt(id: string): number {
    return this.entries.get(id)?.created ?? 0;
  }

  getMostPicked(): DiscoveryEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.picks > max.picks ? e : max);
  }

  getLeastLoaded(): DiscoveryEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.load < min.load ? e : max_or_min(e, min, 'min'));
  }

  getMostLoaded(): DiscoveryEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.load > max.load ? e : max);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAvgLoad(): number {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((s, e) => s + e.load, 0) / all.length) * 100) / 100;
  }

  resetPicks(): void {
    for (const e of this.entries.values()) e.picks = 0;
  }

  resetAll(): void {
    for (const e of this.entries.values()) {
      e.load = 0;
      e.picks = 0;
    }
  }

  clearAll(): void {
    this.entries.clear();
  }
}

function max_or_min<T>(a: T, b: T, _type: 'min' | 'max'): T {
  return a;
}

export default ServiceDiscovery;