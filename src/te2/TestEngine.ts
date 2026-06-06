/**
 * Test Engine
 * claude-code-design Test Engine - Define + Run + Stats
 */

export interface TestCase {
  id: string;
  suite: string;
  name: string;
  passed: boolean;
  duration: number;
  run: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

export interface TE2Stats {
  tests: number;
  suites: number;
  passed: number;
  failed: number;
  active: number;
  inactive: number;
  totalDuration: number;
  avgDuration: number;
  totalHits: number;
  passRate: number;
}

export class TestEngine {
  private tests: Map<string, TestCase> = new Map();
  private counter = 0;

  define(suite: string, name: string): string {
    const id = `te2-${++this.counter}`;
    this.tests.set(id, {
      id,
      suite,
      name,
      passed: false,
      duration: 0,
      run: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
    });
    return id;
  }

  run(id: string, passed: boolean, duration: number = 0): boolean {
    const t = this.tests.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.passed = passed;
    t.duration = duration;
    t.run = true;
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  reset(id: string): boolean {
    const t = this.tests.get(id);
    if (!t) return false;
    t.passed = false;
    t.duration = 0;
    t.run = false;
    t.updated = Date.now();
    return true;
  }

  getStats(): TE2Stats {
    const all = Array.from(this.tests.values());
    const run = all.filter(t => t.run);
    return {
      tests: all.length,
      suites: new Set(all.map(t => t.suite)).size,
      passed: all.filter(t => t.passed).length,
      failed: run.filter(t => !t.passed).length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalDuration: all.reduce((s, t) => s + t.duration, 0),
      avgDuration: all.length > 0 ? Math.round((all.reduce((s, t) => s + t.duration, 0) / all.length) * 100) / 100 : 0,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      passRate: run.length > 0 ? Math.round((all.filter(t => t.passed).length / run.length) * 100) / 100 : 0,
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

  getSuite(id: string): string | undefined {
    return this.tests.get(id)?.suite;
  }

  getName(id: string): string | undefined {
    return this.tests.get(id)?.name;
  }

  getDuration(id: string): number {
    return this.tests.get(id)?.duration ?? 0;
  }

  getHits(id: string): number {
    return this.tests.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.tests.get(id)?.active ?? false;
  }

  isPassed(id: string): boolean {
    return this.tests.get(id)?.passed ?? false;
  }

  isFailed(id: string): boolean {
    const t = this.tests.get(id);
    return t ? t.run && !t.passed : false;
  }

  isRun(id: string): boolean {
    return this.tests.get(id)?.run ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.tests.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setSuite(id: string, suite: string): boolean {
    const t = this.tests.get(id);
    if (!t) return false;
    t.suite = suite;
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

  resetAll(): void {
    for (const t of this.tests.values()) {
      t.passed = false;
      t.duration = 0;
      t.run = false;
      t.hits = 0;
      t.active = true;
    }
  }

  getBySuite(suite: string): TestCase[] {
    return Array.from(this.tests.values()).filter(t => t.suite === suite);
  }

  getPassedTests(): TestCase[] {
    return Array.from(this.tests.values()).filter(t => t.passed);
  }

  getFailedTests(): TestCase[] {
    return Array.from(this.tests.values()).filter(t => t.run && !t.passed);
  }

  getRunTests(): TestCase[] {
    return Array.from(this.tests.values()).filter(t => t.run);
  }

  getActiveTests(): TestCase[] {
    return Array.from(this.tests.values()).filter(t => t.active);
  }

  getInactiveTests(): TestCase[] {
    return Array.from(this.tests.values()).filter(t => !t.active);
  }

  getAllSuites(): string[] {
    return [...new Set(Array.from(this.tests.values()).map(t => t.suite))];
  }

  getSuiteCount(): number {
    return this.getAllSuites().length;
  }

  getByMinDuration(min: number): TestCase[] {
    return Array.from(this.tests.values()).filter(t => t.duration >= min);
  }

  getMostDuration(): TestCase | null {
    const all = Array.from(this.tests.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.duration > max.duration ? t : max);
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

export default TestEngine;