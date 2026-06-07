/**
 * Sentinel Engine
 * thunderbolt-design Sentinel Engine - Add + Guard + Inspect + Stats
 */

export type SentinelMode = 'normal' | 'strict' | 'lax';

export interface Sentinel {
  id: string;
  name: string;
  mode: SentinelMode;
  blocks: number;
  allows: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SseStats {
  sentinels: number;
  totalAdded: number;
  totalBlocks: number;
  totalAllows: number;
  normal: number;
  strict: number;
  lax: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalBlocks2: number;
  totalAllows2: number;
  avgBlocks: number;
  avgAllows: number;
}

export class SentinelEngine {
  private sentinels: Map<string, Sentinel> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalBlocks = 0;
  private totalAllows = 0;

  add(name: string, mode: SentinelMode = 'normal'): string {
    const id = `sse-${++this.counter}`;
    this.sentinels.set(id, {
      id,
      name,
      mode,
      blocks: 0,
      allows: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  guard(id: string, allow: boolean): boolean {
    const s = this.sentinels.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.updated = Date.now();
    s.hits++;
    if (allow) {
      s.allows++;
      this.totalAllows++;
    } else {
      s.blocks++;
      this.totalBlocks++;
    }
    return true;
  }

  inspect(id: string): boolean {
    const s = this.sentinels.get(id);
    if (!s) return false;
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.sentinels.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.sentinels.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.sentinels.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setMode(id: string, mode: SentinelMode): boolean {
    const s = this.sentinels.get(id);
    if (!s) return false;
    s.mode = mode;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.sentinels.values()) {
      s.blocks = 0;
      s.allows = 0;
      s.active = true;
      s.hits = 0;
    }
    this.totalAdded = 0;
    this.totalBlocks = 0;
    this.totalAllows = 0;
  }

  getStats(): SseStats {
    const all = Array.from(this.sentinels.values());
    return {
      sentinels: all.length,
      totalAdded: this.totalAdded,
      totalBlocks: this.totalBlocks,
      totalAllows: this.totalAllows,
      normal: all.filter(s => s.mode === 'normal').length,
      strict: all.filter(s => s.mode === 'strict').length,
      lax: all.filter(s => s.mode === 'lax').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      totalBlocks2: all.reduce((s2, x) => s2 + x.blocks, 0),
      totalAllows2: all.reduce((s2, x) => s2 + x.allows, 0),
      avgBlocks: all.length > 0 ? Math.round((all.reduce((s2, x) => s2 + x.blocks, 0) / all.length) * 100) / 100 : 0,
      avgAllows: all.length > 0 ? Math.round((all.reduce((s2, x) => s2 + x.allows, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getSentinel(id: string): Sentinel | undefined {
    return this.sentinels.get(id);
  }

  getAllSentinels(): Sentinel[] {
    return Array.from(this.sentinels.values());
  }

  hasSentinel(id: string): boolean {
    return this.sentinels.has(id);
  }

  getCount(): number {
    return this.sentinels.size;
  }

  getName(id: string): string | undefined {
    return this.sentinels.get(id)?.name;
  }

  getMode(id: string): SentinelMode | undefined {
    return this.sentinels.get(id)?.mode;
  }

  getBlocks(id: string): number {
    return this.sentinels.get(id)?.blocks ?? 0;
  }

  getAllows(id: string): number {
    return this.sentinels.get(id)?.allows ?? 0;
  }

  getHits(id: string): number {
    return this.sentinels.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.sentinels.get(id)?.active ?? false;
  }

  isNormal(id: string): boolean {
    return this.sentinels.get(id)?.mode === 'normal';
  }

  isStrict(id: string): boolean {
    return this.sentinels.get(id)?.mode === 'strict';
  }

  isLax(id: string): boolean {
    return this.sentinels.get(id)?.mode === 'lax';
  }

  getByMode(mode: SentinelMode): Sentinel[] {
    return Array.from(this.sentinels.values()).filter(s => s.mode === mode);
  }

  getActiveSentinels(): Sentinel[] {
    return Array.from(this.sentinels.values()).filter(s => s.active);
  }

  getInactiveSentinels(): Sentinel[] {
    return Array.from(this.sentinels.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.sentinels.values()).map(s => s.name))];
  }

  getNewest(): Sentinel | null {
    const all = Array.from(this.sentinels.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Sentinel | null {
    const all = Array.from(this.sentinels.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.sentinels.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.sentinels.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalBlocks(): number {
    return this.totalBlocks;
  }

  getTotalAllows(): number {
    return this.totalAllows;
  }

  clearAll(): void {
    this.sentinels.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalBlocks = 0;
    this.totalAllows = 0;
  }
}

export default SentinelEngine;