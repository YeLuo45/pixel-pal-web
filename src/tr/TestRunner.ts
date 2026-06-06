/**
 * Test Runner
 * claude-code-design Test Runner - Register + Run + Stats
 */

export type TestStatus = 'pending' | 'running' | 'passed' | 'failed';

export interface TestCase {
  id: string;
  name: string;
  passed: boolean;
  duration: number;
  status: TestStatus;
  created: number;
  updated: number;
  runs: number;
  history: TestStatus[];
  active: boolean;
  error?: string;
}

export interface TRStats {
  tests: number;
  passed: number;
  failed: number;
  pending: number;
  running: number;
  totalRuns: number;
  avgDuration: number;
  totalDuration: number;
  active: number;
  inactive: number;
  passRate: number;
}

export class TestRunner {
  private tests: Map<string, TestCase> = new Map();
  private counter = 0;

  register(name: string): string {
    const id = `tr-${++this.counter}`;
    this.tests.set(id, {
      id,
      name,
      passed: false,
      duration: 0,
      status: 'pending',
      created: Date.now(),
      updated: Date.now(),
      runs: 0,
      history: ['pending'],
      active: true,
    });
    return id;
  }

  run(id: string, passes: boolean, duration: number = 0, error?: string): boolean {
    const t = this.tests.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.runs++;
    t.passed = passes;
    t.duration += duration;
    t.status = passes ? 'passed' : 'failed';
    t.error = error;
    t.history.push(t.status);
    t.updated = Date.now();
    return true;
  }

  start(id: string): boolean {
    const t = this.tests.get(id);
    if (!t) return false;
    t.status = 'running';
    t.updated = Date.now();
    return true;
  }

  getStats(): TRStats {
    const all = Array.from(this.tests.values());
    const totalDuration = all.reduce((s, t) => s + t.duration, 0);
    const passed = all.filter(t => t.passed).length;
    return {
      tests: all.length,
      passed,
      failed: all.filter(t => !t.passed && t.runs > 0).length,
      pending: all.filter(t => t.status === 'pending').length,
      running: all.filter(t => t.status === 'running').length,
      totalRuns: all.reduce((s, t) => s + t.runs, 0),
      avgDuration: all.length > 0 ? Math.round((totalDuration / all.length) * 100) / 100 : 0,
      totalDuration,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      passRate: all.length > 0 ? Math.round((passed / all.length) * 100) / 100 : 0,
    };
  }

  getTest(id: string): TestCase | undefined {
    return this.tests.get(id);
  }

  getAllTests(): TestCase[] {
    return Array.from(this.tests.values());
  }

  removeTest(id: string): boolean {
    return this.tests.delete(id);
  }

  hasTest(id: string): boolean {
    return this.tests.has(id);
  }

  getCount(): number {
    return this.tests.size;
  }

  getName(id: string): string | undefined {
    return this.tests.get(id)?.name;
  }

  getStatus(id: string): TestStatus | undefined {
    return this.tests.get(id)?.status;
  }

  getDuration(id: string): number {
    return this.tests.get(id)?.duration ?? 0;
  }

  getRuns(id: string): number {
    return this.tests.get(id)?.runs ?? 0;
  }

  getHistory(id: string): TestStatus[] {
    return [...(this.tests.get(id)?.history ?? [])];
  }

  getError(id: string): string | undefined {
    return this.tests.get(id)?.error;
  }

  isPassed(id: string): boolean {
    return this.tests.get(id)?.passed ?? false;
  }

  isFailed(id: string): boolean {
    const t = this.tests.get(id);
    return t ? !t.passed && t.runs > 0 : false;
  }

  isPending(id: string): boolean {
    return this.tests.get(id)?.status === 'pending';
  }

  isRunning(id: string): boolean {
    return this.tests.get(id)?.status === 'running';
  }

  isActive(id: string): boolean {
    return this.tests.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.tests.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const t = this.tests.get(id);
    if (!t) return false;
    t.name = name;
    t.updated = Date.now();
    return true;
  }

  resetRuns(id: string): boolean {
    const t = this.tests.get(id);
    if (!t) return false;
    t.runs = 0;
    t.passed = false;
    t.duration = 0;
    t.status = 'pending';
    t.history = ['pending'];
    t.error = undefined;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.tests.values()) {
      t.runs = 0;
      t.passed = false;
      t.duration = 0;
      t.status = 'pending';
      t.history = ['pending'];
      t.error = undefined;
      t.active = true;
    }
  }

  getByName(name: string): TestCase[] {
    return Array.from(this.tests.values()).filter(t => t.name === name);
  }

  getByStatus(status: TestStatus): TestCase[] {
    return Array.from(this.tests.values()).filter(t => t.status === status);
  }

  getPassedTests(): TestCase[] {
    return Array.from(this.tests.values()).filter(t => t.passed);
  }

  getFailedTests(): TestCase[] {
    return Array.from(this.tests.values()).filter(t => !t.passed && t.runs > 0);
  }

  getPendingTests(): TestCase[] {
    return this.getByStatus('pending');
  }

  getRunningTests(): TestCase[] {
    return this.getByStatus('running');
  }

  getActiveTests(): TestCase[] {
    return Array.from(this.tests.values()).filter(t => t.active);
  }

  getInactiveTests(): TestCase[] {
    return Array.from(this.tests.values()).filter(t => !t.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.tests.values()).map(t => t.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinDuration(min: number): TestCase[] {
    return Array.from(this.tests.values()).filter(t => t.duration >= min);
  }

  getMostRuns(): TestCase | null {
    const all = Array.from(this.tests.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.runs > max.runs ? t : max);
  }

  getNewest(): TestCase | null {
    const all = Array.from(this.tests.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): TestCase | null {
    const all = Array.from(this.tests.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.tests.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.tests.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.tests.clear();
    this.counter = 0;
  }
}

export default TestRunner;