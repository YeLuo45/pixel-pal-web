/**
 * Intention Engine
 * generic-agent-design Intention Engine - Declare + Commit + Complete + Stats
 */

export type IntentionStatus = 'declared' | 'committed' | 'completed' | 'abandoned';

export interface Intention {
  id: string;
  goal: string;
  motivation: string;
  status: IntentionStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface IneStats {
  intentions: number;
  totalDeclared: number;
  totalCommitted: number;
  totalCompleted: number;
  totalAbandoned: number;
  declared: number;
  committed: number;
  completed: number;
  abandoned: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueGoals: number;
  uniqueMotivations: number;
}

export class IntentionEngine {
  private intentions: Map<string, Intention> = new Map();
  private counter = 0;
  private totalDeclared = 0;
  private totalCommitted = 0;
  private totalCompleted = 0;
  private totalAbandoned = 0;

  declare(goal: string, motivation: string): string {
    const id = `ine-${++this.counter}`;
    this.intentions.set(id, {
      id,
      goal,
      motivation,
      status: 'declared',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalDeclared++;
    return id;
  }

  commit(id: string): boolean {
    const i = this.intentions.get(id);
    if (!i) return false;
    if (i.status !== 'declared') return false;
    i.status = 'committed';
    i.updated = Date.now();
    i.hits++;
    this.totalCommitted++;
    return true;
  }

  complete(id: string): boolean {
    const i = this.intentions.get(id);
    if (!i) return false;
    if (i.status !== 'committed') return false;
    i.status = 'completed';
    i.updated = Date.now();
    i.hits++;
    this.totalCompleted++;
    return true;
  }

  abandon(id: string): boolean {
    const i = this.intentions.get(id);
    if (!i) return false;
    i.status = 'abandoned';
    i.updated = Date.now();
    i.hits++;
    this.totalAbandoned++;
    return true;
  }

  remove(id: string): boolean {
    return this.intentions.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const i = this.intentions.get(id);
    if (!i) return false;
    i.active = active;
    i.updated = Date.now();
    return true;
  }

  setGoal(id: string, goal: string): boolean {
    const i = this.intentions.get(id);
    if (!i) return false;
    i.goal = goal;
    i.updated = Date.now();
    return true;
  }

  setMotivation(id: string, motivation: string): boolean {
    const i = this.intentions.get(id);
    if (!i) return false;
    i.motivation = motivation;
    i.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const i of this.intentions.values()) {
      i.status = 'declared';
      i.active = true;
      i.hits = 0;
    }
    this.totalDeclared = 0;
    this.totalCommitted = 0;
    this.totalCompleted = 0;
    this.totalAbandoned = 0;
  }

  getStats(): IneStats {
    const all = Array.from(this.intentions.values());
    return {
      intentions: all.length,
      totalDeclared: this.totalDeclared,
      totalCommitted: this.totalCommitted,
      totalCompleted: this.totalCompleted,
      totalAbandoned: this.totalAbandoned,
      declared: all.filter(i => i.status === 'declared').length,
      committed: all.filter(i => i.status === 'committed').length,
      completed: all.filter(i => i.status === 'completed').length,
      abandoned: all.filter(i => i.status === 'abandoned').length,
      active: all.filter(i => i.active).length,
      inactive: all.filter(i => !i.active).length,
      totalHits: all.reduce((s, i) => s + i.hits, 0),
      uniqueGoals: new Set(all.map(i => i.goal)).size,
      uniqueMotivations: new Set(all.map(i => i.motivation)).size,
    };
  }

  getIntention(id: string): Intention | undefined {
    return this.intentions.get(id);
  }

  getAllIntentions(): Intention[] {
    return Array.from(this.intentions.values());
  }

  hasIntention(id: string): boolean {
    return this.intentions.has(id);
  }

  getCount(): number {
    return this.intentions.size;
  }

  getGoal(id: string): string | undefined {
    return this.intentions.get(id)?.goal;
  }

  getMotivation(id: string): string | undefined {
    return this.intentions.get(id)?.motivation;
  }

  getStatus(id: string): IntentionStatus | undefined {
    return this.intentions.get(id)?.status;
  }

  getHits(id: string): number {
    return this.intentions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.intentions.get(id)?.active ?? false;
  }

  isDeclared(id: string): boolean {
    return this.intentions.get(id)?.status === 'declared';
  }

  isCommitted(id: string): boolean {
    return this.intentions.get(id)?.status === 'committed';
  }

  isCompleted(id: string): boolean {
    return this.intentions.get(id)?.status === 'completed';
  }

  isAbandoned(id: string): boolean {
    return this.intentions.get(id)?.status === 'abandoned';
  }

  getByStatus(status: IntentionStatus): Intention[] {
    return Array.from(this.intentions.values()).filter(i => i.status === status);
  }

  getActiveIntentions(): Intention[] {
    return Array.from(this.intentions.values()).filter(i => i.active);
  }

  getInactiveIntentions(): Intention[] {
    return Array.from(this.intentions.values()).filter(i => !i.active);
  }

  getAllGoals(): string[] {
    return [...new Set(Array.from(this.intentions.values()).map(i => i.goal))];
  }

  getAllMotivations(): string[] {
    return [...new Set(Array.from(this.intentions.values()).map(i => i.motivation))];
  }

  getNewest(): Intention | null {
    const all = Array.from(this.intentions.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.created > max.created ? i : max);
  }

  getOldest(): Intention | null {
    const all = Array.from(this.intentions.values());
    if (all.length === 0) return null;
    return all.reduce((min, i) => i.created < min.created ? i : min);
  }

  getCreatedAt(id: string): number {
    return this.intentions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.intentions.get(id)?.updated ?? 0;
  }

  getTotalDeclared(): number {
    return this.totalDeclared;
  }

  getTotalCommitted(): number {
    return this.totalCommitted;
  }

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  getTotalAbandoned(): number {
    return this.totalAbandoned;
  }

  clearAll(): void {
    this.intentions.clear();
    this.counter = 0;
    this.totalDeclared = 0;
    this.totalCommitted = 0;
    this.totalCompleted = 0;
    this.totalAbandoned = 0;
  }
}

export default IntentionEngine;