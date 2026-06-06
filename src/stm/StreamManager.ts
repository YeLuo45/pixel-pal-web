/**
 * Stream Manager
 * nanobot-design Stream Manager - Create + Push + Subscribe + Unsubscribe + Stats
 */

export interface Stream {
  id: string;
  name: string;
  chunks: string[];
  subscribers: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
  totalPushes: number;
}

export interface StmStats {
  streams: number;
  totalChunks: number;
  totalSubscribers: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgChunks: number;
  maxChunks: number;
  minChunks: number;
  avgSubscribers: number;
  totalPushes: number;
  avgPushes: number;
  emptyStreams: number;
  popularStreams: number;
}

export class StreamManager {
  private streams: Map<string, Stream> = new Map();
  private counter = 0;
  private totalChunks = 0;
  private totalPushes = 0;

  create(name: string): string {
    const id = `stm-${++this.counter}`;
    this.streams.set(id, {
      id,
      name,
      chunks: [],
      subscribers: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
      totalPushes: 0,
    });
    return id;
  }

  push(id: string, chunk: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.chunks.push(chunk);
    s.totalPushes++;
    s.history.push(Date.now());
    s.updated = Date.now();
    s.hits++;
    this.totalChunks++;
    this.totalPushes++;
    return true;
  }

  subscribe(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.subscribers++;
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  unsubscribe(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    if (s.subscribers <= 0) return false;
    s.subscribers--;
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  reset(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.chunks = [];
    s.subscribers = 0;
    s.history = [];
    s.totalPushes = 0;
    s.updated = Date.now();
    return true;
  }

  getChunks(id: string): string[] {
    return [...(this.streams.get(id)?.chunks ?? [])];
  }

  clearChunks(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.chunks = [];
    s.updated = Date.now();
    return true;
  }

  getStats(): StmStats {
    const all = Array.from(this.streams.values());
    const chunkValues = all.map(s => s.chunks.length);
    const subValues = all.map(s => s.subscribers);
    const pushValues = all.map(s => s.totalPushes);
    return {
      streams: all.length,
      totalChunks: this.totalChunks,
      totalSubscribers: subValues.reduce((s, v) => s + v, 0),
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      avgChunks: all.length > 0 ? Math.round((chunkValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxChunks: chunkValues.length > 0 ? Math.max(...chunkValues) : 0,
      minChunks: chunkValues.length > 0 ? Math.min(...chunkValues) : 0,
      avgSubscribers: all.length > 0 ? Math.round((subValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      totalPushes: this.totalPushes,
      avgPushes: all.length > 0 ? Math.round((pushValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      emptyStreams: all.filter(s => s.chunks.length === 0).length,
      popularStreams: all.filter(s => s.subscribers > 0).length,
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

  getName(id: string): string | undefined {
    return this.streams.get(id)?.name;
  }

  getChunkCount(id: string): number {
    return this.streams.get(id)?.chunks.length ?? 0;
  }

  getSubscribers(id: string): number {
    return this.streams.get(id)?.subscribers ?? 0;
  }

  getTotalPushes(id: string): number {
    return this.streams.get(id)?.totalPushes ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.streams.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.streams.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.streams.get(id)?.active ?? false;
  }

  isEmpty(id: string): boolean {
    return (this.streams.get(id)?.chunks.length ?? 0) === 0;
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

  resetAll(): void {
    for (const s of this.streams.values()) {
      s.chunks = [];
      s.subscribers = 0;
      s.hits = 0;
      s.history = [];
      s.totalPushes = 0;
      s.active = true;
    }
    this.totalChunks = 0;
    this.totalPushes = 0;
  }

  getByName(name: string): Stream[] {
    return Array.from(this.streams.values()).filter(s => s.name === name);
  }

  getActiveStreams(): Stream[] {
    return Array.from(this.streams.values()).filter(s => s.active);
  }

  getInactiveStreams(): Stream[] {
    return Array.from(this.streams.values()).filter(s => !s.active);
  }

  getEmptyStreams(): Stream[] {
    return Array.from(this.streams.values()).filter(s => s.chunks.length === 0);
  }

  getPopularStreams(): Stream[] {
    return Array.from(this.streams.values()).filter(s => s.subscribers > 0);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.streams.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
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

  getTotalChunks(): number {
    return this.totalChunks;
  }

  getTotalSubscribers(): number {
    return Array.from(this.streams.values()).reduce((s, x) => s + x.subscribers, 0);
  }

  getTotalStreamPushes(): number {
    return this.totalPushes;
  }

  clearAll(): void {
    this.streams.clear();
    this.counter = 0;
    this.totalChunks = 0;
    this.totalPushes = 0;
  }
}

export default StreamManager;