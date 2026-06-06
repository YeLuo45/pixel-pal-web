/**
 * Failure Manager
 * thunderbolt-design Failure Manager - Record + Resolve + Stats
 */

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Failure {
  id: string;
  message: string;
  severity: Severity;
  resolved: boolean;
  resolvedAt: number;
  created: number;
  hits: number;
  source: string;
  category: string;
}

export interface FMStats {
  failures: number;
  resolved: number;
  unresolved: number;
  bySeverity: Record<Severity, number>;
  totalHits: number;
  avgHits: number;
}

export class FailureManager {
  private failures: Map<string, Failure> = new Map();
  private counter = 0;

  record(message: string, severity: Severity = 'medium', source: string = '', category: string = ''): string {
    const id = `fm-${++this.counter}`;
    this.failures.set(id, {
      id,
      message,
      severity,
      resolved: false,
      resolvedAt: 0,
      created: Date.now(),
      hits: 0,
      source,
      category,
    });
    return id;
  }

  resolve(id: string): boolean {
    const f = this.failures.get(id);
    if (!f) return false;
    if (f.resolved) return false;
    f.resolved = true;
    f.resolvedAt = Date.now();
    return true;
  }

  getStats(): FMStats {
    const all = Array.from(this.failures.values());
    return {
      failures: all.length,
      resolved: all.filter(f => f.resolved).length,
      unresolved: all.filter(f => !f.resolved).length,
      bySeverity: {
        low: all.filter(f => f.severity === 'low').length,
        medium: all.filter(f => f.severity === 'medium').length,
        high: all.filter(f => f.severity === 'high').length,
        critical: all.filter(f => f.severity === 'critical').length,
      },
      totalHits: all.reduce((s, f) => s + f.hits, 0),
      avgHits: all.length > 0 ? Math.round((all.reduce((s, f) => s + f.hits, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getFailure(id: string): Failure | undefined {
    return this.failures.get(id);
  }

  getAllFailures(): Failure[] {
    return Array.from(this.failures.values());
  }

  removeFailure(id: string): boolean {
    return this.failures.delete(id);
  }

  hasFailure(id: string): boolean {
    return this.failures.has(id);
  }

  getCount(): number {
    return this.failures.size;
  }

  getMessage(id: string): string | undefined {
    return this.failures.get(id)?.message;
  }

  getSeverity(id: string): Severity | undefined {
    return this.failures.get(id)?.severity;
  }

  getSource(id: string): string | undefined {
    return this.failures.get(id)?.source;
  }

  getCategory(id: string): string | undefined {
    return this.failures.get(id)?.category;
  }

  getHits(id: string): number {
    return this.failures.get(id)?.hits ?? 0;
  }

  isResolved(id: string): boolean {
    return this.failures.get(id)?.resolved ?? false;
  }

  incrementHits(id: string): boolean {
    const f = this.failures.get(id);
    if (!f) return false;
    f.hits++;
    return true;
  }

  setMessage(id: string, message: string): boolean {
    const f = this.failures.get(id);
    if (!f) return false;
    f.message = message;
    return true;
  }

  setSeverity(id: string, severity: Severity): boolean {
    const f = this.failures.get(id);
    if (!f) return false;
    f.severity = severity;
    return true;
  }

  setCategory(id: string, category: string): boolean {
    const f = this.failures.get(id);
    if (!f) return false;
    f.category = category;
    return true;
  }

  reopen(id: string): boolean {
    const f = this.failures.get(id);
    if (!f) return false;
    if (!f.resolved) return false;
    f.resolved = false;
    f.resolvedAt = 0;
    return true;
  }

  resetHits(): void {
    for (const f of this.failures.values()) f.hits = 0;
  }

  resetAll(): void {
    for (const f of this.failures.values()) {
      f.hits = 0;
      f.resolved = false;
      f.resolvedAt = 0;
    }
  }

  getResolvedFailures(): Failure[] {
    return Array.from(this.failures.values()).filter(f => f.resolved);
  }

  getUnresolvedFailures(): Failure[] {
    return Array.from(this.failures.values()).filter(f => !f.resolved);
  }

  getBySeverity(severity: Severity): Failure[] {
    return Array.from(this.failures.values()).filter(f => f.severity === severity);
  }

  getBySource(source: string): Failure[] {
    return Array.from(this.failures.values()).filter(f => f.source === source);
  }

  getByCategory(category: string): Failure[] {
    return Array.from(this.failures.values()).filter(f => f.category === category);
  }

  getAllSeverities(): Severity[] {
    return [...new Set(Array.from(this.failures.values()).map(f => f.severity))];
  }

  getAllSources(): string[] {
    return [...new Set(Array.from(this.failures.values()).map(f => f.source))];
  }

  getAllCategories(): string[] {
    return [...new Set(Array.from(this.failures.values()).map(f => f.category))];
  }

  getMostHit(): Failure | null {
    const all = Array.from(this.failures.values());
    if (all.length === 0) return null;
    return all.reduce((max, f) => f.hits > max.hits ? f : max);
  }

  getNewest(): Failure | null {
    const all = Array.from(this.failures.values());
    if (all.length === 0) return null;
    return all.reduce((max, f) => f.created > max.created ? f : max);
  }

  getOldest(): Failure | null {
    const all = Array.from(this.failures.values());
    if (all.length === 0) return null;
    return all.reduce((min, f) => f.created < min.created ? f : min);
  }

  getCreatedAt(id: string): number {
    return this.failures.get(id)?.created ?? 0;
  }

  getResolvedAt(id: string): number {
    return this.failures.get(id)?.resolvedAt ?? 0;
  }

  clearAll(): void {
    this.failures.clear();
    this.counter = 0;
  }
}

export default FailureManager;