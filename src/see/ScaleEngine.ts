/**
 * Scale Engine
 * thunderbolt-design Scale Engine - Add + Scale + Stats
 */

export type ScaleDirection = 'up' | 'down' | 'auto' | 'none';

export interface ScaleUnit {
  id: string;
  name: string;
  capacity: number;
  current: number;
  direction: ScaleDirection;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SeeStats {
  units: number;
  totalAdded: number;
  totalScaled: number;
  up: number;
  down: number;
  auto: number;
  none: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalCapacity: number;
  totalCurrent: number;
  avgCapacity: number;
  avgCurrent: number;
  utilization: number;
}

export class ScaleEngine {
  private units: Map<string, ScaleUnit> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalScaled = 0;
  private totalCapacity = 0;
  private totalCurrent = 0;

  add(name: string, capacity: number): string {
    const id = `see-${++this.counter}`;
    this.units.set(id, {
      id,
      name,
      capacity,
      current: 0,
      direction: 'none',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalCapacity += capacity;
    return id;
  }

  scale(id: string, target: number): boolean {
    const s = this.units.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (target > s.current) s.direction = 'up';
    else if (target < s.current) s.direction = 'down';
    else s.direction = 'auto';
    s.current = target;
    s.updated = Date.now();
    s.hits++;
    this.totalScaled++;
    this.totalCurrent += target;
    return true;
  }

  setAuto(id: string): boolean {
    const s = this.units.get(id);
    if (!s) return false;
    s.direction = 'auto';
    s.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.units.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.units.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.units.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setCapacity(id: string, capacity: number): boolean {
    const s = this.units.get(id);
    if (!s) return false;
    s.capacity = capacity;
    s.updated = Date.now();
    return true;
  }

  setCurrent(id: string, current: number): boolean {
    const s = this.units.get(id);
    if (!s) return false;
    s.current = current;
    s.updated = Date.now();
    return true;
  }

  setDirection(id: string, direction: ScaleDirection): boolean {
    const s = this.units.get(id);
    if (!s) return false;
    s.direction = direction;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.units.values()) {
      s.current = 0;
      s.direction = 'none';
      s.active = true;
      s.hits = 0;
    }
    this.totalAdded = 0;
    this.totalScaled = 0;
    this.totalCapacity = 0;
    this.totalCurrent = 0;
  }

  getStats(): SeeStats {
    const all = Array.from(this.units.values());
    const cArr = all.map(s => s.capacity);
    const cuArr = all.map(s => s.current);
    return {
      units: all.length,
      totalAdded: this.totalAdded,
      totalScaled: this.totalScaled,
      up: all.filter(s => s.direction === 'up').length,
      down: all.filter(s => s.direction === 'down').length,
      auto: all.filter(s => s.direction === 'auto').length,
      none: all.filter(s => s.direction === 'none').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      totalCapacity: this.totalCapacity,
      totalCurrent: this.totalCurrent,
      avgCapacity: all.length > 0 ? Math.round((cArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgCurrent: all.length > 0 ? Math.round((cuArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      utilization: this.totalCapacity > 0 ? Math.round((this.totalCurrent / this.totalCapacity) * 100) / 100 : 0,
    };
  }

  getUnit(id: string): ScaleUnit | undefined {
    return this.units.get(id);
  }

  getAllUnits(): ScaleUnit[] {
    return Array.from(this.units.values());
  }

  hasUnit(id: string): boolean {
    return this.units.has(id);
  }

  getCount(): number {
    return this.units.size;
  }

  getName(id: string): string | undefined {
    return this.units.get(id)?.name;
  }

  getCapacity(id: string): number {
    return this.units.get(id)?.capacity ?? 0;
  }

  getCurrent(id: string): number {
    return this.units.get(id)?.current ?? 0;
  }

  getDirection(id: string): ScaleDirection | undefined {
    return this.units.get(id)?.direction;
  }

  getHits(id: string): number {
    return this.units.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.units.get(id)?.active ?? false;
  }

  isUp(id: string): boolean {
    return this.units.get(id)?.direction === 'up';
  }

  isDown(id: string): boolean {
    return this.units.get(id)?.direction === 'down';
  }

  isAuto(id: string): boolean {
    return this.units.get(id)?.direction === 'auto';
  }

  isNone(id: string): boolean {
    return this.units.get(id)?.direction === 'none';
  }

  isOverCapacity(id: string): boolean {
    const s = this.units.get(id);
    return s ? s.current > s.capacity : false;
  }

  isAtCapacity(id: string): boolean {
    const s = this.units.get(id);
    return s ? s.current === s.capacity : false;
  }

  getByDirection(direction: ScaleDirection): ScaleUnit[] {
    return Array.from(this.units.values()).filter(s => s.direction === direction);
  }

  getActiveUnits(): ScaleUnit[] {
    return Array.from(this.units.values()).filter(s => s.active);
  }

  getInactiveUnits(): ScaleUnit[] {
    return Array.from(this.units.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.units.values()).map(s => s.name))];
  }

  getNewest(): ScaleUnit | null {
    const all = Array.from(this.units.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): ScaleUnit | null {
    const all = Array.from(this.units.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.units.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.units.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalScaled(): number {
    return this.totalScaled;
  }

  clearAll(): void {
    this.units.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalScaled = 0;
    this.totalCapacity = 0;
    this.totalCurrent = 0;
  }
}

export default ScaleEngine;