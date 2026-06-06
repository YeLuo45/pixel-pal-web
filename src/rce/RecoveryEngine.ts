/**
 * Recovery Engine
 * thunderbolt-design Recovery Engine - Register + Recover + Retry + Stats
 */

export type RecoveryStatus = 'pending' | 'in-progress' | 'recovered' | 'failed';

export interface Recovery {
  id: string;
  task: string;
  status: RecoveryStatus;
  attempts: number;
  maxAttempts: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface RceStats {
  recoveries: number;
  totalAttempts: number;
  totalRecovered: number;
  totalFailed: number;
  pending: number;
  inProgress: number;
  recovered: number;
  failed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTasks: number;
  avgAttempts: number;
  maxAttempts: number;
  minAttempts: number;
  avgMaxAttempts: number;
}

export class RecoveryEngine {
  private recoveries: Map<string, Recovery> = new Map();
  private counter = 0;
  private totalAttempts = 0;
  private totalRecovered = 0;
  private totalFailed = 0;

  register(task: string, maxAttempts: number = 3): string {
    const id = `rce-${++this.counter}`;
    this.recoveries.set(id, {
      id,
      task,
      status: 'pending',
      attempts: 0,
      maxAttempts,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  attempt(id: string): boolean {
    const r = this.recoveries.get(id);
    if (!r) return false;
    if (!r.active) return false;
    if (r.status === 'recovered' || r.status === 'failed') return false;
    r.attempts++;
    r.status = 'in-progress';
    r.updated = Date.now();
    r.hits++;
    this.totalAttempts++;
    return true;
  }

  recover(id: string): boolean {
    const r = this.recoveries.get(id);
    if (!r) return false;
    r.status = 'recovered';
    r.updated = Date.now();
    r.hits++;
    this.totalRecovered++;
    return true;
  }

  fail(id: string): boolean {
    const r = this.recoveries.get(id);
    if (!r) return false;
    r.status = 'failed';
    r.updated = Date.now();
    r.hits++;
    this.totalFailed++;
    return true;
  }

  retry(id: string): boolean {
    const r = this.recoveries.get(id);
    if (!r) return false;
    if (!r.active) return false;
    if (r.attempts >= r.maxAttempts) return false;
    r.status = 'pending';
    r.attempts = 0;
    r.updated = Date.now();
    r.hits++;
    return true;
  }

  canRetry(id: string): boolean {
    const r = this.recoveries.get(id);
    if (!r) return false;
    return r.attempts < r.maxAttempts;
  }

  remove(id: string): boolean {
    return this.recoveries.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.recoveries.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setMaxAttempts(id: string, maxAttempts: number): boolean {
    const r = this.recoveries.get(id);
    if (!r) return false;
    r.maxAttempts = maxAttempts;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.recoveries.values()) {
      r.status = 'pending';
      r.attempts = 0;
      r.active = true;
      r.hits = 0;
    }
    this.totalAttempts = 0;
    this.totalRecovered = 0;
    this.totalFailed = 0;
  }

  getStats(): RceStats {
    const all = Array.from(this.recoveries.values());
    const attemptsValues = all.map(r => r.attempts);
    const maxAttemptsValues = all.map(r => r.maxAttempts);
    return {
      recoveries: all.length,
      totalAttempts: this.totalAttempts,
      totalRecovered: this.totalRecovered,
      totalFailed: this.totalFailed,
      pending: all.filter(r => r.status === 'pending').length,
      inProgress: all.filter(r => r.status === 'in-progress').length,
      recovered: all.filter(r => r.status === 'recovered').length,
      failed: all.filter(r => r.status === 'failed').length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueTasks: new Set(all.map(r => r.task)).size,
      avgAttempts: all.length > 0 ? Math.round((attemptsValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxAttempts: attemptsValues.length > 0 ? Math.max(...attemptsValues) : 0,
      minAttempts: attemptsValues.length > 0 ? Math.min(...attemptsValues) : 0,
      avgMaxAttempts: all.length > 0 ? Math.round((maxAttemptsValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getRecovery(id: string): Recovery | undefined {
    return this.recoveries.get(id);
  }

  getAllRecoveries(): Recovery[] {
    return Array.from(this.recoveries.values());
  }

  hasRecovery(id: string): boolean {
    return this.recoveries.has(id);
  }

  getCount(): number {
    return this.recoveries.size;
  }

  getTask(id: string): string | undefined {
    return this.recoveries.get(id)?.task;
  }

  getStatus(id: string): RecoveryStatus | undefined {
    return this.recoveries.get(id)?.status;
  }

  getAttempts(id: string): number {
    return this.recoveries.get(id)?.attempts ?? 0;
  }

  getMaxAttempts(id: string): number {
    return this.recoveries.get(id)?.maxAttempts ?? 0;
  }

  getHits(id: string): number {
    return this.recoveries.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.recoveries.get(id)?.active ?? false;
  }

  isRecovered(id: string): boolean {
    return this.recoveries.get(id)?.status === 'recovered';
  }

  isFailed(id: string): boolean {
    return this.recoveries.get(id)?.status === 'failed';
  }

  getByStatus(status: RecoveryStatus): Recovery[] {
    return Array.from(this.recoveries.values()).filter(r => r.status === status);
  }

  getByTask(task: string): Recovery[] {
    return Array.from(this.recoveries.values()).filter(r => r.task === task);
  }

  getActiveRecoveries(): Recovery[] {
    return Array.from(this.recoveries.values()).filter(r => r.active);
  }

  getInactiveRecoveries(): Recovery[] {
    return Array.from(this.recoveries.values()).filter(r => !r.active);
  }

  getAllTasks(): string[] {
    return [...new Set(Array.from(this.recoveries.values()).map(r => r.task))];
  }

  getTaskCount(): number {
    return this.getAllTasks().length;
  }

  getNewest(): Recovery | null {
    const all = Array.from(this.recoveries.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Recovery | null {
    const all = Array.from(this.recoveries.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.recoveries.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.recoveries.get(id)?.updated ?? 0;
  }

  getTotalAttempts(): number {
    return this.totalAttempts;
  }

  getTotalRecovered(): number {
    return this.totalRecovered;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.recoveries.clear();
    this.counter = 0;
    this.totalAttempts = 0;
    this.totalRecovered = 0;
    this.totalFailed = 0;
  }
}

export default RecoveryEngine;