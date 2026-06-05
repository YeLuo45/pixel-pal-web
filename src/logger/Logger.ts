/**
 * Logger
 * claude-code-design Logger - Level + Format + Filter + Export
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  private entries: LogEntry[] = [];
  private level: LogLevel = 'info';

  log(entry: Omit<LogEntry, 'timestamp'>): void {
    if (LEVEL_PRIORITY[entry.level] < LEVEL_PRIORITY[this.level]) return;
    this.entries.push({ ...entry, timestamp: Date.now() });
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  filter(level: LogLevel): LogEntry[] {
    return this.entries.filter(e => e.level === level);
  }

  export(format: 'json' | 'text'): string {
    if (format === 'json') {
      return JSON.stringify(this.entries, null, 2);
    }
    return this.entries.map(e => `[${e.level.toUpperCase()}] ${e.message}`).join('\n');
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log({ level: 'debug', message, ...(context ? { context } : {}) });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log({ level: 'info', message, ...(context ? { context } : {}) });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log({ level: 'warn', message, ...(context ? { context } : {}) });
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log({ level: 'error', message, ...(context ? { context } : {}) });
  }

  getCount(): number {
    return this.entries.length;
  }

  clear(): void {
    this.entries = [];
  }

  clearAll(): void {
    this.entries = [];
    this.level = 'info';
  }

  getRecent(count: number): LogEntry[] {
    return this.entries.slice(-count);
  }

  getByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter(e => e.level === level);
  }

  getByLevelAndAbove(level: LogLevel): LogEntry[] {
    return this.entries.filter(e => LEVEL_PRIORITY[e.level] >= LEVEL_PRIORITY[level]);
  }

  getByMessage(query: string): LogEntry[] {
    const lower = query.toLowerCase();
    return this.entries.filter(e => e.message.toLowerCase().includes(lower));
  }

  getByContext(key: string, value: unknown): LogEntry[] {
    return this.entries.filter(e => e.context?.[key] === value);
  }

  hasLevel(level: LogLevel): boolean {
    return this.entries.some(e => e.level === level);
  }

  getFirst(): LogEntry | undefined {
    return this.entries[0];
  }

  getLast(): LogEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  getErrorCount(): number {
    return this.entries.filter(e => e.level === 'error').length;
  }

  getWarnCount(): number {
    return this.entries.filter(e => e.level === 'warn').length;
  }

  getInfoCount(): number {
    return this.entries.filter(e => e.level === 'info').length;
  }

  getDebugCount(): number {
    return this.entries.filter(e => e.level === 'debug').length;
  }
}

export default Logger;