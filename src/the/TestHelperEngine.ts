/**
 * Test Helper Engine
 * claude-code-design Test Helper - Create + Start + Pass + Fail + Stats
 */

export type TestStatus = 'pending' | 'running' | 'passed' | 'failed';

export interface TestCase {
  id: string;
  name: string;
  status: TestStatus;
  duration: number;
  startTime: number;
  endTime: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: TestStatus[];
}

export interface TheStats {
  cases: number;
  pending: number;
  running: number;
  passed: number;
  failed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
  totalDuration: number;
  passRate: number;
  failRate: number;
  uniqueStatuses: number;
}

export class TestHelperEngine {
  private cases: Map<string, TestCase> = new Map();
  private counter = 0;

  create(name: string): string {
    const id = `the-${++this.counter}`;
    this.cases.set(id, {
      id,
      name,
      status: 'pending',
      duration: 0,
      startTime: 0,
      endTime: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: ['pending'],
    });
    return id;
  }

  start(id: string): boolean {
    const t = this.cases.get(id);
    if (!t) return false;
    if (!t.active) return false;
    if (t.status === 'running') return false;
    t.status = 'running';
    t.startTime = Date.now();
    t.history.push('running');
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  pass(id: string): boolean {
    const t = this.cases.get(id);
    if (!t) return false;
    if (t.status !== 'running') return false;
    t.endTime = Date.now();
    t.duration = t.endTime - t.startTime;
    t.status = 'passed';
    t.history.push('passed');
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  fail(id: string): boolean {
    const t = this.cases.get(id);
    if (!t) return false;
    if (t.status !== 'running') return false;
    t.endTime = Date.now();
    t.duration = t.endTime - t.startTime;
    t.status = 'failed';
    t.history.push('failed');
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  reset(id: string): boolean {
    const t = this.cases.get(id);
    if (!t) return false;
    t.status = 'pending';
    t.duration = 0;
    t.startTime = 0;
    t.endTime = 0;
    t.history = ['pending'];
    t.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.cases.delete(id);
  }

  getStats(): TheStats {
    const all = Array.from(this.cases.values());
    const durationValues = all.map(t => t.duration);
    return {
      cases: all.length,
      pending: all.filter(t => t.status === 'pending').length,
      running: all.filter(t => t.status === 'running').length,
      passed: all.filter(t => t.status === 'passed').length,
      failed: all.filter(t => t.status === 'failed').length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueNames: new Set(all.map(t => t.name)).size,
      avgDuration: all.length > 0 ? Math.round((durationValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxDuration: durationValues.length > 0 ? Math.max(...durationValues) : 0,
      minDuration: durationValues.length > 0 ? Math.min(...durationValues) : 0,
      totalDuration: durationValues.reduce((s, v) => s + v, 0),
      passRate: all.length > 0 ? Math.round((all.filter(t => t.status === 'passed').length / all.length) * 100) / 100 : 0,
      failRate: all.length > 0 ? Math.round((all.filter(t => t.status === 'failed').length / all.length) * 100) / 100 : 0,
      uniqueStatuses: new Set(all.map(t => t.status)).size,
    };
  }

  getTestCase(id: string): TestCase | undefined {
    return this.cases.get(id);
  }

  getAllTestCases(): TestCase[] {
    return Array.from(this.cases.values());
  }

  hasTestCase(id: string): boolean {
    return this.cases.has(id);
  }

  getCount(): number {
    return this.cases.size;
  }

  getName(id: string): string | undefined {
    return this.cases.get(id)?.name;
  }

  getStatus(id: string): TestStatus | undefined {
    return this.cases.get(id)?.status;
  }

  getDuration(id: string): number {
    return this.cases.get(id)?.duration ?? 0;
  }

  getStartTime(id: string): number {
    return this.cases.get(id)?.startTime ?? 0;
  }

  getEndTime(id: string): number {
    return this.cases.get(id)?.endTime ?? 0;
  }

  getHistory(id: string): TestStatus[] {
    return [...(this.cases.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.cases.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.cases.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.cases.get(id)?.status === 'pending';
  }

  isRunning(id: string): boolean {
    return this.cases.get(id)?.status === 'running';
  }

  isPassed(id: string): boolean {
    return this.cases.get(id)?.status === 'passed';
  }

  isFailed(id: string): boolean {
    return this.cases.get(id)?.status === 'failed';
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.cases.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const t = this.cases.get(id);
    if (!t) return false;
    t.name = name;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.cases.values()) {
      t.status = 'pending';
      t.duration = 0;
      t.startTime = 0;
      t.endTime = 0;
      t.hits = 0;
      t.history = ['pending'];
      t.active = true;
    }
  }

  getByStatus(status: TestStatus): TestCase[] {
    return Array.from(this.cases.values()).filter(t => t.status === status);
  }

  getPendingCases(): TestCase[] {
    return Array.from(this.cases.values()).filter(t => t.status === 'pending');
  }

  getRunningCases(): TestCase[] {
    return Array.from(this.cases.values()).filter(t => t.status === 'running');
  }

  getPassedCases(): TestCase[] {
    return Array.from(this.cases.values()).filter(t => t.status === 'passed');
  }

  getFailedCases(): TestCase[] {
    return Array.from(this.cases.values()).filter(t => t.status === 'failed');
  }

  getActiveCases(): TestCase[] {
    return Array.from(this.cases.values()).filter(t => t.active);
  }

  getInactiveCases(): TestCase[] {
    return Array.from(this.cases.values()).filter(t => !t.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.cases.values()).map(t => t.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByName(name: string): TestCase[] {
    return Array.from(this.cases.values()).filter(t => t.name === name);
  }

  getNewest(): TestCase | null {
    const all = Array.from(this.cases.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): TestCase | null {
    const all = Array.from(this.cases.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.cases.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.cases.get(id)?.updated ?? 0;
  }

  getTotalDuration(): number {
    return Array.from(this.cases.values()).reduce((s, t) => s + t.duration, 0);
  }

  clearAll(): void {
    this.cases.clear();
    this.counter = 0;
  }
}

export default TestHelperEngine;