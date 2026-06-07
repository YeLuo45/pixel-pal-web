/**
 * Skeleton Engine
 * nanobot-design Skeleton Engine - AddField + Build + Stats
 */

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'object';

export interface Skeleton {
  id: string;
  name: string;
  fields: Map<string, FieldType>;
  built: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SkeStats {
  skeletons: number;
  totalAdded: number;
  totalBuilt: number;
  totalFields: number;
  string: number;
  number: number;
  boolean: number;
  date: number;
  object: number;
  built: number;
  unbuilt: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgFields: number;
  maxFields: number;
  minFields: number;
}

export class SkeletonEngine {
  private skeletons: Map<string, Skeleton> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalBuilt = 0;
  private totalFields = 0;

  add(name: string): string {
    const id = `ske-${++this.counter}`;
    this.skeletons.set(id, {
      id,
      name,
      fields: new Map(),
      built: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  addField(id: string, fieldName: string, type: FieldType): boolean {
    const s = this.skeletons.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.fields.set(fieldName, type);
    s.updated = Date.now();
    s.hits++;
    this.totalFields++;
    return true;
  }

  build(id: string): boolean {
    const s = this.skeletons.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.built = true;
    s.updated = Date.now();
    s.hits++;
    this.totalBuilt++;
    return true;
  }

  remove(id: string): boolean {
    return this.skeletons.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.skeletons.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.skeletons.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  removeField(id: string, fieldName: string): boolean {
    const s = this.skeletons.get(id);
    if (!s) return false;
    s.fields.delete(fieldName);
    s.updated = Date.now();
    return true;
  }

  setBuilt(id: string, built: boolean): boolean {
    const s = this.skeletons.get(id);
    if (!s) return false;
    s.built = built;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.skeletons.values()) {
      s.fields.clear();
      s.built = false;
      s.active = true;
      s.hits = 0;
    }
    this.totalAdded = 0;
    this.totalBuilt = 0;
    this.totalFields = 0;
  }

  getStats(): SkeStats {
    const all = Array.from(this.skeletons.values());
    const fArr = all.map(s => s.fields.size);
    let stringCount = 0;
    let numberCount = 0;
    let booleanCount = 0;
    let dateCount = 0;
    let objectCount = 0;
    for (const s of all) {
      for (const type of s.fields.values()) {
        if (type === 'string') stringCount++;
        else if (type === 'number') numberCount++;
        else if (type === 'boolean') booleanCount++;
        else if (type === 'date') dateCount++;
        else if (type === 'object') objectCount++;
      }
    }
    return {
      skeletons: all.length,
      totalAdded: this.totalAdded,
      totalBuilt: this.totalBuilt,
      totalFields: this.totalFields,
      string: stringCount,
      number: numberCount,
      boolean: booleanCount,
      date: dateCount,
      object: objectCount,
      built: all.filter(s => s.built).length,
      unbuilt: all.filter(s => !s.built).length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      avgFields: all.length > 0 ? Math.round((fArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxFields: fArr.length > 0 ? Math.max(...fArr) : 0,
      minFields: fArr.length > 0 ? Math.min(...fArr) : 0,
    };
  }

  getSkeleton(id: string): Skeleton | undefined {
    return this.skeletons.get(id);
  }

  getAllSkeletons(): Skeleton[] {
    return Array.from(this.skeletons.values());
  }

  hasSkeleton(id: string): boolean {
    return this.skeletons.has(id);
  }

  getCount(): number {
    return this.skeletons.size;
  }

  getName(id: string): string | undefined {
    return this.skeletons.get(id)?.name;
  }

  getFields(id: string): Map<string, FieldType> {
    return this.skeletons.get(id)?.fields ?? new Map();
  }

  getFieldCount(id: string): number {
    return this.skeletons.get(id)?.fields.size ?? 0;
  }

  getBuilt(id: string): boolean {
    return this.skeletons.get(id)?.built ?? false;
  }

  getHits(id: string): number {
    return this.skeletons.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.skeletons.get(id)?.active ?? false;
  }

  isBuilt(id: string): boolean {
    return this.skeletons.get(id)?.built ?? false;
  }

  getByBuilt(built: boolean): Skeleton[] {
    return Array.from(this.skeletons.values()).filter(s => s.built === built);
  }

  getActiveSkeletons(): Skeleton[] {
    return Array.from(this.skeletons.values()).filter(s => s.active);
  }

  getInactiveSkeletons(): Skeleton[] {
    return Array.from(this.skeletons.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.skeletons.values()).map(s => s.name))];
  }

  getNewest(): Skeleton | null {
    const all = Array.from(this.skeletons.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Skeleton | null {
    const all = Array.from(this.skeletons.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.skeletons.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.skeletons.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalBuilt(): number {
    return this.totalBuilt;
  }

  clearAll(): void {
    this.skeletons.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalBuilt = 0;
    this.totalFields = 0;
  }
}

export default SkeletonEngine;