/**
 * Trust Engine
 * generic-agent-design Trust Engine - AddEntity + Trust + Distrust + Stats
 */

export type TrustLevel = 'untrusted' | 'low' | 'medium' | 'high' | 'absolute';

export interface TrustEntity {
  id: string;
  name: string;
  level: TrustLevel;
  score: number;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface TteStats {
  entities: number;
  totalAdded: number;
  totalTrust: number;
  totalDistrust: number;
  untrusted: number;
  low: number;
  medium: number;
  high: number;
  absolute: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalScore: number;
  avgScore: number;
  maxScore: number;
  minScore: number;
}

export class TrustEngine {
  private entities: Map<string, TrustEntity> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalTrust = 0;
  private totalDistrust = 0;
  private totalScore = 0;

  addEntity(name: string, initialLevel: TrustLevel = 'untrusted', initialScore: number = 0): string {
    const id = `tte-${++this.counter}`;
    this.entities.set(id, {
      id,
      name,
      level: initialLevel,
      score: Math.max(0, Math.min(100, initialScore)),
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    this.totalScore += initialScore;
    return id;
  }

  trust(id: string, amount: number): boolean {
    const e = this.entities.get(id);
    if (!e) return false;
    if (!e.active) return false;
    e.score = Math.max(0, Math.min(100, e.score + Math.abs(amount)));
    e.hits++;
    e.updated = Date.now();
    this.totalTrust++;
    this.totalScore += Math.abs(amount);
    e.level = this.calculateLevel(e.score);
    return true;
  }

  distrust(id: string, amount: number): boolean {
    const e = this.entities.get(id);
    if (!e) return false;
    if (!e.active) return false;
    e.score = Math.max(0, Math.min(100, e.score - Math.abs(amount)));
    e.hits++;
    e.updated = Date.now();
    this.totalDistrust++;
    this.totalScore -= Math.abs(amount);
    e.level = this.calculateLevel(e.score);
    return true;
  }

  private calculateLevel(score: number): TrustLevel {
    if (score >= 90) return 'absolute';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 10) return 'low';
    return 'untrusted';
  }

  remove(id: string): boolean {
    return this.entities.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const e = this.entities.get(id);
    if (!e) return false;
    e.active = active;
    e.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const e = this.entities.get(id);
    if (!e) return false;
    e.name = name;
    e.updated = Date.now();
    return true;
  }

  setLevel(id: string, level: TrustLevel): boolean {
    const e = this.entities.get(id);
    if (!e) return false;
    e.level = level;
    e.updated = Date.now();
    return true;
  }

  setScore(id: string, score: number): boolean {
    const e = this.entities.get(id);
    if (!e) return false;
    e.score = Math.max(0, Math.min(100, score));
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.entities.values()) {
      e.score = 0;
      e.level = 'untrusted';
      e.active = true;
      e.hits = 0;
    }
    this.totalAdded = 0;
    this.totalTrust = 0;
    this.totalDistrust = 0;
    this.totalScore = 0;
  }

  getStats(): TteStats {
    const all = Array.from(this.entities.values());
    const sArr = all.map(e => e.score);
    return {
      entities: all.length,
      totalAdded: this.totalAdded,
      totalTrust: this.totalTrust,
      totalDistrust: this.totalDistrust,
      untrusted: all.filter(e => e.level === 'untrusted').length,
      low: all.filter(e => e.level === 'low').length,
      medium: all.filter(e => e.level === 'medium').length,
      high: all.filter(e => e.level === 'high').length,
      absolute: all.filter(e => e.level === 'absolute').length,
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      uniqueNames: new Set(all.map(e => e.name)).size,
      totalScore: this.totalScore,
      avgScore: all.length > 0 ? Math.round((sArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxScore: sArr.length > 0 ? Math.max(...sArr) : 0,
      minScore: sArr.length > 0 ? Math.min(...sArr) : 0,
    };
  }

  getEntity(id: string): TrustEntity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): TrustEntity[] {
    return Array.from(this.entities.values());
  }

  hasEntity(id: string): boolean {
    return this.entities.has(id);
  }

  getCount(): number {
    return this.entities.size;
  }

  getName(id: string): string | undefined {
    return this.entities.get(id)?.name;
  }

  getLevel(id: string): TrustLevel | undefined {
    return this.entities.get(id)?.level;
  }

  getScore(id: string): number {
    return this.entities.get(id)?.score ?? 0;
  }

  getHits(id: string): number {
    return this.entities.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.entities.get(id)?.active ?? false;
  }

  isUntrusted(id: string): boolean {
    return this.entities.get(id)?.level === 'untrusted';
  }

  isLow(id: string): boolean {
    return this.entities.get(id)?.level === 'low';
  }

  isMedium(id: string): boolean {
    return this.entities.get(id)?.level === 'medium';
  }

  isHigh(id: string): boolean {
    return this.entities.get(id)?.level === 'high';
  }

  isAbsolute(id: string): boolean {
    return this.entities.get(id)?.level === 'absolute';
  }

  getByLevel(level: TrustLevel): TrustEntity[] {
    return Array.from(this.entities.values()).filter(e => e.level === level);
  }

  getActiveEntities(): TrustEntity[] {
    return Array.from(this.entities.values()).filter(e => e.active);
  }

  getInactiveEntities(): TrustEntity[] {
    return Array.from(this.entities.values()).filter(e => !e.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.entities.values()).map(e => e.name))];
  }

  getNewest(): TrustEntity | null {
    const all = Array.from(this.entities.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): TrustEntity | null {
    const all = Array.from(this.entities.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.created < min.created ? e : min);
  }

  getCreatedAt(id: string): number {
    return this.entities.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.entities.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalTrust(): number {
    return this.totalTrust;
  }

  getTotalDistrust(): number {
    return this.totalDistrust;
  }

  clearAll(): void {
    this.entities.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalTrust = 0;
    this.totalDistrust = 0;
    this.totalScore = 0;
  }
}

export default TrustEngine;