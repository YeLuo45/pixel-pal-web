/**
 * Wheel Engine
 * claude-code-design Wheel Engine - AddOption + Spin + Stats
 */

export type WheelType = 'number' | 'string' | 'boolean' | 'object';

export interface WheelEntry {
  id: string;
  label: string;
  type: WheelType;
  weight: number;
  spun: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface WleStats {
  options: number;
  totalAdded: number;
  totalSpun: number;
  number: number;
  string: number;
  boolean: number;
  object: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueLabels: number;
  totalWeight: number;
  totalSpunSum: number;
  maxSpun: number;
  avgSpun: number;
}

export class WheelEngine {
  private options: Map<string, WheelEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalSpun = 0;
  private totalWeight = 0;

  addOption(label: string, type: WheelType, weight: number = 1): string {
    const id = `wle-${++this.counter}`;
    this.options.set(id, {
      id,
      label,
      type,
      weight,
      spun: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalWeight += weight;
    return id;
  }

  spin(id: string): boolean {
    const o = this.options.get(id);
    if (!o) return false;
    if (!o.active) return false;
    o.spun++;
    o.updated = Date.now();
    o.hits++;
    this.totalSpun++;
    return true;
  }

  remove(id: string): boolean {
    return this.options.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const o = this.options.get(id);
    if (!o) return false;
    o.active = active;
    o.updated = Date.now();
    return true;
  }

  setLabel(id: string, label: string): boolean {
    const o = this.options.get(id);
    if (!o) return false;
    o.label = label;
    o.updated = Date.now();
    return true;
  }

  setType(id: string, type: WheelType): boolean {
    const o = this.options.get(id);
    if (!o) return false;
    o.type = type;
    o.updated = Date.now();
    return true;
  }

  setWeight(id: string, weight: number): boolean {
    const o = this.options.get(id);
    if (!o) return false;
    o.weight = weight;
    o.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const o of this.options.values()) {
      o.spun = 0;
      o.active = true;
      o.hits = 0;
    }
    this.totalAdded = 0;
    this.totalSpun = 0;
    this.totalWeight = 0;
  }

  getStats(): WleStats {
    const all = Array.from(this.options.values());
    const sArr = all.map(o => o.spun);
    return {
      options: all.length,
      totalAdded: this.totalAdded,
      number: all.filter(o => o.type === 'number').length,
      string: all.filter(o => o.type === 'string').length,
      boolean: all.filter(o => o.type === 'boolean').length,
      object: all.filter(o => o.type === 'object').length,
      active: all.filter(o => o.active).length,
      inactive: all.filter(o => !o.active).length,
      totalHits: all.reduce((s, o) => s + o.hits, 0),
      uniqueLabels: new Set(all.map(o => o.label)).size,
      totalSpun: this.totalSpun,
      totalWeight: this.totalWeight,
      maxSpun: sArr.length > 0 ? Math.max(...sArr) : 0,
      avgSpun: all.length > 0 ? Math.round((sArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getOption(id: string): WheelEntry | undefined {
    return this.options.get(id);
  }

  getAllOptions(): WheelEntry[] {
    return Array.from(this.options.values());
  }

  hasOption(id: string): boolean {
    return this.options.has(id);
  }

  getCount(): number {
    return this.options.size;
  }

  getLabel(id: string): string | undefined {
    return this.options.get(id)?.label;
  }

  getType(id: string): WheelType | undefined {
    return this.options.get(id)?.type;
  }

  getWeight(id: string): number {
    return this.options.get(id)?.weight ?? 0;
  }

  getSpun(id: string): number {
    return this.options.get(id)?.spun ?? 0;
  }

  getHits(id: string): number {
    return this.options.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.options.get(id)?.active ?? false;
  }

  isNumber(id: string): boolean {
    return this.options.get(id)?.type === 'number';
  }

  isString(id: string): boolean {
    return this.options.get(id)?.type === 'string';
  }

  isBoolean(id: string): boolean {
    return this.options.get(id)?.type === 'boolean';
  }

  isObject(id: string): boolean {
    return this.options.get(id)?.type === 'object';
  }

  getByType(type: WheelType): WheelEntry[] {
    return Array.from(this.options.values()).filter(o => o.type === type);
  }

  getActiveOptions(): WheelEntry[] {
    return Array.from(this.options.values()).filter(o => o.active);
  }

  getInactiveOptions(): WheelEntry[] {
    return Array.from(this.options.values()).filter(o => !o.active);
  }

  getAllLabels(): string[] {
    return [...new Set(Array.from(this.options.values()).map(o => o.label))];
  }

  getNewest(): WheelEntry | null {
    const all = Array.from(this.options.values());
    if (all.length === 0) return null;
    return all.reduce((max, o) => o.created > max.created ? o : max);
  }

  getOldest(): WheelEntry | null {
    const all = Array.from(this.options.values());
    if (all.length === 0) return null;
    return all.reduce((min, o) => o.created < min.created ? o : min);
  }

  getCreatedAt(id: string): number {
    return this.options.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.options.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalSpun(): number {
    return this.totalSpun;
  }

  clearAll(): void {
    this.options.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalSpun = 0;
    this.totalWeight = 0;
  }
}

export default WheelEngine;