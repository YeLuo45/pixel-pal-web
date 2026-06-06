/**
 * Build Engine
 * claude-code-design Build Engine - Define + Start + Finish + Stats
 */

export type BuildStatus = 'pending' | 'running' | 'success' | 'failed';

export interface Build {
  id: string;
  name: string;
  status: BuildStatus;
  duration: number;
  started: number | null;
  finished: number | null;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: BuildStatus[];
}

export interface BEStats {
  builds: number;
  pending: number;
  running: number;
  success: number;
  failed: number;
  active: number;
  inactive: number;
  totalDuration: number;
  avgDuration: number;
  successRate: number;
}

export class BuildEngine {
  private builds: Map<string, Build> = new Map();
  private counter = 0;

  define(name: string): string {
    const id = `be-${++this.counter}`;
    this.builds.set(id, {
      id,
      name,
      status: 'pending',
      duration: 0,
      started: null,
      finished: null,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: ['pending'],
    });
    return id;
  }

  start(id: string): boolean {
    const b = this.builds.get(id);
    if (!b) return false;
    if (!b.active) return false;
    if (b.status !== 'pending') return false;
    b.status = 'running';
    b.started = Date.now();
    b.finished = null;
    b.updated = Date.now();
    b.history.push('running');
    b.hits++;
    return true;
  }

  finish(id: string, success: boolean): boolean {
    const b = this.builds.get(id);
    if (!b) return false;
    if (b.status !== 'running') return false;
    b.finished = Date.now();
    if (b.started) b.duration = b.finished - b.started;
    b.status = success ? 'success' : 'failed';
    b.updated = Date.now();
    b.history.push(b.status);
    b.hits++;
    return true;
  }

  reset(id: string): boolean {
    const b = this.builds.get(id);
    if (!b) return false;
    b.status = 'pending';
    b.started = null;
    b.finished = null;
    b.duration = 0;
    b.updated = Date.now();
    b.history = ['pending'];
    return true;
  }

  getStats(): BEStats {
    const all = Array.from(this.builds.values());
    const finished = all.filter(b => b.status === 'success' || b.status === 'failed');
    return {
      builds: all.length,
      pending: all.filter(b => b.status === 'pending').length,
      running: all.filter(b => b.status === 'running').length,
      success: all.filter(b => b.status === 'success').length,
      failed: all.filter(b => b.status === 'failed').length,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalDuration: all.reduce((s, b) => s + b.duration, 0),
      avgDuration: finished.length > 0 ? Math.round((all.reduce((s, b) => s + b.duration, 0) / finished.length) * 100) / 100 : 0,
      successRate: finished.length > 0 ? Math.round((all.filter(b => b.status === 'success').length / finished.length) * 100) / 100 : 0,
    };
  }

  getBuild(id: string): Build | undefined {
    return this.builds.get(id);
  }

  getAllBuilds(): Build[] {
    return Array.from(this.builds.values());
  }

  removeBuild(id: string): boolean {
    return this.builds.delete(id);
  }

  hasBuild(id: string): boolean {
    return this.builds.has(id);
  }

  getCount(): number {
    return this.builds.size;
  }

  getName(id: string): string | undefined {
    return this.builds.get(id)?.name;
  }

  getStatus(id: string): BuildStatus | undefined {
    return this.builds.get(id)?.status;
  }

  getDuration(id: string): number {
    return this.builds.get(id)?.duration ?? 0;
  }

  getStarted(id: string): number | null {
    return this.builds.get(id)?.started ?? null;
  }

  getFinished(id: string): number | null {
    return this.builds.get(id)?.finished ?? null;
  }

  getHistory(id: string): BuildStatus[] {
    return [...(this.builds.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.builds.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.builds.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.builds.get(id)?.status === 'pending';
  }

  isRunning(id: string): boolean {
    return this.builds.get(id)?.status === 'running';
  }

  isSuccess(id: string): boolean {
    return this.builds.get(id)?.status === 'success';
  }

  isFailed(id: string): boolean {
    return this.builds.get(id)?.status === 'failed';
  }

  isFinished(id: string): boolean {
    const s = this.builds.get(id)?.status;
    return s === 'success' || s === 'failed';
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.builds.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const b = this.builds.get(id);
    if (!b) return false;
    b.name = name;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.builds.values()) {
      b.status = 'pending';
      b.started = null;
      b.finished = null;
      b.duration = 0;
      b.hits = 0;
      b.history = ['pending'];
      b.active = true;
    }
  }

  getByName(name: string): Build[] {
    return Array.from(this.builds.values()).filter(b => b.name === name);
  }

  getByStatus(status: BuildStatus): Build[] {
    return Array.from(this.builds.values()).filter(b => b.status === status);
  }

  getActiveBuilds(): Build[] {
    return Array.from(this.builds.values()).filter(b => b.active);
  }

  getInactiveBuilds(): Build[] {
    return Array.from(this.builds.values()).filter(b => !b.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.builds.values()).map(b => b.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinDuration(min: number): Build[] {
    return Array.from(this.builds.values()).filter(b => b.duration >= min);
  }

  getMostDuration(): Build | null {
    const all = Array.from(this.builds.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.duration > max.duration ? b : max);
  }

  getNewest(): Build | null {
    const all = Array.from(this.builds.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Build | null {
    const all = Array.from(this.builds.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.builds.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.builds.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.builds.clear();
    this.counter = 0;
  }
}

export default BuildEngine;