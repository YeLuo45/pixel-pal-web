/**
 * Priority Engine
 * generic-agent-design Priority Engine - Add + Promote + Demote + Stats
 */

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PriorityItem {
  id: string;
  name: string;
  level: PriorityLevel;
  score: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface PreStats {
  items: number;
  totalAdded: number;
  totalPromoted: number;
  totalDemoted: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgScore: number;
  maxScore: number;
  minScore: number;
}

function levelToScore(level: PriorityLevel): number {
  if (level === 'low') return 1;
  if (level === 'medium') return 5;
  if (level === 'high') return 10;
  return 20;
}

function scoreToLevel(score: number): PriorityLevel {
  if (score >= 20) return 'critical';
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

export class PriorityEngine {
  private items: Map<string, PriorityItem> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalPromoted = 0;
  private totalDemoted = 0;

  add(name: string, level: PriorityLevel = 'medium'): string {
    const id = `pre-${++this.counter}`;
    this.items.set(id, {
      id,
      name,
      level,
      score: levelToScore(level),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  promote(id: string, amount: number = 1): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    if (!i.active) return false;
    i.score += amount * 2;
    i.level = scoreToLevel(i.score);
    i.updated = Date.now();
    i.hits++;
    this.totalPromoted++;
    return true;
  }

  demote(id: string, amount: number = 1): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    if (!i.active) return false;
    i.score = Math.max(0, i.score - amount * 2);
    i.level = scoreToLevel(i.score);
    i.updated = Date.now();
    i.hits++;
    this.totalDemoted++;
    return true;
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    i.active = active;
    i.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    i.name = name;
    i.updated = Date.now();
    return true;
  }

  setLevel(id: string, level: PriorityLevel): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    i.level = level;
    i.score = levelToScore(level);
    i.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const i of this.items.values()) {
      i.active = true;
      i.hits = 0;
    }
    this.totalAdded = 0;
    this.totalPromoted = 0;
    this.totalDemoted = 0;
  }

  getStats(): PreStats {
    const all = Array.from(this.items.values());
    const scoresArr = all.map(i => i.score);
    return {
      items: all.length,
      totalAdded: this.totalAdded,
      totalPromoted: this.totalPromoted,
      totalDemoted: this.totalDemoted,
      low: all.filter(i => i.level === 'low').length,
      medium: all.filter(i => i.level === 'medium').length,
      high: all.filter(i => i.level === 'high').length,
      critical: all.filter(i => i.level === 'critical').length,
      active: all.filter(i => i.active).length,
      inactive: all.filter(i => !i.active).length,
      totalHits: all.reduce((s, i) => s + i.hits, 0),
      uniqueNames: new Set(all.map(i => i.name)).size,
      avgScore: all.length > 0 ? Math.round((scoresArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxScore: scoresArr.length > 0 ? Math.max(...scoresArr) : 0,
      minScore: scoresArr.length > 0 ? Math.min(...scoresArr) : 0,
    };
  }

  getItem(id: string): PriorityItem | undefined {
    return this.items.get(id);
  }

  getAllItems(): PriorityItem[] {
    return Array.from(this.items.values());
  }

  hasItem(id: string): boolean {
    return this.items.has(id);
  }

  getCount(): number {
    return this.items.size;
  }

  getName(id: string): string | undefined {
    return this.items.get(id)?.name;
  }

  getLevel(id: string): PriorityLevel | undefined {
    return this.items.get(id)?.level;
  }

  getScore(id: string): number {
    return this.items.get(id)?.score ?? 0;
  }

  getHits(id: string): number {
    return this.items.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.items.get(id)?.active ?? false;
  }

  isLow(id: string): boolean {
    return this.items.get(id)?.level === 'low';
  }

  isMedium(id: string): boolean {
    return this.items.get(id)?.level === 'medium';
  }

  isHigh(id: string): boolean {
    return this.items.get(id)?.level === 'high';
  }

  isCritical(id: string): boolean {
    return this.items.get(id)?.level === 'critical';
  }

  getByLevel(level: PriorityLevel): PriorityItem[] {
    return Array.from(this.items.values()).filter(i => i.level === level);
  }

  getActiveItems(): PriorityItem[] {
    return Array.from(this.items.values()).filter(i => i.active);
  }

  getInactiveItems(): PriorityItem[] {
    return Array.from(this.items.values()).filter(i => !i.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.items.values()).map(i => i.name))];
  }

  getNewest(): PriorityItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.created > max.created ? i : max);
  }

  getOldest(): PriorityItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((min, i) => i.created < min.created ? i : min);
  }

  getCreatedAt(id: string): number {
    return this.items.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.items.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalPromoted(): number {
    return this.totalPromoted;
  }

  getTotalDemoted(): number {
    return this.totalDemoted;
  }

  clearAll(): void {
    this.items.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalPromoted = 0;
    this.totalDemoted = 0;
  }
}

export default PriorityEngine;