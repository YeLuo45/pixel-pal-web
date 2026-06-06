/**
 * Cadence Engine
 * generic-agent-design Cadence Engine - Set + Tick + Reset + Stats
 */

export type CadenceType = 'fast' | 'normal' | 'slow' | 'idle';

export interface Cadence {
  id: string;
  name: string;
  type: CadenceType;
  interval: number;
  ticks: number;
  lastTick: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface CdeStats {
  cadences: number;
  totalTicks: number;
  fast: number;
  normal: number;
  slow: number;
  idle: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueTypes: number;
  avgTicks: number;
  maxTicks: number;
  minTicks: number;
  avgInterval: number;
  maxInterval: number;
  minInterval: number;
}

export class CadenceEngine {
  private cadences: Map<string, Cadence> = new Map();
  private counter = 0;
  private totalTicks = 0;

  set(name: string, type: CadenceType = 'normal', interval: number = 1000): string {
    const id = `cde-${++this.counter}`;
    this.cadences.set(id, {
      id,
      name,
      type,
      interval,
      ticks: 0,
      lastTick: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  tick(id: string): boolean {
    const c = this.cadences.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.ticks++;
    c.lastTick = Date.now();
    c.history.push(c.lastTick);
    c.updated = Date.now();
    c.hits++;
    this.totalTicks++;
    return true;
  }

  reset(id: string): boolean {
    const c = this.cadences.get(id);
    if (!c) return false;
    c.ticks = 0;
    c.lastTick = 0;
    c.history = [];
    c.updated = Date.now();
    return true;
  }

  getStats(): CdeStats {
    const all = Array.from(this.cadences.values());
    const tickValues = all.map(c => c.ticks);
    const intervalValues = all.map(c => c.interval);
    return {
      cadences: all.length,
      totalTicks: this.totalTicks,
      fast: all.filter(c => c.type === 'fast').length,
      normal: all.filter(c => c.type === 'normal').length,
      slow: all.filter(c => c.type === 'slow').length,
      idle: all.filter(c => c.type === 'idle').length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueNames: new Set(all.map(c => c.name)).size,
      uniqueTypes: new Set(all.map(c => c.type)).size,
      avgTicks: all.length > 0 ? Math.round((tickValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTicks: tickValues.length > 0 ? Math.max(...tickValues) : 0,
      minTicks: tickValues.length > 0 ? Math.min(...tickValues) : 0,
      avgInterval: all.length > 0 ? Math.round((intervalValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxInterval: intervalValues.length > 0 ? Math.max(...intervalValues) : 0,
      minInterval: intervalValues.length > 0 ? Math.min(...intervalValues) : 0,
    };
  }

  getCadence(id: string): Cadence | undefined {
    return this.cadences.get(id);
  }

  getAllCadences(): Cadence[] {
    return Array.from(this.cadences.values());
  }

  removeCadence(id: string): boolean {
    return this.cadences.delete(id);
  }

  hasCadence(id: string): boolean {
    return this.cadences.has(id);
  }

  getCount(): number {
    return this.cadences.size;
  }

  getName(id: string): string | undefined {
    return this.cadences.get(id)?.name;
  }

  getType(id: string): CadenceType | undefined {
    return this.cadences.get(id)?.type;
  }

  getInterval(id: string): number {
    return this.cadences.get(id)?.interval ?? 0;
  }

  getTicks(id: string): number {
    return this.cadences.get(id)?.ticks ?? 0;
  }

  getLastTick(id: string): number {
    return this.cadences.get(id)?.lastTick ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.cadences.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.cadences.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.cadences.get(id)?.active ?? false;
  }

  isFast(id: string): boolean {
    return this.cadences.get(id)?.type === 'fast';
  }

  isNormal(id: string): boolean {
    return this.cadences.get(id)?.type === 'normal';
  }

  isSlow(id: string): boolean {
    return this.cadences.get(id)?.type === 'slow';
  }

  isIdle(id: string): boolean {
    return this.cadences.get(id)?.type === 'idle';
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.cadences.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const c = this.cadences.get(id);
    if (!c) return false;
    c.name = name;
    c.updated = Date.now();
    return true;
  }

  setType(id: string, type: CadenceType): boolean {
    const c = this.cadences.get(id);
    if (!c) return false;
    c.type = type;
    c.updated = Date.now();
    return true;
  }

  setInterval(id: string, interval: number): boolean {
    const c = this.cadences.get(id);
    if (!c) return false;
    c.interval = interval;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.cadences.values()) {
      c.ticks = 0;
      c.lastTick = 0;
      c.hits = 0;
      c.history = [];
      c.active = true;
    }
    this.totalTicks = 0;
  }

  getByName(name: string): Cadence[] {
    return Array.from(this.cadences.values()).filter(c => c.name === name);
  }

  getByType(type: CadenceType): Cadence[] {
    return Array.from(this.cadences.values()).filter(c => c.type === type);
  }

  getFastCadences(): Cadence[] {
    return Array.from(this.cadences.values()).filter(c => c.type === 'fast');
  }

  getNormalCadences(): Cadence[] {
    return Array.from(this.cadences.values()).filter(c => c.type === 'normal');
  }

  getSlowCadences(): Cadence[] {
    return Array.from(this.cadences.values()).filter(c => c.type === 'slow');
  }

  getIdleCadences(): Cadence[] {
    return Array.from(this.cadences.values()).filter(c => c.type === 'idle');
  }

  getActiveCadences(): Cadence[] {
    return Array.from(this.cadences.values()).filter(c => c.active);
  }

  getInactiveCadences(): Cadence[] {
    return Array.from(this.cadences.values()).filter(c => !c.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.cadences.values()).map(c => c.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinTicks(min: number): Cadence[] {
    return Array.from(this.cadences.values()).filter(c => c.ticks >= min);
  }

  getMostTicks(): Cadence | null {
    const all = Array.from(this.cadences.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.ticks > max.ticks ? c : max);
  }

  getNewest(): Cadence | null {
    const all = Array.from(this.cadences.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Cadence | null {
    const all = Array.from(this.cadences.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.cadences.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.cadences.get(id)?.updated ?? 0;
  }

  getTotalTicks(): number {
    return this.totalTicks;
  }

  clearAll(): void {
    this.cadences.clear();
    this.counter = 0;
    this.totalTicks = 0;
  }
}

export default CadenceEngine;