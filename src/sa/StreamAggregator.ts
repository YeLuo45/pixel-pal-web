/**
 * Stream Aggregator
 * thunderbolt-design Stream Aggregator - CreateStream + Emit + Flush + Stats
 */

export interface Stream {
  id: string;
  events: unknown[];
  watermark: number;
  windowSize: number;
  totalEmitted: number;
  totalFlushed: number;
  created: number;
  active: boolean;
}

export interface StreamStats {
  streams: number;
  events: number;
  flushes: number;
  active: number;
}

export class StreamAggregator {
  private streams: Map<string, Stream> = new Map();
  private flushes = 0;

  createStream(id: string, windowSize: number = 10): boolean {
    if (this.streams.has(id)) return false;
    this.streams.set(id, {
      id,
      events: [],
      watermark: 0,
      windowSize,
      totalEmitted: 0,
      totalFlushed: 0,
      created: Date.now(),
      active: true,
    });
    return true;
  }

  emit(streamId: string, event: unknown): boolean {
    const stream = this.streams.get(streamId);
    if (!stream || !stream.active) return false;
    stream.events.push(event);
    stream.totalEmitted++;
    stream.watermark++;
    return true;
  }

  flush(streamId: string): unknown[] {
    const stream = this.streams.get(streamId);
    if (!stream) return [];
    const flushed = stream.events.slice(0, stream.windowSize);
    stream.events = stream.events.slice(stream.windowSize);
    stream.totalFlushed += flushed.length;
    this.flushes++;
    return flushed;
  }

  flushAll(): Map<string, unknown[]> {
    const result = new Map<string, unknown[]>();
    for (const [id, stream] of this.streams.entries()) {
      result.set(id, [...stream.events]);
      stream.events = [];
      stream.totalFlushed += stream.events.length;
      this.flushes++;
    }
    return result;
  }

  getStats(): StreamStats {
    return {
      streams: this.streams.size,
      events: Array.from(this.streams.values()).reduce((s, st) => s + st.totalEmitted, 0),
      flushes: this.flushes,
      active: Array.from(this.streams.values()).filter(s => s.active).length,
    };
  }

  getStream(id: string): Stream | undefined {
    return this.streams.get(id);
  }

  getAllStreams(): Stream[] {
    return Array.from(this.streams.values());
  }

  removeStream(id: string): boolean {
    return this.streams.delete(id);
  }

  hasStream(id: string): boolean {
    return this.streams.has(id);
  }

  getCount(): number {
    return this.streams.size;
  }

  getEvents(streamId: string): unknown[] {
    return [...(this.streams.get(streamId)?.events ?? [])];
  }

  getEventCount(streamId: string): number {
    return this.streams.get(streamId)?.events.length ?? 0;
  }

  getTotalEmitted(streamId: string): number {
    return this.streams.get(streamId)?.totalEmitted ?? 0;
  }

  getTotalFlushed(streamId: string): number {
    return this.streams.get(streamId)?.totalFlushed ?? 0;
  }

  getWatermark(streamId: string): number {
    return this.streams.get(streamId)?.watermark ?? 0;
  }

  getWindowSize(streamId: string): number {
    return this.streams.get(streamId)?.windowSize ?? 0;
  }

  setWindowSize(streamId: string, windowSize: number): boolean {
    const stream = this.streams.get(streamId);
    if (!stream) return false;
    stream.windowSize = windowSize;
    return true;
  }

  isActive(streamId: string): boolean {
    return this.streams.get(streamId)?.active ?? false;
  }

  setActive(streamId: string, active: boolean): boolean {
    const stream = this.streams.get(streamId);
    if (!stream) return false;
    stream.active = active;
    return true;
  }

  getActiveStreams(): Stream[] {
    return Array.from(this.streams.values()).filter(s => s.active);
  }

  getInactiveStreams(): Stream[] {
    return Array.from(this.streams.values()).filter(s => !s.active);
  }

  getFlushes(): number {
    return this.flushes;
  }

  getCreatedAt(streamId: string): number {
    return this.streams.get(streamId)?.created ?? 0;
  }

  getAvgWindowSize(): number {
    const all = Array.from(this.streams.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((s, st) => s + st.windowSize, 0) / all.length) * 100) / 100;
  }

  getMostActiveStream(): Stream | null {
    const all = Array.from(this.streams.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.totalEmitted > max.totalEmitted ? s : max);
  }

  resetAll(): void {
    for (const stream of this.streams.values()) {
      stream.events = [];
      stream.watermark = 0;
      stream.totalEmitted = 0;
      stream.totalFlushed = 0;
    }
    this.flushes = 0;
  }

  clearAll(): void {
    this.streams.clear();
    this.flushes = 0;
  }
}

export default StreamAggregator;