/**
 * Buffer Manager
 * thunderbolt-design Buffer Manager - Create + Write + Read + Clear + Stats
 */

export interface Buffer {
  id: string;
  name: string;
  capacity: number;
  used: number;
  data: string;
  writes: number;
  reads: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface BfmStats {
  buffers: number;
  totalUsed: number;
  totalCapacity: number;
  totalWrites: number;
  totalReads: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgUsed: number;
  maxUsed: number;
  minUsed: number;
  avgCapacity: number;
  utilizationRate: number;
  emptyBuffers: number;
  fullBuffers: number;
}

export class BufferManager {
  private buffers: Map<string, Buffer> = new Map();
  private counter = 0;
  private totalWrites = 0;
  private totalReads = 0;

  create(name: string, capacity: number = 1024): string {
    const id = `bfm-${++this.counter}`;
    this.buffers.set(id, {
      id,
      name,
      capacity,
      used: 0,
      data: '',
      writes: 0,
      reads: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  write(id: string, data: string): boolean {
    const b = this.buffers.get(id);
    if (!b) return false;
    if (!b.active) return false;
    if (b.used + data.length > b.capacity) return false;
    b.data += data;
    b.used = b.data.length;
    b.writes++;
    b.history.push(b.used);
    b.updated = Date.now();
    b.hits++;
    this.totalWrites++;
    return true;
  }

  read(id: string): string {
    const b = this.buffers.get(id);
    if (!b) return '';
    if (!b.active) return '';
    b.reads++;
    b.updated = Date.now();
    b.hits++;
    this.totalReads++;
    return b.data;
  }

  clear(id: string): boolean {
    const b = this.buffers.get(id);
    if (!b) return false;
    b.data = '';
    b.used = 0;
    b.updated = Date.now();
    return true;
  }

  reset(id: string): boolean {
    const b = this.buffers.get(id);
    if (!b) return false;
    b.writes = 0;
    b.reads = 0;
    b.history = [];
    b.updated = Date.now();
    return true;
  }

  resize(id: string, capacity: number): boolean {
    const b = this.buffers.get(id);
    if (!b) return false;
    b.capacity = capacity;
    b.updated = Date.now();
    return true;
  }

  getStats(): BfmStats {
    const all = Array.from(this.buffers.values());
    const usedValues = all.map(b => b.used);
    const capValues = all.map(b => b.capacity);
    const totalCap = capValues.reduce((s, v) => s + v, 0);
    const totalUsed = usedValues.reduce((s, v) => s + v, 0);
    return {
      buffers: all.length,
      totalUsed,
      totalCapacity: totalCap,
      totalWrites: this.totalWrites,
      totalReads: this.totalReads,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      uniqueNames: new Set(all.map(b => b.name)).size,
      avgUsed: all.length > 0 ? Math.round((totalUsed / all.length) * 100) / 100 : 0,
      maxUsed: usedValues.length > 0 ? Math.max(...usedValues) : 0,
      minUsed: usedValues.length > 0 ? Math.min(...usedValues) : 0,
      avgCapacity: all.length > 0 ? Math.round((totalCap / all.length) * 100) / 100 : 0,
      utilizationRate: totalCap > 0 ? Math.round((totalUsed / totalCap) * 100) / 100 : 0,
      emptyBuffers: all.filter(b => b.used === 0).length,
      fullBuffers: all.filter(b => b.used === b.capacity).length,
    };
  }

  getBuffer(id: string): Buffer | undefined {
    return this.buffers.get(id);
  }

  getAllBuffers(): Buffer[] {
    return Array.from(this.buffers.values());
  }

  removeBuffer(id: string): boolean {
    return this.buffers.delete(id);
  }

  hasBuffer(id: string): boolean {
    return this.buffers.has(id);
  }

  getCount(): number {
    return this.buffers.size;
  }

  getName(id: string): string | undefined {
    return this.buffers.get(id)?.name;
  }

  getCapacity(id: string): number {
    return this.buffers.get(id)?.capacity ?? 0;
  }

  getUsed(id: string): number {
    return this.buffers.get(id)?.used ?? 0;
  }

  getWrites(id: string): number {
    return this.buffers.get(id)?.writes ?? 0;
  }

  getReads(id: string): number {
    return this.buffers.get(id)?.reads ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.buffers.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.buffers.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.buffers.get(id)?.active ?? false;
  }

  isEmpty(id: string): boolean {
    return (this.buffers.get(id)?.used ?? 0) === 0;
  }

  isFull(id: string): boolean {
    const b = this.buffers.get(id);
    if (!b) return false;
    return b.used >= b.capacity;
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.buffers.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const b = this.buffers.get(id);
    if (!b) return false;
    b.name = name;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.buffers.values()) {
      b.writes = 0;
      b.reads = 0;
      b.hits = 0;
      b.history = [];
      b.active = true;
    }
    this.totalWrites = 0;
    this.totalReads = 0;
  }

  getByName(name: string): Buffer[] {
    return Array.from(this.buffers.values()).filter(b => b.name === name);
  }

  getActiveBuffers(): Buffer[] {
    return Array.from(this.buffers.values()).filter(b => b.active);
  }

  getInactiveBuffers(): Buffer[] {
    return Array.from(this.buffers.values()).filter(b => !b.active);
  }

  getEmptyBuffers(): Buffer[] {
    return Array.from(this.buffers.values()).filter(b => b.used === 0);
  }

  getFullBuffers(): Buffer[] {
    return Array.from(this.buffers.values()).filter(b => b.used === b.capacity);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.buffers.values()).map(b => b.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getNewest(): Buffer | null {
    const all = Array.from(this.buffers.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Buffer | null {
    const all = Array.from(this.buffers.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.buffers.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.buffers.get(id)?.updated ?? 0;
  }

  getTotalWrites(): number {
    return this.totalWrites;
  }

  getTotalReads(): number {
    return this.totalReads;
  }

  clearAll(): void {
    this.buffers.clear();
    this.counter = 0;
    this.totalWrites = 0;
    this.totalReads = 0;
  }
}

export default BufferManager;