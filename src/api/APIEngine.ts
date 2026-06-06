/**
 * API Engine
 * nanobot-design API Engine - Register + Call + Stats
 */

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface API {
  id: string;
  path: string;
  method: Method;
  calls: number;
  errors: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: boolean[];
}

export interface APIStats {
  apis: number;
  totalCalls: number;
  totalErrors: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniquePaths: number;
  avgCalls: number;
  errorRate: number;
  getCount: number;
  postCount: number;
  putCount: number;
  deleteCount: number;
}

export class APIEngine {
  private apis: Map<string, API> = new Map();
  private counter = 0;
  private totalCalls = 0;
  private totalErrors = 0;

  register(path: string, method: Method = 'GET'): string {
    const id = `api-${++this.counter}`;
    this.apis.set(id, {
      id,
      path,
      method,
      calls: 0,
      errors: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  call(id: string, success: boolean = true): boolean {
    const a = this.apis.get(id);
    if (!a) return false;
    if (!a.active) return false;
    a.calls++;
    a.history.push(success);
    a.updated = Date.now();
    a.hits++;
    this.totalCalls++;
    if (!success) {
      a.errors++;
      this.totalErrors++;
    }
    return true;
  }

  getStats(): APIStats {
    const all = Array.from(this.apis.values());
    return {
      apis: all.length,
      totalCalls: this.totalCalls,
      totalErrors: this.totalErrors,
      active: all.filter(a => a.active).length,
      inactive: all.filter(a => !a.active).length,
      totalHits: all.reduce((s, a) => s + a.hits, 0),
      uniquePaths: new Set(all.map(a => a.path)).size,
      avgCalls: all.length > 0 ? Math.round((all.reduce((s, a) => s + a.calls, 0) / all.length) * 100) / 100 : 0,
      errorRate: this.totalCalls > 0 ? Math.round((this.totalErrors / this.totalCalls) * 100) / 100 : 0,
      getCount: all.filter(a => a.method === 'GET').length,
      postCount: all.filter(a => a.method === 'POST').length,
      putCount: all.filter(a => a.method === 'PUT').length,
      deleteCount: all.filter(a => a.method === 'DELETE').length,
    };
  }

  getAPI(id: string): API | undefined {
    return this.apis.get(id);
  }

  getAllAPIs(): API[] {
    return Array.from(this.apis.values());
  }

  removeAPI(id: string): boolean {
    return this.apis.delete(id);
  }

  hasAPI(id: string): boolean {
    return this.apis.has(id);
  }

  getCount(): number {
    return this.apis.size;
  }

  getPath(id: string): string | undefined {
    return this.apis.get(id)?.path;
  }

  getMethod(id: string): Method | undefined {
    return this.apis.get(id)?.method;
  }

  getCalls(id: string): number {
    return this.apis.get(id)?.calls ?? 0;
  }

  getErrors(id: string): number {
    return this.apis.get(id)?.errors ?? 0;
  }

  getHistory(id: string): boolean[] {
    return [...(this.apis.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.apis.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.apis.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const a = this.apis.get(id);
    if (!a) return false;
    a.active = active;
    a.updated = Date.now();
    return true;
  }

  setPath(id: string, path: string): boolean {
    const a = this.apis.get(id);
    if (!a) return false;
    a.path = path;
    a.updated = Date.now();
    return true;
  }

  setMethod(id: string, method: Method): boolean {
    const a = this.apis.get(id);
    if (!a) return false;
    a.method = method;
    a.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const a of this.apis.values()) {
      a.calls = 0;
      a.errors = 0;
      a.hits = 0;
      a.history = [];
      a.active = true;
    }
    this.totalCalls = 0;
    this.totalErrors = 0;
  }

  getByPath(path: string): API[] {
    return Array.from(this.apis.values()).filter(a => a.path === path);
  }

  getByMethod(method: Method): API[] {
    return Array.from(this.apis.values()).filter(a => a.method === method);
  }

  getActiveAPIs(): API[] {
    return Array.from(this.apis.values()).filter(a => a.active);
  }

  getInactiveAPIs(): API[] {
    return Array.from(this.apis.values()).filter(a => !a.active);
  }

  getAllPaths(): string[] {
    return [...new Set(Array.from(this.apis.values()).map(a => a.path))];
  }

  getPathCount(): number {
    return this.getAllPaths().length;
  }

  getByMinCalls(min: number): API[] {
    return Array.from(this.apis.values()).filter(a => a.calls >= min);
  }

  getMostCalls(): API | null {
    const all = Array.from(this.apis.values());
    if (all.length === 0) return null;
    return all.reduce((max, a) => a.calls > max.calls ? a : max);
  }

  getNewest(): API | null {
    const all = Array.from(this.apis.values());
    if (all.length === 0) return null;
    return all.reduce((max, a) => a.created > max.created ? a : max);
  }

  getOldest(): API | null {
    const all = Array.from(this.apis.values());
    if (all.length === 0) return null;
    return all.reduce((min, a) => a.created < min.created ? a : min);
  }

  getCreatedAt(id: string): number {
    return this.apis.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.apis.get(id)?.updated ?? 0;
  }

  getTotalCalls(): number {
    return this.totalCalls;
  }

  getTotalErrors(): number {
    return this.totalErrors;
  }

  clearAll(): void {
    this.apis.clear();
    this.counter = 0;
    this.totalCalls = 0;
    this.totalErrors = 0;
  }
}

export default APIEngine;