/**
 * Reflection Engine
 * generic-agent-design Reflection Engine - Reflect + Learn + Adapt + Stats
 */

export type ReflectStatus = 'pending' | 'reflected' | 'adapted';

export interface Reflection {
  id: string;
  situation: string;
  lesson: string;
  status: ReflectStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface RfeStats {
  reflections: number;
  totalReflected: number;
  totalAdapted: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueSituations: number;
  uniqueLessons: number;
  pending: number;
  reflected: number;
  adapted: number;
}

export class ReflectionEngine {
  private reflections: Map<string, Reflection> = new Map();
  private counter = 0;
  private totalReflected = 0;
  private totalAdapted = 0;

  reflect(situation: string, lesson: string): string {
    const id = `rfe-${++this.counter}`;
    this.reflections.set(id, {
      id,
      situation,
      lesson,
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  learn(id: string): boolean {
    const r = this.reflections.get(id);
    if (!r) return false;
    r.status = 'reflected';
    r.updated = Date.now();
    r.hits++;
    this.totalReflected++;
    return true;
  }

  adapt(id: string): boolean {
    const r = this.reflections.get(id);
    if (!r) return false;
    if (r.status !== 'reflected') return false;
    r.status = 'adapted';
    r.updated = Date.now();
    r.hits++;
    this.totalAdapted++;
    return true;
  }

  remove(id: string): boolean {
    return this.reflections.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.reflections.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setSituation(id: string, situation: string): boolean {
    const r = this.reflections.get(id);
    if (!r) return false;
    r.situation = situation;
    r.updated = Date.now();
    return true;
  }

  setLesson(id: string, lesson: string): boolean {
    const r = this.reflections.get(id);
    if (!r) return false;
    r.lesson = lesson;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.reflections.values()) {
      r.status = 'pending';
      r.active = true;
      r.hits = 0;
    }
    this.totalReflected = 0;
    this.totalAdapted = 0;
  }

  getStats(): RfeStats {
    const all = Array.from(this.reflections.values());
    return {
      reflections: all.length,
      totalReflected: this.totalReflected,
      totalAdapted: this.totalAdapted,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueSituations: new Set(all.map(r => r.situation)).size,
      uniqueLessons: new Set(all.map(r => r.lesson)).size,
      pending: all.filter(r => r.status === 'pending').length,
      reflected: all.filter(r => r.status === 'reflected').length,
      adapted: all.filter(r => r.status === 'adapted').length,
    };
  }

  getReflection(id: string): Reflection | undefined {
    return this.reflections.get(id);
  }

  getAllReflections(): Reflection[] {
    return Array.from(this.reflections.values());
  }

  hasReflection(id: string): boolean {
    return this.reflections.has(id);
  }

  getCount(): number {
    return this.reflections.size;
  }

  getSituation(id: string): string | undefined {
    return this.reflections.get(id)?.situation;
  }

  getLesson(id: string): string | undefined {
    return this.reflections.get(id)?.lesson;
  }

  getStatus(id: string): ReflectStatus | undefined {
    return this.reflections.get(id)?.status;
  }

  getHits(id: string): number {
    return this.reflections.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.reflections.get(id)?.active ?? false;
  }

  isReflected(id: string): boolean {
    return this.reflections.get(id)?.status === 'reflected';
  }

  isAdapted(id: string): boolean {
    return this.reflections.get(id)?.status === 'adapted';
  }

  isPending(id: string): boolean {
    return this.reflections.get(id)?.status === 'pending';
  }

  getByStatus(status: ReflectStatus): Reflection[] {
    return Array.from(this.reflections.values()).filter(r => r.status === status);
  }

  getBySituation(situation: string): Reflection[] {
    return Array.from(this.reflections.values()).filter(r => r.situation === situation);
  }

  getActiveReflections(): Reflection[] {
    return Array.from(this.reflections.values()).filter(r => r.active);
  }

  getInactiveReflections(): Reflection[] {
    return Array.from(this.reflections.values()).filter(r => !r.active);
  }

  getAllSituations(): string[] {
    return [...new Set(Array.from(this.reflections.values()).map(r => r.situation))];
  }

  getAllLessons(): string[] {
    return [...new Set(Array.from(this.reflections.values()).map(r => r.lesson))];
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

  getTotalReflected(): number {
    return this.totalReflected;
  }

  getTotalAdapted(): number {
    return this.totalAdapted;
  }

  clearAll(): void {
    this.reflections.clear();
    this.counter = 0;
    this.totalReflected = 0;
    this.totalAdapted = 0;
  }
}

export default ReflectionEngine;