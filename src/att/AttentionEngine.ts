/**
 * Attention Engine
 * generic-agent-design Attention Engine - Define + Focus + GetCurrent + Stats
 */

export interface Focus {
  id: string;
  name: string;
  weight: number;
  active: boolean;
  created: number;
  hits: number;
}

export interface AttentionStats {
  focuses: number;
  total: number;
  active: number;
  inactive: number;
  totalHits: number;
  avgWeight: number;
}

export class AttentionEngine {
  private focuses: Map<string, Focus> = new Map();
  private counter = 0;
  private currentId: string | null = null;

  define(name: string, weight: number): string {
    const id = `foc-${++this.counter}`;
    this.focuses.set(id, {
      id,
      name,
      weight,
      active: true,
      created: Date.now(),
      hits: 0,
    });
    return id;
  }

  focus(id: string): boolean {
    const f = this.focuses.get(id);
    if (!f) return false;
    if (!f.active) return false;
    f.hits++;
    this.currentId = id;
    return true;
  }

  getCurrent(): Focus | null {
    return this.currentId ? (this.focuses.get(this.currentId) ?? null) : null;
  }

  getStats(): AttentionStats {
    const all = Array.from(this.focuses.values());
    return {
      focuses: all.length,
      total: all.length,
      active: all.filter(f => f.active).length,
      inactive: all.filter(f => !f.active).length,
      totalHits: all.reduce((s, f) => s + f.hits, 0),
      avgWeight: all.length > 0 ? Math.round((all.reduce((s, f) => s + f.weight, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getFocus(id: string): Focus | undefined {
    return this.focuses.get(id);
  }

  getAllFocuses(): Focus[] {
    return Array.from(this.focuses.values());
  }

  removeFocus(id: string): boolean {
    if (this.currentId === id) this.currentId = null;
    return this.focuses.delete(id);
  }

  hasFocus(id: string): boolean {
    return this.focuses.has(id);
  }

  getCount(): number {
    return this.focuses.size;
  }

  getName(id: string): string | undefined {
    return this.focuses.get(id)?.name;
  }

  getWeight(id: string): number {
    return this.focuses.get(id)?.weight ?? 0;
  }

  getHits(id: string): number {
    return this.focuses.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.focuses.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const f = this.focuses.get(id);
    if (!f) return false;
    f.active = active;
    if (!active && this.currentId === id) this.currentId = null;
    return true;
  }

  setWeight(id: string, weight: number): boolean {
    const f = this.focuses.get(id);
    if (!f) return false;
    f.weight = weight;
    return true;
  }

  setName(id: string, name: string): boolean {
    const f = this.focuses.get(id);
    if (!f) return false;
    f.name = name;
    return true;
  }

  resetHits(): void {
    for (const f of this.focuses.values()) f.hits = 0;
  }

  resetAll(): void {
    for (const f of this.focuses.values()) {
      f.hits = 0;
      f.active = true;
    }
    this.currentId = null;
  }

  getByName(name: string): Focus[] {
    return Array.from(this.focuses.values()).filter(f => f.name === name);
  }

  getActiveFocuses(): Focus[] {
    return Array.from(this.focuses.values()).filter(f => f.active);
  }

  getInactiveFocuses(): Focus[] {
    return Array.from(this.focuses.values()).filter(f => !f.active);
  }

  getByMinWeight(min: number): Focus[] {
    return Array.from(this.focuses.values()).filter(f => f.weight >= min);
  }

  getSortedByWeight(): Focus[] {
    return [...Array.from(this.focuses.values())].sort((a, b) => b.weight - a.weight);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.focuses.values()).map(f => f.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getMostHit(): Focus | null {
    const all = Array.from(this.focuses.values());
    if (all.length === 0) return null;
    return all.reduce((max, f) => f.hits > max.hits ? f : max);
  }

  getHighestWeight(): Focus | null {
    const all = Array.from(this.focuses.values());
    if (all.length === 0) return null;
    return all.reduce((max, f) => f.weight > max.weight ? f : max);
  }

  getCreatedAt(id: string): number {
    return this.focuses.get(id)?.created ?? 0;
  }

  getCurrentId(): string | null {
    return this.currentId;
  }

  clearAll(): void {
    this.focuses.clear();
    this.counter = 0;
    this.currentId = null;
  }
}

export default AttentionEngine;