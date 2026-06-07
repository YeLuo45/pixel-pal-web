/**
 * Composer Engine
 * claude-code-design Composer Engine - Compose + Build + Stats
 */

export type CompositionType = 'sequence' | 'parallel' | 'conditional';

export interface Composition {
  id: string;
  name: string;
  type: CompositionType;
  parts: number;
  built: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface CpeStats {
  compositions: number;
  totalComposed: number;
  totalBuilt: number;
  sequence: number;
  parallel: number;
  conditional: number;
  built: number;
  unbuilt: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalParts: number;
  avgParts: number;
  maxParts: number;
  minParts: number;
}

export class ComposerEngine {
  private compositions: Map<string, Composition> = new Map();
  private counter = 0;
  private totalComposed = 0;
  private totalBuilt = 0;

  compose(name: string, type: CompositionType, parts: number): string {
    const id = `cpe-${++this.counter}`;
    this.compositions.set(id, {
      id,
      name,
      type,
      parts: Math.max(0, parts),
      built: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalComposed++;
    return id;
  }

  build(id: string): boolean {
    const c = this.compositions.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.built = true;
    c.updated = Date.now();
    c.hits++;
    this.totalBuilt++;
    return true;
  }

  remove(id: string): boolean {
    return this.compositions.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.compositions.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const c = this.compositions.get(id);
    if (!c) return false;
    c.name = name;
    c.updated = Date.now();
    return true;
  }

  setType(id: string, type: CompositionType): boolean {
    const c = this.compositions.get(id);
    if (!c) return false;
    c.type = type;
    c.updated = Date.now();
    return true;
  }

  setParts(id: string, parts: number): boolean {
    const c = this.compositions.get(id);
    if (!c) return false;
    c.parts = Math.max(0, parts);
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.compositions.values()) {
      c.built = false;
      c.active = true;
      c.hits = 0;
    }
    this.totalComposed = 0;
    this.totalBuilt = 0;
  }

  getStats(): CpeStats {
    const all = Array.from(this.compositions.values());
    const partsArr = all.map(c => c.parts);
    return {
      compositions: all.length,
      totalComposed: this.totalComposed,
      totalBuilt: this.totalBuilt,
      sequence: all.filter(c => c.type === 'sequence').length,
      parallel: all.filter(c => c.type === 'parallel').length,
      conditional: all.filter(c => c.type === 'conditional').length,
      built: all.filter(c => c.built).length,
      unbuilt: all.filter(c => !c.built).length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueNames: new Set(all.map(c => c.name)).size,
      totalParts: all.reduce((s, c) => s + c.parts, 0),
      avgParts: all.length > 0 ? Math.round((partsArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxParts: partsArr.length > 0 ? Math.max(...partsArr) : 0,
      minParts: partsArr.length > 0 ? Math.min(...partsArr) : 0,
    };
  }

  getComposition(id: string): Composition | undefined {
    return this.compositions.get(id);
  }

  getAllCompositions(): Composition[] {
    return Array.from(this.compositions.values());
  }

  hasComposition(id: string): boolean {
    return this.compositions.has(id);
  }

  getCount(): number {
    return this.compositions.size;
  }

  getName(id: string): string | undefined {
    return this.compositions.get(id)?.name;
  }

  getType(id: string): CompositionType | undefined {
    return this.compositions.get(id)?.type;
  }

  getParts(id: string): number {
    return this.compositions.get(id)?.parts ?? 0;
  }

  getHits(id: string): number {
    return this.compositions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.compositions.get(id)?.active ?? false;
  }

  isBuilt(id: string): boolean {
    return this.compositions.get(id)?.built ?? false;
  }

  isSequence(id: string): boolean {
    return this.compositions.get(id)?.type === 'sequence';
  }

  isParallel(id: string): boolean {
    return this.compositions.get(id)?.type === 'parallel';
  }

  isConditional(id: string): boolean {
    return this.compositions.get(id)?.type === 'conditional';
  }

  getByType(type: CompositionType): Composition[] {
    return Array.from(this.compositions.values()).filter(c => c.type === type);
  }

  getBuiltCompositions(): Composition[] {
    return Array.from(this.compositions.values()).filter(c => c.built);
  }

  getUnbuiltCompositions(): Composition[] {
    return Array.from(this.compositions.values()).filter(c => !c.built);
  }

  getActiveCompositions(): Composition[] {
    return Array.from(this.compositions.values()).filter(c => c.active);
  }

  getInactiveCompositions(): Composition[] {
    return Array.from(this.compositions.values()).filter(c => !c.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.compositions.values()).map(c => c.name))];
  }

  getNewest(): Composition | null {
    const all = Array.from(this.compositions.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Composition | null {
    const all = Array.from(this.compositions.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.compositions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.compositions.get(id)?.updated ?? 0;
  }

  getTotalComposed(): number {
    return this.totalComposed;
  }

  getTotalBuilt(): number {
    return this.totalBuilt;
  }

  clearAll(): void {
    this.compositions.clear();
    this.counter = 0;
    this.totalComposed = 0;
    this.totalBuilt = 0;
  }
}

export default ComposerEngine;