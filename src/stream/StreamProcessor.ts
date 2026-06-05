/**
 * Stream Processor
 * thunderbolt-design Stream Processor - Create + Transform + Filter + Aggregate
 */

export interface StreamEvent {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
}

export interface StreamStats {
  count: number;
  types: Record<string, number>;
}

export class StreamProcessor {
  private streams: Map<string, StreamEvent[]> = new Map();
  private counter = 0;

  createStream(name: string): string {
    const id = `stream-${++this.counter}`;
    this.streams.set(id, []);
    return id;
  }

  emit(streamId: string, event: Omit<StreamEvent, 'id' | 'timestamp'>): boolean {
    const stream = this.streams.get(streamId);
    if (!stream) return false;
    stream.push({ ...event, id: `e-${Date.now()}-${stream.length}`, timestamp: Date.now() });
    return true;
  }

  filter(streamId: string, predicate: (e: StreamEvent) => boolean): StreamEvent[] {
    return (this.streams.get(streamId) ?? []).filter(predicate);
  }

  aggregate(streamId: string): StreamStats {
    const stream = this.streams.get(streamId) ?? [];
    const types: Record<string, number> = {};
    for (const e of stream) {
      types[e.type] = (types[e.type] ?? 0) + 1;
    }
    return { count: stream.length, types };
  }

  getEvents(streamId: string): StreamEvent[] {
    return [...(this.streams.get(streamId) ?? [])];
  }

  getEventCount(streamId: string): number {
    return this.streams.get(streamId)?.length ?? 0;
  }

  hasStream(streamId: string): boolean {
    return this.streams.has(streamId);
  }

  removeStream(streamId: string): boolean {
    return this.streams.delete(streamId);
  }

  getCount(): number {
    return this.streams.size;
  }

  map<T>(streamId: string, fn: (e: StreamEvent) => T): T[] {
    return (this.streams.get(streamId) ?? []).map(fn);
  }

  reduce<T>(streamId: string, fn: (acc: T, e: StreamEvent) => T, initial: T): T {
    return (this.streams.get(streamId) ?? []).reduce(fn, initial);
  }

  find(streamId: string, predicate: (e: StreamEvent) => boolean): StreamEvent | undefined {
    return (this.streams.get(streamId) ?? []).find(predicate);
  }

  some(streamId: string, predicate: (e: StreamEvent) => boolean): boolean {
    return (this.streams.get(streamId) ?? []).some(predicate);
  }

  every(streamId: string, predicate: (e: StreamEvent) => boolean): boolean {
    return (this.streams.get(streamId) ?? []).every(predicate);
  }

  count(streamId: string, predicate: (e: StreamEvent) => boolean): number {
    return (this.streams.get(streamId) ?? []).filter(predicate).length;
  }

  getByType(streamId: string, type: string): StreamEvent[] {
    return (this.streams.get(streamId) ?? []).filter(e => e.type === type);
  }

  getByTypeCount(streamId: string, type: string): number {
    return this.getByType(streamId, type).length;
  }

  getAllTypes(streamId: string): string[] {
    return [...new Set((this.streams.get(streamId) ?? []).map(e => e.type))];
  }

  getFirst(streamId: string): StreamEvent | undefined {
    return this.streams.get(streamId)?.[0];
  }

  getLast(streamId: string): StreamEvent | undefined {
    const stream = this.streams.get(streamId);
    if (!stream || stream.length === 0) return undefined;
    return stream[stream.length - 1];
  }

  getRecent(streamId: string, n: number): StreamEvent[] {
    const stream = this.streams.get(streamId) ?? [];
    return stream.slice(-n);
  }

  clearStream(streamId: string): boolean {
    const stream = this.streams.get(streamId);
    if (!stream) return false;
    stream.length = 0;
    return true;
  }

  clearAll(): void {
    this.streams.clear();
    this.counter = 0;
  }
}

export default StreamProcessor;