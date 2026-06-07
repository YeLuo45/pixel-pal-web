/**
 * Action Engine
 * generic-agent-design Action Engine - Define + Execute + Stats
 */

export type ActionState = 'idle' | 'queued' | 'running' | 'done' | 'failed';

export interface Action {
  id: string;
  name: string;
  state: ActionState;
  duration: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface AceStats {
  actions: number;
  totalDefined: number;
  totalExecuted: number;
  totalDone: number;
  totalFailed: number;
  idle: number;
  queued: number;
  running: number;
  done: number;
  failed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalDuration: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
}

export class ActionEngine {
  private actions: Map<string, Action> = new Map();
  private counter = 0;
  private totalDefined = 0;
  private totalExecuted = 0;
  private totalDone = 0;
  private totalFailed = 0;
  private totalDuration = 0;

  define(name: string): string {
    const id = `ace-${++this.counter}`;
    this.actions.set(id, {
      id,
      name,
      state: 'idle',
      duration: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalDefined++;
    return id;
  }

  queue(id: string): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    if (!a.active) return false;
    a.state = 'queued';
    a.updated = Date.now();
    a.hits++;
    return true;
  }

  execute(id: string): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    if (!a.active) return false;
    a.state = 'running';
    a.updated = Date.now();
    a.hits++;
    this.totalExecuted++;
    return true;
  }

  complete(id: string, duration: number): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    a.duration = duration;
    a.state = 'done';
    a.updated = Date.now();
    a.hits++;
    this.totalDone++;
    this.totalDuration += duration;
    return true;
  }

  fail(id: string): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    a.state = 'failed';
    a.updated = Date.now();
    a.hits++;
    this.totalFailed++;
    return true;
  }

  remove(id: string): boolean {
    return this.actions.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    a.active = active;
    a.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    a.name = name;
    a.updated = Date.now();
    return true;
  }

  setState(id: string, state: ActionState): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    a.state = state;
    a.updated = Date.now();
    return true;
  }

  setDuration(id: string, duration: number): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    a.duration = duration;
    a.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const a of this.actions.values()) {
      a.state = 'idle';
      a.active = true;
      a.hits = 0;
    }
    this.totalDefined = 0;
    this.totalExecuted = 0;
    this.totalDone = 0;
    this.totalFailed = 0;
    this.totalDuration = 0;
  }

  getStats(): AceStats {
    const all = Array.from(this.actions.values());
    const dArr = all.map(a => a.duration);
    return {
      actions: all.length,
      totalDefined: this.totalDefined,
      totalExecuted: this.totalExecuted,
      totalDone: this.totalDone,
      totalFailed: this.totalFailed,
      idle: all.filter(a => a.state === 'idle').length,
      queued: all.filter(a => a.state === 'queued').length,
      running: all.filter(a => a.state === 'running').length,
      done: all.filter(a => a.state === 'done').length,
      failed: all.filter(a => a.state === 'failed').length,
      active: all.filter(a => a.active).length,
      inactive: all.filter(a => !a.active).length,
      totalHits: all.reduce((s, a) => s + a.hits, 0),
      uniqueNames: new Set(all.map(a => a.name)).size,
      totalDuration: this.totalDuration,
      avgDuration: all.length > 0 ? Math.round((dArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxDuration: dArr.length > 0 ? Math.max(...dArr) : 0,
      minDuration: dArr.length > 0 ? Math.min(...dArr) : 0,
    };
  }

  getAction(id: string): Action | undefined {
    return this.actions.get(id);
  }

  getAllActions(): Action[] {
    return Array.from(this.actions.values());
  }

  hasAction(id: string): boolean {
    return this.actions.has(id);
  }

  getCount(): number {
    return this.actions.size;
  }

  getName(id: string): string | undefined {
    return this.actions.get(id)?.name;
  }

  getState(id: string): ActionState | undefined {
    return this.actions.get(id)?.state;
  }

  getDuration(id: string): number {
    return this.actions.get(id)?.duration ?? 0;
  }

  getHits(id: string): number {
    return this.actions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.actions.get(id)?.active ?? false;
  }

  isIdle(id: string): boolean {
    return this.actions.get(id)?.state === 'idle';
  }

  isQueued(id: string): boolean {
    return this.actions.get(id)?.state === 'queued';
  }

  isRunning(id: string): boolean {
    return this.actions.get(id)?.state === 'running';
  }

  isDone(id: string): boolean {
    return this.actions.get(id)?.state === 'done';
  }

  isFailed(id: string): boolean {
    return this.actions.get(id)?.state === 'failed';
  }

  getByState(state: ActionState): Action[] {
    return Array.from(this.actions.values()).filter(a => a.state === state);
  }

  getActiveActions(): Action[] {
    return Array.from(this.actions.values()).filter(a => a.active);
  }

  getInactiveActions(): Action[] {
    return Array.from(this.actions.values()).filter(a => !a.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.actions.values()).map(a => a.name))];
  }

  getNewest(): Action | null {
    const all = Array.from(this.actions.values());
    if (all.length === 0) return null;
    return all.reduce((max, a) => a.created > max.created ? a : max);
  }

  getOldest(): Action | null {
    const all = Array.from(this.actions.values());
    if (all.length === 0) return null;
    return all.reduce((min, a) => a.created < min.created ? a : min);
  }

  getCreatedAt(id: string): number {
    return this.actions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.actions.get(id)?.updated ?? 0;
  }

  getTotalDefined(): number {
    return this.totalDefined;
  }

  getTotalExecuted(): number {
    return this.totalExecuted;
  }

  getTotalDone(): number {
    return this.totalDone;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.actions.clear();
    this.counter = 0;
    this.totalDefined = 0;
    this.totalExecuted = 0;
    this.totalDone = 0;
    this.totalFailed = 0;
    this.totalDuration = 0;
  }
}

export default ActionEngine;