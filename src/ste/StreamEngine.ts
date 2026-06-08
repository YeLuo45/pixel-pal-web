/**
 * Stream Engine
 * thunderbolt-design Stream Engine - Create + Write + Flush + Stats
 */

export type StreamMode = 'idle' | 'writing' | 'flushing' | 'closed' | 'error';

export interface StreamEntry {
  id: string;
  name: string;
  mode: StreamMode;
  written: number;
  flushed: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SteStats {
  streams: number;
  totalAdded: number;
  totalWritten: number;
  totalFlushed: number;
  idle: number;
  writing: number;
  flushing: number;
  closed: number;
  error: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalWrittenSum: number;
  totalFlushedSum: number;
  avgWritten: number;
}

export class StreamEngine {
  private streams: Map<string, StreamEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalWritten = 0;
  private totalFlushed = 0;

  create(name: string): string {
    const id = `ste-${++this.counter}`;
    this.streams.set(id, {
      id,
      name,
      mode: 'idle',
      written: 0,
      flushed: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  write(id: string, bytes: number): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (s.mode === 'closed' || s.mode === 'error') return false;
    s.written += Math.max(0, bytes);
    s.mode = 'writing';
    s.updated = Date.now();
    s.hits++;
    this.totalWritten += Math.max(0, bytes);
    return true;
  }

  flush(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (s.mode === 'closed') return false;
    s.flushed += s.written;
    s.written = 0;
    s.mode = 'flushing';
    s.updated = Date.now();
    s.hits++;
    this.totalFlushed += s.flushed;
    return true;
  }

  close(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.mode = 'closed';
    s.updated = Date.now();
    return true;
  }

  fail(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.mode = 'error';
    s.updated = Date.now();
    return true;
  }

  reset(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.mode = 'idle';
    s.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.streams.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setMode(id: string, mode: StreamMode): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.mode = mode;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.streams.values()) {
      s.mode = 'idle';
      s.written = 0;
      s.flushed = 0;
      s.active = true;
      s.hits = 0;
    }
    this.totalAdded = 0;
    this.totalWritten = 0;
    this.totalFlushed = 0;
  }

  getStats(): SteStats {
    const all = Array.from(this.streams.values());
    return {
      streams: all.length,
      totalAdded: this.totalAdded,
      idle: all.filter(s => s.mode === 'idle').length,
      writing: all.filter(s => s.mode === 'writing').length,
      flushing: all.filter(s => s.mode === 'flushing').length,
      closed: all.filter(s => s.mode === 'closed').length,
      error: all.filter(s => s.mode === 'error').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      totalWrittenSum: all.reduce((s, x) => s + x.written, 0),
      totalFlushedSum: all.reduce((s, x) => s + x.flushed, 0),
      avgWritten: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.written, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getStream(id: string): StreamEntry | undefined {
    return this.streams.get(id);
  }

  getAllStreams(): StreamEntry[] {
    return Array.from(this.streams.values());
  }

  hasStream(id: string): boolean {
    return this.streams.has(id);
  }

  getCount(): number {
    return this.streams.size;
  }

  getName(id: string): string | undefined {
    return this.streams.get(id)?.name;
  }

  getMode(id: string): StreamMode | undefined {
    return this.streams.get(id)?.mode;
  }

  getWritten(id: string): number {
    return this.streams.get(id)?.written ?? 0;
  }

  getFlushed(id: string): number {
    return this.streams.get(id)?.flushed ?? 0;
  }

  getHits(id: string): number {
    return this.streams.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.streams.get(id)?.active ?? false;
  }

  isIdle(id: string): boolean {
    return this.streams.get(id)?.mode === 'idle';
  }

  isWriting(id: string): boolean {
    return this.streams.get(id)?.mode === 'writing';
  }

  isFlushing(id: string): boolean {
    return this.streams.get(id)?.mode === 'flushing';
  }

  isClosed(id: string): boolean {
    return this.streams.get(id)?.mode === 'closed';
  }

  isError(id: string): boolean {
    return this.streams.get(id)?.mode === 'error';
  }

  getByMode(mode: StreamMode): StreamEntry[] {
    return Array.from(this.streams.values()).filter(s => s.mode === mode);
  }

  getActiveStreams(): StreamEntry[] {
    return Array.from(this.streams.values()).filter(s => s.active);
  }

  getInactiveStreams(): StreamEntry[] {
    return Array.from(this.streams.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.streams.values()).map(s => s.name))];
  }

  getNewest(): StreamEntry | null {
    const all = Array.from(this.streams.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): StreamEntry | null {
    const all = Array.from(this.streams.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.streams.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.streams.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalWritten(): number {
    return this.totalWritten;
  }

  getTotalFlushed(): number {
    return this.totalFlushed;
  }

  clearAll(): void {
    this.streams.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalWritten = 0;
    this.totalFlushed = 0;
  }
}

export default StreamEngine;