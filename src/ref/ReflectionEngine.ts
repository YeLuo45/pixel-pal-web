/**
 * Reflection Engine
 * generic-agent-design Reflection Engine - Record + Apply + Analyze + Stats
 */

export interface Reflection {
  id: string;
  trigger: string;
  insight: string;
  score: number;
  applied: number;
  created: number;
  updated: number;
  hits: number;
  active: boolean;
}

export interface ReflectionAnalysis {
  topInsight: string;
  avgScore: number;
  totalApplied: number;
  totalHits: number;
  activeCount: number;
}

export interface RefStats {
  reflections: number;
  totalApplied: number;
  avgScore: number;
  totalHits: number;
  active: number;
  inactive: number;
}

export class ReflectionEngine {
  private reflections: Map<string, Reflection> = new Map();
  private counter = 0;

  record(trigger: string, insight: string): string {
    const id = `ref-${++this.counter}`;
    this.reflections.set(id, {
      id,
      trigger,
      insight,
      score: 0,
      applied: 0,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      active: true,
    });
    return id;
  }

  apply(id: string, score: number): boolean {
    const r = this.reflections.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.score = Math.max(0, Math.min(1, score));
    r.applied++;
    r.updated = Date.now();
    return true;
  }

  analyze(): ReflectionAnalysis {
    const all = Array.from(this.reflections.values());
    if (all.length === 0) {
      return { topInsight: '', avgScore: 0, totalApplied: 0, totalHits: 0, activeCount: 0 };
    }
    const top = all.reduce((max, r) => r.score > max.score ? r : max);
    return {
      topInsight: top.insight,
      avgScore: Math.round((all.reduce((s, r) => s + r.score, 0) / all.length) * 100) / 100,
      totalApplied: all.reduce((s, r) => s + r.applied, 0),
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      activeCount: all.filter(r => r.active).length,
    };
  }

  getStats(): RefStats {
    const all = Array.from(this.reflections.values());
    return {
      reflections: all.length,
      totalApplied: all.reduce((s, r) => s + r.applied, 0),
      avgScore: all.length > 0 ? Math.round((all.reduce((s, r) => s + r.score, 0) / all.length) * 100) / 100 : 0,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
    };
  }

  getReflection(id: string): Reflection | undefined {
    return this.reflections.get(id);
  }

  getAllReflections(): Reflection[] {
    return Array.from(this.reflections.values());
  }

  removeReflection(id: string): boolean {
    return this.reflections.delete(id);
  }

  hasReflection(id: string): boolean {
    return this.reflections.has(id);
  }

  getCount(): number {
    return this.reflections.size;
  }

  getTrigger(id: string): string | undefined {
    return this.reflections.get(id)?.trigger;
  }

  getInsight(id: string): string | undefined {
    return this.reflections.get(id)?.insight;
  }

  getScore(id: string): number {
    return this.reflections.get(id)?.score ?? 0;
  }

  getApplied(id: string): number {
    return this.reflections.get(id)?.applied ?? 0;
  }

  getHits(id: string): number {
    return this.reflections.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.reflections.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.reflections.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setTrigger(id: string, trigger: string): boolean {
    const r = this.reflections.get(id);
    if (!r) return false;
    r.trigger = trigger;
    r.updated = Date.now();
    return true;
  }

  setInsight(id: string, insight: string): boolean {
    const r = this.reflections.get(id);
    if (!r) return false;
    r.insight = insight;
    r.updated = Date.now();
    return true;
  }

  touch(id: string): boolean {
    const r = this.reflections.get(id);
    if (!r) return false;
    r.hits++;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.reflections.values()) {
      r.score = 0;
      r.applied = 0;
      r.hits = 0;
      r.active = true;
    }
  }

  getByTrigger(trigger: string): Reflection[] {
    return Array.from(this.reflections.values()).filter(r => r.trigger === trigger);
  }

  getActiveReflections(): Reflection[] {
    return Array.from(this.reflections.values()).filter(r => r.active);
  }

  getInactiveReflections(): Reflection[] {
    return Array.from(this.reflections.values()).filter(r => !r.active);
  }

  getAllTriggers(): string[] {
    return [...new Set(Array.from(this.reflections.values()).map(r => r.trigger))];
  }

  getTriggerCount(): number {
    return this.getAllTriggers().length;
  }

  getByMinScore(min: number): Reflection[] {
    return Array.from(this.reflections.values()).filter(r => r.score >= min);
  }

  getMostApplied(): Reflection | null {
    const all = Array.from(this.reflections.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.applied > max.applied ? r : max);
  }

  getHighestScore(): Reflection | null {
    const all = Array.from(this.reflections.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.score > max.score ? r : max);
  }

  getNewest(): Reflection | null {
    const all = Array.from(this.reflections.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Reflection | null {
    const all = Array.from(this.reflections.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.reflections.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.reflections.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.reflections.clear();
    this.counter = 0;
  }
}

export default ReflectionEngine;