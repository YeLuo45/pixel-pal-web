/**
 * Probe Engine
 * nanobot-design Probe Engine - Probe + Log + Stats
 */

export type ProbeStatus = 'ok' | 'warn' | 'fail';

export interface Probe {
  id: string;
  target: string;
  status: ProbeStatus;
  latency: number;
  attempts: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Pre2Stats {
  probes: number;
  totalAdded: number;
  totalProbed: number;
  ok: number;
  warn: number;
  fail: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTargets: number;
  totalLatency: number;
  avgLatency: number;
  maxLatency: number;
  minLatency: number;
  totalAttempts: number;
  avgAttempts: number;
}

export class ProbeEngine {
  private probes: Map<string, Probe> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalProbed = 0;
  private totalLatency = 0;
  private totalAttempts = 0;

  add(target: string): string {
    const id = `pre2-${++this.counter}`;
    this.probes.set(id, {
      id,
      target,
      status: 'ok',
      latency: 0,
      attempts: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  probe(id: string, latency: number, status: ProbeStatus = 'ok'): boolean {
    const p = this.probes.get(id);
    if (!p) return false;
    if (!p.active) return false;
    p.latency = latency;
    p.status = status;
    p.attempts++;
    p.updated = Date.now();
    p.hits++;
    this.totalProbed++;
    this.totalLatency += latency;
    this.totalAttempts++;
    return true;
  }

  log(id: string): boolean {
    const p = this.probes.get(id);
    if (!p) return false;
    p.updated = Date.now();
    p.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.probes.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.probes.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const p = this.probes.get(id);
    if (!p) return false;
    p.target = target;
    p.updated = Date.now();
    return true;
  }

  setStatus(id: string, status: ProbeStatus): boolean {
    const p = this.probes.get(id);
    if (!p) return false;
    p.status = status;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.probes.values()) {
      p.status = 'ok';
      p.latency = 0;
      p.attempts = 0;
      p.active = true;
      p.hits = 0;
    }
    this.totalAdded = 0;
    this.totalProbed = 0;
    this.totalLatency = 0;
    this.totalAttempts = 0;
  }

  getStats(): Pre2Stats {
    const all = Array.from(this.probes.values());
    const latArr = all.map(p => p.latency);
    return {
      probes: all.length,
      totalAdded: this.totalAdded,
      totalProbed: this.totalProbed,
      ok: all.filter(p => p.status === 'ok').length,
      warn: all.filter(p => p.status === 'warn').length,
      fail: all.filter(p => p.status === 'fail').length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueTargets: new Set(all.map(p => p.target)).size,
      totalLatency: this.totalLatency,
      avgLatency: all.length > 0 ? Math.round((latArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxLatency: latArr.length > 0 ? Math.max(...latArr) : 0,
      minLatency: latArr.length > 0 ? Math.min(...latArr) : 0,
      totalAttempts: this.totalAttempts,
      avgAttempts: all.length > 0 ? Math.round((all.reduce((s, p) => s + p.attempts, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getProbe(id: string): Probe | undefined {
    return this.probes.get(id);
  }

  getAllProbes(): Probe[] {
    return Array.from(this.probes.values());
  }

  hasProbe(id: string): boolean {
    return this.probes.has(id);
  }

  getCount(): number {
    return this.probes.size;
  }

  getTarget(id: string): string | undefined {
    return this.probes.get(id)?.target;
  }

  getStatus(id: string): ProbeStatus | undefined {
    return this.probes.get(id)?.status;
  }

  getLatency(id: string): number {
    return this.probes.get(id)?.latency ?? 0;
  }

  getAttempts(id: string): number {
    return this.probes.get(id)?.attempts ?? 0;
  }

  getHits(id: string): number {
    return this.probes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.probes.get(id)?.active ?? false;
  }

  isOk(id: string): boolean {
    return this.probes.get(id)?.status === 'ok';
  }

  isWarn(id: string): boolean {
    return this.probes.get(id)?.status === 'warn';
  }

  isFail(id: string): boolean {
    return this.probes.get(id)?.status === 'fail';
  }

  getByStatus(status: ProbeStatus): Probe[] {
    return Array.from(this.probes.values()).filter(p => p.status === status);
  }

  getActiveProbes(): Probe[] {
    return Array.from(this.probes.values()).filter(p => p.active);
  }

  getInactiveProbes(): Probe[] {
    return Array.from(this.probes.values()).filter(p => !p.active);
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.probes.values()).map(p => p.target))];
  }

  getNewest(): Probe | null {
    const all = Array.from(this.probes.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Probe | null {
    const all = Array.from(this.probes.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.probes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.probes.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalProbed(): number {
    return this.totalProbed;
  }

  getTotalLatency(): number {
    return this.totalLatency;
  }

  getTotalAttempts(): number {
    return this.totalAttempts;
  }

  clearAll(): void {
    this.probes.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalProbed = 0;
    this.totalLatency = 0;
    this.totalAttempts = 0;
  }
}

export default ProbeEngine;