/**
 * Priority Engine
 * generic-agent-design Priority Engine - Enqueue + Schedule + GetNext + Stats
 */

export interface Task {
  id: string;
  name: string;
  priority: number;
  scheduled: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface PE3Stats {
  tasks: number;
  scheduled: number;
  pending: number;
  active: number;
  inactive: number;
  avgPriority: number;
  maxPriority: number;
  minPriority: number;
  totalHits: number;
}

export class PriorityEngine {
  private tasks: Map<string, Task> = new Map();
  private counter = 0;
  private totalScheduled = 0;

  enqueue(name: string, priority: number = 0): string {
    const id = `pe3-${++this.counter}`;
    this.tasks.set(id, {
      id,
      name,
      priority,
      scheduled: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [Date.now()],
    });
    return id;
  }

  schedule(id: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    if (!t.active) return false;
    if (t.scheduled) return false;
    t.scheduled = true;
    t.updated = Date.now();
    t.history.push(Date.now());
    t.hits++;
    this.totalScheduled++;
    return true;
  }

  unschedule(id: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    if (!t.scheduled) return false;
    t.scheduled = false;
    t.updated = Date.now();
    return true;
  }

  getNext(): Task | null {
    const pending = Array.from(this.tasks.values())
      .filter(t => t.active && !t.scheduled)
      .sort((a, b) => b.priority - a.priority);
    return pending[0] ?? null;
  }

  getAll(): Task[] {
    return Array.from(this.tasks.values())
      .filter(t => t.active && !t.scheduled)
      .sort((a, b) => b.priority - a.priority);
  }

  getStats(): PE3Stats {
    const all = Array.from(this.tasks.values());
    const pending = all.filter(t => !t.scheduled);
    return {
      tasks: all.length,
      scheduled: this.totalScheduled,
      pending: pending.length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      avgPriority: all.length > 0 ? Math.round((all.reduce((s, t) => s + t.priority, 0) / all.length) * 100) / 100 : 0,
      maxPriority: all.length > 0 ? Math.max(...all.map(t => t.priority)) : 0,
      minPriority: all.length > 0 ? Math.min(...all.map(t => t.priority)) : 0,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
    };
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getScheduledTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.scheduled);
  }

  getPendingTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => !t.scheduled);
  }

  removeTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  hasTask(id: string): boolean {
    return this.tasks.has(id);
  }

  getCount(): number {
    return this.tasks.size;
  }

  getName(id: string): string | undefined {
    return this.tasks.get(id)?.name;
  }

  getPriority(id: string): number {
    return this.tasks.get(id)?.priority ?? 0;
  }

  getHits(id: string): number {
    return this.tasks.get(id)?.hits ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.tasks.get(id)?.history ?? [])];
  }

  isScheduled(id: string): boolean {
    return this.tasks.get(id)?.scheduled ?? false;
  }

  isPending(id: string): boolean {
    return !this.isScheduled(id);
  }

  isActive(id: string): boolean {
    return this.tasks.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.name = name;
    t.updated = Date.now();
    return true;
  }

  setPriority(id: string, priority: number): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.priority = priority;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.tasks.values()) {
      t.scheduled = false;
      t.hits = 0;
      t.history = [t.created];
      t.active = true;
    }
    this.totalScheduled = 0;
  }

  getByName(name: string): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.name === name);
  }

  getActiveTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.active);
  }

  getInactiveTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => !t.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.tasks.values()).map(t => t.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinPriority(min: number): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.priority >= min);
  }

  getHighestPriority(): Task | null {
    const all = Array.from(this.tasks.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.priority > max.priority ? t : max);
  }

  getNewest(): Task | null {
    const all = Array.from(this.tasks.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): Task | null {
    const all = Array.from(this.tasks.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.tasks.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.tasks.get(id)?.updated ?? 0;
  }

  getTotalScheduled(): number {
    return this.totalScheduled;
  }

  clearAll(): void {
    this.tasks.clear();
    this.counter = 0;
    this.totalScheduled = 0;
  }
}

export default PriorityEngine;