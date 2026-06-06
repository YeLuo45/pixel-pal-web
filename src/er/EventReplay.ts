/**
 * Event Replay
 * thunderbolt-design Event Replay - Record + Replay + Checkpoint + Stats
 */

export interface ReplayEvent {
  id: string;
  type: string;
  data: unknown;
  replayed: boolean;
  replayCount: number;
  created: number;
  updated: number;
  hits: number;
  history: number[];
  active: boolean;
}

export interface Checkpoint {
  id: string;
  position: number;
  eventIds: string[];
  created: number;
}

export interface ERStats {
  events: number;
  replayed: number;
  checkpoints: number;
  totalReplays: number;
  totalHits: number;
  active: number;
  inactive: number;
  types: number;
  replayRate: number;
}

export class EventReplay {
  private events: Map<string, ReplayEvent> = new Map();
  private checkpoints: Map<string, Checkpoint> = new Map();
  private eventOrder: string[] = [];
  private counter = 0;
  private cpCounter = 0;

  record(type: string, data: unknown): string {
    const id = `er-${++this.counter}`;
    this.events.set(id, {
      id,
      type,
      data,
      replayed: false,
      replayCount: 0,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [Date.now()],
      active: true,
    });
    this.eventOrder.push(id);
    return id;
  }

  replay(id: string): boolean {
    const e = this.events.get(id);
    if (!e) return false;
    if (!e.active) return false;
    e.replayed = true;
    e.replayCount++;
    e.history.push(Date.now());
    e.updated = Date.now();
    return true;
  }

  checkpoint(): string {
    const id = `cp-${++this.cpCounter}`;
    this.checkpoints.set(id, {
      id,
      position: this.eventOrder.length,
      eventIds: [...this.eventOrder],
      created: Date.now(),
    });
    return id;
  }

  replayFromCheckpoint(checkpointId: string): number {
    const cp = this.checkpoints.get(checkpointId);
    if (!cp) return 0;
    let count = 0;
    for (const eventId of cp.eventIds) {
      if (this.replay(eventId)) count++;
    }
    return count;
  }

  getStats(): ERStats {
    const all = Array.from(this.events.values());
    return {
      events: all.length,
      replayed: all.filter(e => e.replayed).length,
      checkpoints: this.checkpoints.size,
      totalReplays: all.reduce((s, e) => s + e.replayCount, 0),
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      types: new Set(all.map(e => e.type)).size,
      replayRate: all.length > 0 ? Math.round((all.filter(e => e.replayed).length / all.length) * 100) / 100 : 0,
    };
  }

  getEvent(id: string): ReplayEvent | undefined {
    return this.events.get(id);
  }

  getAllEvents(): ReplayEvent[] {
    return Array.from(this.events.values());
  }

  getOrderedEvents(): ReplayEvent[] {
    return this.eventOrder.map(id => this.events.get(id)!).filter(Boolean);
  }

  getCheckpoint(id: string): Checkpoint | undefined {
    return this.checkpoints.get(id);
  }

  getAllCheckpoints(): Checkpoint[] {
    return Array.from(this.checkpoints.values());
  }

  removeEvent(id: string): boolean {
    const idx = this.eventOrder.indexOf(id);
    if (idx >= 0) this.eventOrder.splice(idx, 1);
    return this.events.delete(id);
  }

  removeCheckpoint(id: string): boolean {
    return this.checkpoints.delete(id);
  }

  hasEvent(id: string): boolean {
    return this.events.has(id);
  }

  hasCheckpoint(id: string): boolean {
    return this.checkpoints.has(id);
  }

  getCount(): number {
    return this.events.size;
  }

  getCheckpointCount(): number {
    return this.checkpoints.size;
  }

  getType(id: string): string | undefined {
    return this.events.get(id)?.type;
  }

  getData(id: string): unknown {
    return this.events.get(id)?.data;
  }

  getReplayCount(id: string): number {
    return this.events.get(id)?.replayCount ?? 0;
  }

  getHits(id: string): number {
    return this.events.get(id)?.hits ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.events.get(id)?.history ?? [])];
  }

  isReplayed(id: string): boolean {
    return this.events.get(id)?.replayed ?? false;
  }

  isActive(id: string): boolean {
    return this.events.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const e = this.events.get(id);
    if (!e) return false;
    e.active = active;
    e.updated = Date.now();
    return true;
  }

  touch(id: string): boolean {
    const e = this.events.get(id);
    if (!e) return false;
    e.hits++;
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.events.values()) {
      e.replayed = false;
      e.replayCount = 0;
      e.hits = 0;
      e.history = [e.created];
      e.active = true;
    }
    this.checkpoints.clear();
    this.cpCounter = 0;
  }

  getByType(type: string): ReplayEvent[] {
    return Array.from(this.events.values()).filter(e => e.type === type);
  }

  getReplayedEvents(): ReplayEvent[] {
    return Array.from(this.events.values()).filter(e => e.replayed);
  }

  getUnreplayedEvents(): ReplayEvent[] {
    return Array.from(this.events.values()).filter(e => !e.replayed);
  }

  getActiveEvents(): ReplayEvent[] {
    return Array.from(this.events.values()).filter(e => e.active);
  }

  getInactiveEvents(): ReplayEvent[] {
    return Array.from(this.events.values()).filter(e => !e.active);
  }

  getAllTypes(): string[] {
    return [...new Set(Array.from(this.events.values()).map(e => e.type))];
  }

  getTypeCount(): number {
    return this.getAllTypes().length;
  }

  getByMinReplayCount(min: number): ReplayEvent[] {
    return Array.from(this.events.values()).filter(e => e.replayCount >= min);
  }

  getMostReplayed(): ReplayEvent | null {
    const all = Array.from(this.events.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.replayCount > max.replayCount ? e : max);
  }

  getNewest(): ReplayEvent | null {
    const all = Array.from(this.events.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): ReplayEvent | null {
    const all = Array.from(this.events.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.created < min.created ? e : min);
  }

  getCreatedAt(id: string): number {
    return this.events.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.events.get(id)?.updated ?? 0;
  }

  getEventOrderPosition(id: string): number {
    return this.eventOrder.indexOf(id);
  }

  clearAll(): void {
    this.events.clear();
    this.checkpoints.clear();
    this.eventOrder = [];
    this.counter = 0;
    this.cpCounter = 0;
  }
}

export default EventReplay;