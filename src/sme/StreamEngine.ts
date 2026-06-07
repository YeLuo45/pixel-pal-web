/**
 * Stream Engine
 * claude-code-design Stream Engine - Open + Write + Close + Stats
 */

export type StreamStatus = 'open' | 'closed' | 'paused';

export interface Stream {
  id: string;
  name: string;
  status: StreamStatus;
  bytes: number;
  chunks: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SmeStats {
  streams: number;
  totalOpened: number;
  totalClosed: number;
  totalPaused: number;
  totalBytes: number;
  open: number;
  closed: number;
  paused: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalBytes2: number;
  totalChunks: number;
  avgBytes: number;
  maxBytes: number;
  minBytes: number;
}

export class StreamEngine {
  private streams: Map<string, Stream> = new Map();
  private counter = 0;
  private totalOpened = 0;
  private totalClosed = 0;
  private totalPaused = 0;
  private totalBytes = 0;

  open(name: string): string {
    const id = `sme-${++this.counter}`;
    this.streams.set(id, {
      id,
      name,
      status: 'open',
      bytes: 0,
      chunks: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalOpened++;
    return id;
  }

  write(id: string, bytes: number): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    if (s.status !== 'open') return false;
    if (!s.active) return false;
    s.bytes += bytes;
    s.chunks++;
    s.updated = Date.now();
    s.hits++;
    this.totalBytes += bytes;
    return true;
  }

  close(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.status = 'closed';
    s.updated = Date.now();
    s.hits++;
    this.totalClosed++;
    return true;
  }

  pause(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    if (s.status !== 'open') return false;
    s.status = 'paused';
    s.updated = Date.now();
    s.hits++;
    this.totalPaused++;
    return true;
  }

  resume(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    if (s.status !== 'paused') return false;
    s.status = 'open';
    s.updated = Date.now();
    s.hits++;
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

  resetAll(): void {
    for (const s of this.streams.values()) {
      s.status = 'open';
      s.bytes = 0;
      s.chunks = 0;
      s.active = true;
      s.hits = 0;
    }
    this.totalOpened = 0;
    this.totalClosed = 0;
    this.totalPaused = 0;
    this.totalBytes = 0;
  }

  getStats(): SmeStats {
    const all = Array.from(this.streams.values());
    const bytesArr = all.map(s => s.bytes);
    return {
      streams: all.length,
      totalOpened: this.totalOpened,
      totalClosed: this.totalClosed,
      totalPaused: this.totalPaused,
      totalBytes: this.totalBytes,
      open: all.filter(s => s.status === 'open').length,
      closed: all.filter(s => s.status === 'closed').length,
      paused: all.filter(s => s.status === 'paused').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      totalBytes2: all.reduce((s2, x) => s2 + x.bytes, 0),
      totalChunks: all.reduce((s2, x) => s2 + x.chunks, 0),
      avgBytes: all.length > 0 ? Math.round((bytesArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      maxBytes: bytesArr.length > 0 ? Math.max(...bytesArr) : 0,
      minBytes: bytesArr.length > 0 ? Math.min(...bytesArr) : 0,
    };
  }

  getStream(id: string): Stream | undefined {
    return this.streams.get(id);
  }

  getAllStreams(): Stream[] {
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

  getStatus(id: string): StreamStatus | undefined {
    return this.streams.get(id)?.status;
  }

  getBytes(id: string): number {
    return this.streams.get(id)?.bytes ?? 0;
  }

  getChunks(id: string): number {
    return this.streams.get(id)?.chunks ?? 0;
  }

  getHits(id: string): number {
    return this.streams.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.streams.get(id)?.active ?? false;
  }

  isOpen(id: string): boolean {
    return this.streams.get(id)?.status === 'open';
  }

  isClosed(id: string): boolean {
    return this.streams.get(id)?.status === 'closed';
  }

  isPaused(id: string): boolean {
    return this.streams.get(id)?.status === 'paused';
  }

  getByStatus(status: StreamStatus): Stream[] {
    return Array.from(this.streams.values()).filter(s => s.status === status);
  }

  getActiveStreams(): Stream[] {
    return Array.from(this.streams.values()).filter(s => s.active);
  }

  getInactiveStreams(): Stream[] {
    return Array.from(this.streams.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.streams.values()).map(s => s.name))];
  }

  getNewest(): Stream | null {
    const all = Array.from(this.streams.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Stream | null {
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

  getTotalOpened(): number {
    return this.totalOpened;
  }

  getTotalClosed(): number {
    return this.totalClosed;
  }

  getTotalPaused(): number {
    return this.totalPaused;
  }

  getTotalBytes(): number {
    return this.totalBytes;
  }

  clearAll(): void {
    this.streams.clear();
    this.counter = 0;
    this.totalOpened = 0;
    this.totalClosed = 0;
    this.totalPaused = 0;
    this.totalBytes = 0;
  }
}

export default StreamEngine;