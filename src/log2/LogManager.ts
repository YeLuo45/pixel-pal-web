/**
 * Log Manager
 * claude-code-design Log Manager - Log + Query + Clear + Stats
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  source: string;
  timestamp: number;
}

export interface LogFilter {
  level?: LogLevel;
  source?: string;
  since?: number;
  until?: number;
}

export interface LogStats {
  entries: number;
  byLevel: Record<LogLevel, number>;
  sources: number;
  oldest: number;
  newest: number;
}

export class LogManager {
  private entries: Map<string, LogEntry> = new Map();
  private counter = 0;
  private maxEntries: number;

  constructor(maxEntries: number = 10000) {
    this.maxEntries = maxEntries;
  }

  log(level: LogLevel, message: string, source: string = ''): string {
    const id = `log-${++this.counter}`;
    this.entries.set(id, {
      id,
      level,
      message,
      source,
      timestamp: Date.now(),
    });
    if (this.entries.size > this.maxEntries) {
      const oldest = Array.from(this.entries.values()).sort((a, b) => a.timestamp - b.timestamp)[0];
      this.entries.delete(oldest.id);
    }
    return id;
  }

  query(filter: LogFilter = {}): LogEntry[] {
    let results = Array.from(this.entries.values());
    if (filter.level) results = results.filter(e => e.level === filter.level);
    if (filter.source) results = results.filter(e => e.source === filter.source);
    if (filter.since !== undefined) results = results.filter(e => e.timestamp >= filter.since!);
    if (filter.until !== undefined) results = results.filter(e => e.timestamp <= filter.until!);
    return results.sort((a, b) => a.timestamp - b.timestamp);
  }

  clear(): number {
    const count = this.entries.size;
    this.entries.clear();
    return count;
  }

  getStats(): LogStats {
    const all = Array.from(this.entries.values());
    return {
      entries: all.length,
      byLevel: {
        debug: all.filter(e => e.level === 'debug').length,
        info: all.filter(e => e.level === 'info').length,
        warn: all.filter(e => e.level === 'warn').length,
        error: all.filter(e => e.level === 'error').length,
      },
      sources: new Set(all.map(e => e.source)).size,
      oldest: all.length > 0 ? Math.min(...all.map(e => e.timestamp)) : 0,
      newest: all.length > 0 ? Math.max(...all.map(e => e.timestamp)) : 0,
    };
  }

  getEntry(id: string): LogEntry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): LogEntry[] {
    return Array.from(this.entries.values());
  }

  removeEntry(id: string): boolean {
    return this.entries.delete(id);
  }

  hasEntry(id: string): boolean {
    return this.entries.has(id);
  }

  getCount(): number {
    return this.entries.size;
  }

  getMaxEntries(): number {
    return this.maxEntries;
  }

  getLevel(id: string): LogLevel | undefined {
    return this.entries.get(id)?.level;
  }

  getMessage(id: string): string | undefined {
    return this.entries.get(id)?.message;
  }

  getSource(id: string): string | undefined {
    return this.entries.get(id)?.source;
  }

  getTimestamp(id: string): number {
    return this.entries.get(id)?.timestamp ?? 0;
  }

  getByLevel(level: LogLevel): LogEntry[] {
    return this.query({ level });
  }

  getBySource(source: string): LogEntry[] {
    return this.query({ source });
  }

  getByLevelCount(level: LogLevel): number {
    return this.getByLevel(level).length;
  }

  getBySourceCount(source: string): number {
    return this.getBySource(source).length;
  }

  getAllSources(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.source))];
  }

  getSourceCount(): number {
    return this.getAllSources().length;
  }

  getByTimeRange(since: number, until: number): LogEntry[] {
    return this.query({ since, until });
  }

  clearByLevel(level: LogLevel): number {
    let count = 0;
    for (const [id, e] of this.entries) {
      if (e.level === level) {
        this.entries.delete(id);
        count++;
      }
    }
    return count;
  }

  clearBySource(source: string): number {
    let count = 0;
    for (const [id, e] of this.entries) {
      if (e.source === source) {
        this.entries.delete(id);
        count++;
      }
    }
    return count;
  }

  getNewest(): LogEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.timestamp > max.timestamp ? e : max);
  }

  getOldest(): LogEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.timestamp < min.timestamp ? e : min);
  }

  getNewestByLevel(level: LogLevel): LogEntry | null {
    const filtered = this.getByLevel(level);
    if (filtered.length === 0) return null;
    return filtered.reduce((max, e) => e.timestamp > max.timestamp ? e : max);
  }

  getOldestByLevel(level: LogLevel): LogEntry | null {
    const filtered = this.getByLevel(level);
    if (filtered.length === 0) return null;
    return filtered.reduce((min, e) => e.timestamp < min.timestamp ? e : min);
  }

  getCountByLevel(level: LogLevel): number {
    return this.entries ? Array.from(this.entries.values()).filter(e => e.level === level).length : 0;
  }
}

export default LogManager;