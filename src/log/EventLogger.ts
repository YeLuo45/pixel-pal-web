/**
 * Event Logger
 * thunderbolt-design Event Logger - Log + Filter + Stats
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  source: string;
  timestamp: number;
  tag: string;
  context: string;
}

export interface LogStats {
  entries: number;
  errors: number;
  warnings: number;
  info: number;
  debug: number;
}

export class EventLogger {
  private entries: Map<string, LogEntry> = new Map();
  private counter = 0;
  private minLevel: LogLevel = 'debug';

  log(level: LogLevel, message: string, source: string): string {
    const id = `log-${++this.counter}`;
    this.entries.set(id, {
      id,
      level,
      message,
      source,
      timestamp: Date.now(),
      tag: '',
      context: '',
    });
    return id;
  }

  filter(level: LogLevel): LogEntry[] {
    return Array.from(this.entries.values()).filter(e => e.level === level);
  }

  getStats(): LogStats {
    const all = Array.from(this.entries.values());
    return {
      entries: all.length,
      errors: all.filter(e => e.level === 'error').length,
      warnings: all.filter(e => e.level === 'warn').length,
      info: all.filter(e => e.level === 'info').length,
      debug: all.filter(e => e.level === 'debug').length,
    };
  }

  info(message: string, source: string = ''): string {
    return this.log('info', message, source);
  }

  warn(message: string, source: string = ''): string {
    return this.log('warn', message, source);
  }

  error(message: string, source: string = ''): string {
    return this.log('error', message, source);
  }

  debug(message: string, source: string = ''): string {
    return this.log('debug', message, source);
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

  getMessage(id: string): string | undefined {
    return this.entries.get(id)?.message;
  }

  getLevel(id: string): LogLevel | undefined {
    return this.entries.get(id)?.level;
  }

  getSource(id: string): string | undefined {
    return this.entries.get(id)?.source;
  }

  getTimestamp(id: string): number {
    return this.entries.get(id)?.timestamp ?? 0;
  }

  getTag(id: string): string {
    return this.entries.get(id)?.tag ?? '';
  }

  setTag(id: string, tag: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.tag = tag;
    return true;
  }

  getContext(id: string): string {
    return this.entries.get(id)?.context ?? '';
  }

  setContext(id: string, context: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.context = context;
    return true;
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  getMinLevel(): LogLevel {
    return this.minLevel;
  }

  getByLevel(level: LogLevel): LogEntry[] {
    return this.filter(level);
  }

  getInfo(): LogEntry[] {
    return this.filter('info');
  }

  getWarnings(): LogEntry[] {
    return this.filter('warn');
  }

  getErrors(): LogEntry[] {
    return this.filter('error');
  }

  getDebugs(): LogEntry[] {
    return this.filter('debug');
  }

  getBySource(source: string): LogEntry[] {
    return Array.from(this.entries.values()).filter(e => e.source === source);
  }

  getByMessage(message: string): LogEntry[] {
    return Array.from(this.entries.values()).filter(e => e.message.includes(message));
  }

  getByTag(tag: string): LogEntry[] {
    return Array.from(this.entries.values()).filter(e => e.tag === tag);
  }

  getAllSources(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.source))];
  }

  getSourceCount(): number {
    return this.getAllSources().length;
  }

  getAllTags(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.tag))].filter(t => t !== '');
  }

  getTagCount(): number {
    return this.getAllTags().length;
  }

  getInTimeRange(start: number, end: number): LogEntry[] {
    return Array.from(this.entries.values()).filter(e => e.timestamp >= start && e.timestamp <= end);
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

  clearAll(): void {
    this.entries.clear();
    this.counter = 0;
  }
}

export default EventLogger;