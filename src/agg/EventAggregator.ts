/**
 * Event Aggregator
 * thunderbolt-design Event Aggregator - AddEvent + Aggregate + Stats
 */

export interface Event {
  id: string;
  type: string;
  source: string;
  data: unknown;
  timestamp: number;
}

export interface Aggregation {
  type: string;
  count: number;
  first: number;
  last: number;
  sources: string[];
}

export interface AggregatorStats {
  events: number;
  types: number;
  sources: number;
}

export class EventAggregator {
  private events: Map<string, Event> = new Map();
  private counter = 0;

  addEvent(type: string, source: string, data: unknown): string {
    const id = `evt-${++this.counter}`;
    this.events.set(id, { id, type, source, data, timestamp: Date.now() });
    return id;
  }

  aggregate(): Aggregation[] {
    const groups = new Map<string, Event[]>();
    for (const event of this.events.values()) {
      if (!groups.has(event.type)) groups.set(event.type, []);
      groups.get(event.type)!.push(event);
    }
    const result: Aggregation[] = [];
    for (const [type, evts] of groups.entries()) {
      const timestamps = evts.map(e => e.timestamp);
      const sources = [...new Set(evts.map(e => e.source))];
      result.push({
        type,
        count: evts.length,
        first: Math.min(...timestamps),
        last: Math.max(...timestamps),
        sources,
      });
    }
    return result;
  }

  getStats(): AggregatorStats {
    return {
      events: this.events.size,
      types: this.getTypes().length,
      sources: this.getSources().length,
    };
  }

  getEvent(id: string): Event | undefined {
    return this.events.get(id);
  }

  getAllEvents(): Event[] {
    return Array.from(this.events.values());
  }

  removeEvent(id: string): boolean {
    return this.events.delete(id);
  }

  hasEvent(id: string): boolean {
    return this.events.has(id);
  }

  getCount(): number {
    return this.events.size;
  }

  getTypes(): string[] {
    return [...new Set(Array.from(this.events.values()).map(e => e.type))];
  }

  getSources(): string[] {
    return [...new Set(Array.from(this.events.values()).map(e => e.source))];
  }

  getByType(type: string): Event[] {
    return Array.from(this.events.values()).filter(e => e.type === type);
  }

  getBySource(source: string): Event[] {
    return Array.from(this.events.values()).filter(e => e.source === source);
  }

  getTypeCount(): number {
    return this.getTypes().length;
  }

  getSourceCount(): number {
    return this.getSources().length;
  }

  getEventCount(): number {
    return this.events.size;
  }

  getCountForType(type: string): number {
    return this.getByType(type).length;
  }

  getCountForSource(source: string): number {
    return this.getBySource(source).length;
  }

  getFirstForType(type: string): Event | undefined {
    const evts = this.getByType(type);
    return evts[0];
  }

  getLastForType(type: string): Event | undefined {
    const evts = this.getByType(type);
    return evts[evts.length - 1];
  }

  getTimeRangeForType(type: string): number {
    const evts = this.getByType(type);
    if (evts.length === 0) return 0;
    const timestamps = evts.map(e => e.timestamp);
    return Math.max(...timestamps) - Math.min(...timestamps);
  }

  getTypeRate(type: string): number {
    if (this.events.size === 0) return 0;
    return Math.round((this.getCountForType(type) / this.events.size) * 100) / 100;
  }

  getMostFrequentType(): string | null {
    const types = this.getTypes();
    if (types.length === 0) return null;
    return types.reduce((max, t) => this.getCountForType(t) > this.getCountForType(max) ? t : max);
  }

  getMostActiveSource(): string | null {
    const sources = this.getSources();
    if (sources.length === 0) return null;
    return sources.reduce((max, s) => this.getCountForSource(s) > this.getCountForSource(max) ? s : max);
  }

  getAvgEventsPerType(): number {
    const types = this.getTypes();
    if (types.length === 0) return 0;
    return Math.round((this.events.size / types.length) * 100) / 100;
  }

  getAvgEventsPerSource(): number {
    const sources = this.getSources();
    if (sources.length === 0) return 0;
    return Math.round((this.events.size / sources.length) * 100) / 100;
  }

  clearAll(): void {
    this.events.clear();
    this.counter = 0;
  }
}

export default EventAggregator;