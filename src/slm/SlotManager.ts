/**
 * Slot Manager
 * nanobot-design Slot Manager - Add + Reserve + Release + Stats
 */

export interface Slot {
  id: string;
  name: string;
  reserved: boolean;
  owner: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface SlmStats {
  slots: number;
  totalReserves: number;
  totalReleases: number;
  reserved: number;
  unreserved: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueOwners: number;
}

export class SlotManager {
  private slots: Map<string, Slot> = new Map();
  private counter = 0;
  private totalReserves = 0;
  private totalReleases = 0;

  add(name: string): string {
    const id = `slm-${++this.counter}`;
    this.slots.set(id, {
      id,
      name,
      reserved: false,
      owner: '',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  reserve(id: string, owner: string): boolean {
    const s = this.slots.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (s.reserved) return false;
    s.reserved = true;
    s.owner = owner;
    s.updated = Date.now();
    s.hits++;
    this.totalReserves++;
    return true;
  }

  release(id: string): boolean {
    const s = this.slots.get(id);
    if (!s) return false;
    if (!s.reserved) return false;
    s.reserved = false;
    s.owner = '';
    s.updated = Date.now();
    s.hits++;
    this.totalReleases++;
    return true;
  }

  remove(id: string): boolean {
    return this.slots.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.slots.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.slots.values()) {
      s.reserved = false;
      s.owner = '';
      s.active = true;
      s.hits = 0;
      s.history = [];
    }
    this.totalReserves = 0;
    this.totalReleases = 0;
  }

  isReserved(id: string): boolean {
    return this.slots.get(id)?.reserved ?? false;
  }

  isAvailable(id: string): boolean {
    const s = this.slots.get(id);
    if (!s) return false;
    return s.active && !s.reserved;
  }

  getStats(): SlmStats {
    const all = Array.from(this.slots.values());
    return {
      slots: all.length,
      totalReserves: this.totalReserves,
      totalReleases: this.totalReleases,
      reserved: all.filter(s => s.reserved).length,
      unreserved: all.filter(s => !s.reserved).length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      uniqueOwners: new Set(all.map(s => s.owner).filter(o => o !== '')).size,
    };
  }

  getSlot(id: string): Slot | undefined {
    return this.slots.get(id);
  }

  getAllSlots(): Slot[] {
    return Array.from(this.slots.values());
  }

  hasSlot(id: string): boolean {
    return this.slots.has(id);
  }

  getCount(): number {
    return this.slots.size;
  }

  getName(id: string): string | undefined {
    return this.slots.get(id)?.name;
  }

  getOwner(id: string): string | undefined {
    return this.slots.get(id)?.owner;
  }

  getHistory(id: string): number[] {
    return [...(this.slots.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.slots.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.slots.get(id)?.active ?? false;
  }

  setName(id: string, name: string): boolean {
    const s = this.slots.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  getByName(name: string): Slot[] {
    return Array.from(this.slots.values()).filter(s => s.name === name);
  }

  getByOwner(owner: string): Slot[] {
    return Array.from(this.slots.values()).filter(s => s.owner === owner);
  }

  getReservedSlots(): Slot[] {
    return Array.from(this.slots.values()).filter(s => s.reserved);
  }

  getUnreservedSlots(): Slot[] {
    return Array.from(this.slots.values()).filter(s => !s.reserved);
  }

  getAvailableSlots(): Slot[] {
    return Array.from(this.slots.values()).filter(s => s.active && !s.reserved);
  }

  getActiveSlots(): Slot[] {
    return Array.from(this.slots.values()).filter(s => s.active);
  }

  getInactiveSlots(): Slot[] {
    return Array.from(this.slots.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.slots.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllOwners(): string[] {
    return [...new Set(Array.from(this.slots.values()).map(s => s.owner).filter(o => o !== ''))];
  }

  getOwnerCount(): number {
    return this.getAllOwners().length;
  }

  getNewest(): Slot | null {
    const all = Array.from(this.slots.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Slot | null {
    const all = Array.from(this.slots.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.slots.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.slots.get(id)?.updated ?? 0;
  }

  getTotalReserves(): number {
    return this.totalReserves;
  }

  getTotalReleases(): number {
    return this.totalReleases;
  }

  clearAll(): void {
    this.slots.clear();
    this.counter = 0;
    this.totalReserves = 0;
    this.totalReleases = 0;
  }
}

export default SlotManager;