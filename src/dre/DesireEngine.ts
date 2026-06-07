/**
 * Desire Engine
 * generic-agent-design Desire Engine - Add + Satisfy + Stats
 */

export type DesirePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Desire {
  id: string;
  name: string;
  priority: DesirePriority;
  intensity: number;
  satisfied: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface DreStats {
  desires: number;
  totalAdded: number;
  totalSatisfied: number;
  totalUnsatisfied: number;
  low: number;
  normal: number;
  high: number;
  urgent: number;
  satisfied: number;
  unsatisfied: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalIntensity: number;
  avgIntensity: number;
  maxIntensity: number;
  minIntensity: number;
}

export class DesireEngine {
  private desires: Map<string, Desire> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalSatisfied = 0;
  private totalUnsatisfied = 0;
  private totalIntensity = 0;

  add(name: string, priority: DesirePriority, intensity: number): string {
    const id = `dre-${++this.counter}`;
    this.desires.set(id, {
      id,
      name,
      priority,
      intensity: Math.max(0, Math.min(10, intensity)),
      satisfied: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalIntensity += intensity;
    return id;
  }

  satisfy(id: string): boolean {
    const d = this.desires.get(id);
    if (!d) return false;
    if (!d.active) return false;
    if (d.satisfied) return false;
    d.satisfied = true;
    d.updated = Date.now();
    d.hits++;
    this.totalSatisfied++;
    return true;
  }

  unsatisfy(id: string): boolean {
    const d = this.desires.get(id);
    if (!d) return false;
    if (!d.satisfied) return false;
    d.satisfied = false;
    d.updated = Date.now();
    d.hits++;
    this.totalUnsatisfied++;
    return true;
  }

  remove(id: string): boolean {
    return this.desires.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const d = this.desires.get(id);
    if (!d) return false;
    d.active = active;
    d.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const d = this.desires.get(id);
    if (!d) return false;
    d.name = name;
    d.updated = Date.now();
    return true;
  }

  setPriority(id: string, priority: DesirePriority): boolean {
    const d = this.desires.get(id);
    if (!d) return false;
    d.priority = priority;
    d.updated = Date.now();
    return true;
  }

  setIntensity(id: string, intensity: number): boolean {
    const d = this.desires.get(id);
    if (!d) return false;
    d.intensity = Math.max(0, Math.min(10, intensity));
    d.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const d of this.desires.values()) {
      d.satisfied = false;
      d.active = true;
      d.hits = 0;
    }
    this.totalAdded = 0;
    this.totalSatisfied = 0;
    this.totalUnsatisfied = 0;
  }

  getStats(): DreStats {
    const all = Array.from(this.desires.values());
    const iArr = all.map(d => d.intensity);
    return {
      desires: all.length,
      totalAdded: this.totalAdded,
      totalSatisfied: this.totalSatisfied,
      totalUnsatisfied: this.totalUnsatisfied,
      low: all.filter(d => d.priority === 'low').length,
      normal: all.filter(d => d.priority === 'normal').length,
      high: all.filter(d => d.priority === 'high').length,
      urgent: all.filter(d => d.priority === 'urgent').length,
      satisfied: all.filter(d => d.satisfied).length,
      unsatisfied: all.filter(d => !d.satisfied).length,
      active: all.filter(d => d.active).length,
      inactive: all.filter(d => !d.active).length,
      totalHits: all.reduce((s, d) => s + d.hits, 0),
      uniqueNames: new Set(all.map(d => d.name)).size,
      totalIntensity: this.totalIntensity,
      avgIntensity: all.length > 0 ? Math.round((iArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxIntensity: iArr.length > 0 ? Math.max(...iArr) : 0,
      minIntensity: iArr.length > 0 ? Math.min(...iArr) : 0,
    };
  }

  getDesire(id: string): Desire | undefined {
    return this.desires.get(id);
  }

  getAllDesires(): Desire[] {
    return Array.from(this.desires.values());
  }

  hasDesire(id: string): boolean {
    return this.desires.has(id);
  }

  getCount(): number {
    return this.desires.size;
  }

  getName(id: string): string | undefined {
    return this.desires.get(id)?.name;
  }

  getPriority(id: string): DesirePriority | undefined {
    return this.desires.get(id)?.priority;
  }

  getIntensity(id: string): number {
    return this.desires.get(id)?.intensity ?? 0;
  }

  isSatisfied(id: string): boolean {
    return this.desires.get(id)?.satisfied ?? false;
  }

  getHits(id: string): number {
    return this.desires.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.desires.get(id)?.active ?? false;
  }

  isLow(id: string): boolean {
    return this.desires.get(id)?.priority === 'low';
  }

  isNormal(id: string): boolean {
    return this.desires.get(id)?.priority === 'normal';
  }

  isHigh(id: string): boolean {
    return this.desires.get(id)?.priority === 'high';
  }

  isUrgent(id: string): boolean {
    return this.desires.get(id)?.priority === 'urgent';
  }

  getByPriority(priority: DesirePriority): Desire[] {
    return Array.from(this.desires.values()).filter(d => d.priority === priority);
  }

  getSatisfiedDesires(): Desire[] {
    return Array.from(this.desires.values()).filter(d => d.satisfied);
  }

  getUnsatisfiedDesires(): Desire[] {
    return Array.from(this.desires.values()).filter(d => !d.satisfied);
  }

  getActiveDesires(): Desire[] {
    return Array.from(this.desires.values()).filter(d => d.active);
  }

  getInactiveDesires(): Desire[] {
    return Array.from(this.desires.values()).filter(d => !d.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.desires.values()).map(d => d.name))];
  }

  getNewest(): Desire | null {
    const all = Array.from(this.desires.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.created > max.created ? d : max);
  }

  getOldest(): Desire | null {
    const all = Array.from(this.desires.values());
    if (all.length === 0) return null;
    return all.reduce((min, d) => d.created < min.created ? d : min);
  }

  getCreatedAt(id: string): number {
    return this.desires.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.desires.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalSatisfied(): number {
    return this.totalSatisfied;
  }

  getTotalUnsatisfied(): number {
    return this.totalUnsatisfied;
  }

  clearAll(): void {
    this.desires.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalSatisfied = 0;
    this.totalUnsatisfied = 0;
    this.totalIntensity = 0;
  }
}

export default DesireEngine;