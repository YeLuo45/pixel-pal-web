/**
 * Belief Engine
 * generic-agent-design Belief Engine - Define + Update + Query + Stats
 */

export interface Belief {
  id: string;
  name: string;
  value: unknown;
  confidence: number;
  parent: string | null;
  updated: number;
  created: number;
  accessCount: number;
}

export interface BeliefStats {
  beliefs: number;
  avgConfidence: number;
  rootCount: number;
  childCount: number;
}

export class BeliefEngine {
  private beliefs: Map<string, Belief> = new Map();
  private counter = 0;

  define(name: string, value: unknown, parent: string | null = null): string {
    const id = `bel-${++this.counter}`;
    this.beliefs.set(id, {
      id,
      name,
      value,
      confidence: 1,
      parent,
      updated: Date.now(),
      created: Date.now(),
      accessCount: 0,
    });
    return id;
  }

  update(id: string, value: unknown, confidence: number): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    b.value = value;
    b.confidence = Math.max(0, Math.min(1, confidence));
    b.updated = Date.now();
    return true;
  }

  query(name: string): Belief[] {
    const results = Array.from(this.beliefs.values()).filter(b => b.name === name);
    for (const r of results) r.accessCount++;
    return results;
  }

  getStats(): BeliefStats {
    const all = Array.from(this.beliefs.values());
    return {
      beliefs: all.length,
      avgConfidence: all.length > 0 ? Math.round((all.reduce((s, b) => s + b.confidence, 0) / all.length) * 100) / 100 : 0,
      rootCount: all.filter(b => b.parent === null).length,
      childCount: all.filter(b => b.parent !== null).length,
    };
  }

  getBelief(id: string): Belief | undefined {
    return this.beliefs.get(id);
  }

  getAllBeliefs(): Belief[] {
    return Array.from(this.beliefs.values());
  }

  removeBelief(id: string): boolean {
    const removed = this.beliefs.delete(id);
    if (removed) {
      // Re-parent children to root
      for (const b of this.beliefs.values()) {
        if (b.parent === id) b.parent = null;
      }
    }
    return removed;
  }

  hasBelief(id: string): boolean {
    return this.beliefs.has(id);
  }

  getCount(): number {
    return this.beliefs.size;
  }

  getName(id: string): string | undefined {
    return this.beliefs.get(id)?.name;
  }

  getValue(id: string): unknown {
    return this.beliefs.get(id)?.value;
  }

  getConfidence(id: string): number {
    return this.beliefs.get(id)?.confidence ?? 0;
  }

  getParent(id: string): string | null {
    return this.beliefs.get(id)?.parent ?? null;
  }

  setParent(id: string, parent: string | null): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    if (parent !== null && !this.beliefs.has(parent)) return false;
    b.parent = parent;
    b.updated = Date.now();
    return true;
  }

  getChildren(parentId: string): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => b.parent === parentId);
  }

  getChildrenCount(parentId: string): number {
    return this.getChildren(parentId).length;
  }

  hasChildren(parentId: string): boolean {
    return this.getChildrenCount(parentId) > 0;
  }

  isRoot(id: string): boolean {
    return this.beliefs.get(id)?.parent === null;
  }

  isLeaf(id: string): boolean {
    return !this.hasChildren(id);
  }

  getRoot(): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => b.parent === null);
  }

  getRoots(): Belief[] {
    return this.getRoot();
  }

  getRootsCount(): number {
    return this.getRoot().length;
  }

  getAccessCount(id: string): number {
    return this.beliefs.get(id)?.accessCount ?? 0;
  }

  getCreatedAt(id: string): number {
    return this.beliefs.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.beliefs.get(id)?.updated ?? 0;
  }

  getByName(name: string): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => b.name === name);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.beliefs.values()).map(b => b.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getHighConfidence(threshold: number): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => b.confidence >= threshold);
  }

  getLowConfidence(threshold: number): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => b.confidence < threshold);
  }

  getMostConfident(): Belief | null {
    const all = Array.from(this.beliefs.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.confidence > max.confidence ? b : max);
  }

  getLeastConfident(): Belief | null {
    const all = Array.from(this.beliefs.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.confidence < min.confidence ? b : min);
  }

  getMostAccessed(): Belief | null {
    const all = Array.from(this.beliefs.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.accessCount > max.accessCount ? b : max);
  }

  clearAll(): void {
    this.beliefs.clear();
    this.counter = 0;
  }
}

export default BeliefEngine;