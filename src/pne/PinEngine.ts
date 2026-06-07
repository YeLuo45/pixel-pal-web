/**
 * Pin Engine
 * chatdev-design Pin Engine - Add + Pin + Unpin + Stats
 */

export type PinKind = 'top' | 'sticky' | 'highlight' | 'announcement';

export interface PinEntry {
  id: string;
  name: string;
  kind: PinKind;
  pinned: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface PneStats {
  pins: number;
  totalAdded: number;
  totalPinned: number;
  totalUnpinned: number;
  top: number;
  sticky: number;
  highlight: number;
  announcement: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalPinnedSum: number;
  maxPinned: number;
  avgPinned: number;
}

export class PinEngine {
  private pins: Map<string, PinEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalPinned = 0;
  private totalUnpinned = 0;

  add(name: string, kind: PinKind): string {
    const id = `pne-${++this.counter}`;
    this.pins.set(id, {
      id,
      name,
      kind,
      pinned: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  pin(id: string): boolean {
    const p = this.pins.get(id);
    if (!p) return false;
    if (!p.active) return false;
    p.pinned++;
    p.updated = Date.now();
    p.hits++;
    this.totalPinned++;
    return true;
  }

  unpin(id: string): boolean {
    const p = this.pins.get(id);
    if (!p) return false;
    if (p.pinned <= 0) return false;
    p.pinned--;
    p.updated = Date.now();
    p.hits++;
    this.totalUnpinned++;
    return true;
  }

  remove(id: string): boolean {
    return this.pins.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.pins.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const p = this.pins.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
  }

  setKind(id: string, kind: PinKind): boolean {
    const p = this.pins.get(id);
    if (!p) return false;
    p.kind = kind;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.pins.values()) {
      p.pinned = 0;
      p.active = true;
      p.hits = 0;
    }
    this.totalAdded = 0;
    this.totalPinned = 0;
    this.totalUnpinned = 0;
  }

  getStats(): PneStats {
    const all = Array.from(this.pins.values());
    const pArr = all.map(p => p.pinned);
    return {
      pins: all.length,
      totalAdded: this.totalAdded,
      totalPinned: this.totalPinned,
      totalUnpinned: this.totalUnpinned,
      top: all.filter(p => p.kind === 'top').length,
      sticky: all.filter(p => p.kind === 'sticky').length,
      highlight: all.filter(p => p.kind === 'highlight').length,
      announcement: all.filter(p => p.kind === 'announcement').length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
      totalPinnedSum: all.reduce((s, p) => s + p.pinned, 0),
      maxPinned: pArr.length > 0 ? Math.max(...pArr) : 0,
      avgPinned: all.length > 0 ? Math.round((pArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getPin(id: string): PinEntry | undefined {
    return this.pins.get(id);
  }

  getAllPins(): PinEntry[] {
    return Array.from(this.pins.values());
  }

  hasPin(id: string): boolean {
    return this.pins.has(id);
  }

  getCount(): number {
    return this.pins.size;
  }

  getName(id: string): string | undefined {
    return this.pins.get(id)?.name;
  }

  getKind(id: string): PinKind | undefined {
    return this.pins.get(id)?.kind;
  }

  getPinned(id: string): number {
    return this.pins.get(id)?.pinned ?? 0;
  }

  getHits(id: string): number {
    return this.pins.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.pins.get(id)?.active ?? false;
  }

  isTop(id: string): boolean {
    return this.pins.get(id)?.kind === 'top';
  }

  isSticky(id: string): boolean {
    return this.pins.get(id)?.kind === 'sticky';
  }

  isHighlight(id: string): boolean {
    return this.pins.get(id)?.kind === 'highlight';
  }

  isAnnouncement(id: string): boolean {
    return this.pins.get(id)?.kind === 'announcement';
  }

  getByKind(kind: PinKind): PinEntry[] {
    return Array.from(this.pins.values()).filter(p => p.kind === kind);
  }

  getActivePins(): PinEntry[] {
    return Array.from(this.pins.values()).filter(p => p.active);
  }

  getInactivePins(): PinEntry[] {
    return Array.from(this.pins.values()).filter(p => !p.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.pins.values()).map(p => p.name))];
  }

  getNewest(): PinEntry | null {
    const all = Array.from(this.pins.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): PinEntry | null {
    const all = Array.from(this.pins.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.pins.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.pins.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalPinned(): number {
    return this.totalPinned;
  }

  getTotalUnpinned(): number {
    return this.totalUnpinned;
  }

  clearAll(): void {
    this.pins.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalPinned = 0;
    this.totalUnpinned = 0;
  }
}

export default PinEngine;