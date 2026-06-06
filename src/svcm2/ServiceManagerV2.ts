/**
 * Service Manager v2
 * nanobot-design Service Manager v2 - Register + SetStatus + Call + Stats
 */

export type V2Status = 'active' | 'draining' | 'stopped';

export interface V2Service {
  id: string;
  name: string;
  version: string;
  status: V2Status;
  load: number;
  calls: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: V2Status[];
}

export interface SM4Stats {
  services: number;
  active: number;
  draining: number;
  stopped: number;
  totalHits: number;
  totalCalls: number;
  totalLoad: number;
  uniqueNames: number;
  uniqueVersions: number;
  avgLoad: number;
  maxLoad: number;
  minLoad: number;
}

export class ServiceManagerV2 {
  private services: Map<string, V2Service> = new Map();
  private counter = 0;
  private totalCalls = 0;
  private totalLoad = 0;

  register(name: string, version: string): string {
    const id = `svcm2-${++this.counter}`;
    this.services.set(id, {
      id,
      name,
      version,
      status: 'active',
      load: 0,
      calls: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: ['active'],
    });
    return id;
  }

  setStatus(id: string, status: V2Status): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.status = status;
    s.history.push(status);
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  call(id: string, load: number = 1): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (s.status !== 'active') return false;
    s.calls++;
    s.load += load;
    s.updated = Date.now();
    s.hits++;
    this.totalCalls++;
    this.totalLoad += load;
    return true;
  }

  setLoad(id: string, load: number): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    s.load = load;
    s.updated = Date.now();
    return true;
  }

  reset(id: string): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    s.calls = 0;
    s.load = 0;
    s.hits = 0;
    s.updated = Date.now();
    return true;
  }

  getStats(): SM4Stats {
    const all = Array.from(this.services.values());
    const loadValues = all.map(s => s.load);
    return {
      services: all.length,
      active: all.filter(s => s.status === 'active').length,
      draining: all.filter(s => s.status === 'draining').length,
      stopped: all.filter(s => s.status === 'stopped').length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      totalCalls: this.totalCalls,
      totalLoad: this.totalLoad,
      uniqueNames: new Set(all.map(s => s.name)).size,
      uniqueVersions: new Set(all.map(s => s.version)).size,
      avgLoad: all.length > 0 ? Math.round((loadValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxLoad: loadValues.length > 0 ? Math.max(...loadValues) : 0,
      minLoad: loadValues.length > 0 ? Math.min(...loadValues) : 0,
    };
  }

  getService(id: string): V2Service | undefined {
    return this.services.get(id);
  }

  getAllServices(): V2Service[] {
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

  getStatus(id: string): V2Status | undefined {
    return this.services.get(id)?.status;
  }

  getLoad(id: string): number {
    return this.services.get(id)?.load ?? 0;
  }

  getCalls(id: string): number {
    return this.services.get(id)?.calls ?? 0;
  }

  getHistory(id: string): V2Status[] {
    return [...(this.services.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.services.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.services.get(id)?.active ?? false;
  }

  isActive2(id: string): boolean {
    return this.services.get(id)?.status === 'active';
  }

  isDraining(id: string): boolean {
    return this.services.get(id)?.status === 'draining';
  }

  isStopped(id: string): boolean {
    return this.services.get(id)?.status === 'stopped';
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
      s.load = 0;
      s.hits = 0;
      s.active = true;
      s.status = 'active';
      s.history = ['active'];
    }
    this.totalCalls = 0;
    this.totalLoad = 0;
  }

  getByName(name: string): V2Service[] {
    return Array.from(this.services.values()).filter(s => s.name === name);
  }

  getByVersion(version: string): V2Service[] {
    return Array.from(this.services.values()).filter(s => s.version === version);
  }

  getByStatus(status: V2Status): V2Service[] {
    return Array.from(this.services.values()).filter(s => s.status === status);
  }

  getActiveServices(): V2Service[] {
    return Array.from(this.services.values()).filter(s => s.active);
  }

  getInactiveServices(): V2Service[] {
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

  getByMinLoad(min: number): V2Service[] {
    return Array.from(this.services.values()).filter(s => s.load >= min);
  }

  getMostLoad(): V2Service | null {
    const all = Array.from(this.services.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.load > max.load ? s : max);
  }

  getNewest(): V2Service | null {
    const all = Array.from(this.services.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): V2Service | null {
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

  getTotalLoad(): number {
    return this.totalLoad;
  }

  clearAll(): void {
    this.services.clear();
    this.counter = 0;
    this.totalCalls = 0;
    this.totalLoad = 0;
  }
}

export default ServiceManagerV2;