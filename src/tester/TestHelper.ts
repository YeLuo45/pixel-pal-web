/**
 * Test Helper
 * claude-code-design Test Helper - Generate + Run + Report + Snapshot
 */

export type TestResult = 'pass' | 'fail' | 'skip';

export interface TestCase {
  name: string;
  input: unknown;
  expected: unknown;
  result: TestResult;
  duration: number;
  error?: string;
}

export interface TestReport {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

export class TestHelper {
  private tests: TestCase[] = [];
  private snapshots: Map<string, string> = new Map();
  private startTime: number = Date.now();

  run(test: TestCase): TestCase {
    const start = Date.now();
    const t: TestCase = { ...test, duration: 0 };
    try {
      if (this.deepEqual(t.input, t.expected)) {
        t.result = 'pass';
      } else {
        t.result = 'fail';
        t.error = `Expected ${JSON.stringify(t.expected)} but got ${JSON.stringify(t.input)}`;
      }
    } catch (e) {
      t.result = 'fail';
      t.error = String(e);
    }
    t.duration = Date.now() - start;
    this.tests.push(t);
    return t;
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null) return a === b;
    if (typeof a !== typeof b) return false;
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      if (Array.isArray(a)) {
        if (a.length !== (b as unknown[]).length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!this.deepEqual(a[i], (b as unknown[])[i])) return false;
        }
        return true;
      }
      const aKeys = Object.keys(a as object);
      const bKeys = Object.keys(b as object);
      if (aKeys.length !== bKeys.length) return false;
      for (const key of aKeys) {
        if (!this.deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
      }
      return true;
    }
    return false;
  }

  assertEqual<T>(actual: T, expected: T): boolean {
    return this.deepEqual(actual, expected);
  }

  assertNotEqual<T>(actual: T, expected: T): boolean {
    return !this.deepEqual(actual, expected);
  }

  assertTrue(value: boolean): boolean {
    return value === true;
  }

  assertFalse(value: boolean): boolean {
    return value === false;
  }

  assertNull(value: unknown): boolean {
    return value === null;
  }

  assertNotNull(value: unknown): boolean {
    return value !== null;
  }

  assertUndefined(value: unknown): boolean {
    return value === undefined;
  }

  assertDefined(value: unknown): boolean {
    return value !== undefined;
  }

  snapshot(value: unknown): string {
    const hash = this.computeHash(value);
    this.snapshots.set(hash, JSON.stringify(value));
    return hash;
  }

  private computeHash(value: unknown): string {
    const str = JSON.stringify(value);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  matchesSnapshot(value: unknown): boolean {
    const hash = this.computeHash(value);
    return this.snapshots.has(hash);
  }

  getSnapshotCount(): number {
    return this.snapshots.size;
  }

  clearSnapshots(): void {
    this.snapshots.clear();
  }

  getReport(): TestReport {
    const passed = this.tests.filter(t => t.result === 'pass').length;
    const failed = this.tests.filter(t => t.result === 'fail').length;
    const skipped = this.tests.filter(t => t.result === 'skip').length;
    return {
      total: this.tests.length,
      passed,
      failed,
      skipped,
      duration: Date.now() - this.startTime,
    };
  }

  getAllTests(): TestCase[] {
    return [...this.tests];
  }

  getPassedTests(): TestCase[] {
    return this.tests.filter(t => t.result === 'pass');
  }

  getFailedTests(): TestCase[] {
    return this.tests.filter(t => t.result === 'fail');
  }

  getSkippedTests(): TestCase[] {
    return this.tests.filter(t => t.result === 'skip');
  }

  getTestByName(name: string): TestCase | undefined {
    return this.tests.find(t => t.name === name);
  }

  skip(name: string): boolean {
    this.tests.push({ name, input: undefined, expected: undefined, result: 'skip', duration: 0 });
    return true;
  }

  getPassRate(): number {
    if (this.tests.length === 0) return 0;
    return Math.round((this.getPassedTests().length / this.tests.length) * 100) / 100;
  }

  getTotalDuration(): number {
    return this.tests.reduce((sum, t) => sum + t.duration, 0);
  }

  hasFailures(): boolean {
    return this.getFailedTests().length > 0;
  }

  hasPassed(): boolean {
    return this.getPassedTests().length > 0;
  }

  clearAll(): void {
    this.tests = [];
    this.snapshots.clear();
    this.startTime = Date.now();
  }
}

export default TestHelper;