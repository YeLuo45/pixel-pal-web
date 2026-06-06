/**
 * Service Manager
 * nanobot-design Service Manager - Register + Call + Stats
 */

export interface ManagedService {
  id: string;
  name: string;
  version: string;
  calls: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
  totalSuccess: number;
  totalFailed: number;
}

export interface SM2Stats {
  services: number;
  totalCalls: number;
  active: number;
  inactive: number;
  avgCalls: number;
  names: number;
  versions: number;
  totalHits: number;
  totalSuccess: number;
  totalFailed: number;
  successRate: number;
}

export class ServiceManager {
  private services: Map<string, ManagedService> = new Map();
  private counter = 0;
  private totalCalls = 0;
  private totalSuccess = 0;
  private totalFailed = 0;

  register(name: string, version: string): string {
    const id = `svcm-${++this.counter}`;
    this.services.set(id, {
      id,
      name,
      version,
      calls: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [Date.now()],
      totalSuccess: 0,
      totalFailed: 0,
    });
    return id;
  }

  call(id: string, success: boolean = true): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.calls++;
    s.hits++;
    s.history.push(Date.now());
    s.updated = Date.now();
    this.totalCalls++;
    if (success) {
      s.totalSuccess++;
      this.totalSuccess++;
    } else {
      s.totalFailed++;
      this.totalFailed++;
    }
    return true;
  }

  getStats(): SM2Stats {
    const all = Array.from(this.services.values());
    return {
      services: all.length,
      totalCalls: this.totalCalls,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      avgCalls: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.calls, 0) / all.length) * 100) / 100 : 0,
      names: new Set(all.map(s => s.name)).size,
      versions: new Set(all.map(s => s.version)).size,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      totalSuccess: this.totalSuccess,
      totalFailed: this.totalFailed,
      successRate: this.totalCalls > 0 ? Math.round((this.totalSuccess / this.totalCalls) * 100) / 100 : 0,
    };
  }

  getService(id: string): ManagedService | undefined {
    return this.services.get(id);
  }

  getAllServices(): ManagedService[] {
    return Array.from(this.services.values());
  }

  removeService(id: string): boolean {
    return this.services.delete(id);
  }

  hasService(id: string): boolean {
    return this.services.has(id);
  }

  getCount(): number {
    return this.services.size;
  }

  getName(id: string): string | undefined {
    return this.services.get(id)?.name;
  }

  getVersion(id: string): string | undefined {
    return this.services.get(id)?.version;
  }

  getCalls(id: string): number {
    return this.services.get(id)?.calls ?? 0;
  }

  getHits(id: string): number {
    return this.services.get(id)?.hits ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.services.get(id)?.history ?? [])];
  }

  getTotalSuccess(id: string): number {
    return this.services.get(id)?.totalSuccess ?? 0;
  }

  getTotalFailed(id: string): number {
    return this.services.get(id)?.totalFailed ?? 0;
  }

  isActive(id: string): boolean {
    return this.services.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setVersion(id: string, version: string): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    s.version = version;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.services.values()) {
      s.calls = 0;
      s.hits = 0;
      s.history = [s.created];
      s.totalSuccess = 0;
      s.totalFailed = 0;
      s.active = true;
    }
    this.totalCalls = 0;
    this.totalSuccess = 0;
    this.totalFailed = 0;
  }

  getByName(name: string): ManagedService[] {
    return Array.from(this.services.values()).filter(s => s.name === name);
  }

  getByVersion(version: string): ManagedService[] {
    return Array.from(this.services.values()).filter(s => s.version === version);
  }

  getActiveServices(): ManagedService[] {
    return Array.from(this.services.values()).filter(s => s.active);
  }

  getInactiveServices(): ManagedService[] {
    return Array.from(this.services.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.services.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllVersions(): string[] {
    return [...new Set(Array.from(this.services.values()).map(s => s.version))];
  }

  getVersionCount(): number {
    return this.getAllVersions().length;
  }

  getByMinCalls(min: number): ManagedService[] {
    return Array.from(this.services.values()).filter(s => s.calls >= min);
  }

  getMostCalls(): ManagedService | null {
    const all = Array.from(this.services.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.calls > max.calls ? s : max);
  }

  getNewest(): ManagedService | null {
    const all = Array.from(this.services.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): ManagedService | null {
    const all = Array.from(this.services.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.services.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.services.get(id)?.updated ?? 0;
  }

  getTotalCalls(): number {
    return this.totalCalls;
  }

  getTotalSuccessGlobal(): number {
    return this.totalSuccess;
  }

  getTotalFailedGlobal(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.services.clear();
    this.counter = 0;
    this.totalCalls = 0;
    this.totalSuccess = 0;
    this.totalFailed = 0;
  }
}

export default ServiceManager;