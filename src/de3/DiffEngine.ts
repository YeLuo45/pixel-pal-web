/**
 * Diff Engine
 * claude-code-design Diff Engine - Create + Update + Stats
 */

function countChanges(oldText: string, newText: string): number {
  let changes = 0;
  const minLen = Math.min(oldText.length, newText.length);
  for (let i = 0; i < minLen; i++) {
    if (oldText[i] !== newText[i]) changes++;
  }
  changes += Math.abs(oldText.length - newText.length);
  return changes;
}

export interface Diff {
  id: string;
  name: string;
  oldText: string;
  newText: string;
  changes: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface DE3Stats {
  diffs: number;
  totalChanges: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgChanges: number;
  maxChanges: number;
  minChanges: number;
  avgOldTextLength: number;
  avgNewTextLength: number;
}

export class DiffEngine {
  private diffs: Map<string, Diff> = new Map();
  private counter = 0;
  private totalChanges = 0;

  create(name: string, oldText: string, newText: string): string {
    const id = `de3-${++this.counter}`;
    const changes = countChanges(oldText, newText);
    this.diffs.set(id, {
      id,
      name,
      oldText,
      newText,
      changes,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [changes],
    });
    this.totalChanges += changes;
    return id;
  }

  update(id: string, newText: string): boolean {
    const d = this.diffs.get(id);
    if (!d) return false;
    if (!d.active) return false;
    const oldChanges = d.changes;
    d.newText = newText;
    d.changes = countChanges(d.oldText, newText);
    d.history.push(d.changes);
    d.updated = Date.now();
    d.hits++;
    this.totalChanges = this.totalChanges - oldChanges + d.changes;
    return true;
  }

  reset(id: string): boolean {
    const d = this.diffs.get(id);
    if (!d) return false;
    const oldChanges = d.changes;
    d.changes = 0;
    d.history = [0];
    this.totalChanges -= oldChanges;
    d.updated = Date.now();
    return true;
  }

  getStats(): DE3Stats {
    const all = Array.from(this.diffs.values());
    const changeValues = all.map(d => d.changes);
    return {
      diffs: all.length,
      totalChanges: this.totalChanges,
      active: all.filter(d => d.active).length,
      inactive: all.filter(d => !d.active).length,
      totalHits: all.reduce((s, d) => s + d.hits, 0),
      uniqueNames: new Set(all.map(d => d.name)).size,
      avgChanges: all.length > 0 ? Math.round((changeValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxChanges: changeValues.length > 0 ? Math.max(...changeValues) : 0,
      minChanges: changeValues.length > 0 ? Math.min(...changeValues) : 0,
      avgOldTextLength: all.length > 0 ? Math.round((all.reduce((s, d) => s + d.oldText.length, 0) / all.length) * 100) / 100 : 0,
      avgNewTextLength: all.length > 0 ? Math.round((all.reduce((s, d) => s + d.newText.length, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getDiff(id: string): Diff | undefined {
    return this.diffs.get(id);
  }

  getAllDiffs(): Diff[] {
    return Array.from(this.diffs.values());
  }

  removeDiff(id: string): boolean {
    return this.diffs.delete(id);
  }

  hasDiff(id: string): boolean {
    return this.diffs.has(id);
  }

  getCount(): number {
    return this.diffs.size;
  }

  getName(id: string): string | undefined {
    return this.diffs.get(id)?.name;
  }

  getOldText(id: string): string | undefined {
    return this.diffs.get(id)?.oldText;
  }

  getNewText(id: string): string | undefined {
    return this.diffs.get(id)?.newText;
  }

  getChanges(id: string): number {
    return this.diffs.get(id)?.changes ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.diffs.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.diffs.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.diffs.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const d = this.diffs.get(id);
    if (!d) return false;
    d.active = active;
    d.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const d = this.diffs.get(id);
    if (!d) return false;
    d.name = name;
    d.updated = Date.now();
    return true;
  }

  setOldText(id: string, oldText: string): boolean {
    const d = this.diffs.get(id);
    if (!d) return false;
    d.oldText = oldText;
    d.changes = countChanges(oldText, d.newText);
    d.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const d of this.diffs.values()) {
      d.changes = 0;
      d.hits = 0;
      d.history = [0];
      d.active = true;
    }
    this.totalChanges = 0;
  }

  getByName(name: string): Diff[] {
    return Array.from(this.diffs.values()).filter(d => d.name === name);
  }

  getActiveDiffs(): Diff[] {
    return Array.from(this.diffs.values()).filter(d => d.active);
  }

  getInactiveDiffs(): Diff[] {
    return Array.from(this.diffs.values()).filter(d => !d.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.diffs.values()).map(d => d.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinChanges(min: number): Diff[] {
    return Array.from(this.diffs.values()).filter(d => d.changes >= min);
  }

  getMostChanges(): Diff | null {
    const all = Array.from(this.diffs.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.changes > max.changes ? d : max);
  }

  getNewest(): Diff | null {
    const all = Array.from(this.diffs.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.created > max.created ? d : max);
  }

  getOldest(): Diff | null {
    const all = Array.from(this.diffs.values());
    if (all.length === 0) return null;
    return all.reduce((min, d) => d.created < min.created ? d : min);
  }

  getCreatedAt(id: string): number {
    return this.diffs.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.diffs.get(id)?.updated ?? 0;
  }

  getTotalChanges(): number {
    return this.totalChanges;
  }

  clearAll(): void {
    this.diffs.clear();
    this.counter = 0;
    this.totalChanges = 0;
  }
}

export default DiffEngine;